"use client";

import { useEffect, useRef } from "react";
import { showCount } from "@/data/site";
import { CountUp } from "./Motion";
import { usePortfolio } from "./PortfolioProvider";

/** 進入專案頁就記錄一次瀏覽，並顯示最新統計 */
export function ProjectLiveStats({ projectId }: { projectId: string }) {
  const { state, statsFor, recordView } = usePortfolio();
  const stats = statsFor(projectId);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordView(projectId);
  }, [projectId, recordView]);

  if (state?.mode === "off" || !showCount(stats.views)) return null;
  return (
    <dl className="flex gap-8">
      <div>
        <dt className="text-xs text-muted">瀏覽</dt>
        <dd className="mt-1 font-mono text-2xl">
          <CountUp value={stats.views} />
        </dd>
      </div>
      {showCount(stats.visitors) && (
        <div>
          <dt className="text-xs text-muted">不重複訪客</dt>
          <dd className="mt-1 font-mono text-2xl">
            <CountUp value={stats.visitors} />
          </dd>
        </div>
      )}
    </dl>
  );
}
