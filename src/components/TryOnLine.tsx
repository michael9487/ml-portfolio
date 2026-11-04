import QRCode from "qrcode";
import type { Project } from "@/data/projects";

/** 給有 LINE 功能的專案：桌機訪客用手機掃碼就能體驗，手機訪客直接點連結 */
export async function TryOnLine({ project }: { project: Project }) {
  if (!project.line) return null;
  const { addFriendUrl, liffUrl } = project.line;
  const target = liffUrl ?? addFriendUrl;
  const qr = await QRCode.toString(target, {
    type: "svg",
    margin: 1,
    color: { dark: "#090912", light: "#efe8da" },
  });

  return (
    <section className="mt-16 border-t border-rule pt-6">
      <h2 className="font-display text-2xl">怎麼體驗 LINE 功能</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        網頁版可以直接瀏覽；加好友、分享、掃碼報到要在 LINE 裡才看得到。
      </p>
      <div className="mt-6 grid gap-8 sm:grid-cols-[10rem_1fr] sm:items-center">
        {/* QR Code 由伺服器用專案自己的網址產生，內容可信 */}
        <div className="w-40 overflow-hidden rounded-sm" dangerouslySetInnerHTML={{ __html: qr }} />
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm leading-relaxed">
            {liffUrl ? "用手機掃描，直接在 LINE 裡開啟。" : "用手機掃描，加入 LINE 官方帳號。"}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={target}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-line px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
            >
              {liffUrl ? "在 LINE 開啟" : "加入 LINE 好友"}
            </a>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-rule px-5 py-2.5 text-sm transition hover:border-bone/50"
              >
                開啟網頁版
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
