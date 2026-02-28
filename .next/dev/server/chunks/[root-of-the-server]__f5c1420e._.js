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
"[project]/src/lib/dev-invite-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "acceptInvite",
    ()=>acceptInvite,
    "createInvite",
    ()=>createInvite,
    "getInviteByToken",
    ()=>getInviteByToken,
    "listInvitesByFarm",
    ()=>listInvitesByFarm
]);
const globalStore = globalThis;
const store = globalStore.__farmOpsDevInviteStore ?? {
    invites: [],
    users: [],
    memberships: [],
    sessions: []
};
globalStore.__farmOpsDevInviteStore = store;
function listInvitesByFarm(farmId) {
    return store.invites.filter((invite)=>invite.farmId === farmId).sort((a, b)=>a.createdAt < b.createdAt ? 1 : -1);
}
function createInvite(input) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invite = {
        id: crypto.randomUUID(),
        token,
        farmId: input.farmId,
        email: input.email.toLowerCase(),
        role: input.role,
        status: 'PENDING',
        inviteUrl: `${input.origin}/auth/invite/${token}`,
        expiresAt,
        createdAt: new Date().toISOString()
    };
    store.invites.push(invite);
    return invite;
}
function getInviteByToken(token) {
    const invite = store.invites.find((entry)=>entry.token === token);
    if (!invite) return null;
    if (invite.status === 'PENDING' && new Date(invite.expiresAt).getTime() < Date.now()) {
        invite.status = 'EXPIRED';
    }
    return invite;
}
function acceptInvite(input) {
    const invite = getInviteByToken(input.token);
    if (!invite) {
        return {
            ok: false,
            code: 'INVITE_NOT_FOUND',
            message: 'Invite link is invalid'
        };
    }
    if (invite.status !== 'PENDING') {
        return {
            ok: false,
            code: 'INVITE_NOT_ACTIVE',
            message: 'Invite is not active'
        };
    }
    if (invite.email !== input.email.toLowerCase()) {
        return {
            ok: false,
            code: 'INVITE_EMAIL_MISMATCH',
            message: 'Use the invited email address'
        };
    }
    let user = store.users.find((entry)=>entry.email === input.email.toLowerCase());
    if (input.mode === 'SIGNUP') {
        if (user) {
            return {
                ok: false,
                code: 'EMAIL_EXISTS',
                message: 'Account already exists, login instead'
            };
        }
        user = {
            id: crypto.randomUUID(),
            email: input.email.toLowerCase(),
            name: input.name,
            password: input.password
        };
        store.users.push(user);
    } else {
        if (!user || user.password !== input.password) {
            return {
                ok: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            };
        }
    }
    const membershipExists = store.memberships.some((entry)=>entry.farmId === invite.farmId && entry.userId === user.id);
    if (!membershipExists) {
        store.memberships.push({
            farmId: invite.farmId,
            userId: user.id,
            role: invite.role
        });
    }
    invite.status = 'ACCEPTED';
    const sessionToken = crypto.randomUUID();
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    store.sessions.push({
        token: sessionToken,
        userId: user.id,
        expiresAt: sessionExpires
    });
    return {
        ok: true,
        user,
        invite,
        sessionToken,
        sessionExpires
    };
}
}),
"[project]/src/app/api/auth/invites/[token]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dev$2d$invite$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dev-invite-store.ts [app-route] (ecmascript)");
;
;
async function GET(_request, context) {
    try {
        const { token } = await context.params;
        const invite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dev$2d$invite$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInviteByToken"])(token);
        if (!invite) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('INVITE_NOT_FOUND', 'Invite link is invalid', 404);
        }
        return Response.json({
            success: true,
            data: {
                token,
                farmId: invite.farmId,
                email: invite.email,
                role: invite.role,
                status: invite.status,
                expiresAt: invite.expiresAt
            }
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(error);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5c1420e._.js.map