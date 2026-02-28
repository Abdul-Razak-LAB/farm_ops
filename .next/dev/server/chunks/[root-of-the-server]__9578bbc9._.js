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
"[project]/src/services/monitoring/monitoring-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MonitoringService",
    ()=>MonitoringService,
    "monitoringService",
    ()=>monitoringService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
;
;
class MonitoringService {
    async getDashboard(farmId) {
        const [devices, unresolvedAlerts, latestReadings] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sensorDevice.findMany({
                where: {
                    farmId
                },
                include: {
                    readings: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1
                    }
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].alert.findMany({
                where: {
                    farmId,
                    resolved: false
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 20
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sensorReading.findMany({
                where: {
                    device: {
                        farmId
                    }
                },
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 30
            })
        ]);
        return {
            devices,
            unresolvedAlerts,
            latestReadings,
            summary: {
                totalDevices: devices.length,
                unresolvedAlerts: unresolvedAlerts.length
            }
        };
    }
    async triggerAlert(input) {
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
                reused: true
            };
        }
        const alert = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const createdAlert = await tx.alert.create({
                data: {
                    farmId: input.farmId,
                    level: input.level,
                    message: input.message,
                    resolved: false
                }
            });
            await tx.event.create({
                data: {
                    farmId: input.farmId,
                    type: 'SENSOR_ALERT_TRIGGERED',
                    payload: {
                        alertId: createdAlert.id,
                        level: input.level,
                        message: input.message
                    },
                    userId: input.userId,
                    idempotencyKey: input.idempotencyKey
                }
            });
            return createdAlert;
        }, {
            isolationLevel: 'Serializable'
        });
        return alert;
    }
    async resolveAlert(input) {
        const alert = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].alert.findFirst({
            where: {
                id: input.alertId,
                farmId: input.farmId
            }
        });
        if (!alert) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('ALERT_NOT_FOUND', 'Alert not found', 404);
        }
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
                reused: true
            };
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            await tx.alert.update({
                where: {
                    id: input.alertId
                },
                data: {
                    resolved: true
                }
            });
            await tx.event.create({
                data: {
                    farmId: input.farmId,
                    type: 'ALERT_RESOLVED',
                    payload: {
                        alertId: input.alertId
                    },
                    userId: input.userId,
                    idempotencyKey: input.idempotencyKey
                }
            });
        }, {
            isolationLevel: 'Serializable'
        });
        return {
            alertId: input.alertId,
            status: 'RESOLVED'
        };
    }
    async getLearningAdjustment(farmId) {
        const feedbackEvents = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.findMany({
            where: {
                farmId,
                type: 'VRA_FEEDBACK_RECORDED'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 30
        });
        const errors = [];
        for (const event of feedbackEvents){
            const payload = event.payload;
            const outcomes = Array.isArray(payload?.outcomes) ? payload.outcomes : [];
            for (const outcome of outcomes){
                const recommended = Number(outcome?.recommendedYieldPerHa || 0);
                const actual = Number(outcome?.actualYieldPerHa || 0);
                if (recommended > 0) {
                    errors.push((actual - recommended) / recommended);
                }
            }
        }
        if (errors.length === 0) {
            return {
                adjustmentFactor: 1,
                confidence: 0,
                averageYieldError: 0
            };
        }
        const averageYieldError = errors.reduce((sum, value)=>sum + value, 0) / errors.length;
        const adjustmentFactor = Math.max(0.85, Math.min(1.15, 1 + averageYieldError * 0.35));
        const confidence = Math.min(1, errors.length / 20);
        return {
            adjustmentFactor,
            confidence,
            averageYieldError
        };
    }
    async generateVraPlan(input) {
        if (!input.zones.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('INVALID_ZONES', 'At least one productivity zone is required', 400);
        }
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.findUnique({
            where: {
                farmId_idempotencyKey: {
                    farmId: input.farmId,
                    idempotencyKey: input.idempotencyKey
                }
            }
        });
        if (existing) {
            return existing.payload;
        }
        const learning = await this.getLearningAdjustment(input.farmId);
        const phase1 = input.zones.map((zone)=>{
            const band = zone.productivityIndex < 0.4 ? 'LOW' : zone.productivityIndex < 0.7 ? 'MEDIUM' : 'HIGH';
            return {
                zoneId: zone.zoneId,
                zoneName: zone.name,
                hectares: zone.hectares,
                productivityIndex: zone.productivityIndex,
                applicationBand: band
            };
        });
        const weatherModifier = input.intelligence.weatherRisk === 'HIGH' ? 0.92 : input.intelligence.weatherRisk === 'MEDIUM' ? 0.97 : 1.02;
        const pestModifier = input.intelligence.pestPressure === 'HIGH' ? 0.94 : input.intelligence.pestPressure === 'MEDIUM' ? 0.98 : 1.03;
        const phase2 = phase1.map((zone)=>{
            const seedBandFactor = zone.applicationBand === 'LOW' ? 0.9 : zone.applicationBand === 'HIGH' ? 1.12 : 1;
            const fertilizerBandFactor = zone.applicationBand === 'LOW' ? 0.88 : zone.applicationBand === 'HIGH' ? 1.15 : 1;
            const seedRateKgPerHa = Number((22 * seedBandFactor * learning.adjustmentFactor).toFixed(2));
            const fertilizerRateKgPerHa = Number((180 * fertilizerBandFactor * learning.adjustmentFactor).toFixed(2));
            return {
                zoneId: zone.zoneId,
                zoneName: zone.zoneName,
                hectares: zone.hectares,
                seedRateKgPerHa,
                fertilizerRateKgPerHa
            };
        });
        const optimizedZones = phase2.map((zone)=>{
            const productivity = phase1.find((item)=>item.zoneId === zone.zoneId)?.productivityIndex || 0.5;
            const estimatedYieldPerHa = Number((input.intelligence.maxYieldPotentialTonsPerHa * productivity * weatherModifier * pestModifier).toFixed(2));
            const grossRevenue = estimatedYieldPerHa * input.market.commodityPricePerTon * zone.hectares;
            const inputCost = (zone.seedRateKgPerHa * input.market.seedCostPerKg + zone.fertilizerRateKgPerHa * input.market.fertilizerCostPerKg) * zone.hectares;
            let adjustedSeedRateKgPerHa = zone.seedRateKgPerHa;
            let adjustedFertilizerRateKgPerHa = zone.fertilizerRateKgPerHa;
            const marginPerHa = (grossRevenue - inputCost) / zone.hectares;
            if (marginPerHa < input.market.targetMarginPerHa) {
                adjustedSeedRateKgPerHa = Number((zone.seedRateKgPerHa * 0.96).toFixed(2));
                adjustedFertilizerRateKgPerHa = Number((zone.fertilizerRateKgPerHa * 0.9).toFixed(2));
            }
            const adjustedInputCost = (adjustedSeedRateKgPerHa * input.market.seedCostPerKg + adjustedFertilizerRateKgPerHa * input.market.fertilizerCostPerKg) * zone.hectares;
            const expectedMargin = grossRevenue - adjustedInputCost;
            return {
                zoneId: zone.zoneId,
                zoneName: zone.zoneName,
                hectares: zone.hectares,
                estimatedYieldPerHa,
                optimizedSeedRateKgPerHa: adjustedSeedRateKgPerHa,
                optimizedFertilizerRateKgPerHa: adjustedFertilizerRateKgPerHa,
                expectedRevenue: Number(grossRevenue.toFixed(2)),
                expectedInputCost: Number(adjustedInputCost.toFixed(2)),
                expectedMargin: Number(expectedMargin.toFixed(2))
            };
        });
        const totalExpectedMargin = optimizedZones.reduce((sum, zone)=>sum + zone.expectedMargin, 0);
        const averageYieldPerHa = optimizedZones.reduce((sum, zone)=>sum + zone.estimatedYieldPerHa, 0) / optimizedZones.length;
        const plan = {
            phase1,
            phase2,
            phase3: {
                zones: optimizedZones,
                totals: {
                    expectedMargin: Number(totalExpectedMargin.toFixed(2)),
                    averageYieldPerHa: Number(averageYieldPerHa.toFixed(2))
                }
            },
            phase4: {
                learningAdjustmentFactor: Number(learning.adjustmentFactor.toFixed(4)),
                learningConfidence: Number(learning.confidence.toFixed(2)),
                averageYieldError: Number(learning.averageYieldError.toFixed(4)),
                recommendation: learning.confidence < 0.3 ? 'Collect more yield feedback to strengthen zone intelligence.' : learning.averageYieldError < 0 ? 'Yields are below recommendations; reduce aggressive rates in low-productivity zones.' : 'Yields are meeting/exceeding recommendations; keep optimized strategy and monitor risk shifts.'
            },
            generatedAt: new Date().toISOString()
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.create({
            data: {
                farmId: input.farmId,
                type: 'VRA_PLAN_GENERATED',
                payload: plan,
                userId: input.userId,
                idempotencyKey: input.idempotencyKey
            }
        });
        return plan;
    }
    async recordVraFeedback(input) {
        if (!input.outcomes.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('INVALID_FEEDBACK', 'At least one zone outcome is required', 400);
        }
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
                reused: true
            };
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.create({
            data: {
                farmId: input.farmId,
                type: 'VRA_FEEDBACK_RECORDED',
                payload: {
                    outcomes: input.outcomes,
                    recordedAt: new Date().toISOString()
                },
                userId: input.userId,
                idempotencyKey: input.idempotencyKey
            }
        });
        return {
            status: 'RECORDED'
        };
    }
}
const monitoringService = new MonitoringService();
}),
"[project]/src/app/api/farms/[farmId]/monitoring/vra/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$monitoring$2f$monitoring$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/monitoring/monitoring-service.ts [app-route] (ecmascript)");
;
;
;
;
const zoneSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zoneId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    hectares: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive(),
    productivityIndex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(1)
});
const createSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zones: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(zoneSchema).min(1).max(50),
    market: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        commodityPricePerTon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive(),
        seedCostPerKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive(),
        fertilizerCostPerKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive(),
        targetMarginPerHa: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive()
    }),
    intelligence: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        weatherRisk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'LOW',
            'MEDIUM',
            'HIGH'
        ]),
        pestPressure: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'LOW',
            'MEDIUM',
            'HIGH'
        ]),
        maxYieldPotentialTonsPerHa: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive()
    }),
    idempotencyKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8)
});
const sampleRequest = {
    zones: [
        {
            zoneId: 'z1',
            name: 'North Ridge',
            hectares: 12,
            productivityIndex: 0.34
        },
        {
            zoneId: 'z2',
            name: 'Central Flat',
            hectares: 18,
            productivityIndex: 0.61
        },
        {
            zoneId: 'z3',
            name: 'South Valley',
            hectares: 10,
            productivityIndex: 0.82
        }
    ],
    market: {
        commodityPricePerTon: 360,
        seedCostPerKg: 2.6,
        fertilizerCostPerKg: 0.95,
        targetMarginPerHa: 420
    },
    intelligence: {
        weatherRisk: 'MEDIUM',
        pestPressure: 'LOW',
        maxYieldPotentialTonsPerHa: 6.2
    }
};
async function GET(request, context) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])(request, 'monitoring:read');
        const { farmId } = await context.params;
        const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestUserId"])(request);
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$monitoring$2f$monitoring$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["monitoringService"].generateVraPlan({
            farmId,
            userId,
            idempotencyKey: `sample-${new Date().toISOString().slice(0, 10)}`,
            ...sampleRequest
        });
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])(request, 'monitoring:write');
        const { farmId } = await context.params;
        const userId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestUserId"])(request);
        const input = createSchema.parse(await request.json());
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$monitoring$2f$monitoring$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["monitoringService"].generateVraPlan({
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

//# sourceMappingURL=%5Broot-of-the-server%5D__9578bbc9._.js.map