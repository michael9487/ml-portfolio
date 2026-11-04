"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Liff } from "@line/liff";
import { MAX_VOTES } from "@/data/site";
import type { ProjectStats, PublicState } from "@/lib/types";
import { LoginDialog } from "./LoginDialog";

type PendingAction = { type: "favorite" | "vote"; projectId: string };

type Ctx = {
  state: PublicState | null;
  statsFor: (id: string) => ProjectStats;
  recordView: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleVote: (id: string) => void;
  openLogin: () => void;
  logout: () => void;
  votesLeft: number;
};

const PortfolioContext = createContext<Ctx | null>(null);

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}

const PENDING_KEY = "pf_pending_action";
const POLL_MS = 30_000;
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

let liffReady: Promise<Liff> | null = null;
function getLiff() {
  liffReady ??= import("@line/liff").then(async ({ default: liff }) => {
    await liff.init({ liffId: liffId! });
    return liff;
  });
  return liffReady;
}

/** LIFF SDK 不小，只在 LINE 內開啟或登入導回時才載入 */
function shouldAutoInitLiff() {
  const params = new URLSearchParams(location.search);
  return /\bLine\//i.test(navigator.userAgent) || params.has("code") || params.has("liff.state");
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loginReason, setLoginReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 較舊的回應（例如輪詢）不可覆蓋較新的結果
  const seq = useRef(0);
  const applied = useRef(0);

  const request = useCallback(async (path: string, body?: object) => {
    const id = ++seq.current;
    const res = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as { state?: PublicState; error?: string };
    if (json.state && id > applied.current) {
      applied.current = id;
      setState(json.state);
    }
    return { ok: res.ok, error: json.error };
  }, []);

  const flash = useCallback((message: string) => setNotice(message), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(t);
  }, [notice]);

  const exchangeLiffToken = useCallback(
    async (liff: Liff) => {
      const idToken = liff.getIDToken();
      if (!idToken) return false;
      const { ok } = await request("/api/auth/line", { idToken });
      if (!ok) liff.logout(); // 通常是 ID Token 過期，清掉後才能重新取得
      return ok;
    },
    [request],
  );

  // 首次載入與輪詢
  const mode = state?.mode;
  const userId = state?.user?.id;
  useEffect(() => {
    request("/api/state").catch(() => undefined);
  }, [request]);

  useEffect(() => {
    if (mode === "off") return;
    const timer = setInterval(() => {
      if (!document.hidden) request("/api/state").catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [mode, request]);

  // 在 LINE 內開啟，或從 LINE 登入頁導回時，自動完成登入
  const autoInitDone = useRef(false);
  useEffect(() => {
    if (mode !== "live" || !liffId || autoInitDone.current) return;
    autoInitDone.current = true;
    if (userId || !shouldAutoInitLiff()) return;
    getLiff()
      .then(async (liff) => {
        if (liff.isLoggedIn()) await exchangeLiffToken(liff);
      })
      .catch(() => flash("LINE 登入初始化失敗，請重新整理再試一次。"));
  }, [mode, userId, exchangeLiffToken, flash]);

  const startLogin = useCallback(async () => {
    setBusy(true);
    try {
      if (mode === "demo") {
        await request("/api/auth/demo", {});
      } else {
        const liff = await getLiff();
        if (liff.isLoggedIn() && (await exchangeLiffToken(liff))) {
          // 已完成
        } else {
          liff.login({ redirectUri: location.href });
          return; // 頁面即將導向 LINE
        }
      }
      setLoginReason(null);
    } catch {
      flash("登入失敗，請再試一次。");
      setLoginReason(null);
    } finally {
      setBusy(false);
    }
  }, [mode, request, exchangeLiffToken, flash]);

  const logout = useCallback(async () => {
    await request("/api/auth/logout", {});
    sessionStorage.removeItem(PENDING_KEY);
    if (mode === "live") {
      try {
        const liff = await getLiff();
        if (liff.isLoggedIn()) liff.logout();
      } catch {
        // 網站自己的登入已清除，LIFF 登出失敗不影響
      }
    }
  }, [mode, request]);

  const runAction = useCallback(
    async ({ type, projectId }: PendingAction) => {
      const path = type === "favorite" ? "/api/favorites" : "/api/votes";
      const { error, ok } = await request(path, { projectId });
      if (error === "vote_limit") flash(`你的 ${MAX_VOTES} 票都投完了，取消其中一票就能改投。`);
      else if (!ok) flash("沒有成功，請再試一次。");
    },
    [request, flash],
  );

  const act = useCallback(
    (action: PendingAction) => {
      if (mode === "off") {
        flash("互動功能尚未開放。");
      } else if (userId) {
        void runAction(action);
      } else {
        // LINE 登入會離開頁面，先記下來，回來後接著完成
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
        setLoginReason(action.type === "favorite" ? "登入後收藏會綁定你的 LINE 帳號，下次打開還在。" : `每個 LINE 帳號有 ${MAX_VOTES} 票。`);
      }
    },
    [mode, userId, runAction, flash],
  );

  useEffect(() => {
    if (!userId) return;
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_KEY);
    const action = JSON.parse(raw) as PendingAction;
    // 使用者想要的是「加上」；帳號裡已經有的話，切換反而會把它取消
    const existing = action.type === "favorite" ? state?.favorites : state?.votes;
    if (existing?.includes(action.projectId)) return;
    void runAction(action);
  }, [userId, runAction, state?.favorites, state?.votes]);

  const closeLogin = useCallback(() => {
    sessionStorage.removeItem(PENDING_KEY);
    setLoginReason(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      statsFor: (id) =>
        state?.stats.find((s) => s.project_id === id) ?? { project_id: id, views: 0, visitors: 0, favorites: 0, votes: 0 },
      recordView: (id) => void request("/api/views", { projectId: id }).catch(() => undefined),
      toggleFavorite: (id) => act({ type: "favorite", projectId: id }),
      toggleVote: (id) => act({ type: "vote", projectId: id }),
      openLogin: () => setLoginReason("收藏和投票都會綁定你的 LINE 帳號，換裝置也找得回來。"),
      logout: () => void logout(),
      votesLeft: MAX_VOTES - (state?.votes.length ?? 0),
    }),
    [state, request, act, logout],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
      <LoginDialog
        reason={loginReason}
        demo={mode === "demo"}
        busy={busy}
        onLogin={() => void startLogin()}
        onClose={closeLogin}
      />
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {notice && (
          <p className="rounded-full border border-rule bg-panel px-5 py-2.5 text-sm text-bone shadow-lg">{notice}</p>
        )}
      </div>
    </PortfolioContext.Provider>
  );
}
