/**
 * A minimal stand-in for Netlify Dev: serves the built app and routes /api/*
 * to the same handler the deployed function uses. Used for local verification.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { handleApi, type ApiRequest } from "../server/api.js";

const ROOT = new URL("../dist/", import.meta.url).pathname;
const TYPES: Record<string, string> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json",
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (url.pathname.startsWith("/api/")) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString();

    const cookies: Record<string, string> = {};
    for (const part of (req.headers.cookie ?? "").split(";")) {
      const [name, ...value] = part.trim().split("=");
      if (name) cookies[name] = decodeURIComponent(value.join("="));
    }

    const request: ApiRequest = {
      method: req.method ?? "GET",
      path: url.pathname.replace(/^\/api\/?/, ""),
      query: Object.fromEntries(url.searchParams.entries()),
      body: raw ? JSON.parse(raw) : undefined,
      cookies,
    };

    let result;
    try {
      result = await handleApi(request);
    } catch (error: any) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: error?.message }));
      return;
    }

    const headers: Record<string, string> = { "content-type": "application/json", ...(result.headers ?? {}) };
    if (result.cookie) headers["set-cookie"] = `${result.cookie.name}=${result.cookie.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${result.cookie.maxAge}`;
    if (result.clearCookie) headers["set-cookie"] = `${result.clearCookie}=; Path=/; Max-Age=0`;
    res.writeHead(result.status, headers);
    res.end(result.body === null ? "" : JSON.stringify(result.body));
    return;
  }

  const path = normalize(url.pathname === "/" ? "/index.html" : url.pathname);
  try {
    const file = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
    res.end(file);
  } catch {
    const shell = await readFile(join(ROOT, "index.html"));
    res.writeHead(200, { "content-type": "text/html" });
    res.end(shell);
  }
}).listen(4188, () => console.log("ready on http://127.0.0.1:4188"));
