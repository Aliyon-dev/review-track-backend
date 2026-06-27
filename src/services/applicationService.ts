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
