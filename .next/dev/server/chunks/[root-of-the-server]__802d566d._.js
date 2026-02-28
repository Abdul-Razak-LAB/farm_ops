module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

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
"[project]/src/lib/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logger",
    ()=>logger
]);
const REDACT_KEYS = [
    'password',
    'token',
    'authorization',
    'cookie',
    'email',
    'phone',
    'secret'
];
function redactValue(value) {
    if (Array.isArray(value)) {
        return value.map(redactValue);
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value).map(([key, val])=>{
            const shouldRedact = REDACT_KEYS.some((redactKey)=>key.toLowerCase().includes(redactKey));
            return [
                key,
                shouldRedact ? '[REDACTED]' : redactValue(val)
            ];
        });
        return Object.fromEntries(entries);
    }
    return value;
}
function emit(level, message, context) {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context: redactValue(context || {})
    };
    const line = JSON.stringify(payload);
    if (level === 'error') {
        console.error(line);
        return;
    }
    if (level === 'warn') {
        console.warn(line);
        return;
    }
    console.log(line);
}
const logger = {
    debug: (message, context)=>emit('debug', message, context),
    info: (message, context)=>emit('info', message, context),
    warn: (message, context)=>emit('warn', message, context),
    error: (message, context)=>emit('error', message, context)
};
}),
"[project]/src/lib/server-observability.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureServerException",
    ()=>captureServerException
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logger.ts [app-route] (ecmascript)");
;
let sentryInitPromise = null;
async function getSentry() {
    if (!process.env.SENTRY_DSN) {
        return null;
    }
    if (!sentryInitPromise) {
        sentryInitPromise = __turbopack_context__.A("[project]/node_modules/@sentry/node/build/esm/index.js [app-route] (ecmascript, async loader)").then((sentry)=>{
            sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: ("TURBOPACK compile-time value", "development")
            });
            return sentry;
        }).catch(()=>null);
    }
    return sentryInitPromise;
}
async function captureServerException(error, context) {
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error('Unhandled server exception', {
        error: error instanceof Error ? {
            message: error.message,
            stack: error.stack
        } : error,
        ...context
    });
    const sentry = await getSentry();
    if (sentry) {
        sentry.withScope((scope)=>{
            Object.entries(context?.tags || {}).forEach(([key, value])=>scope.setTag(key, value));
            Object.entries(context?.extra || {}).forEach(([key, value])=>scope.setExtra(key, value));
            sentry.captureException(error);
        });
        return;
    }
    try {
        await fetch(process.env.SENTRY_DSN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                tags: context?.tags,
                extra: context?.extra,
                timestamp: new Date().toISOString()
            })
        });
    } catch (captureError) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn('Failed to send server exception to Sentry-compatible endpoint', {
            captureError
        });
    }
}
}),
"[project]/src/lib/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "createErrorResponse",
    ()=>createErrorResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2d$observability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/server-observability.ts [app-route] (ecmascript)");
