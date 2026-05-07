export type TenantContext = {
  tenantId: string;
  campaignId?: string;
  userId: string;
  permissions: string[];
};

export type CommandMetric = {
  label: string;
  value: string;
  change: number;
  tone: "positive" | "neutral" | "negative";
};

export type IntelligenceRecommendation = {
  title: string;
  summary: string;
  recommendation: string;
  confidence: number;
  priority: number;
};
