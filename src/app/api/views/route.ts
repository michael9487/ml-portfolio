import { ensureVisitorId, getSessionUser } from "@/lib/server/session";
import { guarded, readProjectId, respond } from "@/lib/server/state";
import { getStore } from "@/lib/server/store";

export const POST = guarded(async (req) => {
  const store = getStore();
  if (!store) return respond("unavailable", 503);
  const projectId = await readProjectId(req);
  if (!projectId) return respond("bad_project", 400);
  const visitorId = await ensureVisitorId();
  const user = await getSessionUser();
  await store.recordView(projectId, visitorId, user?.id ?? null);
  return respond(undefined, 200, { visitorId });
});
