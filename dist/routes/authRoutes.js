"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateMiddleware_1 = require("@/middleware/validateMiddleware");
const authValidators_1 = require("@/validators/authValidators");
const authController_1 = require("@/controllers/authController");
const router = (0, express_1.Router)();
router.post('/login', authValidators_1.loginValidators, validateMiddleware_1.validate, authController_1.login);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map