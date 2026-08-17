"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();

  return (
    <div style={{ position: "relative" }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--nv-text-muted)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
      <input
        type="search"
        placeholder="Buscar paciente…"
        defaultValue={defaultValue}
        className="input"
        style={{ paddingLeft: 38 }}
        onChange={(e) => {
          const v = e.target.value;
          start(() => (v ? router.push(`${pathname}?q=${encodeURIComponent(v)}`) : router.push(pathname)));
        }}
      />
    </div>
  );
}
