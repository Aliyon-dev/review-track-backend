"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@/generated/prisma/client");
const createPrismaClient = () => new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prisma = global.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production")
    global.prisma = prisma;
exports.default = prisma;
//# sourceMappingURL=prisma.js.map