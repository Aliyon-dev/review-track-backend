"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("@/config/env"));
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
    try {
        const token = authHeader.split(' ')[1];
        req.user = jsonwebtoken_1.default.verify(token, env_1.default.jwtSecret);
        next();
    }
    catch {
        res.status(401);
        next(new Error('Not authorized, token invalid'));
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map