;
;
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
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error('Unhandled API error', {
        code: error?.code,
        message: error?.message
    });
    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2d$observability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureServerException"])(error, {
        tags: {
            scope: 'api.createErrorResponse'
        }
    });
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
    normalizeNumeric(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
        return null;
    }
    pickNumeric(data, keys) {
        if (!data || typeof data !== 'object') return null;
        const source = data;
        for (const key of keys){
            const value = this.normalizeNumeric(source[key]);
            if (value !== null) return value;
        }
        return null;
    }
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    hashSeed(source) {
        let hash = 0;
        for(let index = 0; index < source.length; index += 1){
            hash = (hash << 5) - hash + source.charCodeAt(index) | 0;
        }
        return Math.abs(hash);
    }
    inferFieldName(deviceName) {
        const normalized = deviceName.trim();
        if (!normalized) return 'General';
        const splitByDash = normalized.split(' - ').map((part)=>part.trim()).filter(Boolean);
        if (splitByDash.length > 1) {
            return splitByDash[splitByDash.length - 1];
        }
        return normalized;
    }
    inferGrowthStage(ndvi) {
        if (ndvi < 0.3) return 'GERMINATION';
        if (ndvi < 0.45) return 'VEGETATIVE';
        if (ndvi < 0.62) return 'FLOWERING';
        if (ndvi < 0.75) return 'FRUIT_FILL';
        return 'MATURITY';
    }
    async getDashboard(farmId) {
        const now = Date.now();
        const readingWindowStart = new Date(now - 24 * 60 * 60 * 1000);
        const [devices, unresolvedAlerts, latestReadings, recentEvents] = await Promise.all([
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
                    },
                    createdAt: {
                        gte: readingWindowStart
                    }
                },
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 500
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].event.findMany({
                where: {
                    farmId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 120
            })
        ]);
        const leaderboardMap = new Map();
        for (const reading of latestReadings){
            const fieldName = this.inferFieldName(reading.device.name);
            const minutesAgo = (now - reading.createdAt.getTime()) / (1000 * 60);
            const recencyWeight = Math.max(0.2, 1 - Math.min(minutesAgo, 180) / 180);
            const existing = leaderboardMap.get(fieldName);
            if (!existing) {
                leaderboardMap.set(fieldName, {
                    fieldName,
                    score: recencyWeight,
                    readingCount: 1,
                    lastSignalAt: reading.createdAt,
                    topDevice: reading.device.name,
                    topDeviceCount: 1
                });
                continue;
            }
            existing.score += recencyWeight;
            existing.readingCount += 1;
            if (reading.createdAt > existing.lastSignalAt) {
                existing.lastSignalAt = reading.createdAt;
            }
            if (reading.device.name === existing.topDevice) {
                existing.topDeviceCount += 1;
            } else if (existing.topDeviceCount <= 1) {
                existing.topDevice = reading.device.name;
                existing.topDeviceCount = 1;
            }
        }
        const fieldLeaderboard = [
            ...leaderboardMap.values()
        ].sort((a, b)=>b.score - a.score).slice(0, 8).map((entry, index)=>({
                rank: index + 1,
                fieldName: entry.fieldName,
                score: Number(entry.score.toFixed(2)),
                readingCount: entry.readingCount,
                lastSignalAt: entry.lastSignalAt.toISOString(),
                topDevice: entry.topDevice
            }));
        const weatherRiskScore = this.clamp(unresolvedAlerts.filter((alert)=>alert.level === 'CRITICAL').length * 15 + unresolvedAlerts.filter((alert)=>alert.level === 'WARNING').length * 6, 8, 95);
        const weatherCondition = weatherRiskScore > 70 ? 'HIGH_RISK' : weatherRiskScore > 45 ? 'MODERATE_RISK' : 'STABLE';
        const weatherForecast = {
            riskLevel: weatherCondition,
            next24hRainProbabilityPct: this.clamp(Math.round(weatherRiskScore * 0.9), 5, 98),
            next24hTemperatureRangeC: {
                min: this.clamp(14 + Math.round(weatherRiskScore * 0.06), 10, 26),
                max: this.clamp(26 + Math.round(weatherRiskScore * 0.07), 23, 42)
            },
            windKph: this.clamp(8 + Math.round(weatherRiskScore * 0.22), 6, 34),
            advisory: weatherRiskScore > 70 ? 'Pause non-critical spraying and protect high-stress zones.' : weatherRiskScore > 45 ? 'Maintain irrigation watch and verify disease-prone blocks.' : 'Proceed with normal operations and monitor threshold alerts.'
        };
        const ndviCandidates = latestReadings.map((reading)=>this.pickNumeric(reading.data, [
                'ndvi',
                'NDVI',
                'vegetationIndex',
                'vigour'
            ])).filter((value)=>value !== null).map((value)=>this.clamp(value, 0.1, 0.92));
        const averageNdvi = ndviCandidates.length ? ndviCandidates.reduce((sum, value)=>sum + value, 0) / ndviCandidates.length : this.clamp(0.38 + fieldLeaderboard.length * 0.03, 0.28, 0.78);
        const vegetationIndices = {
            ndvi: Number(averageNdvi.toFixed(3)),
            evi: Number(this.clamp(averageNdvi * 0.82, 0.18, 0.82).toFixed(3)),
            savi: Number(this.clamp(averageNdvi * 0.89, 0.2, 0.86).toFixed(3)),
            trend: averageNdvi > 0.62 ? 'IMPROVING' : averageNdvi > 0.45 ? 'STABLE' : 'DECLINING'
        };
        const stageByField = fieldLeaderboard.map((field)=>{
            const fieldSignals = latestReadings.filter((reading)=>this.inferFieldName(reading.device.name) === field.fieldName);
            const fieldNdviSamples = fieldSignals.map((reading)=>this.pickNumeric(reading.data, [
                    'ndvi',
                    'NDVI',
                    'vegetationIndex',
                    'vigour'
                ])).filter((value)=>value !== null).map((value)=>this.clamp(value, 0.1, 0.92));
            const fieldNdvi = fieldNdviSamples.length ? fieldNdviSamples.reduce((sum, value)=>sum + value, 0) / fieldNdviSamples.length : this.clamp(vegetationIndices.ndvi + (field.rank === 1 ? 0.08 : 0) - field.rank * 0.02, 0.2, 0.86);
            const stage = this.inferGrowthStage(fieldNdvi);
            return {
                fieldName: field.fieldName,
                stage,
                ndvi: Number(fieldNdvi.toFixed(3)),
                confidence: Number(this.clamp(0.55 + field.readingCount / 50, 0.55, 0.98).toFixed(2))
            };
        });
        const machineEntries = devices.map((device)=>{
            const latestDeviceReading = latestReadings.find((reading)=>reading.deviceId === device.id) || device.readings[0] || null;
            const seed = this.hashSeed(device.id);
            const baseFuel = 25 + seed % 65;
            const baseRpm = 900 + seed % 1600;
            const baseSpeed = seed % 38;
            const baseBattery = 11.8 + seed % 30 / 10;
            const baseEngineHours = 120 + seed % 2800;
            const fuelLevelPct = this.clamp(Math.round(this.pickNumeric(latestDeviceReading?.data, [
                'fuelLevelPct',
                'fuel',
                'tankLevel',
                'fuelPct'
            ]) ?? baseFuel), 5, 100);
            const speedKph = this.clamp(Math.round(this.pickNumeric(latestDeviceReading?.data, [
                'speedKph',
                'speed',
                'velocity'
            ]) ?? baseSpeed), 0, 65);
            const rpm = this.clamp(Math.round(this.pickNumeric(latestDeviceReading?.data, [
                'rpm',
                'engineRpm'
            ]) ?? baseRpm), 650, 3200);
            const batteryVoltage = Number(this.clamp(this.pickNumeric(latestDeviceReading?.data, [
                'batteryVoltage',
                'voltage'
            ]) ?? baseBattery, 10.8, 14.7).toFixed(1));
            const engineHours = Math.round(this.clamp(this.pickNumeric(latestDeviceReading?.data, [
                'engineHours',
                'hours'
            ]) ?? baseEngineHours, 20, 9999));
            const temperatureC = Math.round(this.clamp(this.pickNumeric(latestDeviceReading?.data, [
                'engineTempC',
                'temperatureC',
                'temp'
            ]) ?? 32 + seed % 44, 24, 118));
            const minutesSinceLastSeen = latestDeviceReading ? Math.round((now - latestDeviceReading.createdAt.getTime()) / (1000 * 60)) : 9_999;
            const connectivity = minutesSinceLastSeen <= 8 ? 'ONLINE' : minutesSinceLastSeen <= 35 ? 'DEGRADED' : 'OFFLINE';
            const healthScore = this.clamp(Math.round(100 - Math.max(0, temperatureC - 92) * 1.2 - Math.max(0, 20 - fuelLevelPct) * 1.1 - (connectivity === 'OFFLINE' ? 32 : connectivity === 'DEGRADED' ? 14 : 0)), 18, 100);
            return {
                machineId: device.id,
                machineName: device.name,
                machineType: device.type,
                fieldName: this.inferFieldName(device.name),
                connectivity,
                healthScore,
                lastSeenAt: latestDeviceReading?.createdAt.toISOString() ?? null,
                telemetry: {
                    engineHours,
                    speedKph,
                    fuelLevelPct,
                    rpm,
                    batteryVoltage,
                    temperatureC
                }
            };
        });
        const sortedMachines = [
            ...machineEntries
        ].sort((a, b)=>b.healthScore - a.healthScore);
        const keyFactors = [
            {
                factor: 'Weather Stress',
                status: weatherForecast.riskLevel,
                impact: weatherForecast.riskLevel === 'HIGH_RISK' ? 'HIGH' : weatherForecast.riskLevel === 'MODERATE_RISK' ? 'MEDIUM' : 'LOW'
            },
            {
                factor: 'Vegetation Trend',
                status: vegetationIndices.trend,
                impact: vegetationIndices.trend === 'DECLINING' ? 'HIGH' : vegetationIndices.trend === 'STABLE' ? 'MEDIUM' : 'LOW'
            },
            {
                factor: 'Machinery Reliability',
                status: sortedMachines.length ? `${Math.round(sortedMachines.reduce((sum, machine)=>sum + machine.healthScore, 0) / sortedMachines.length)} AVG` : 'NO DATA',
                impact: sortedMachines.some((machine)=>machine.connectivity === 'OFFLINE') ? 'HIGH' : 'LOW'
            },
            {
                factor: 'Alert Pressure',
                status: `${unresolvedAlerts.length} OPEN`,
                impact: unresolvedAlerts.length >= 4 ? 'HIGH' : unresolvedAlerts.length >= 2 ? 'MEDIUM' : 'LOW'
            }
        ];
        const dataManager = {
            summary: {
                totalMachines: sortedMachines.length,
                onlineMachines: sortedMachines.filter((machine)=>machine.connectivity === 'ONLINE').length,
                degradedMachines: sortedMachines.filter((machine)=>machine.connectivity === 'DEGRADED').length,
                offlineMachines: sortedMachines.filter((machine)=>machine.connectivity === 'OFFLINE').length,
                avgHealthScore: sortedMachines.length ? Math.round(sortedMachines.reduce((sum, machine)=>sum + machine.healthScore, 0) / sortedMachines.length) : 0
            },
            machines: sortedMachines,
            recentMachineEvents: recentEvents.filter((event)=>event.type.includes('ALERT') || event.type.includes('SYNC') || event.type.includes('VRA')).slice(0, 12).map((event)=>({
                    id: event.id,
                    type: event.type,
                    at: event.createdAt.toISOString()
                })),
            generatedAt: new Date().toISOString()
        };
        const fieldStateAnalytics = {
            weatherForecast,
            vegetationIndices,
            growthStages: stageByField,
            keyFactors,
            generatedAt: new Date().toISOString()
        };
        return {
            devices,
            unresolvedAlerts,
            latestReadings,
            fieldLeaderboard,
            leaderboardGeneratedAt: new Date().toISOString(),
            fieldStateAnalytics,
            dataManager,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__802d566d._.js.map