import Link from "next/link";

import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CampaignWithProgress } from "@/lib/donations/queries";
import { CATEGORY_LABELS } from "@/lib/donations/types";
import { usd } from "@/lib/format";

export function CampaignCard({ campaign }: { campaign: CampaignWithProgress }) {
  return (
    <Card className="group transition-shadow hover:ring-primary/30 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-lg bg-accent text-2xl"
          >
            {campaign.emoji}
          </span>
          <Badge variant="secondary" className="shrink-0">
            {CATEGORY_LABELS[campaign.category]}
          </Badge>
        </div>
        <Link href={`/campaigns/${campaign.slug}`} className="mt-3">
          <h3 className="text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
            {campaign.title}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {campaign.location} · {campaign.organization}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{campaign.summary}</p>
        <div className="flex flex-col gap-1.5">
          <Progress value={campaign.percent} aria-label="Funding progress" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{usd(campaign.raisedUsd)} raised</span>
            <span className="text-muted-foreground">of {usd(campaign.goalUsd)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>{campaign.donationCount} gifts</span>
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="font-medium text-primary hover:underline"
        >
          Give now →
        </Link>
      </CardFooter>
    </Card>
  );
}
