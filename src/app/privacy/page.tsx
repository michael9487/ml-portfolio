import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/data/site";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "這個作品集網站蒐集哪些資料、如何使用，以及如何申請刪除。",
};

const email = contact.find((c) => c.label === "Email")?.value;

const sections = [
  {
    title: "蒐集哪些資料",
    items: [
      "用 LINE 登入時：LINE 提供的使用者識別碼、顯示名稱與頭像網址。",
      "你的操作：收藏與投票的專案，以及操作時間。",
      "瀏覽紀錄：看過哪個專案、時間，以及一組隨機產生的訪客識別碼。沒有登入也會記錄。",
    ],
  },
  {
    title: "如何使用",
    items: [
      "記住你的收藏與投票，讓你換裝置或下次開啟時還找得到。",
      "計算總瀏覽次數、不重複訪客與投票結果。網站上只會顯示統計數字，不會公開任何人的名稱、頭像或個人選擇。",
      "顯示名稱與頭像只用於你自己登入後的畫面。",
    ],
  },
  {
    title: "Cookie",
    items: [
      "pf_session：維持登入狀態，效期 30 天，登出時清除。",
      "pf_visitor：區分不同訪客，避免重複計算瀏覽，效期 1 年。",
      "這兩個 Cookie 都是網站運作所需，沒有用於廣告或跨網站追蹤。",
    ],
  },
  {
    title: "資料存放與分享",
    items: [
      "資料存放在 Supabase，網站部署在 Vercel，登入由 LINE 提供，這些服務會依其服務內容處理必要資料。",
      "不會販售你的資料，也不會提供給第三方作行銷使用。",
    ],
  },
  {
    title: "保存期間與你的權利",
    items: [
      "資料會保存到你申請刪除，或這個網站停止運作為止。",
      "你可以來信申請查詢或刪除你的資料。",
      "你也可以隨時到 LINE 的「設定 > 我的帳號 > 連動中的應用程式」取消授權。取消授權不會自動刪除已存的資料，需要刪除請來信。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-8">
      <Link href="/" className="text-sm text-muted transition hover:text-bone">
        ← 回到首頁
      </Link>
      <h1 className="mt-8 font-display text-[clamp(2.2rem,6vw,3.5rem)] leading-tight">隱私權政策</h1>
      <p className="mt-3 font-mono text-xs text-muted">最後更新：2026 年 11 月 5 日</p>
      <p className="mt-6 leading-relaxed text-bone/85">
        這是一個個人前端作品集網站，登入、收藏與投票都是為了展示作品功能。以下說明網站實際處理的資料。
      </p>

      {sections.map((s) => (
        <section key={s.title} className="mt-10 border-t border-rule pt-6">
          <h2 className="font-display text-xl">{s.title}</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-bone/80 marker:text-muted">
            {s.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="font-display text-xl">聯絡方式</h2>
        <p className="mt-4 leading-relaxed text-bone/80">
          對這份政策有疑問，或想申請刪除資料，請寄信到{" "}
          <a href={`mailto:${email}`} className="text-bone underline underline-offset-4">
            {email}
          </a>
          。
        </p>
      </section>
    </main>
  );
}
