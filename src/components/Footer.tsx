import Link from "next/link";
import { contact } from "@/data/site";

export function Footer() {
  return (
    <footer id="contact" className="relative z-10 scroll-mt-16 border-t border-rule bg-ink px-5 pt-16 pb-8 sm:px-8">
      <div className="mx-auto max-w-[90rem]">
        <h2 className="font-display text-3xl sm:text-4xl">聯絡我</h2>
        <ul className="mt-8 border-b border-rule">
          {contact.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={c.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule py-5 transition hover:bg-bone/[0.04]"
              >
                <span className="text-sm text-muted">{c.label}</span>
                <span className="text-lg break-all transition group-hover:text-star sm:text-xl">{c.value}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <p className="font-mono tracking-widest uppercase">Portfolio 2026</p>
          <Link href="/privacy" className="underline underline-offset-4 transition hover:text-bone">
            隱私權政策
          </Link>
          <p>Next.js・Three.js・GSAP・Supabase・LINE LIFF</p>
        </div>
      </div>
    </footer>
  );
}
