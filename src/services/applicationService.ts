import { Application, ApplicationStatus } from '@/models/models';
import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { notifyStatusChange } from '@/services/notificationService';

export class ApplicationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApplicationServiceError';
  }
}

const applicantSelect = {
  applicant: { select: { firstName: true, lastName: true } },
} as const;

export interface ApplicationInput {
  title: string;
  description: string;
  type?: string;
  priority?: string;
  amount?: number;
  justification?: string;
}

export const createApplication = async (
  data: ApplicationInput,
  applicantId: string,
): Promise<Application> => {
  const application = await prisma.application.create({
    data: {
      ...data,
      status: ApplicationStatus.DRAFT,
      applicantId,
    },
    include: applicantSelect,
  });

  return application as Application;
};

export const getApplicationById = async (id: string): Promise<Application | null> => {
  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: applicantSelect,
  });

  return application as Application | null;
};

export const getApplications = async (): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { deletedAt: null },
    include: applicantSelect,
  });
  return applications as Application[];
};

export const updateApplicationStatus = async (
  id: string,
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  changedBy: string,
): Promise<Application> => {
  const application = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        status: toStatus,
        ...(toStatus === ApplicationStatus.SUBMITTED && { submittedAt: new Date() }),
      },
      include: applicantSelect,
    });

    await tx.auditLog.create({
      data: { applicationId: id, changedBy, fromStatus, toStatus },
    });

    return updated;
  });

  void notifyStatusChange(application.applicantId, application.title, toStatus).catch(console.error);

  return application as Application;
};

export const getApplicationsByApplicantId = async (applicantId: string): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { applicantId, deletedAt: null },
    include: applicantSelect,
  });

  return applications as Application[];
};

export const getApplicationsByStatus = async (status: ApplicationStatus): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { status, deletedAt: null },
    include: applicantSelect,
  });

  return applications as Application[];
};

export const updateApplication = async (
  id: string,
  data: Partial<ApplicationInput>,
  changedById: string,
): Promise<Application> => {
  const application = await prisma.application.findFirst({ where: { id, deletedAt: null } });

  if (!application) throw new ApplicationServiceError('Application not found', 404);
  if (application.applicantId !== changedById) throw new ApplicationServiceError('Forbidden', 403);
  if (
    application.status !== ApplicationStatus.DRAFT &&
    application.status !== ApplicationStatus.CHANGES_REQUESTED
  ) {
    throw new ApplicationServiceError(
      `Cannot edit application with status: ${application.status}`,
      422,
    );
  }

  const { title, description, type, priority, amount, justification } = data;
  const safeData = Object.fromEntries(
    Object.entries({ title, description, type, priority, amount, justification }).filter(
      ([, v]) => v !== undefined,
    ),
  );

  const updated = await prisma.application.update({
    where: { id },
    data: safeData,
    include: applicantSelect,
  });

  return updated as Application;
};

export const deleteApplication = async (id: string, changedById: string): Promise<void> => {
  const application = await prisma.application.findFirst({ where: { id, deletedAt: null } });

  if (!application) throw new ApplicationServiceError('Application not found', 404);
  if (application.applicantId !== changedById) throw new ApplicationServiceError('Forbidden', 403);
  if (application.status !== ApplicationStatus.DRAFT) {
    throw new ApplicationServiceError('Only DRAFT applications can be deleted', 422);
  }

  await prisma.application.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
