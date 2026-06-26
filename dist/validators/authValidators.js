"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidators = void 0;
const express_validator_1 = require("express-validator");
exports.loginValidators = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('Password is required'),
];
//# sourceMappingURL=authValidators.js.map