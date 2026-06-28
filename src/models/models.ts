export enum Role {
  APPLICANT = "APPLICANT",
  REVIEWER = "REVIEWER",
  ADMIN = "ADMIN",
}

export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface Application {
  id: string;
  title: string;
  description: string;
  status: ApplicationStatus;
  applicantId: string;
  applicant?: { firstName: string; lastName: string };
  type?: string | null;
  priority?: string | null;
  amount?: number | null;
  justification?: string | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ActivityEvent {
  type: 'STATUS_CHANGE' | 'COMMENT';
  id: string;
  createdAt: Date;
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
  changedBy?: string;
  changedByName?: string;
  comment?: string;
  reviewerId?: string;
  reviewerName?: string;
}

export interface Review {
  id: string;
  comment: string;
  applicationId: string;
  reviewerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  applicationId: string;
  changedBy: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  createdAt: Date;
}
