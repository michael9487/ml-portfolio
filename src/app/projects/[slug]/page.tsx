import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectActions } from "@/components/ProjectActions";
import { ProjectLiveStats } from "@/components/ProjectLive";
import { TryOnLine } from "@/components/TryOnLine";
import { activeProjects, getProject } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return activeProjects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const meta = [
    { label: "角色", value: project.role },
    { label: "團隊", value: project.team },
  ].filter((m) => m.value);

  return (
    <main className="mx-auto max-w-5xl px-5 pt-28 pb-24 sm:px-8">
      <Link href="/#works" className="text-sm text-muted transition hover:text-bone">
        ← 回到作品
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted">{project.subtitle}</p>
          <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-tight">{project.title}</h1>
        </div>
        <ProjectLiveStats projectId={project.id} />
      </header>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone/85">{project.summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ProjectActions projectId={project.id} />
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-bone px-5 py-2 text-sm font-medium text-ink transition hover:bg-star"
          >
            {project.linkLabel ?? "開啟網站"} ↗
          </a>
        )}
      </div>

      {project.cover && (
        <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-sm border border-rule bg-black">
          <Image src={project.cover} alt={`${project.title} 首頁畫面`} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
        </div>
      )}

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl">主要功能</h2>
          <ul className="mt-4 border-b border-rule">
            {project.features.map((f) => (
              <li key={f.label} className="flex items-baseline justify-between gap-4 border-t border-rule py-3">
                <span>{f.label}</span>
                {f.where && <span className="text-xs whitespace-nowrap text-muted">{f.where}</span>}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">技術</h2>
          <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
            {project.stack.map((t) => (
              <li key={t} className="rounded-full border border-rule px-3 py-1.5">
                {t}
              </li>
            ))}
          </ul>
          {meta.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="text-xs text-muted">{m.label}</dt>
                  <dd className="mt-1">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <TryOnLine project={project} />
    </main>
  );
}
