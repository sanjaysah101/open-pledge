import { Sparkles } from "lucide-react";

import { GithubIcon } from "@/components/icons/github-icon";
import { GITHUB_URL } from "@/lib/site";

const TECH = ["Solana", "Google Gemini", "ElevenLabs", "Snowflake"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md">
          OpenPledge — built for the DEV Weekend Challenge: Generosity Edition. A demo of
          transparent, accountable micro-giving.
        </p>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
          >
            <GithubIcon className="size-3.5" />
            View source on GitHub
          </a>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Sparkles className="size-3.5 text-primary" />
            {TECH.map((t, i) => (
              <span key={t} className="text-xs">
                {t}
                {i < TECH.length - 1 ? " ·" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
