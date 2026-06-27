import { Application, ApplicationStatus } from '@/models/models';
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

export const createApplication = async (
  title: string,
  description: string,
  applicantId: string,
): Promise<Application> => {
  const application = await prisma.application.create({
    data: {
      title,
      description,
      status: ApplicationStatus.DRAFT,
      applicantId,
    },
  });

  return application as Application;
};


export const getApplicationById = async (id: string): Promise<Application | null> => {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  return application as Application | null;
}

export const getApplications =  async (): Promise<Application[]> => {
  const applications = await prisma.application.findMany();
  return applications as Application[];
}

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
): Promise<Application> => {
  const application = await prisma.application.update({
    where: { id },
    data: { status },
  });

  return application as Application;
}

export const getApplicationsByApplicantId  =  async (applicantId: string): Promise<Application[]> => {
  const applications = await prisma.application.findMany({
    where: { applicantId },
  });

  return applications as Application[];
}   