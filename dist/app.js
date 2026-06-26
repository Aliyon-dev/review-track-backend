"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_api_reference_1 = require("@scalar/express-api-reference");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const authRoutes_1 = __importDefault(require("@/routes/authRoutes"));
const openapi_1 = __importDefault(require("@/docs/openapi"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/health', healthRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.get('/api/docs/openapi.json', (_req, res) => res.json(openapi_1.default));
app.get('/api/docs', (0, express_api_reference_1.apiReference)({ url: '/api/docs/openapi.json' }));
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map