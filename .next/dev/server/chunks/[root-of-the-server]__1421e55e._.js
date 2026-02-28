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
"[project]/src/lib/invite-email.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendInviteEmail",
    ()=>sendInviteEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/errors.ts [app-route] (ecmascript)");
;
async function sendInviteEmail(input) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('EMAIL_NOT_CONFIGURED', 'RESEND_API_KEY is missing. Configure email delivery first.', 500);
    }
    const fromEmail = process.env.INVITE_FROM_EMAIL || 'onboarding@resend.dev';
    const subject = `FarmOps Invite: Join as ${input.role}`;
    const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">You are invited to FarmOps</h2>
      <p style="margin:0 0 12px;">You have been invited to join farm <strong>${input.farmId}</strong> as <strong>${input.role}</strong>.</p>
      <p style="margin:0 0 16px;">Use this link to accept the invite and login or sign up with your email:</p>
      <p style="margin:0 0 20px;">
        <a href="${input.inviteUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;">Accept Invite</a>
      </p>
      <p style="font-size:12px;color:#6b7280;word-break:break-all;">If the button does not work, copy and open:<br/>${input.inviteUrl}</p>
    </div>
  `;
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [
                input.to
            ],
            subject,
            html
        })
    });
    const result = await response.json();
    if (!response.ok) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('EMAIL_SEND_FAILED', result?.message || 'Failed to send invite email', 502, result);
    }
    return {
        provider: 'resend',
        id: result?.id
    };
}
}),
"[project]/src/app/api/farms/[farmId]/invites/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dev$2d$invite$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dev-invite-store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$invite$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/invite-email.ts [app-route] (ecmascript)");
;
;
;
;
;
const createInviteSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    role: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'MANAGER',
        'WORKER'
    ])
});
async function GET(request, context) {
    try {
        const { farmId } = await context.params;
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dev$2d$invite$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listInvitesByFarm"])(farmId);
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
        const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestRole"])(request);
        if (role !== 'OWNER') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('FORBIDDEN', 'Only owners can invite users', 403);
        }
        const { farmId } = await context.params;
        if (!farmId || farmId.trim().length < 2) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]('FARM_NOT_FOUND', 'Farm not found. Select a valid farm before sending invites.', 404);
        }
        const body = await request.json();
        const input = createInviteSchema.parse(body);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dev$2d$invite$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createInvite"])({
            farmId,
            email: input.email,
            role: input.role,
            origin: request.nextUrl.origin
        });
        const delivery = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$invite$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendInviteEmail"])({
            to: created.email,
            inviteUrl: created.inviteUrl,
            role: created.role,
            farmId
        });
        return Response.json({
            success: true,
            data: {
                id: created.id,
                email: created.email,
                role: created.role,
                inviteUrl: created.inviteUrl,
                token: created.token,
                expiresAt: created.expiresAt,
                delivery
            }
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(error);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1421e55e._.js.map