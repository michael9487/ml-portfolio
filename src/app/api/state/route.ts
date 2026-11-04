import { guarded, respond } from "@/lib/server/state";

export const dynamic = "force-dynamic";
export const GET = guarded(() => respond());
