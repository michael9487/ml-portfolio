"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { TechIcons } from "./TechIcons";

/** 開頭畫面：背景是 banner 圖，文字、按鈕、技術圖示都是真實 HTML */
export function Banner() {
  const rootRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const art = artRef.current;
    if (!root || !art) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(root.querySelectorAll("[data-banner]"), {
        y: 34,
        autoAlpha: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.2,
      });
      gsap.from(art, { scale: 1.08, autoAlpha: 0, duration: 1.8, ease: "power2.out" });

      // 滑鼠視差：背景微幅跟著移動（只在有滑鼠的裝置）
      const moveX = gsap.quickTo(art, "x", { duration: 1.2, ease: "power3" });
      const moveY = gsap.quickTo(art, "y", { duration: 1.2, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        moveX((e.clientX / window.innerWidth - 0.5) * -18);
        moveY((e.clientY / window.innerHeight - 0.5) * -12);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative z-10 flex min-h-svh w-full flex-col overflow-hidden bg-ink px-5 pt-20 pb-8 sm:px-[6vw] sm:pt-24 landscape:justify-center landscape:pb-16"
    >
      {/*
        橫向：大小等同 cover，但錨定右下，筆電不會被裁，上方空白先被裁掉。
        直向：換成手機版直圖，筆電在中段，文字與按鈕分別放在上下。
        scale 多留一點邊，視差移動時才不會露出邊緣。
      */}
      <div
        ref={artRef}
        className="absolute scale-[1.03] portrait:inset-0 portrait:scale-100 landscape:right-0 landscape:bottom-0 landscape:aspect-[1672/941] landscape:w-[max(100vw,calc(100svh*1672/941))]"
      >
        {/* picture 讓瀏覽器只下載符合方向的那一張 */}
        <picture>
          <source media="(orientation: portrait)" srcSet="/banner-hero-m.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banner-hero.webp" alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
        </picture>
        <a
          href="#hero"
          aria-label="Scroll Down"
          className="absolute top-[84%] left-[46.5%] hidden h-[13%] w-[7%] rounded-lg transition hover:bg-white/10 landscape:block"
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink to-transparent portrait:hidden" />

      <div className="pointer-events-none relative flex max-w-[min(46vw,44rem)] flex-col font-hero portrait:max-w-none portrait:flex-1 portrait:justify-between [&_a]:pointer-events-auto">
        <div>
        <p
          data-banner
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm text-bone sm:text-base"
        >
          <span className="bg-gradient-to-r from-brand-sky to-bone bg-clip-text text-transparent">Hello, I&apos;m a</span>
          Web Developer
          <span aria-hidden="true">👋</span>
        </p>
        <h1
          data-banner
          className="mt-5 text-[clamp(2.2rem,min(4vw,7.4vh),5rem)] leading-[1.14] font-bold tracking-tight text-white portrait:mt-4 portrait:text-[clamp(1.9rem,8.4vw,4.5rem)]"
        >
          Building Modern
          <br />
          <span className="bg-gradient-to-r from-brand-sky via-brand-sky to-brand-violet bg-clip-text text-transparent">
            Web Experiences
          </span>
          <span aria-hidden="true" className="caret ml-1 font-light text-brand-violet">
            |
          </span>
        </h1>
        <p data-banner className="mt-3 max-w-[30rem] text-[clamp(0.95rem,1.35vw,1.3rem)] leading-relaxed text-bone/75 landscape:mt-5 portrait:[@media(max-height:700px)]:hidden">
          I design and develop responsive, interactive, and user-focused websites.
        </p>
        </div>
        <div>
        <div data-banner className="flex flex-wrap gap-2.5 sm:gap-5 landscape:mt-8">
          <a
            href="#works"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-brand-violet px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition hover:brightness-110 sm:px-8 sm:py-4 sm:text-base"
          >
            <span aria-hidden="true" className="hidden sm:inline">&lt;/&gt;</span> View Projects <span aria-hidden="true">→</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-white hover:text-ink sm:px-8 sm:py-4 sm:text-base"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Contact Me
          </a>
        </div>
        <div data-banner className="mt-5 sm:mt-8">
          <TechIcons />
        </div>
        </div>
      </div>
    </section>
  );
}
