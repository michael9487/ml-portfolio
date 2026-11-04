"use client";

import Image from "next/image";
import Link from "next/link";
import { activeProjects, projects, type Project } from "@/data/projects";
import { MAX_VOTES } from "@/data/site";
import { CountUp } from "./Motion";
import { usePortfolio } from "./PortfolioProvider";
import { ProjectActions } from "./ProjectActions";

function SectionHead({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <div data-reveal className="mb-10 grid gap-3 border-t border-rule pt-5 sm:grid-cols-[6rem_1fr_minmax(0,22rem)] sm:items-baseline">
      <span className="font-mono text-xs tracking-widest text-star">{index}</span>
      <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      {note && <p className="text-sm leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

export function Hero() {
  const { state } = usePortfolio();
  const totals = (state?.stats ?? []).reduce(
    (acc, s) => ({ favorites: acc.favorites + s.favorites, votes: acc.votes + s.votes }),
    { favorites: 0, votes: 0 },
  );
  const figures = [
    { label: "總瀏覽", value: state?.site.views ?? 0 },
    { label: "不重複訪客", value: state?.site.visitors ?? 0 },
    { label: "收藏", value: totals.favorites },
    { label: "投票", value: totals.votes },
  ];

  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-svh flex-col justify-end px-5 pb-10 sm:px-8 lg:justify-center lg:pb-0"
    >
      <div className="max-w-2xl">
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-star uppercase">
          Front-end Portfolio
        </p>
        <h2 data-reveal className="mt-5 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.08]">
          半年的作品，
          <br />
          畫成一張星圖。
        </h2>
        <p data-reveal className="mt-6 max-w-md leading-relaxed text-muted">
          每顆星是一個專案。有人看過、收藏或投票，它就變亮，數字直接來自資料庫。
        </p>
        <div data-reveal className="mt-8">
          <a
            href="#works"
            className="inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 font-medium text-ink transition hover:bg-star"
          >
            看作品
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <dl data-reveal className="mt-10 grid max-w-lg grid-cols-4 gap-3">
          {figures.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] text-muted sm:text-xs">{f.label}</dt>
              <dd className="mt-1 font-mono text-xl text-bone sm:text-2xl">
                {state?.mode === "off" ? "—" : <CountUp value={f.value} />}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Ranking() {
  const { state, statsFor } = usePortfolio();
  const rows = activeProjects
    .map((p, order) => ({ project: p, order, stats: statsFor(p.id) }))
    .sort((a, b) => b.stats.views - a.stats.views || a.order - b.order)
    .slice(0, 5);
  const max = Math.max(1, ...rows.map((r) => r.stats.views));
  const empty = rows.every((r) => r.stats.views === 0);

  return (
    <section id="ranking" className="relative z-10 px-5 py-24 sm:px-8">
      <SectionHead
        index="01"
        title="熱門專案 TOP 5"
        note={
          state && empty
            ? "還沒有瀏覽紀錄，點進任何一個作品，它就會排上來。"
            : "點進作品就會記錄一次瀏覽，同一位訪客 30 分鐘內只算一次。"
        }
      />
      <ol className="border-b border-rule">
        {rows.map((r, i) => (
          <li key={r.project.id} data-reveal>
            <Link
              href={`/projects/${r.project.id}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-t border-rule py-5 transition hover:bg-bone/[0.04] sm:grid-cols-[6rem_1fr_16rem_8rem]"
            >
              <span className="font-display text-3xl text-star">{i + 1}</span>
              <span>
                <span className="block text-lg transition group-hover:text-star">{r.project.title}</span>
                <span className="block text-xs text-muted">{r.project.subtitle}</span>
              </span>
              <span className="col-span-3 row-start-2 h-px bg-rule sm:col-span-1 sm:row-start-auto">
                <span
                  className="block h-px bg-star transition-[width] duration-700"
                  style={{ width: `${(r.stats.views / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono text-sm">
                <CountUp value={r.stats.views} /> <span className="text-xs text-muted">次</span>
                <span className="block text-xs text-muted">{r.stats.visitors} 位訪客</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  return (
    <article data-reveal className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
      <Link
        href={`/projects/${project.id}`}
        className={`group relative block aspect-[16/10] overflow-hidden rounded-sm border border-rule bg-black lg:col-span-7 ${index % 2 ? "lg:order-2" : ""}`}
      >
        <Image
          src={project.cover!}
          alt={`${project.title} 首頁畫面`}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </Link>
      <div className={`lg:col-span-5 ${index % 2 ? "lg:order-1" : ""}`}>
        <p className="text-sm text-muted">{project.subtitle}</p>
        <h3 className="mt-2 font-display text-4xl leading-tight">
          <Link href={`/projects/${project.id}`} className="transition hover:text-star">
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-bone/70">
          {project.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="mt-6">
          <ProjectActions projectId={project.id} />
        </div>
      </div>
    </article>
  );
}

export function Featured() {
  const featured = activeProjects.filter((p) => p.group === "featured");
  const upcoming = projects.find((p) => p.soon);
  return (
    <section id="works" className="relative z-10 scroll-mt-16 px-5 py-24 sm:px-8">
      <SectionHead index="02" title="主要作品" />
      <div className="flex flex-col gap-20">
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} project={p} index={i} />
        ))}
        {upcoming && (
          <div data-reveal className="border border-dashed border-rule px-6 py-12 text-center">
            <p className="font-display text-2xl text-bone/70">{upcoming.title}</p>
            <p className="mt-2 text-sm text-muted">第三個專案製作中，完成後會出現在星圖上。</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function OtherWorks() {
  const others = activeProjects.filter((p) => p.group === "other");
  return (
    <section className="relative z-10 px-5 py-24 sm:px-8">
      <SectionHead index="03" title="形象網站" />
      <ul className="border-b border-rule">
        {others.map((p) => (
          <li key={p.id} data-reveal className="grid gap-4 border-t border-rule py-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="text-xl">
                <Link href={`/projects/${p.id}`} className="transition hover:text-star">
                  {p.title}
                  <span className="text-muted">｜{p.subtitle}</span>
                </Link>
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{p.summary}</p>
              <p className="mt-2 text-sm text-muted">
                專案網址：
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-bone underline underline-offset-4">
                    {p.urlNote ?? p.url}
                  </a>
                ) : (
                  p.urlNote
                )}
              </p>
            </div>
            <ProjectActions projectId={p.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VoteSection() {
  const { state, statsFor, toggleVote, votesLeft } = usePortfolio();
  const total = activeProjects.reduce((sum, p) => sum + statsFor(p.id).votes, 0);
  const stars = Array.from({ length: MAX_VOTES }, (_, i) => i < votesLeft);

  return (
    <section id="vote" className="relative z-10 scroll-mt-16 px-5 py-24 sm:px-8">
      <SectionHead index="04" title="你最喜歡哪個專案？" note={`每個 LINE 帳號有 ${MAX_VOTES} 票，每個專案最多投一票，可以隨時收回。`} />
      <p data-reveal className="mb-6 flex items-center gap-3 text-sm text-muted">
        <span aria-hidden="true" className="text-lg tracking-widest text-star">
          {stars.map((on, i) => (
            <span key={i} className={on ? "" : "opacity-25"}>
              ★
            </span>
          ))}
        </span>
        {state?.user ? `還剩 ${votesLeft} 票` : `登入後可投 ${MAX_VOTES} 票`}
      </p>
      <ul className="flex flex-col gap-3">
        {activeProjects.map((p) => {
          const votes = statsFor(p.id).votes;
          const voted = state?.votes.includes(p.id) ?? false;
          const share = total ? Math.round((votes / total) * 100) : 0;
          return (
            <li key={p.id} data-reveal>
              <button
                type="button"
                disabled={!state}
                aria-pressed={voted}
                onClick={() => toggleVote(p.id)}
                className={`relative block w-full overflow-hidden rounded-sm border px-5 py-4 text-left transition ${voted ? "border-star" : "border-rule hover:border-bone/50"}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-star/15 transition-[width] duration-700"
                  style={{ width: `${share}%` }}
                />
                <span className="relative flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className={voted ? "text-star" : "text-muted"}>
                      ★
                    </span>
                    {p.title}
                  </span>
                  <span className="font-mono text-sm whitespace-nowrap">
                    {votes} 票 <span className="text-muted">· {share}%</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LoopSection() {
  const { state } = usePortfolio();
  const hasData = (state?.site.views ?? 0) > 0;
  const steps = [
    { label: "LIFF 登入", done: Boolean(state?.user) },
    { label: "瀏覽作品", done: (state?.myViews.length ?? 0) > 0 },
    { label: "產生瀏覽紀錄", done: (state?.myViews.length ?? 0) > 0 },
    { label: "收藏喜歡的作品", done: (state?.favorites.length ?? 0) > 0 },
    { label: "投票", done: (state?.votes.length ?? 0) > 0 },
    { label: "資料庫即時統計", done: hasData },
    { label: "首頁排行更新", done: hasData },
  ];
  return (
    <section className="relative z-10 px-5 py-24 sm:px-8">
      <SectionHead index="05" title="這個網站本身也是作品" note="你走過的步驟會亮起來。登入用 LINE LIFF，資料存在 Supabase，身分由伺服器向 LINE 驗證。" />
      <ol data-reveal className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-7">
        {steps.map((s, i) => (
          <li key={s.label} className="bg-ink p-5">
            <span className={`font-mono text-xs ${s.done ? "text-star" : "text-muted"}`}>
              {s.done ? "●" : "○"} {String(i + 1).padStart(2, "0")}
            </span>
            <p className={`mt-3 text-sm leading-snug ${s.done ? "text-bone" : "text-muted"}`}>{s.label}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
