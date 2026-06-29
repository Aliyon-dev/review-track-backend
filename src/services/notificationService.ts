import nodemailer from 'nodemailer';
import env from '@/config/env';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@/models/models';
import { buildStatusEmail } from '@/utils/emailTemplates';

const SUBJECTS: Partial<Record<ApplicationStatus, string>> = {
  [ApplicationStatus.UNDER_REVIEW]: 'Your application is under review',
  [ApplicationStatus.APPROVED]: 'Your application has been approved',
  [ApplicationStatus.REJECTED]: 'Your application has been rejected',
  [ApplicationStatus.CHANGES_REQUESTED]: 'Changes requested on your application',
};

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export const notifyStatusChange = async (
  applicantId: string,
  applicationTitle: string,
  toStatus: ApplicationStatus,
): Promise<void> => {
  const subject = SUBJECTS[toStatus];
  if (!subject || !env.smtpUser) return;

  const user = await prisma.user.findUnique({
    where: { id: applicantId },
    select: { email: true, firstName: true },
  });
  if (!user) return;

  const { html, text } = buildStatusEmail(user.firstName, applicationTitle, toStatus);

  await transporter.sendMail({
    from: env.fromEmail,
    to: user.email,
    subject,
    html,
    text,
  });
};
