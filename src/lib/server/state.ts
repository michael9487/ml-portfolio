import "server-only";
import { NextResponse } from "next/server";
import { activeIds } from "@/data/projects";
import type { PublicState, SessionUser } from "@/lib/types";
import { getMode } from "./config";
import { getSessionUser, readVisitorId } from "./session";
import { getStore } from "./store";

type Overrides = {
  /** 這個請求剛發的訪客 id，cookie 要到下一個請求才讀得到 */
  visitorId?: string;
  /** 這個請求剛登入或登出的結果，理由同上 */
  user?: SessionUser | null;
};

export async function buildState(overrides: Overrides = {}): Promise<PublicState> {
  const mode = getMode();
  const store = getStore();
  if (!store) {
    return { mode, stats: [], site: { views: 0, visitors: 0 }, user: null, favorites: [], votes: [], myViews: [] };
  }
  const user = overrides.user !== undefined ? overrides.user : await getSessionUser();
  const visitorId = overrides.visitorId ?? (await readVisitorId());
  const [stats, site, favorites, votes, myViews] = await Promise.all([
    store.stats(),
    store.site(),
    user ? store.listFavorites(user.id) : [],
    user ? store.listVotes(user.id) : [],
    visitorId ? store.listViewed(visitorId) : [],
  ]);
  return { mode, stats, site, user, favorites, votes, myViews };
}

export async function respond(error?: string, status = 200, overrides?: Overrides) {
  return NextResponse.json({ state: await buildState(overrides), error }, { status });
}

/** 讀取並驗證 body 裡的 projectId，只接受資料檔裡存在的專案 */
export async function readProjectId(req: Request): Promise<string | null> {
  const body = (await req.json().catch(() => null)) as { projectId?: unknown } | null;
  const id = body?.projectId;
  return typeof id === "string" && activeIds.has(id) ? id : null;
}

export function guarded(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  };
}
