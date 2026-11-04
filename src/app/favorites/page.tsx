"use client";

import Image from "next/image";
import Link from "next/link";
import { usePortfolio } from "@/components/PortfolioProvider";
import { ProjectActions } from "@/components/ProjectActions";
import { getProject } from "@/data/projects";

export default function FavoritesPage() {
  const { state, openLogin } = usePortfolio();
  const items = (state?.favorites ?? []).flatMap((id) => getProject(id) ?? []);

  return (
    <main className="mx-auto min-h-[80svh] max-w-5xl px-5 pt-28 pb-24 sm:px-8">
      <h1 className="font-display text-[clamp(2.4rem,6vw,4rem)]">我的收藏</h1>

      {state && !state.user && (
        <div className="mt-8">
          <p className="text-muted">收藏綁定在 LINE 帳號上，登入後才看得到。</p>
          {state.mode !== "off" && (
            <button
              type="button"
              onClick={openLogin}
              className="mt-5 rounded-full bg-line px-6 py-3 font-medium text-white transition hover:brightness-110"
            >
              使用 LINE 登入
            </button>
          )}
        </div>
      )}

      {state?.user && items.length === 0 && (
        <p className="mt-8 text-muted">
          還沒有收藏。
          <Link href="/#works" className="ml-2 text-bone underline underline-offset-4">
            去看作品
          </Link>
        </p>
      )}

      <ul className="mt-10 flex flex-col gap-6">
        {items.map((p) => (
          <li key={p.id} className="grid gap-5 border-t border-rule pt-6 sm:grid-cols-[14rem_1fr]">
            {p.cover && (
              <Link href={`/projects/${p.id}`} className="relative block aspect-[16/10] overflow-hidden rounded-sm border border-rule bg-black">
                <Image src={p.cover} alt="" fill sizes="14rem" className="object-cover" />
              </Link>
            )}
            <div className={p.cover ? "" : "sm:col-span-2"}>
              <h2 className="text-xl">
                <Link href={`/projects/${p.id}`} className="transition hover:text-star">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{p.subtitle}</p>
              <div className="mt-4">
                <ProjectActions projectId={p.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
