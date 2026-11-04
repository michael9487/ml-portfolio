import { getMode } from "@/lib/server/config";
import { readVisitorId, setSessionUser } from "@/lib/server/session";
import { guarded, respond } from "@/lib/server/state";
import { getStore } from "@/lib/server/store";

/** 只在本機未設定 LINE / Supabase 時可用，正式環境一律拒絕 */
export const POST = guarded(async () => {
  const store = getStore();
  if (!store || getMode() !== "demo") return respond("unavailable", 404);
  const user = { id: "demo-user", name: "示範帳號" };
  await setSessionUser(user);
  const visitorId = await readVisitorId();
  if (visitorId) await store.claimViews(user.id, visitorId);
  return respond(undefined, 200, { user });
});
