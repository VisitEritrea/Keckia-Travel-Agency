import type { Config, Context } from "@netlify/functions";
import { handleApi, type ApiRequest } from "../../server/api.js";

/**
 * Production entry point. Everything under /api/* is routed here and handed to
 * the shared router in server/api.ts, so the deployed API and the local dev
 * API are the same code enforcing the same permissions.
 */
export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/, "");

  let body: unknown = undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    body = await req.json().catch(() => ({}));
  }

  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name) cookies[name] = decodeURIComponent(value.join("="));
  }

  const apiRequest: ApiRequest = {
    method: req.method,
    path,
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    cookies,
  };

  let result;
  try {
    result = await handleApi(apiRequest);
  } catch (error: any) {
    console.error("API error", error);
    // A missing or unreachable database is a configuration problem, not a
    // crash, and the message explains exactly how to fix it — so it is passed
    // through to the browser as 503 rather than swallowed as a generic 500.
    const unavailable = error?.name === "DatabaseUnavailableError";
    return Response.json(
      { error: error?.message || "Unexpected server error.", database: unavailable ? false : undefined },
      {
        status: unavailable ? 503 : 500,
        headers: path.startsWith("public") ? { "Access-Control-Allow-Origin": "*" } : undefined,
      },
    );
  }

  if (result.cookie) {
    context.cookies.set({
      name: result.cookie.name,
      value: result.cookie.value,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: result.cookie.maxAge,
    });
  }
  if (result.clearCookie) {
    context.cookies.delete({ name: result.clearCookie, path: "/" });
  }

  // Public feed routes carry their own CORS and caching headers; everything
  // else stays uncached so a signed-in user never reads a stale record.
  const headers = { "Cache-Control": "no-store", ...(result.headers ?? {}) };

  if (result.body === null) {
    return new Response(null, { status: result.status, headers });
  }

  return Response.json(result.body, {
    status: result.status,
    headers,
  });
};

export const config: Config = {
  path: "/api/*",
};
