"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = void 0;
const models_1 = require("@/models/models");
const transitions = {
    [models_1.ApplicationStatus.DRAFT]: [models_1.ApplicationStatus.SUBMITTED],
    [models_1.ApplicationStatus.SUBMITTED]: [
        models_1.ApplicationStatus.UNDER_REVIEW,
        models_1.ApplicationStatus.CHANGES_REQUESTED,
    ],
    [models_1.ApplicationStatus.CHANGES_REQUESTED]: [models_1.ApplicationStatus.DRAFT],
    [models_1.ApplicationStatus.UNDER_REVIEW]: [
        models_1.ApplicationStatus.APPROVED,
        models_1.ApplicationStatus.REJECTED,
        models_1.ApplicationStatus.CHANGES_REQUESTED,
        models_1.ApplicationStatus.DRAFT,
    ],
    [models_1.ApplicationStatus.APPROVED]: [],
    [models_1.ApplicationStatus.REJECTED]: [],
};
const canTransition = (fromStatus, toStatus) => {
    return transitions[fromStatus]?.includes(toStatus) ?? false;
};
exports.canTransition = canTransition;
//# sourceMappingURL=workflow.js.map