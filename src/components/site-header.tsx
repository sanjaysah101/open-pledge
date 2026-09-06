import Link from "next/link";

import { HandHeart } from "lucide-react";

import { ByokDialog } from "@/components/byok-dialog";
import { ThemeToggle } from "@/theme/theme-toggle";

const NAV = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/ledger", label: "Ledger" },
  { href: "/impact", label: "Impact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HandHeart className="size-4" />
          </span>
          <span className="text-base">
            Open<span className="text-primary">Pledge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ByokDialog />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
