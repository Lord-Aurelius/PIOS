import { create } from "zustand";
import { commandData } from "./demo-data";

export type Region = (typeof commandData.regions)[number];
export type ModuleKey =
  | "creator"
  | "command"
  | "field"
  | "social"
  | "ai"
  | "crm"
  | "surveys"
  | "alerts"
  | "deployment"
  | "voters"
  | "party"
  | "access"
  | "customize"
  | "comms";

export type WorkspaceRole = "creator" | "candidate" | "media" | "clerk" | "field";

export type LoginResult = {
  ok: boolean;
  message: string;
};

type OpsState = {
  isAuthenticated: boolean;
  workspaceRole: WorkspaceRole;
  activeIdentity: string;
  loginError: string;
  activeModule: ModuleKey;
  selectedRegion: Region;
  generatedBriefing: string;
  fieldDrafts: Array<{ title: string; region: string; type: string }>;
  selectedParty: string;
  uploadedVoterFile: string;
  campaignName: string;
  candidateName: string;
  campaignSlogan: string;
  brandColor: string;
  customVisits: Array<{ title: string; type: string; region: string; attendance: number; sentiment: number; x: number; y: number }>;
  onboardedCandidates: Array<{ name: string; office: string; party: string; region: string }>;
  candidateStatuses: Record<string, "Active" | "Suspended">;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
  staffPasswords: Record<string, string>;
  socialHandles: Array<{ network: string; handle: string; status: string; risk: string }>;
  fieldAgents: Array<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>;
  resourceAllocations: Array<{ resource: string; region: string; quantity: number; contact: string; status: string }>;
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
  publishedMessages: Array<{ message: string; period: string; channels: string[]; asset: string }>;
  sentMessages: Array<{ target: string; message: string; channel: string; provider: string }>;
  login: (credentials: { userKey: string; username: string; password: string }) => LoginResult;
  logout: () => void;
  setActiveModule: (activeModule: ModuleKey) => void;
  setSelectedRegion: (region: Region) => void;
  generateBriefing: () => void;
  addFieldDraft: (draft: { title: string; region: string; type: string }) => void;
  setSelectedParty: (selectedParty: string) => void;
  setUploadedVoterFile: (uploadedVoterFile: string) => void;
  addCandidate: (candidate: { name: string; office: string; party: string; region: string }) => void;
  addVisitToSelectedRegion: () => void;
  updateCampaignProfile: (profile: { campaignName: string; candidateName: string; campaignSlogan: string; brandColor: string }) => void;
  changePassword: (target: string) => void;
  suspendCandidate: (name: string) => void;
  deleteCandidate: (name: string) => void;
  setStaffPassword: (username: string, password: string) => void;
  addSocialHandle: (handle: { network: string; handle: string; status: string; risk: string }) => void;
  updateSocialHandle: (network: string, handle: string) => void;
  addFieldAgent: (agent: { name: string; phone: string; pollingStation: string; ward: string; status: string }) => void;
  updateFieldAgent: (phone: string, patch: Partial<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>) => void;
  addResourceAllocation: (allocation: { resource: string; region: string; quantity: number; contact: string; status: string }) => void;
  addPoliticalParty: (party: { name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }) => void;
  publishMessage: (message: { message: string; period: string; channels: string[]; asset: string }) => void;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
};

