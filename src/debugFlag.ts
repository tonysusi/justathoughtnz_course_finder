/**
 * Debug panels, the Debug nav link and the "answers are saved" notice: on in the local dev server, and in
 * deployed builds made with VITE_DEBUG=true. The server logs only when DEBUG_LOG is on (lib/debugLog/server.ts).
 */
export const DEBUG_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEBUG === "true";
