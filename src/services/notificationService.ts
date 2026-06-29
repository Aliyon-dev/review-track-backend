import { Resend } from 'resend';
import env from '@/config/env';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@/models/models';

const SUBJECTS: Partial<Record<ApplicationStatus, string>> = {
  [ApplicationStatus.UNDER_REVIEW]: 'Your application is under review',
  [ApplicationStatus.APPROVED]: 'Your application has been approved',
  [ApplicationStatus.REJECTED]: 'Your application has been rejected',
  [ApplicationStatus.CHANGES_REQUESTED]: 'Changes requested on your application',
};

export const notifyStatusChange = async (
  applicantId: string,
  applicationTitle: string,
  toStatus: ApplicationStatus,
): Promise<void> => {
  const subject = SUBJECTS[toStatus];
  if (!subject || !env.resendApiKey) return;

  const user = await prisma.user.findUnique({
    where: { id: applicantId },
    select: { email: true, firstName: true },
  });
  if (!user) return;

  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: env.fromEmail,
    to: user.email,
    subject,
    text: `Hi ${user.firstName},\n\nYour application "${applicationTitle}" status has changed to: ${toStatus}.\n\nLog in to view the details.\n\nReview Track`,
  });
};
