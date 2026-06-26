"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("./config/env"));
app_1.default.listen(env_1.default.port, () => {
    console.log(`Server running on port ${env_1.default.port} in ${env_1.default.nodeEnv} mode`);
});
//# sourceMappingURL=server.js.map