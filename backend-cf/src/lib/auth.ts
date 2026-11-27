import type { Context, Next } from "hono";
import type { Env } from "./types";

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  nickname: string;
  points: number;
};

type Variables = { user: AuthUser };

function b64url(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return atob(b64);
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(sig);
}

export async function createToken(
  secret: string,
  userId: string,
  expiresInSec = 60 * 60 * 24 * 30
): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + expiresInSec,
    })
  );
  const body = `${header}.${payload}`;
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifyToken(
  secret: string,
  token: string
): Promise<{ sub: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expected = await hmacSign(secret, `${header}.${payload}`);
  if (expected !== sig) return null;
  try {
    const data = JSON.parse(fromB64url(payload)) as { sub?: string; exp?: number };
    if (!data.sub || !data.exp) return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}

export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "로그인이 필요해요." }, 401);
  }
  const token = header.slice(7);
  const verified = await verifyToken(c.env.JWT_SECRET, token);
  if (!verified) {
    return c.json({ error: "로그인 정보가 만료됐어요. 다시 로그인해 주세요." }, 401);
  }
  const row = await c.env.DB.prepare(
    "SELECT id, phone, name, nickname, points FROM users WHERE id = ?"
  )
    .bind(verified.sub)
    .first<AuthUser>();
  if (!row) {
    return c.json({ error: "사용자를 찾을 수 없어요." }, 401);
  }
  c.set("user", row);
  await next();
}

export type { Variables };
