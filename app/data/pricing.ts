export type BillingFrequency = "monthly" | "yearly";

export type PricingPlan = {
  tier: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  highlight?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    tier: "Launch",
    monthlyPrice: 0,
    description: "Perfect for solo founders validating their forecast process.",
    features: [
      "1 company workspace",
      "1-month forecast horizon",
      "Manual data entry only",
      "Read-only dashboard",
    ],
  },
  {
    tier: "Scale",
    monthlyPrice: 149,
    description: "For finance teams who need scenario agility and stakeholder reporting.",
    features: [
      "Unlimited scenarios & entities",
      "3-year monthly + yearly projections",
      "Automated variance commentary",
      "Team workspaces & stakeholder sharing",
      "Direct accounting integrations (Xero/QBO)",
      "Cash flow & runway modeling",
    ],
    highlight: true,
  },
  {
    tier: "Advisory",
    monthlyPrice: 349,
    description: "Built for fractional CFOs and accounting firms with SMB portfolios.",
    features: [
      "Client portal & white-label reports",
      "Portfolio roll-ups & benchmarking",
      "Priority support & onboarding",
      "Dedicated success strategist",
      "API access & custom data sources",
      "Audit logs & advanced permissions",
    ],
  },
];