export const useOpsStore = create<OpsState>((set) => ({
  isAuthenticated: false,
  workspaceRole: "candidate",
  activeIdentity: "",
  loginError: "",
  activeModule: "command",
  selectedRegion: commandData.regions[0],
  generatedBriefing: "",
  fieldDrafts: [],
  selectedParty: commandData.parties[0].abbreviation,
  uploadedVoterFile: "",
  campaignName: commandData.campaign.name,
  candidateName: commandData.campaign.candidate,
  campaignSlogan: commandData.campaign.slogan,
  brandColor: commandData.parties[0].color,
  customVisits: [],
  onboardedCandidates: [],
  candidateStatuses: Object.fromEntries(commandData.candidates.map((candidate) => [candidate.name, candidate.status === "Onboarding" ? "Active" : candidate.status])) as Record<string, "Active" | "Suspended">,
  passwordEvents: [],
  staffPasswords: Object.fromEntries(commandData.candidateAccounts.map((account) => [account.username, "Set by candidate"])),
  socialHandles: commandData.socialHandles,
  fieldAgents: commandData.fieldAgents,
  resourceAllocations: commandData.deployments.map((item) => ({ ...item, contact: "Regional logistics lead" })),
  platformParties: commandData.parties,
  publishedMessages: [],
  sentMessages: [],
  login: (credentials) => {
    const account = commandData.demoAccounts.find(
      (item) =>
        item.userKey.toLowerCase() === credentials.userKey.trim().toLowerCase() &&
        item.username.toLowerCase() === credentials.username.trim().toLowerCase() &&
        item.password === credentials.password
    );
    if (!account) {
      set({ loginError: "Invalid user key, username, or password." });
      return { ok: false, message: "Invalid user key, username, or password." };
    }
    const workspaceRole = account.role as WorkspaceRole;
    set({
      workspaceRole,
      activeIdentity: account.username,
      isAuthenticated: true,
      loginError: "",
      activeModule: workspaceRole === "creator" ? "creator" : "command"
    });
    return { ok: true, message: "Logged in." };
  },
  logout: () => set({ isAuthenticated: false, activeModule: "command", workspaceRole: "candidate", activeIdentity: "" }),
  setActiveModule: (activeModule) => set({ activeModule }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  generateBriefing: () =>
    set({
      generatedBriefing:
        "Executive brief: Nairobi West requires a cost-of-living response within 48 hours. Kibra remains the strongest mobilization opportunity. Embakasi East should receive targeted youth-jobs content and opposition-convoy monitoring."
    }),
  addFieldDraft: (draft) => set((state) => ({ fieldDrafts: [draft, ...state.fieldDrafts] })),
  setSelectedParty: (selectedParty) => set({ selectedParty }),
  setUploadedVoterFile: (uploadedVoterFile) => set({ uploadedVoterFile }),
  addCandidate: (candidate) =>
    set((state) => ({
      onboardedCandidates: [candidate, ...state.onboardedCandidates],
      candidateStatuses: { ...state.candidateStatuses, [candidate.name]: "Active" }
    })),
  addVisitToSelectedRegion: () =>
    set((state) => ({
      customVisits: [
        {
          title: `${state.candidateName} visit to ${state.selectedRegion.name}`,
          type: "Candidate visit",
          region: state.selectedRegion.name,
          attendance: 0,
          sentiment: 0,
          x: state.selectedRegion.x,
          y: state.selectedRegion.y
        },
        ...state.customVisits
      ]
    })),
  updateCampaignProfile: (profile) => set(profile),
  changePassword: (target) =>
    set((state) => ({
      passwordEvents: [
        { actor: state.activeIdentity || "current user", target, changedAt: new Date().toLocaleString() },
        ...state.passwordEvents
      ]
    })),
  suspendCandidate: (name) =>
    set((state) => ({ candidateStatuses: { ...state.candidateStatuses, [name]: "Suspended" } })),
  deleteCandidate: (name) =>
    set((state) => ({
      onboardedCandidates: state.onboardedCandidates.filter((candidate) => candidate.name !== name),
      candidateStatuses: { ...state.candidateStatuses, [name]: "Suspended" }
    })),
  setStaffPassword: (username, password) =>
    set((state) => ({
      staffPasswords: { ...state.staffPasswords, [username]: password },
      passwordEvents: [
        { actor: state.activeIdentity || "candidate", target: username, changedAt: new Date().toLocaleString() },
        ...state.passwordEvents
      ]
    })),
  addSocialHandle: (handle) => set((state) => ({ socialHandles: [handle, ...state.socialHandles] })),
  updateSocialHandle: (network, handle) =>
    set((state) => ({
      socialHandles: state.socialHandles.map((item) => (item.network === network ? { ...item, handle } : item))
    })),
  addFieldAgent: (agent) => set((state) => ({ fieldAgents: [agent, ...state.fieldAgents] })),
  updateFieldAgent: (phone, patch) =>
    set((state) => ({
      fieldAgents: state.fieldAgents.map((agent) => (agent.phone === phone ? { ...agent, ...patch } : agent))
    })),
  addResourceAllocation: (allocation) =>
    set((state) => ({ resourceAllocations: [allocation, ...state.resourceAllocations] })),
  addPoliticalParty: (party) => set((state) => ({ platformParties: [party, ...state.platformParties] })),
  publishMessage: (message) => set((state) => ({ publishedMessages: [message, ...state.publishedMessages] })),
  sendAfricaTalkingMessage: (message) =>
    set((state) => ({
      sentMessages: [
        { ...message, provider: "Africa's Talking" },
        ...state.sentMessages
      ]
    }))
}));
