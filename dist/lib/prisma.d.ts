import { PrismaClient } from "@/generated/prisma/client";
declare global {
    var prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map