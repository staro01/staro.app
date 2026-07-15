export const PLAN_TIERS = {
  essentiel: { label: "Essentiel", monthly: 60, annual: 660 },
  pro: { label: "Pro", monthly: 90, annual: 990 },
  premium: { label: "Premium", monthly: 120, annual: 1320 },
} as const;

export type PlanTier = keyof typeof PLAN_TIERS;
