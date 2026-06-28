import { Review, ActivityEvent, ApplicationStatus } from '@/models/models';
import prisma from '@/lib/prisma';

export const createComment = async (
  applicationId: string,
  reviewerId: string,
  comment: string,
): Promise<Review> => {
  const review = await prisma.review.create({
    data: { applicationId, reviewerId, comment },
  });

  return review as Review;
};

export const getEventsByApplicationId = async (applicationId: string): Promise<ActivityEvent[]> => {
  const [auditLogs, reviews] = await Promise.all([
    prisma.auditLog.findMany({
      where: { applicationId },
      include: { changedByUser: { select: { firstName: true, lastName: true } } },
    }),
    prisma.review.findMany({
      where: { applicationId },
      include: { reviewer: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const statusEvents: ActivityEvent[] = auditLogs.map((log) => ({
    type: 'STATUS_CHANGE',
    id: log.id,
    createdAt: log.createdAt,
    fromStatus: log.fromStatus as ApplicationStatus,
    toStatus: log.toStatus as ApplicationStatus,
    changedBy: log.changedBy,
    changedByName: `${log.changedByUser.firstName} ${log.changedByUser.lastName}`,
  }));

  const commentEvents: ActivityEvent[] = reviews.map((review) => ({
    type: 'COMMENT',
    id: review.id,
    createdAt: review.createdAt,
    comment: review.comment,
    reviewerId: review.reviewerId,
    reviewerName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
  }));

  return [...statusEvents, ...commentEvents].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
};
