import { clearSession } from "@/lib/server/session";
import { guarded, respond } from "@/lib/server/state";

export const POST = guarded(async () => {
  await clearSession();
  return respond(undefined, 200, { user: null });
});
