import "server-only";
import type { Mode } from "@/lib/types";

export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "",
  lineChannelId: process.env.LINE_CHANNEL_ID ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
};

export function getMode(): Mode {
  if (Object.values(env).every(Boolean)) return "live";
  return process.env.NODE_ENV === "production" ? "off" : "demo";
}
