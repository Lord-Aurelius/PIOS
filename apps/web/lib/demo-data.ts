export const commandData = {
  campaign: {
    name: "Nairobi Governor 2027",
    candidate: "Amina Wekesa",
    office: "Governor",
    status: "ACTIVE",
    slogan: "Accountable services, jobs, and safer neighborhoods"
  },
  candidates: [
    { name: "Amina Wekesa", office: "Governor", party: "DPA", status: "Active", region: "Nairobi County" },
    { name: "Daniel Otieno", office: "MP", party: "CRM", status: "Onboarding", region: "Embakasi East" }
  ],
  staffRoles: [
    { role: "Media team", access: ["Social", "AI", "Alerts"], members: 6, purpose: "Narrative response, press monitoring, message testing" },
    { role: "Clerks", access: ["Voters", "Surveys", "CRM"], members: 12, purpose: "Data entry, voter register imports, survey cleanup" },
    { role: "Field coordinators", access: ["Field", "Surveys", "Resources"], members: 28, purpose: "Door-to-door reporting and resource deployment" }
  ],
  socialHandles: [
    { network: "X", handle: "@AminaWekesa", status: "Connected", risk: "Fuel-tax replies rising" },
    { network: "Facebook", handle: "Amina Wekesa Official", status: "Connected", risk: "High engagement on jobs posts" },
    { network: "TikTok", handle: "@aminafornairobi", status: "Needs review", risk: "Youth comments require moderation" }
  ],
  demoAccounts: [
    { label: "Creator", userKey: "CREATOR-HQ", username: "creator@pios.local", password: "Creator123!", role: "creator" },
    { label: "Candidate", userKey: "AMINA-2027", username: "amina", password: "Candidate123!", role: "candidate" },
    { label: "Media team", userKey: "AMINA-2027", username: "media.lead", password: "Media123!", role: "media" },
    { label: "Clerk", userKey: "AMINA-2027", username: "clerk.lead", password: "Clerk123!", role: "clerk" }
  ],
  candidateAccounts: [
    { username: "amina", role: "Candidate", status: "Active", access: ["All candidate modules"] },
    { username: "media.lead", role: "Media team", status: "Active", access: ["Social", "AI", "Alerts"] },
    { username: "clerk.lead", role: "Clerk", status: "Active", access: ["Voters", "Surveys", "CRM"] }
  ],
  fieldAgents: [
    { name: "John Kariuki", phone: "+254711000101", pollingStation: "Nairobi West Primary", ward: "Nairobi West", status: "Active" },
    { name: "Mariam Achieng", phone: "+254722000202", pollingStation: "Laini Saba Hall", ward: "Kibra", status: "Active" },
    { name: "Peter Mwangi", phone: "+254733000303", pollingStation: "Embakasi Social Hall", ward: "Embakasi East", status: "Inactive" }
  ],
  communications: [
    { channel: "SMS", provider: "Africa's Talking", target: "Nairobi West agents", status: "Delivered", count: 42 },
    { channel: "WhatsApp", provider: "Africa's Talking", target: "Media response group", status: "Queued", count: 8 }
  ],
  mediaStrategies: [
    {
      message: "Amina's jobs plan funds ward-level youth enterprise desks.",
      period: "Next 7 days",
      audience: "18-35 undecided voters",
      assets: ["youth-jobs-townhall.jpg", "candidate-market-walk.png"],
      channels: ["X", "Facebook", "TikTok", "WhatsApp"]
    },
    {
      message: "County services must be predictable, accountable, and close to residents.",
      period: "Weekend push",
      audience: "Market traders and household heads",
      assets: ["services-scorecard.png"],
      channels: ["Facebook", "WhatsApp", "Radio brief"]
    }
  ],
  metrics: [
    { label: "Win probability", value: "57%", change: 4.2, tone: "positive" },
    { label: "Active alerts", value: "3", change: -8.1, tone: "negative" },
    { label: "Positive field signals", value: "128", change: 6.4, tone: "positive" },
    { label: "Negative social spikes", value: "5", change: -12, tone: "negative" }
  ],
  regions: [
    { code: "NAI-WEST", name: "Nairobi West", support: 49, risk: 78, momentum: -12, registeredVoters: 88300, x: 22, y: 42 },
    { code: "KIBRA", name: "Kibra", support: 61, risk: 38, momentum: 9, registeredVoters: 109000, x: 46, y: 64 },
    { code: "EMBAKASI", name: "Embakasi East", support: 54, risk: 46, momentum: 4, registeredVoters: 126000, x: 72, y: 38 },
    { code: "ROYSAMBU", name: "Roysambu", support: 52, risk: 52, momentum: -2, registeredVoters: 94500, x: 58, y: 22 }
  ],
  voterImports: [
    {
      sourceName: "IEBC Registered Voters Per Polling Station",
      fileName: "iebc-registered-voters-demo.pdf",
      status: "Parsed",
      rowsParsed: 40883,
      votersTotal: 19611423
    }
  ],
  parties: [
    {
      name: "Demo Progressive Alliance",
      abbreviation: "DPA",
      color: "#38bdf8",
      ideology: "Service delivery, accountability, youth employment",
      influenceScore: 64,
      sentimentScore: 22,
      strongholds: ["Kibra", "Embakasi East"],
      risks: ["National tax debate spillover", "Urban service delivery fatigue"]
    },
    {
      name: "Civic Renewal Movement",
      abbreviation: "CRM",
      color: "#f59e0b",
      ideology: "Local business, public safety, anti-waste messaging",
      influenceScore: 51,
      sentimentScore: -6,
      strongholds: ["Nairobi West"],
      risks: ["Weak youth organizer network", "Low volunteer density"]
    }
  ],
  candidateVisits: [
    {
      title: "Laini Saba women organizer forum",
      type: "Town hall",
      region: "Kibra",
      attendance: 780,
      sentiment: 48,
      x: 46,
      y: 64
    },
    {
      title: "Matatu stage listening tour",
      type: "Listening tour",
      region: "Nairobi West",
      attendance: 220,
      sentiment: -18,
      x: 22,
      y: 42
    }
  ],
  alerts: [
    {
      severity: "HIGH",
      title: "Sentiment decline in Nairobi West",
      message: "Youth support declined after fuel-tax discussion; social velocity is above threshold.",
      region: { name: "Nairobi West" }
    },
    {
      severity: "MEDIUM",
      title: "Opposition convoy activity",
      message: "Two market stops detected near Embakasi East swing clusters.",
      region: { name: "Embakasi East" }
    },
    {
      severity: "CRITICAL",
      title: "Misinformation clip accelerating",
      message: "A clipped radio segment is spreading across public Telegram groups.",
      region: { name: "Kibra" }
    }
  ],
  insights: [
    {
      title: "Cost-of-living narrative accelerating",
      summary: "Negative fuel-tax discussion is concentrated in Nairobi West transport corridors.",
      recommendation: "Deploy a targeted affordability message and schedule listening sessions within 7 days.",
      confidence: 0.84,
      priority: 1
    },
    {
      title: "Kibra organizer network is outperforming",
      summary: "Rally attendance and volunteer density indicate a high-opportunity mobilization zone.",
      recommendation: "Increase volunteer kits and retain women organizer leads for household visits.",
      confidence: 0.78,
      priority: 2
    }
  ],
  posts: [
    {
      source: "X",
      authorHandle: "@nairobivoices",
      text: "Fuel prices are hurting families. Candidates must answer clearly.",
      sentiment: "NEGATIVE",
      engagement: 4200,
      region: { name: "Nairobi West" }
    },
    {
      source: "Radio",
      authorHandle: "East FM",
      text: "Callers praised the candidate's promise on youth job centers.",
      sentiment: "POSITIVE",
      engagement: 900,
      region: { name: "Embakasi East" }
    },
    {
      source: "Field",
      authorHandle: "Ward coordinator",
      text: "Market traders want a direct response on county permits and enforcement.",
      sentiment: "MIXED",
      engagement: 80,
      region: { name: "Kibra" }
    }
  ],
  reports: [
    {
      type: "COMMUNITY_ISSUE",
      title: "Fuel tax anger in matatu stages",
      body: "Youth and drivers raised cost-of-living concerns after the fuel tax debate.",
      sentiment: "NEGATIVE",
      region: { name: "Nairobi West" },
      reporter: { name: "Campaign Commander" }
    },
    {
      type: "RALLY_ATTENDANCE",
      title: "Strong turnout at Laini Saba rally",
      body: "Attendance exceeded estimates, with strong women organizer presence.",
      sentiment: "POSITIVE",
      region: { name: "Kibra" },
      reporter: { name: "Campaign Commander" }
    }
  ],
  crm: [
    { name: "Grace Atieno", type: "LOCAL_LEADER", region: "Kibra", score: 88, next: "Host women organizer roundtable" },
    { name: "David Mwangi", type: "INFLUENCER", region: "Embakasi East", score: 64, next: "Brief on youth jobs message" },
    { name: "Fatuma Noor", type: "VOLUNTEER", region: "Nairobi West", score: 73, next: "Assign matatu-stage listening post" }
  ],
  surveys: [
    { name: "Cost of living pulse", slug: "cost-of-living-pulse", responses: 1842, sentiment: -0.24, complete: 76, target: "Nairobi West youth and transport workers" },
    { name: "Youth jobs cross-tab", slug: "youth-jobs-cross-tab", responses: 1190, sentiment: 0.31, complete: 68, target: "18-35 undecided voters" },
    { name: "Rally follow-up", slug: "rally-follow-up", responses: 642, sentiment: 0.48, complete: 54, target: "Recent event attendees" }
  ],
  deployments: [
    { resource: "Volunteer kits", region: "Kibra", status: "In transit", quantity: 300 },
    { resource: "Rapid response media", region: "Nairobi West", status: "Assigned", quantity: 4 },
    { resource: "Ward canvass teams", region: "Embakasi East", status: "Active", quantity: 12 }
  ]
};
