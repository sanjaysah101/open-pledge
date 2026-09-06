import type { Campaign } from "@/lib/donations/types";

/**
 * Seed campaigns for the demo. Each maps to one of the UN charity themes
 * highlighted in the challenge prompt. Wallet addresses are demo devnet
 * public keys used only to attribute on-chain donations.
 */
export const CAMPAIGNS: Campaign[] = [
  {
    id: "clean-water-mto",
    slug: "clean-water-mto",
    title: "Clean Water for Mto Primary School",
    organization: "Maji Bora Collective",
    summary: "A solar-powered well so 400 students stop walking 6km for water.",
    story:
      "Students at Mto Primary lose hours each day fetching water from a distant, unsafe river. Maji Bora Collective — a youth-led group of local engineers — is installing a solar-powered borehole and storage tank on school grounds. Every micro-donation buys pipe, panels, or a day of drilling. Progress and receipts are published openly so the community can hold us accountable.",
    category: "climate-poverty",
    goalUsd: 8000,
    location: "Kilifi, Kenya",
    emoji: "💧",
    walletAddress: "GEnERosiTyWaTeR1111111111111111111111111111",
  },
  {
    id: "girls-code-lab",
    slug: "girls-code-lab",
    title: "Girls Who Build: Neighborhood Code Lab",
    organization: "Futuras Tech Community",
    summary: "Refurbished laptops and mentors for 30 girls in an after-school lab.",
    story:
      "Futuras runs a free after-school coding lab for girls aged 11–16 in an underserved neighborhood. Funds go to refurbished laptops, a reliable internet line, and stipends for volunteer mentors — most of them alumnae of the program. We report spending line-by-line every month so donors see exactly what their generosity built.",
    category: "equity-inclusion",
    goalUsd: 5000,
    location: "Bogotá, Colombia",
    emoji: "👩‍💻",
    walletAddress: "GEnERosiTyCoDe22222222222222222222222222222",
  },
  {
    id: "youth-food-rescue",
    slug: "youth-food-rescue",
    title: "Youth Food Rescue Bikes",
    organization: "Second Plate Youth Brigade",
    summary: "Cargo bikes that move surplus food from cafes to shelters, fast.",
    story:
      "A teen-led brigade rescues unsold food from cafes and bakeries and delivers it to shelters within the hour — all by bike, zero emissions. Donations fund cargo bikes, insulated bags, and safety gear. Each bike keeps roughly 12,000 meals a year out of the landfill and on someone's plate.",
    category: "youth-leadership",
    goalUsd: 6000,
    location: "Lisbon, Portugal",
    emoji: "🚲",
    walletAddress: "GEnERosiTyFooD33333333333333333333333333333",
  },
  {
    id: "assistive-devices",
    slug: "assistive-devices",
    title: "Open-Source Assistive Devices",
    organization: "Makers for Mobility",
    summary: "3D-printed prosthetics and comms boards, free for families who need them.",
    story:
      "Makers for Mobility designs low-cost, open-source assistive devices — 3D-printed prosthetic hands and augmentative communication boards — and gives them away free to families who can't afford commercial equivalents. Micro-donations cover filament, electronics, and shipping. All designs are published so any maker can replicate them.",
    category: "technology-giving",
    goalUsd: 7000,
    location: "Chennai, India",
    emoji: "🦾",
    walletAddress: "GEnERosiTyAbLe44444444444444444444444444444",
  },
  {
    id: "reforest-ridge",
    slug: "reforest-ridge",
    title: "Reforest the Burnt Ridge",
    organization: "Green Ridge Restorers",
    summary: "Native saplings and a community nursery on land lost to wildfire.",
    story:
      "After last season's wildfire, the ridge above our valley is bare and eroding. Green Ridge Restorers is planting native, fire-resilient saplings and building a community nursery so the effort sustains itself. Donations buy saplings, tools, and drip irrigation. We geotag every planting so donors can watch the canopy return.",
    category: "climate-poverty",
    goalUsd: 9000,
    location: "Valparaíso, Chile",
    emoji: "🌱",
    walletAddress: "GEnERosiTyTreE55555555555555555555555555555",
  },
  {
    id: "warm-nights",
    slug: "warm-nights",
    title: "Warm Nights Winter Kits",
    organization: "Neighbors First Mutual Aid",
    summary: "Sleeping bags, thermal kits, and hot meals for unhoused neighbors.",
    story:
      "A volunteer mutual-aid network assembles and hands out winter survival kits — insulated sleeping bags, thermal layers, socks, and hot meals — to unhoused neighbors during cold snaps. Every $25 is one complete kit. We publish distribution counts and locations (anonymized) so the community can see where help is going.",
    category: "equity-inclusion",
    goalUsd: 4000,
    location: "Toronto, Canada",
    emoji: "🧣",
    walletAddress: "GEnERosiTyWarM66666666666666666666666666666",
  },
];

export function getCampaign(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id || c.slug === id);
}
