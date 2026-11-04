import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MAX_VOTES } from "@/data/site";
import type { ProjectStats, SessionUser, SiteStats } from "@/lib/types";
import { env, getMode } from "./config";

export type ToggleResult = "added" | "removed" | "limit";

export interface Store {
  upsertUser(user: SessionUser): Promise<void>;
  claimViews(userId: string, visitorId: string): Promise<void>;
  recordView(projectId: string, visitorId: string, userId: string | null): Promise<void>;
  stats(): Promise<ProjectStats[]>;
  site(): Promise<SiteStats>;
  listFavorites(userId: string): Promise<string[]>;
  listVotes(userId: string): Promise<string[]>;
  listViewed(visitorId: string): Promise<string[]>;
  toggleFavorite(userId: string, projectId: string): Promise<ToggleResult>;
  toggleVote(userId: string, projectId: string): Promise<ToggleResult>;
}

type DbResult<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>({ data, error }: DbResult<T>): T {
  if (error) throw new Error(error.message);
  return data as T;
}

function supabaseStore(db: SupabaseClient): Store {
  return {
    async upsertUser(u) {
      unwrap(
        await db.from("line_users").upsert({
          user_id: u.id,
          display_name: u.name,
          picture_url: u.picture ?? null,
          last_login_at: new Date().toISOString(),
        }),
      );
    },
    async claimViews(userId, visitorId) {
      unwrap(await db.rpc("claim_views", { p_user: userId, p_visitor: visitorId }));
    },
    async recordView(projectId, visitorId, userId) {
      unwrap(await db.rpc("record_view", { p_project: projectId, p_visitor: visitorId, p_user: userId }));
    },
    async stats() {
      const rows = unwrap<ProjectStats[]>(await db.rpc("project_stats"));
      return rows.map((r) => ({
        project_id: r.project_id,
        views: Number(r.views),
        visitors: Number(r.visitors),
        favorites: Number(r.favorites),
        votes: Number(r.votes),
      }));
    },
    async site() {
      const [row] = unwrap<SiteStats[]>(await db.rpc("site_stats"));
      return { views: Number(row?.views ?? 0), visitors: Number(row?.visitors ?? 0) };
    },
    async listFavorites(userId) {
      const rows = unwrap<{ project_id: string }[]>(
        await db.from("favorites").select("project_id").eq("user_id", userId).order("created_at", { ascending: false }),
      );
      return rows.map((r) => r.project_id);
    },
    async listVotes(userId) {
      const rows = unwrap<{ project_id: string }[]>(await db.from("votes").select("project_id").eq("user_id", userId));
      return rows.map((r) => r.project_id);
    },
    async listViewed(visitorId) {
      const rows = unwrap<{ project_id: string }[]>(
        await db.from("project_views").select("project_id").eq("visitor_id", visitorId),
      );
      return [...new Set(rows.map((r) => r.project_id))];
    },
    async toggleFavorite(userId, projectId) {
      return unwrap<ToggleResult>(await db.rpc("toggle_favorite", { p_user: userId, p_project: projectId }));
    },
    async toggleVote(userId, projectId) {
      return unwrap<ToggleResult>(
        await db.rpc("toggle_vote", { p_user: userId, p_project: projectId, p_max: MAX_VOTES }),
      );
    },
  };
}

/** 只在本機示範模式使用，重啟就清空。行為與 supabase/schema.sql 的函式對應。 */
function memoryStore(): Store {
  type View = { projectId: string; visitorId: string; userId: string | null; at: number };
  const views: View[] = [];
  const favorites = new Map<string, Set<string>>();
  const votes = new Map<string, Set<string>>();
  const setOf = (map: Map<string, Set<string>>, key: string) => {
    if (!map.has(key)) map.set(key, new Set());
    return map.get(key)!;
  };
  const distinct = (rows: View[]) => new Set(rows.map((v) => v.userId ?? v.visitorId)).size;
  const countFor = (map: Map<string, Set<string>>, id: string) =>
    [...map.values()].filter((s) => s.has(id)).length;

  return {
    async upsertUser() {},
    async claimViews(userId, visitorId) {
      for (const v of views) if (v.visitorId === visitorId && !v.userId) v.userId = userId;
    },
    async recordView(projectId, visitorId, userId) {
      const recent = views.some(
        (v) => v.visitorId === visitorId && v.projectId === projectId && Date.now() - v.at < 30 * 60_000,
      );
      if (!recent) views.push({ projectId, visitorId, userId, at: Date.now() });
    },
    async stats() {
      const ids = new Set([
        ...views.map((v) => v.projectId),
        ...[...favorites.values()].flatMap((s) => [...s]),
        ...[...votes.values()].flatMap((s) => [...s]),
      ]);
      return [...ids].map((id) => {
        const rows = views.filter((v) => v.projectId === id);
        return {
          project_id: id,
          views: rows.length,
          visitors: distinct(rows),
          favorites: countFor(favorites, id),
          votes: countFor(votes, id),
        };
      });
    },
    async site() {
      return { views: views.length, visitors: distinct(views) };
    },
    async listFavorites(userId) {
      return [...setOf(favorites, userId)];
    },
    async listVotes(userId) {
      return [...setOf(votes, userId)];
    },
    async listViewed(visitorId) {
      return [...new Set(views.filter((v) => v.visitorId === visitorId).map((v) => v.projectId))];
    },
    async toggleFavorite(userId, projectId) {
      const s = setOf(favorites, userId);
      if (s.delete(projectId)) return "removed";
      s.add(projectId);
      return "added";
    },
    async toggleVote(userId, projectId) {
      const s = setOf(votes, userId);
      if (s.delete(projectId)) return "removed";
      if (s.size >= MAX_VOTES) return "limit";
      s.add(projectId);
      return "added";
    },
  };
}

const globalStore = globalThis as unknown as { __portfolioStore?: Store };

export function getStore(): Store | null {
  const mode = getMode();
  if (mode === "off") return null;
  if (!globalStore.__portfolioStore) {
    globalStore.__portfolioStore =
      mode === "live"
        ? // 只取到網域：Supabase 後台顯示的網址常帶 /rest/v1/，client 會自己再補一次而變成無效路徑
          supabaseStore(createClient(new URL(env.supabaseUrl).origin, env.supabaseKey, { auth: { persistSession: false } }))
        : memoryStore();
  }
  return globalStore.__portfolioStore;
}
