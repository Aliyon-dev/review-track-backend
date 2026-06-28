import { Application, ApplicationStatus } from '@/models/models';
import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

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
  const application = await prisma.application.findUnique({
    where: { id },
    include: applicantSelect,
  });

  return application as Application | null;
};

export const getApplications = async (): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
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

  return application as Application;
};

export const getApplicationsByApplicantId = async (applicantId: string): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { applicantId },
    include: applicantSelect,
  });

  return applications as Application[];
};

export const getApplicationsByStatus = async (status: ApplicationStatus): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { status },
    include: applicantSelect,
  });

  return applications as Application[];
};

export const updateApplication = async (
  id: string,
  data: Partial<ApplicationInput>,
  changedById: string,
): Promise<Application> => {
  const application = await prisma.application.findUnique({ where: { id } });

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

  const updated = await prisma.application.update({
    where: { id },
    data,
    include: applicantSelect,
  });

  return updated as Application;
};

export const deleteApplication = async (id: string, changedById: string): Promise<void> => {
  const application = await prisma.application.findUnique({ where: { id } });

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
