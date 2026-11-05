export const MAX_VOTES = 3;

/** 數字達到這個值才顯示；之前只顯示排名與比例，避免人少時看起來冷清 */
export const SHOW_COUNT_FROM = 10;
export const showCount = (n: number) => n >= SHOW_COUNT_FROM;

/** 公開的聯絡方式，會顯示在頁尾的聯絡區塊 */
export const contact: { label: string; value: string; href: string }[] = [
  { label: "Email", value: "michael4292015@gmail.com", href: "mailto:michael4292015@gmail.com" },
  { label: "LINE ID", value: "supergod0429", href: "https://line.me/ti/p/~supergod0429" },
  { label: "GitHub", value: "michael9487", href: "https://github.com/michael9487" },
];
