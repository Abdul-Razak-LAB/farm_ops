(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
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
    const isPublicRoute = request.nextUrl.pathname === '/';
    const isStateChanging = [
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ].includes(request.method);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map