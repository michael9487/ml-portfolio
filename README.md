# Portfolio 2026

前端作品集。LIFF 登入 → 看作品 → 瀏覽紀錄 → 收藏 → 投票 → 資料庫統計 → 首頁排行與星圖更新。

技術：Next.js、TypeScript、Tailwind CSS、Three.js、GSAP、Supabase、LINE LIFF、Vercel。

## 本機執行

```bash
npm install
npm run dev
```

不填環境變數也能跑：會進入示範模式，資料存在記憶體（重啟清空），登入是假的本機帳號。

## 接上正式服務

1. **Supabase**：建立專案，到 SQL Editor 執行 [supabase/schema.sql](supabase/schema.sql)。
2. **LINE**：在 LINE Developers 建立 LINE Login channel，新增 LIFF app。
   - Endpoint URL：部署後的網站網址（例如 `https://你的網域/`）
   - Scopes：`openid`、`profile`（缺 `openid` 就拿不到 ID Token，登入會失敗）
   - Channel 要發布（Published），否則只有開發者與測試者能登入
3. **環境變數**：照 [.env.example](.env.example) 填到 `.env.local` 與 Vercel。五項缺一，正式環境就會關閉互動功能。

## 內容維護

- 專案資料都在 [src/data/projects.ts](src/data/projects.ts)，新增一筆就會出現在星圖、排行與投票。
- 第三個專案完成後：把 `next-project` 那筆的 `soon` 拿掉並填入內容。
- 語言學校的 QR Code 目前指向加好友連結；填入 `line.liffUrl` 後會改成直接開啟 LIFF。
- 公開聯絡方式填在 [src/data/site.ts](src/data/site.ts)。

## 安全設計

- 瀏覽器不直接連資料庫：表都開 RLS 且無 policy，函式只授權給 `service_role`。
- 身分只信任伺服器向 LINE 驗證過的 ID Token，不接受前端傳來的 userId。
- 三票上限在資料庫函式內檢查並上鎖，連點或多分頁都無法超過。
