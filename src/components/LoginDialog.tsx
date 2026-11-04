"use client";

import { useEffect, useRef } from "react";

type Props = {
  reason: string | null;
  demo: boolean;
  busy: boolean;
  onLogin: () => void;
  onClose: () => void;
};

export function LoginDialog({ reason, demo, busy, onLogin, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (reason && !dialog.open) dialog.showModal();
    if (!reason && dialog.open) dialog.close();
  }, [reason]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-rule bg-panel p-0 text-bone backdrop:bg-black/70"
    >
      <div className="p-7">
        <h2 className="font-display text-2xl">用 LINE 登入</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{reason}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          只用 LINE 身分來記住你的收藏與投票，名稱和頭像不會公開顯示。
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onLogin}
            disabled={busy}
            className="rounded-md bg-line px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "處理中…" : demo ? "示範登入（本機測試）" : "使用 LINE 登入"}
          </button>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2.5 text-sm text-muted transition hover:text-bone">
            先不要
          </button>
        </div>
      </div>
    </dialog>
  );
}
