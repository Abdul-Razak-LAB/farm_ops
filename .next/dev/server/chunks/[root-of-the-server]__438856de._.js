module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/lib/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "createErrorResponse",
    ()=>createErrorResponse
]);
class AppError extends Error {
    code;
    status;
    details;
    constructor(code, message, status = 400, details){
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
function createErrorResponse(error) {
    if (error instanceof AppError || error?.name === 'AppError' && error?.code && error?.message) {
        return Response.json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            }
        }, {
            status: error.status || 400
        });
    }
    if (error?.name === 'ZodError') {
        return Response.json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                details: error.issues ?? error.errors
            }
        }, {
            status: 400
        });
    }
    if (error?.code === 'P2002') {
        return Response.json({
            success: false,
            error: {
                code: 'CONFLICT',
                message: 'A record with the same unique value already exists',
                details: error.meta
            }
        }, {
            status: 409
        });
    }
    if (error?.code === 'P2003') {
        return Response.json({
            success: false,
            error: {
                code: 'RELATION_ERROR',
                message: 'Related record is missing or invalid',
                details: error.meta
            }
        }, {
            status: 400
        });
    }
    console.error('[Unhandled Error]:', error);
    if ("TURBOPACK compile-time truthy", 1) {
        return Response.json({
            success: false,
            error: {
                code: error?.code || 'INTERNAL_ERROR',
                message: error?.message || 'Unknown server error',
                details: error?.stack || error
            }
        }, {
            status: 500
        });
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/lib/permissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRequestRole",
    ()=>getRequestRole,
    "getRequestUserId",
    ()=>getRequestUserId,
    "requirePermission",
    ()=>requirePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
;
const roleMatrix = {
    OWNER: [
        'finance:read',
        'finance:write',
        'finance:approve',
        'updates:read',
        'updates:write',
        'digest:read',
        'monitoring:read',
        'monitoring:write',
        'incident:read',
        'incident:write',
        'vendor:read',
        'vendor:write',
        'procurement:read',
        'procurement:write',
        'payroll:read',
        'payroll:write',
        'payroll:approve',
        'payroll:pay'
    ],
    MANAGER: [
        'finance:read',
        'finance:write',
        'updates:read',
        'updates:write',
        'digest:read',
        'monitoring:read',
        'monitoring:write',
        'incident:read',
        'incident:write',
        'vendor:read',
        'vendor:write',
        'procurement:read',
        'procurement:write',
        'payroll:read',
        'payroll:write'
    ],
    WORKER: [
        'updates:read',
        'updates:write',
        'incident:read',
        'incident:write',
        'procurement:read'
    ]
};
function getRequestRole(request) {
    const headerRole = request.headers.get('x-farm-role');
    if (headerRole === 'OWNER' || headerRole === 'MANAGER' || headerRole === 'WORKER') {
        return headerRole;
    }
    return 'MANAGER';
}
function getRequestUserId(request) {
    return request.headers.get('x-user-id') || 'user_id_from_session';
}
function requirePermission(request, permission) {
    const role = getRequestRole(request);
    if (!roleMatrix[role].includes(permission)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('FORBIDDEN', 'You do not have permission for this action', 403);
    }
}
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/services/finance/finance-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinanceService",
    ()=>FinanceService,
    "financeService",
    ()=>financeService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
;
;
class FinanceService {
    async listBudgets(farmId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].budget.findMany({
            where: {
                farmId
            },
            include: {
                lines: true
            },
            orderBy: {
                startDate: 'desc'
            },
            take: 20
        });
    }
    async listSpendRequests(farmId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].spendRequest.findMany({
            where: {
                farmId
            },
            include: {
                approvals: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });
    }
    async requestExpense(input) {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.findUnique({
            where: {
                farmId_idempotencyKey: {
                    farmId: input.farmId,
                    idempotencyKey: input.idempotencyKey
                }
            }
        });
        if (existing) {
            return {
                reused: true,
                eventId: existing.id
            };
        }
        const request = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const created = await tx.spendRequest.create({
                data: {
                    farmId: input.farmId,
                    amount: input.amount,
                    category: input.category,
                    description: input.description,
                    status: 'PENDING'
                }
            });
            await tx.event.create({
                data: {
                    farmId: input.farmId,
                    type: 'SPEND_REQUEST_CREATED',
                    payload: {
                        requestId: created.id,
                        amount: input.amount,
                        category: input.category
                    },
                    idempotencyKey: input.idempotencyKey,
                    userId: input.userId
                }
            });
            return created;
        }, {
            isolationLevel: 'Serializable'
        });
        return {
            requestId: request.id,
            status: request.status
        };
    }
    async decideExpense(input) {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.findUnique({
            where: {
                farmId_idempotencyKey: {
                    farmId: input.farmId,
                    idempotencyKey: input.idempotencyKey
                }
            }
        });
        if (existing) {
            return {
                reused: true,
                eventId: existing.id
            };
        }
        const request = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].spendRequest.findFirst({
            where: {
                id: input.requestId,
                farmId: input.farmId
            }
        });
        if (!request) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('REQUEST_NOT_FOUND', 'Spend request not found', 404);
        }
        if (request.status !== 'PENDING') {
            return {
                requestId: request.id,
                status: request.status
            };
        }
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const updated = await tx.spendRequest.update({
                where: {
                    id: input.requestId
                },
                data: {
                    status: input.decision
                }
            });
            await tx.approval.create({
                data: {
                    spendRequestId: input.requestId,
                    userId: input.userId,
                    status: input.decision,
                    comment: input.comment
                }
            });
            if (input.decision === 'APPROVED') {
                const activeBudget = await tx.budget.findFirst({
                    where: {
                        farmId: input.farmId,
                        startDate: {
                            lte: new Date()
                        },
                        endDate: {
                            gte: new Date()
                        }
                    },
                    include: {
                        lines: true
                    }
                });
                const matchedLine = activeBudget?.lines.find((line)=>line.category === request.category);
                if (matchedLine) {
                    await tx.budgetLine.update({
                        where: {
                            id: matchedLine.id
                        },
                        data: {
                            spent: {
                                increment: request.amount
                            }
                        }
                    });
                }
            }
            await tx.event.create({
                data: {
                    farmId: input.farmId,
                    type: 'SPEND_REQUEST_DECIDED',
                    payload: {
                        requestId: input.requestId,
                        decision: input.decision,
                        comment: input.comment
                    },
                    idempotencyKey: input.idempotencyKey,
                    userId: input.userId
                }
            });
            return updated;
        }, {
            isolationLevel: 'Serializable'
        });
        return {
            requestId: result.id,
            status: result.status
        };
    }
}
const financeService = new FinanceService();
}),
"[project]/src/app/api/farms/[farmId]/finance/requests/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/permissions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$finance$2f$finance$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/finance/finance-service.ts [app-route] (ecmascript)");
;
;
;
;
const createSpendRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    amount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive(),
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(5),
    idempotencyKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8)
});
async function GET(request, context) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])(request, 'finance:read');
        const { farmId } = await context.params;
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$finance$2f$finance$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["financeService"].listSpendRequests(farmId);
        return Response.json({
            success: true,
            data
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(error);
    }
}
async function POST(request, context) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])(request, 'finance:write');
        const { farmId } = await context.params;
        const input = createSpendRequestSchema.parse(await request.json());
        const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestUserId"])(request);
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$finance$2f$finance$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["financeService"].requestExpense({
            farmId,
            userId,
            ...input
        });
        return Response.json({
            success: true,
            data
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(error);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__438856de._.js.map