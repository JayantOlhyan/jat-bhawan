"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/committee", label: "Committee" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line bg-surface">
      <div className="container-site flex max-w-7xl flex-wrap items-center gap-2 py-2">
        <span className="mr-4 font-serif text-lg">Jat Bhawan admin</span>
        <nav aria-label="Admin" className="flex flex-1 flex-wrap gap-1">
          {ITEMS.map((i) => {
            const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-3 no-underline hover:bg-sand ${active ? "bg-sand font-semibold text-maroon" : "text-ink"}`}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>
        <a href="/hi" className="btn btn-quiet" target="_blank" rel="noopener">View site</a>
        <form method="post" action="/api/admin/logout">
          <button type="submit" className="btn btn-quiet">Sign out</button>
        </form>
      </div>
    </header>
  );
}
