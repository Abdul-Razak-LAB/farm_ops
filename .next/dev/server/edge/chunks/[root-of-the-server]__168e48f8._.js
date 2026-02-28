(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__168e48f8._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/rate-limit.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit
]);
const profiles = {
    auth: {
        limit: 10,
        windowSeconds: 60
    },
    write: {
        limit: 120,
        windowSeconds: 60
    }
};
const memoryStore = new Map();
function getClientIp(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || 'unknown-ip';
    }
    return 'unknown-ip';
}
async function incrementInRedis(key, windowSeconds) {
    const redisUrl = process.env.UPSTASH_REDIS_URL;
    const redisToken = process.env.UPSTASH_REDIS_TOKEN;
    if (!redisUrl || !redisToken) {
        return null;
    }
    const headers = {
        Authorization: `Bearer ${redisToken}`
    };
    const encodedKey = encodeURIComponent(key);
    const incrResponse = await fetch(`${redisUrl}/incr/${encodedKey}`, {
        headers,
        cache: 'no-store'
    });
    if (!incrResponse.ok) {
        return null;
    }
    const incrJson = await incrResponse.json();
    const count = Number(incrJson.result || 0);
    if (count <= 1) {
        await fetch(`${redisUrl}/expire/${encodedKey}/${windowSeconds}`, {
            headers,
            cache: 'no-store'
        });
    }
    return count;
}
function incrementInMemory(key, windowSeconds) {
    const now = Date.now();
    const current = memoryStore.get(key);
    const nextResetAt = now + windowSeconds * 1000;
    if (!current || current.resetAt <= now) {
        memoryStore.set(key, {
            count: 1,
            resetAt: nextResetAt
        });
        return 1;
    }
    const nextCount = current.count + 1;
    memoryStore.set(key, {
        count: nextCount,
        resetAt: current.resetAt
    });
    return nextCount;
}
async function checkRateLimit(input) {
    const config = profiles[input.profile];
    const ip = getClientIp(input.request);
    const route = input.request.nextUrl.pathname;
    const identity = [
        ip,
        input.userId || 'anon-user',
        input.farmId || 'no-farm'
    ].join(':');
    const key = `rl:${input.profile}:${route}:${identity}`;
    const redisCount = await incrementInRedis(key, config.windowSeconds);
    const count = redisCount ?? incrementInMemory(key, config.windowSeconds);
    const limited = count > config.limit;
    return {
        limited,
        limit: config.limit,
        remaining: Math.max(0, config.limit - count),
        retryAfterSeconds: config.windowSeconds
    };
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // 1. Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
    // 2. Auth Check (Simplistic version for brevity)
    // In production, use session token validation against DB/Redis
    const sessionToken = request.cookies.get('session_token')?.value;
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
    const isAuthMutation = request.nextUrl.pathname === '/api/auth/login' || request.nextUrl.pathname === '/api/auth/signup';
    const isPublicRoute = request.nextUrl.pathname === '/';
    const isStateChanging = [
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ].includes(request.method);
    const farmMatch = request.nextUrl.pathname.match(/^\/api\/farms\/([^/]+)/);
    const farmId = farmMatch?.[1];
    const userId = request.headers.get('x-user-id') || undefined;
    if (isAuthMutation || isStateChanging && request.nextUrl.pathname.startsWith('/api')) {
        const rate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkRateLimit"])({
            request,
            profile: isAuthMutation ? 'auth' : 'write',
            userId,
            farmId
        });
        if (rate.limited) {
            return Response.json({
                success: false,
                error: {
                    code: 'RATE_LIMITED',
                    message: 'Too many requests. Please retry later.',
                    details: {
                        retryAfterSeconds: rate.retryAfterSeconds
                    }
                }
            }, {
                status: 429,
                headers: {
                    'Retry-After': String(rate.retryAfterSeconds)
                }
            });
        }
    }
    if (!sessionToken && !isAuthRoute && !isPublicRoute && request.nextUrl.pathname.startsWith('/api')) {
        return Response.json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Auth required'
            }
        }, {
            status: 401
        });
    }
    if (isStateChanging && request.nextUrl.pathname.startsWith('/api')) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        if (origin && host) {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                return Response.json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN_ORIGIN',
                        message: 'Invalid request origin'
                    }
                }, {
                    status: 403
                });
            }
        }
    }
    return response;
}
const config = {
    matcher: [
        '/api/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__168e48f8._.js.map