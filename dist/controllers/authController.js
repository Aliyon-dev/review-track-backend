"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const asyncHandler_1 = __importDefault(require("@/utils/asyncHandler"));
const responseHelper_1 = require("@/utils/responseHelper");
const authService_1 = require("@/services/authService");
exports.login = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await (0, authService_1.loginUser)(email, password);
        (0, responseHelper_1.sendSuccess)(res, result);
    }
    catch (err) {
        if (err instanceof authService_1.AuthError) {
            res.status(err.statusCode);
        }
        next(err);
    }
});
//# sourceMappingURL=authController.js.map