import { contact } from "@/data/site";

export function Footer() {
  return (
    <footer id="contact" className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule px-5 py-8 text-xs text-muted sm:px-8">
      <p className="font-mono tracking-widest uppercase">Portfolio 2026</p>
      {contact.length > 0 && (
        <ul className="flex gap-5">
          {contact.map((c) => (
            <li key={c.href}>
              <a href={c.href} className="transition hover:text-bone">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p>Next.js・Three.js・GSAP・Supabase・LINE LIFF</p>
    </footer>
  );
}
