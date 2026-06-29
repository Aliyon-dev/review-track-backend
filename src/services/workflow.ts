import { ApplicationStatus } from "@/models/models";

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],

  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.CHANGES_REQUESTED,
  ],

  [ApplicationStatus.CHANGES_REQUESTED]: [ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED],

  [ApplicationStatus.UNDER_REVIEW]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.CHANGES_REQUESTED,
  ],

  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [],
};

export const canTransition = (fromStatus: string, toStatus: string): boolean => {
  return transitions[fromStatus as ApplicationStatus]?.includes(toStatus as ApplicationStatus) ?? false;
};
