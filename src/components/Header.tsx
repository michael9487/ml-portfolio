"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortfolio } from "./PortfolioProvider";

const links = [
  { label: "Home", href: "/#top", active: (path: string) => path === "/", always: false },
  { label: "Projects", href: "/#works", active: (path: string) => path.startsWith("/projects"), always: false },
  { label: "Vote", href: "/#vote", active: () => false, always: false },
  { label: "Favorites", href: "/favorites", active: (path: string) => path === "/favorites", always: true },
  { label: "Contact", href: "#contact", active: () => false, always: false },
];

export function Header() {
  const { state, openLogin, logout } = usePortfolio();
  const pathname = usePathname();
  const user = state?.user;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 bg-gradient-to-b from-ink/80 to-transparent px-5 py-4 font-hero sm:px-[4.5vw]">
      <Link href="/" aria-label="回到首頁" className="shrink-0">
        <Image src="/logo.png" alt="ML Web Developer" width={585} height={120} priority className="h-8 w-auto sm:h-11" />
      </Link>
      <nav className="flex items-center gap-4 text-sm font-medium lg:gap-9 lg:text-base">
        {links.map((l) => {
          const active = l.active(pathname);
          return (
            <Link
              key={l.label}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative py-1 transition hover:text-white ${l.always ? "" : "hidden md:inline"} ${active ? "text-white" : "text-bone/75"}`}
            >
              {l.label}
              {l.label === "Favorites" && user && state.favorites.length > 0 && (
                <span className="ml-1.5 font-mono text-xs text-heart">{state.favorites.length}</span>
              )}
              {active && (
                <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-brand-sky to-brand-violet" />
              )}
            </Link>
          );
        })}
        {user ? (
          <button type="button" onClick={logout} className="flex items-center gap-2 text-bone/75 transition hover:text-white">
            {user.picture && (
              // LINE 頭像網域不固定，不經過 next/image
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
            )}
            登出
          </button>
        ) : (
          state?.mode !== "off" && (
            <button
              type="button"
              onClick={openLogin}
              disabled={!state}
              className="rounded-full bg-line px-3.5 py-1.5 font-medium whitespace-nowrap text-white transition hover:brightness-110 disabled:opacity-60"
            >
              LINE 登入
            </button>
          )
        )}
      </nav>
    </header>
  );
}
