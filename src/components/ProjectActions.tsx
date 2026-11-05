"use client";

import { showCount } from "@/data/site";
import { usePortfolio } from "./PortfolioProvider";

export function ProjectActions({ projectId }: { projectId: string }) {
  const { state, statsFor, toggleFavorite, toggleVote } = usePortfolio();
  const stats = statsFor(projectId);
  const favorited = state?.favorites.includes(projectId) ?? false;
  const voted = state?.votes.includes(projectId) ?? false;
  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={!state}
        aria-pressed={favorited}
        onClick={() => toggleFavorite(projectId)}
        className={`${base} ${favorited ? "border-heart bg-heart/15 text-bone" : "border-rule text-muted hover:border-bone/50 hover:text-bone"}`}
      >
        <span aria-hidden="true" className={favorited ? "text-heart" : ""}>
          ♥
        </span>
        {favorited ? "已收藏" : "收藏"}
        {showCount(stats.favorites) && <span className="font-mono text-xs">{stats.favorites}</span>}
      </button>
      <button
        type="button"
        disabled={!state}
        aria-pressed={voted}
        onClick={() => toggleVote(projectId)}
        className={`${base} ${voted ? "border-star bg-star/15 text-bone" : "border-rule text-muted hover:border-bone/50 hover:text-bone"}`}
      >
        <span aria-hidden="true" className={voted ? "text-star" : ""}>
          ★
        </span>
        {voted ? "已投票" : "投一票"}
        {showCount(stats.votes) && <span className="font-mono text-xs">{stats.votes}</span>}
      </button>
    </div>
  );
}
