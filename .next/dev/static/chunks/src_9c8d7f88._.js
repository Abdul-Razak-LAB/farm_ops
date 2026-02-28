(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/use-web-push.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWebPush",
    ()=>useWebPush
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$integration$2d$status$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-integration-status.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$observability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/observability.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for(let i = 0; i < rawData.length; i += 1){
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function isIosDevice() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
function isStandalonePwa() {
    const iosStandalone = Boolean(window.navigator.standalone);
    const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return iosStandalone || mediaStandalone;
}
function useWebPush() {
    _s();
    const [isSubscribed, setIsSubscribed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSubscribing, setIsSubscribing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const statusQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$integration$2d$status$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntegrationStatus"])();
    const isSupported = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useWebPush.useMemo[isSupported]": ()=>("TURBOPACK compile-time value", "object") !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
    }["useWebPush.useMemo[isSupported]"], []);
    const integrationAvailable = statusQuery.data?.push ?? false;
    const subscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWebPush.useCallback[subscribe]": async (farmId)=>{
            if (!isSupported) {
                setMessage('Push is unavailable on this browser. In-app alerts will be used.');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$observability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reportIntegrationDegraded"])('push', 'PushManager unavailable in this browser');
                return;
            }
            if (!integrationAvailable) {
                setMessage('Push integration is currently unavailable. In-app alerts will be used.');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$observability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reportIntegrationDegraded"])('push', 'Backend reported push unavailable');
                return;
            }
            if (isIosDevice() && !isStandalonePwa()) {
                setMessage('On iOS, install to Home Screen first, then enable notifications.');
                return;
            }
            setIsSubscribing(true);
            setMessage(null);
            try {
                const keyResponse = await fetch('/api/push/public-key');
                const keyJson = await keyResponse.json();
                if (!keyJson.success || !keyJson.data?.publicKey) {
                    throw new Error(keyJson.error?.message || 'Push key unavailable');
                }
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(keyJson.data.publicKey)
                });
                const subscribeResponse = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        farmId,
                        subscription
                    })
                });
                const subscribeJson = await subscribeResponse.json();
                if (!subscribeJson.success) {
                    throw new Error(subscribeJson.error?.message || 'Unable to persist push subscription');
                }
                setIsSubscribed(true);
                setMessage('Notifications enabled.');
            } catch (error) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$observability$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reportIntegrationDegraded"])('push', error instanceof Error ? error.message : 'Push subscription failed');
                setMessage('Push could not be enabled. In-app alerts will continue.');
            } finally{
                setIsSubscribing(false);
            }
        }
    }["useWebPush.useCallback[subscribe]"], [
        integrationAvailable,
        isSupported
    ]);
    return {
        isSubscribed,
        isSupported,
        isSubscribing,
        integrationAvailable,
        message,
        subscribe
    };
}
_s(useWebPush, "Ar8wdEhfM4OfLOX/YEeiV/rHQzo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$integration$2d$status$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntegrationStatus"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/updates/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UpdatesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$auth$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/auth-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$offline$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-offline-sync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$web$2d$push$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-web-push.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
async function apiCall(path, options) {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers || {}
        }
    });
    const json = await response.json();
    if (!json.success) {
        throw new Error(json.error?.message || 'Request failed');
    }
    return json.data;
}
function UpdatesPage() {
    _s();
    const { farmId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$auth$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { mutateAsync: queueDailyUpdate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$offline$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOfflineAction"])('updates', 'DAILY_UPDATE_SUBMITTED');
    const push = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$web$2d$push$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebPush"])();
    const [inputMode, setInputMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('VOICE');
    const [isRecording, setIsRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [voiceTranscript, setVoiceTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [blockers, setBlockers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const updatesQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'daily-updates',
            farmId
        ],
        queryFn: {
            "UpdatesPage.useQuery[updatesQuery]": ()=>apiCall(`/api/farms/${farmId}/daily-updates`)
        }["UpdatesPage.useQuery[updatesQuery]"],
        enabled: Boolean(farmId)
    });
    const createMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "UpdatesPage.useMutation[createMutation]": async ()=>{
                const payload = {
                    summary: inputMode === 'VOICE' ? voiceTranscript || summary : summary,
                    blockers: blockers || undefined,
                    inputMode,
                    idempotencyKey: crypto.randomUUID()
                };
                if (("TURBOPACK compile-time value", "object") !== 'undefined' && !window.navigator.onLine) {
                    await queueDailyUpdate({
                        ...payload,
                        queuedAt: new Date().toISOString(),
                        offline: true
                    });
                    return {
                        queued: true
                    };
                }
                try {
                    return await apiCall(`/api/farms/${farmId}/daily-updates`, {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                } catch  {
                    await queueDailyUpdate({
                        ...payload,
                        queuedAt: new Date().toISOString(),
                        offline: true
                    });
                    return {
                        queued: true
                    };
                }
            }
        }["UpdatesPage.useMutation[createMutation]"],
        onSuccess: {
            "UpdatesPage.useMutation[createMutation]": ()=>{
                setSummary('');
                setBlockers('');
                setVoiceTranscript('');
                setIsRecording(false);
                void updatesQuery.refetch();
            }
        }["UpdatesPage.useMutation[createMutation]"]
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6 pb-24 md:pb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold tracking-tight",
                        children: "Daily Update"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground uppercase font-semibold",
                        children: "Voice-first fallback to short-form"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "p-4 border rounded-xl bg-card space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-md border bg-accent/20 p-3 space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold uppercase",
                                        children: "Alerts"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                        lineNumber: 100,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>push.subscribe(farmId ?? undefined),
                                        disabled: push.isSubscribing || !push.isSupported || !push.integrationAvailable || push.isSubscribed,
                                        className: "h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50",
                                        children: push.isSubscribed ? 'Enabled' : push.isSubscribing ? 'Enabling...' : 'Enable Push'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-muted-foreground",
                                children: push.message || 'Enable notifications for escalations. If unavailable, in-app alerts remain active.'
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-2 rounded-lg bg-accent/30 p-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setInputMode('VOICE'),
                                className: `h-9 rounded-md text-xs font-semibold ${inputMode === 'VOICE' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`,
                                children: "Voice First"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setInputMode('FORM'),
                                className: `h-9 rounded-md text-xs font-semibold ${inputMode === 'FORM' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`,
                                children: "Short Form"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    inputMode === 'VOICE' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsRecording((current)=>!current),
                                className: `w-full h-10 rounded-md text-sm font-semibold ${isRecording ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`,
                                children: isRecording ? 'Stop Recording' : 'Start Recording'
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: voiceTranscript,
                                onChange: (event)=>setVoiceTranscript(event.target.value),
                                placeholder: "Voice transcript will appear here (editable fallback)",
                                className: "w-full min-h-[100px] rounded-md bg-accent/40 px-3 py-2 text-sm"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: summary,
                        onChange: (event)=>setSummary(event.target.value),
                        placeholder: "What was completed today?",
                        className: "w-full min-h-[100px] rounded-md bg-accent/40 px-3 py-2 text-sm"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: blockers,
                        onChange: (event)=>setBlockers(event.target.value),
                        placeholder: "Blockers (optional)",
                        className: "w-full h-10 rounded-md bg-accent/50 px-3 text-sm"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>createMutation.mutate(),
                        disabled: createMutation.isPending || (inputMode === 'VOICE' ? voiceTranscript : summary).trim().length < 3,
                        className: "w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50",
                        children: createMutation.isPending ? 'Saving...' : 'Submit Update'
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 158,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "p-4 border rounded-xl bg-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-bold uppercase mb-3",
                        children: "Recent Updates"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: updatesQuery.data?.length ? updatesQuery.data.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-md bg-accent/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: entry.payload?.summary
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this),
                                    entry.payload?.blockers ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-1",
                                        children: [
                                            "Blockers: ",
                                            entry.payload.blockers
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                        lineNumber: 173,
                                        columnNumber: 42
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-muted-foreground mt-2",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(entry.createdAt)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                        lineNumber: 174,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, entry.id, true, {
                                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-muted-foreground",
                            children: "No updates submitted yet."
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                            lineNumber: 176,
                            columnNumber: 16
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/updates/page.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_s(UpdatesPage, "vrD+h3gv9Voe9C58HMR7Ha94C2Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$auth$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$offline$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOfflineAction"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$web$2d$push$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebPush"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = UpdatesPage;
var _c;
__turbopack_context__.k.register(_c, "UpdatesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_9c8d7f88._.js.map