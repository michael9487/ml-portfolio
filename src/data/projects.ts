export type Feature = {
  label: string;
  /** 訪客要在哪裡才看得到這個功能 */
  where?: string;
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  group: "featured" | "other";
  /** soon = 還沒上線的預留位，不計入排行與投票 */
  soon?: boolean;
  summary: string;
  role?: string;
  team?: string;
  stack: string[];
  features: Feature[];
  url?: string;
  /** 沒有可公開網址時顯示的文字 */
  urlNote?: string;
  cover?: string;
  /** 星圖上的位置 */
  star: [number, number, number];
  line?: {
    addFriendUrl: string;
    /** 填入 https://liff.line.me/{LIFF_ID} 後，QR Code 會改成直接開啟 LIFF */
    liffUrl?: string;
  };
};

export const projects: Project[] = [
  {
    id: "verbora",
    title: "沃語國際語言學校",
    subtitle: "Verbora Language School",
    group: "featured",
    summary:
      "以虛構語言學校為題的完整網站，把 LINE 當成會員入口：登入、加好友、分享、活動報到都走 LIFF，資料再回到後台與試算表。",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "LINE LIFF", "Google Sheets", "Vercel"],
    features: [
      { label: "LINE 會員登入", where: "網頁、LINE" },
      { label: "偵測並推薦加好友", where: "LINE" },
      { label: "分享至聊天室", where: "LINE" },
      { label: "活動掃碼報到驗證身分", where: "LINE" },
      { label: "串接 Google 試算表", where: "幕後" },
      { label: "小型後台看資料", where: "後台" },
    ],
    url: "https://verbora-language-school.vercel.app/",
    cover: "/covers/verbora.jpg",
    star: [-1.1, 0.75, 0.2],
    line: {
      addFriendUrl: "https://line.me/R/ti/p/%40820jdwus",
    },
  },
  {
    id: "formosoul",
    title: "FormoSoul",
    subtitle: "台灣哈利波特｜七人團隊專案",
    group: "featured",
    summary:
      "前端養成班的七人團隊專案。擔任組長，負責首頁 3D 動畫、最新消息，以及全部後台頁面。",
    role: "組長、前端開發",
    team: "七人團隊",
    stack: ["Vue 3", "MySQL", "PHP", "Element Plus", "GSAP", "Three.js"],
    features: [{ label: "首頁 3D 動畫" }, { label: "最新消息" }, { label: "全部後台頁面" }],
    url: "https://tibamef2e.com/tjd103/home",
    cover: "/covers/harry.jpg",
    star: [0.75, 1.05, -0.3],
  },
  {
    id: "car-detailing",
    title: "汽車美容形象網站",
    subtitle: "前端開發",
    group: "other",
    summary: "獨立完成 RWD 響應式網站、JavaScript 互動動畫、SEO 基礎設定及 Netlify 部署。",
    role: "前端開發",
    stack: ["JavaScript", "RWD", "SEO", "Netlify"],
    features: [
      { label: "RWD 響應式網站" },
      { label: "JavaScript 互動動畫" },
      { label: "SEO 基礎設定" },
      { label: "Netlify 部署" },
    ],
    urlNote: "已公開的客戶官網",
    star: [1.3, -0.35, 0.3],
  },
  {
    id: "next-project",
    title: "下一顆星",
    subtitle: "第三個熱門專案",
    group: "featured",
    soon: true,
    summary: "製作中。",
    stack: [],
    features: [],
    star: [-0.15, -0.95, 0],
  },
];

export const activeProjects = projects.filter((p) => !p.soon);
export const activeIds = new Set(activeProjects.map((p) => p.id));
export const getProject = (id: string) => activeProjects.find((p) => p.id === id);
