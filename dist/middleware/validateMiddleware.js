"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422);
        return next(new Error(errors.array().map((e) => e.msg).join(', ')));
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validateMiddleware.js.map