export type RegionRecord = {
  code: string;
  name: string;
  support: number;
  risk: number;
  momentum: number;
  registeredVoters: number;
  x: number;
  y: number;
  latitude?: number;
  longitude?: number;
  boundary?: Array<{ x: number; y: number }>;
};

export const emptyRegion: RegionRecord = {
  code: "UNCONFIGURED",
  name: "No region configured",
  support: 0,
  risk: 0,
  momentum: 0,
  registeredVoters: 0,
  x: 50,
  y: 50
};

export const commandData = {
  campaign: {
    name: "",
    candidate: "",
    office: "",
    status: "",
    slogan: ""
  },
  candidates: [] as Array<{ name: string; office: string; party: string; status: string; region: string }>,
  staffRoles: [] as Array<{ role: string; access: string[]; members: number; purpose: string }>,
  socialHandles: [] as Array<{ network: string; handle: string; status: string; risk: string }>,
  candidateAccounts: [] as Array<{ username: string; role: string; status: string; access: string[] }>,
  fieldAgents: [] as Array<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>,
  communications: [] as Array<{ channel: string; provider: string; target: string; status: string; count: number }>,
  mediaStrategies: [] as Array<{ message: string; period: string; audience: string; assets: string[]; channels: string[] }>,
  metrics: [] as Array<{ label: string; value: string; change: number; tone: string }>,
  regions: [] as RegionRecord[],
  voterImports: [] as Array<{ sourceName: string; fileName: string; status: string; rowsParsed: number; votersTotal: number }>,
  parties: [] as Array<{
    name: string;
    abbreviation: string;
    color: string;
    ideology: string;
    influenceScore: number;
    sentimentScore: number;
    strongholds: string[];
    risks: string[];
  }>,
  candidateVisits: [] as Array<{ title: string; type: string; region: string; attendance: number; sentiment: number; x: number; y: number }>,
  alerts: [] as Array<{ severity: string; title: string; message: string; region: { name: string } }>,
  insights: [] as Array<{ title: string; summary: string; recommendation: string; confidence: number; priority: number }>,
  posts: [] as Array<{ source: string; authorHandle: string; text: string; sentiment: string; engagement: number; region: { name: string } }>,
  reports: [] as Array<{ type: string; title: string; body: string; sentiment: string; region: { name: string }; reporter: { name: string } }>,
  crm: [] as Array<{ name: string; type: string; region: string; score: number; next: string }>,
  surveys: [] as Array<{ name: string; slug: string; responses: number; sentiment: number; complete: number; target: string }>,
  deployments: [] as Array<{ resource: string; region: string; status: string; quantity: number }>
};
