"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { showCount } from "@/data/site";
import { usePortfolio } from "../PortfolioProvider";
import type { createStarChart } from "./scene";

type Chart = ReturnType<typeof createStarChart>;

const LABEL_WIDTH = 190;

const getHeroTop = () => document.getElementById("hero")?.offsetTop ?? 0;

/** 固定在背景的星圖；星星大小由資料庫統計決定，標籤是真正可點、可聚焦的連結 */
export function StarChart() {
  const { state, statsFor } = usePortfolio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const chartRef = useRef<Chart | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./scene")
      .then(({ createStarChart }) => {
        if (cancelled) return;
        chartRef.current = createStarChart(
          canvas,
          projects.map((p) => ({ id: p.id, position: p.star, soon: p.soon })),
          {
            reducedMotion,
            getHeroTop,
            onFrame(points, hero) {
              const layer = layerRef.current;
              if (layer) {
                // 標籤只在星圖區塊顯示：捲進來時淡入，捲走時淡出
                const vh = window.innerHeight;
                const enter = (window.scrollY - (getHeroTop() - vh * 0.35)) / (vh * 0.35);
                const opacity = Math.max(0, Math.min(1, enter, 1 - hero * 3.2));
                layer.style.opacity = String(opacity);
                layer.style.visibility = opacity < 0.02 ? "hidden" : "visible";
              }
              const w = window.innerWidth;
              points.forEach((pt, i) => {
                const el = labelRefs.current[i];
                if (!el) return;
                // 窄螢幕星星靠得近，標籤改放在星星正下方才不會互相重疊
                if (w < 768) {
                  const half = el.offsetWidth / 2;
                  const cx = Math.min(Math.max(pt.x - half, 8), w - el.offsetWidth - 8);
                  el.style.transform = `translate3d(${cx}px, ${pt.y + 12}px, 0)`;
                  return;
                }
                const flip = pt.x + LABEL_WIDTH > w - 8;
                const x = flip ? pt.x - el.offsetWidth - 14 : pt.x + 14;
                el.style.transform = `translate3d(${x}px, ${pt.y - 18}px, 0)`;
              });
            },
          },
        );
        setReady(true);
      })
      .catch(() => {
        // 沒有 WebGL 時退回純背景，作品列表與連結不受影響
      });

    return () => {
      cancelled = true;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  const stats = state?.stats;
  useEffect(() => {
    if (!ready || !stats) return;
    const scores: Record<string, number> = {};
    for (const s of stats) scores[s.project_id] = s.views + s.favorites * 2 + s.votes * 3;
    chartRef.current?.setScores(scores);
  }, [ready, stats]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 h-screen w-screen" />
      <div
        ref={layerRef}
        className={`pointer-events-none fixed inset-0 z-20 overflow-hidden transition-[filter] ${ready ? "" : "invisible"}`}
      >
        {projects.map((p, i) => {
          const body = (
            <>
              <span className="block text-sm whitespace-nowrap text-bone">{p.title}</span>
              {(p.soon || showCount(statsFor(p.id).views)) && (
                <span className="mt-0.5 block font-mono text-[11px] tracking-wide text-muted">
                  {p.soon ? "製作中" : `${statsFor(p.id).views} 次瀏覽`}
                </span>
              )}
            </>
          );
          const className = "absolute top-0 left-0 block will-change-transform";
          return p.soon ? (
            <span key={p.id} ref={(el) => void (labelRefs.current[i] = el)} className={`${className} opacity-60`}>
              {body}
            </span>
          ) : (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              ref={(el) => void (labelRefs.current[i] = el)}
              className={`${className} pointer-events-auto rounded px-1 py-0.5 transition-colors hover:bg-bone/10 focus-visible:bg-bone/10`}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </>
  );
}
