"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TrackerHeaderProps {
  slug: string;
  displayName: string;
  lighterpackUrl?: string | null;
}

export default function TrackerHeader({ slug, displayName, lighterpackUrl }: TrackerHeaderProps) {
  const pathname = usePathname();
  const base = `/tracker/${slug}`;

  const tabs = [
    { label: "Map", href: base },
    { label: "Updates", href: `${base}/updates` },
  ];

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <div className="brand">
          <div className="brand-title">{displayName}&apos;s PCT Tracker</div>
          <div className="brand-sub">Pacific Crest Trail</div>
        </div>

        <nav className="tabs">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`tab ${pathname === t.href ? "active" : ""}`}
            >
              {t.label}
            </Link>
          ))}
          {lighterpackUrl && (
            <a href={`https://lighterpack.com/r/${lighterpackUrl}`} target="_blank" rel="noopener noreferrer" className="tab">
              Gear
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
