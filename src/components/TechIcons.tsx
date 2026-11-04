const tile = "grid size-11 place-items-center rounded-lg bg-white/[0.06] sm:size-14";

const icons = [
  {
    name: "Vue",
    icon: (
      <svg viewBox="0 0 256 221" className="size-6 sm:size-8">
        <path fill="#41b883" d="M204.8 0H256L128 220.8 0 0h97.9L128 51.2 157.4 0h47.4Z" />
        <path fill="#35495e" d="m50.5 0 77.5 133.6L204.8 0h-47.4L128 51.2 97.9 0H50.5Z" />
      </svg>
    ),
  },
  {
    name: "React",
    icon: (
      <svg viewBox="-12 -11 24 22" className="size-7 sm:size-9" fill="none" stroke="#61dafb">
        <circle r="2" fill="#61dafb" stroke="none" />
        <ellipse rx="10.5" ry="4.2" />
        <ellipse rx="10.5" ry="4.2" transform="rotate(60)" />
        <ellipse rx="10.5" ry="4.2" transform="rotate(120)" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    icon: (
      <span className="flex size-7 items-end justify-end rounded-sm bg-[#3178c6] pr-0.5 text-sm leading-tight font-bold text-white sm:size-9 sm:text-lg">
        TS
      </span>
    ),
  },
  {
    name: "JavaScript",
    icon: (
      <span className="flex size-7 items-end justify-end rounded-sm bg-[#f7df1e] pr-0.5 text-sm leading-tight font-bold text-black sm:size-9 sm:text-lg">
        JS
      </span>
    ),
  },
  {
    name: "PHP",
    icon: (
      <span className="rounded-[50%] bg-[#8892bf] px-1.5 py-0.5 text-[10px] font-bold text-[#1b1d2b] italic sm:px-2 sm:text-sm">
        php
      </span>
    ),
  },
  {
    name: "MySQL",
    icon: <span className="text-[10px] font-bold text-[#4f9fc4] sm:text-sm">MySQL</span>,
  },
];

export function TechIcons() {
  return (
    <ul className="flex flex-wrap gap-2 sm:gap-2.5">
      {icons.map((t) => (
        <li key={t.name} title={t.name} className={t.name === "MySQL" ? `${tile} !w-auto px-2 sm:px-3` : tile}>
          <span className="sr-only">{t.name}</span>
          <span aria-hidden="true">{t.icon}</span>
        </li>
      ))}
    </ul>
  );
}
