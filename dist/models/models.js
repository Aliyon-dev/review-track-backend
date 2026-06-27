"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["APPLICANT"] = "APPLICANT";
    Role["REVIEWER"] = "REVIEWER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "DRAFT";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["CHANGES_REQUESTED"] = "CHANGES_REQUESTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
//# sourceMappingURL=models.js.map