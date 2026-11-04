import "server-only";
import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";
import { env, getMode } from "./config";

const SESSION_COOKIE = "pf_session";
const VISITOR_COOKIE = "pf_visitor";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

function secret() {
  // 固定值只會出現在示範模式；live 模式由 getMode() 保證 SESSION_SECRET 存在
  const value = getMode() === "live" ? env.sessionSecret : "local-demo-only";
  return new TextEncoder().encode(value);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (getMode() === "off") return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? "LINE 使用者"),
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser) {
  const maxAge = 60 * 60 * 24 * 30;
  const token = await new SignJWT({ name: user.name, picture: user.picture })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(maxAge));
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readVisitorId(): Promise<string | null> {
  const value = (await cookies()).get(VISITOR_COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}

export async function ensureVisitorId(): Promise<string> {
  const existing = await readVisitorId();
  if (existing) return existing;
  const id = randomUUID();
  (await cookies()).set(VISITOR_COOKIE, id, cookieOptions(60 * 60 * 24 * 365));
  return id;
}
