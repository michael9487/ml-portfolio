import { env, getMode } from "@/lib/server/config";
import { readVisitorId, setSessionUser } from "@/lib/server/session";
import { guarded, respond } from "@/lib/server/state";
import { getStore } from "@/lib/server/store";

/**
 * 前端傳來的 userId 不可信，所以只收 ID Token，交給 LINE 驗證後
 * 才採用其中的 sub 作為身分，再換成自己簽的 httpOnly cookie。
 */
export const POST = guarded(async (req) => {
  const store = getStore();
  if (!store || getMode() !== "live") return respond("unavailable", 503);

  const body = (await req.json().catch(() => null)) as { idToken?: unknown } | null;
  if (typeof body?.idToken !== "string") return respond("bad_token", 400);

  const verify = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: body.idToken, client_id: env.lineChannelId }),
  });
  if (!verify.ok) return respond("invalid_token", 401);

  const claims = (await verify.json()) as { sub: string; name?: string; picture?: string };
  const user = { id: claims.sub, name: claims.name ?? "LINE 使用者", picture: claims.picture };
  await store.upsertUser(user);
  const visitorId = await readVisitorId();
  if (visitorId) await store.claimViews(user.id, visitorId);
  await setSessionUser(user);
  return respond(undefined, 200, { user });
});
