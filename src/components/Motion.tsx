"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/** 讓頁面裡 data-reveal 的元素在進入視窗時浮現；沒有 JS 或偏好減少動態時直接顯示 */
export function RevealOnScroll() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 每個元素各自一個 trigger：直接跳到錨點時，已經捲過的元素也會播放，不會一直隱藏
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}

/** 數字變動時滾動到新值 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef({ n: value });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current.n = value;
      el.textContent = value.toLocaleString("zh-TW");
      return;
    }
    const tween = gsap.to(current.current, {
      n: value,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(current.current.n).toLocaleString("zh-TW");
      },
    });
    return () => void tween.kill();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("zh-TW")}
    </span>
  );
}
