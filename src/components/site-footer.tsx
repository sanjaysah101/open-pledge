import { Sparkles } from "lucide-react";

const TECH = ["Solana", "Google Gemini", "ElevenLabs", "Snowflake"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md">
          OpenPledge — built for the DEV Weekend Challenge: Generosity Edition. A demo of
          transparent, accountable micro-giving.
        </p>
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
    </footer>
  );
}
