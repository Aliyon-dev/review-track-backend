export declare enum Role {
    APPLICANT = "APPLICANT",
    REVIEWER = "REVIEWER",
    ADMIN = "ADMIN"
}
export declare enum ApplicationStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
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
    createdAt: Date;
    updatedAt: Date;
}
export interface Review {
    id: string;
    comment: string;
    applicationId: string;
    reviewerId: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=models.d.ts.map