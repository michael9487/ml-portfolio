import { getSessionUser } from "@/lib/server/session";
import { guarded, readProjectId, respond } from "@/lib/server/state";
import { getStore } from "@/lib/server/store";

export const POST = guarded(async (req) => {
  const store = getStore();
  if (!store) return respond("unavailable", 503);
  const user = await getSessionUser();
  if (!user) return respond("login_required", 401);
  const projectId = await readProjectId(req);
  if (!projectId) return respond("bad_project", 400);
  const result = await store.toggleVote(user.id, projectId);
  return result === "limit" ? respond("vote_limit", 409) : respond();
});
