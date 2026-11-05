export type Feature = {
  label: string;
  /** 訪客要在哪裡才看得到這個功能 */
  where?: string;
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  /** soon = 還沒上線的預留位，不計入排行與投票 */
  soon?: boolean;
  summary: string;
  role?: string;
  team?: string;
  stack: string[];
  features: Feature[];
  url?: string;
  /** 外部連結按鈕的文字，預設為「開啟網站」 */
  linkLabel?: string;
  cover?: string;
  /** 星圖上的位置，連線依陣列順序 */
  star: [number, number, number];
  line?: {
    addFriendUrl: string;
    /** 填入 https://liff.line.me/{LIFF_ID} 後，QR Code 會改成直接開啟 LIFF */
    liffUrl?: string;
  };
};

/** 熱門專案：有專案頁、會進星圖、排行與投票 */
export const projects: Project[] = [
  {
    id: "verbora",
    title: "沃語國際語言學校",
    subtitle: "Verbora Language School",
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
      liffUrl: "https://liff.line.me/2012358470-MrC07YH9",
    },
  },
  {
    id: "formosoul",
    title: "FormoSoul",
    subtitle: "台灣哈利波特｜七人團隊專案",
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
    id: "tea-ecommerce",
    title: "好喝茶飲電商網站",
    subtitle: "React 電商平台",
    summary:
      "把 Vue 的開發經驗轉換到 React 的電商練習作品，完整實作商品瀏覽、分類篩選、購物車與結帳流程，並支援 LINE 登入。",
    stack: ["React", "React Router", "Context API", "MUI", "Axios", "LINE LIFF", "Vercel"],
    features: [
      { label: "動態購物車與金額計算" },
      { label: "商品分類篩選與搜尋" },
      { label: "結帳流程" },
      { label: "LINE 會員登入" },
      { label: "RWD 響應式版面" },
    ],
    url: "https://react-ecommerce-tea-website.vercel.app/",
    cover: "/covers/tea.jpg",
    star: [1.3, -0.2, 0.3],
  },
  {
    id: "portfolio",
    title: "作品集網站",
    subtitle: "ML Portfolio",
    summary:
      "你正在看的這個網站。瀏覽、收藏與投票都寫進資料庫，排行和星圖會跟著改變，身分由伺服器向 LINE 驗證。",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Three.js", "GSAP", "Supabase", "LINE LIFF", "Vercel"],
    features: [
      { label: "瀏覽統計與熱門排行" },
      { label: "綁定 LINE 帳號的收藏" },
      { label: "每個帳號 3 票的專案投票" },
      { label: "由統計數字驅動的 3D 星圖" },
    ],
    cover: "/covers/portfolio.jpg",
    star: [0.35, -0.6, -0.1],
  },
  {
    id: "laundry",
    title: "LINE 自助洗衣系統",
    subtitle: "製作中",
    soon: true,
    summary: "在 LINE 裡掃洗衣機上的 QR Code 就能啟動機台、查看剩餘時間，洗好時收到 LINE 推播。",
    stack: [],
    features: [],
    star: [-0.95, -1.25, 0.1],
  },
];

export const activeProjects = projects.filter((p) => !p.soon);
export const activeIds = new Set(activeProjects.map((p) => p.id));
export const getProject = (id: string) => activeProjects.find((p) => p.id === id);

/** 其他形象網站：只列名稱與連結，沒有專案頁，也不開放收藏與投票 */
export const otherSites: { name: string; url?: string }[] = [
  { name: "真愛桃花源", url: "https://xn--vgu42njsflzjh5o.tw/" },
  { name: "B Line 餐酒館", url: "https://blinebyatrain.com.tw/" },
  { name: "田馨裝潢", url: "https://tc422.com/" },
  { name: "澎湖民宿", url: "https://xn--9iqv14adwmm9bt0b665bfpd.tw/" },
];
