export declare const Role: {
    readonly APPLICANT: "APPLICANT";
    readonly REVIEWER: "REVIEWER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const ApplicationStatus: {
    readonly DRAFT: "DRAFT";
    readonly SUBMITTED: "SUBMITTED";
    readonly UNDER_REVIEW: "UNDER_REVIEW";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly CHANGES_REQUESTED: "CHANGES_REQUESTED";
};
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
//# sourceMappingURL=enums.d.ts.map