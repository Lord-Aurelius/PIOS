import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
  | "meetings"
  | "customize"
  | "comms";

export type WorkspaceRole = "creator" | "candidate" | "media" | "clerk" | "field";
export type StaffMember = {
  name: string;
  email: string;
  phone: string;
  role: WorkspaceRole;
  access: ModuleKey[];
  status: string;
};

export type ResourceAllocation = {
  resource: string;
  region: string;
  quantity: number;
  contact: string;
  recipientName: string;
  recipientPhone: string;
  location: string;
  status: string;
};

export type CandidateLoginAccount = {
  candidateName: string;
  userKey: string;
  username: string;
  password: string;
  status: "Active" | "Suspended";
};

export type MeetingAttendee = {
  name: string;
  phone: string;
  location: string;
  meetingType: string;
  supportScore: number;
  x: number;
  y: number;
  attendedAt: string;
};

export type CreatorAccount = {
  userKey: string;
  username: string;
  password: string;
};

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
  candidateLoginAccounts: CandidateLoginAccount[];
  deletedCandidateNames: string[];
  candidateStatuses: Record<string, "Active" | "Suspended">;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
  staffPasswords: Record<string, string>;
  socialHandles: Array<{ network: string; handle: string; status: string; risk: string }>;
  fieldAgents: Array<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>;
  staffMembers: StaffMember[];
  resourceAllocations: ResourceAllocation[];
  meetingAttendees: MeetingAttendee[];
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
  publishedMessages: Array<{ message: string; period: string; channels: string[]; asset: string }>;
  sentMessages: Array<{ target: string; message: string; channel: string; provider: string }>;
  creatorAccount: CreatorAccount;
  login: (credentials: { userKey: string; username: string; password: string }) => LoginResult;
  logout: () => void;
  setActiveModule: (activeModule: ModuleKey) => void;
  setSelectedRegion: (region: Region) => void;
  generateBriefing: () => void;
  addFieldDraft: (draft: { title: string; region: string; type: string }) => void;
  setSelectedParty: (selectedParty: string) => void;
  setUploadedVoterFile: (uploadedVoterFile: string) => void;
  addCandidate: (candidate: { name: string; office: string; party: string; region: string; userKey: string; username: string; password: string }) => void;
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
  deleteFieldAgent: (phone: string) => void;
  addStaffMember: (member: StaffMember) => void;
  updateStaffAccess: (email: string, access: ModuleKey[]) => void;
  addResourceAllocation: (allocation: ResourceAllocation) => void;
  addPoliticalParty: (party: { name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }) => void;
  deletePoliticalParty: (abbreviation: string) => void;
  publishMessage: (message: { message: string; period: string; channels: string[]; asset: string }) => void;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
  updateCreatorAccount: (account: CreatorAccount) => void;
  addMeetingAttendee: (attendee: Omit<MeetingAttendee, "attendedAt">) => void;
};

export const useOpsStore = create<OpsState>()(
  persist(
    (set, get) => ({
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
  candidateLoginAccounts: [],
  deletedCandidateNames: [],
  candidateStatuses: Object.fromEntries(commandData.candidates.map((candidate) => [candidate.name, candidate.status === "Onboarding" ? "Active" : candidate.status])) as Record<string, "Active" | "Suspended">,
  passwordEvents: [],
  staffPasswords: Object.fromEntries(commandData.candidateAccounts.map((account) => [account.username, "Set by candidate"])),
  socialHandles: commandData.socialHandles,
  fieldAgents: commandData.fieldAgents,
  staffMembers: [
    { name: "Brian Otieno", email: "media.lead@amina.local", phone: "+254711222333", role: "media", access: ["social", "ai", "alerts", "comms"], status: "Active" },
    { name: "Lydia Njeri", email: "clerk.lead@amina.local", phone: "+254722333444", role: "clerk", access: ["voters", "surveys", "crm", "field"], status: "Active" },
    { name: "Grace Atieno", email: "field.ops@amina.local", phone: "+254733444555", role: "field", access: ["field", "surveys", "deployment", "comms"], status: "Active" }
  ],
  resourceAllocations: commandData.deployments.map((item, index) => ({
    ...item,
    contact: ["Grace Atieno", "Brian Otieno", "Lydia Njeri"][index] ?? "Regional logistics lead",
    recipientName: ["John Kariuki", "Brian Otieno", "Mariam Achieng"][index] ?? "Regional lead",
    recipientPhone: ["+254711000101", "+254711222333", "+254722000202"][index] ?? "+254700000000",
    location: item.region
  })),
  meetingAttendees: [],
  platformParties: commandData.parties,
  publishedMessages: [],
  sentMessages: [],
  creatorAccount: { userKey: "CREATOR-HQ", username: "creator@pios.local", password: "Creator123!" },
  login: (credentials) => {
    const creatorAccount = get().creatorAccount;
    const creatorMatch =
      creatorAccount.userKey.toLowerCase() === credentials.userKey.trim().toLowerCase() &&
      creatorAccount.username.toLowerCase() === credentials.username.trim().toLowerCase() &&
      creatorAccount.password === credentials.password;
    const candidateAccount = get().candidateLoginAccounts.find(
      (item) =>
        item.status === "Active" &&
        item.userKey.toLowerCase() === credentials.userKey.trim().toLowerCase() &&
        item.username.toLowerCase() === credentials.username.trim().toLowerCase() &&
        item.password === credentials.password
    );
    const staffAccount = get().staffMembers.find(
      (item) =>
        item.status === "Active" &&
        credentials.userKey.trim().length > 0 &&
        item.email.toLowerCase() === credentials.username.trim().toLowerCase() &&
        get().staffPasswords[item.email] === credentials.password
    );
    const account = creatorMatch
      ? { username: creatorAccount.username, role: "creator" }
      : (candidateAccount ? { username: candidateAccount.username, role: "candidate" } : undefined) ?? (staffAccount ? { username: staffAccount.email, role: staffAccount.role } : undefined);
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
      onboardedCandidates: [{ name: candidate.name, office: candidate.office, party: candidate.party, region: candidate.region }, ...state.onboardedCandidates],
      candidateLoginAccounts: [
        { candidateName: candidate.name, userKey: candidate.userKey, username: candidate.username, password: candidate.password, status: "Active" },
        ...state.candidateLoginAccounts
      ],
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
    set((state) => ({
      candidateStatuses: { ...state.candidateStatuses, [name]: "Suspended" },
      candidateLoginAccounts: state.candidateLoginAccounts.map((account) => (account.candidateName === name ? { ...account, status: "Suspended" } : account))
    })),
  deleteCandidate: (name) =>
    set((state) => ({
      onboardedCandidates: state.onboardedCandidates.filter((candidate) => candidate.name !== name),
      candidateLoginAccounts: state.candidateLoginAccounts.filter((account) => account.candidateName !== name),
      deletedCandidateNames: [...state.deletedCandidateNames, name],
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
  deleteFieldAgent: (phone) =>
    set((state) => ({
      fieldAgents: state.fieldAgents.filter((agent) => agent.phone !== phone)
    })),
  addStaffMember: (member) =>
    set((state) => ({
      staffMembers: [member, ...state.staffMembers],
      staffPasswords: { ...state.staffPasswords, [member.email]: "Set by candidate" }
    })),
  updateStaffAccess: (email, access) =>
    set((state) => ({
      staffMembers: state.staffMembers.map((member) => (member.email === email ? { ...member, access } : member))
    })),
  addResourceAllocation: (allocation) =>
    set((state) => ({ resourceAllocations: [allocation, ...state.resourceAllocations] })),
  addPoliticalParty: (party) => set((state) => ({ platformParties: [party, ...state.platformParties] })),
  deletePoliticalParty: (abbreviation) =>
    set((state) => {
      const remainingParties = state.platformParties.filter((party) => party.abbreviation !== abbreviation);
      if (!remainingParties.length) return state;
      return {
        platformParties: remainingParties,
        selectedParty: state.selectedParty === abbreviation ? remainingParties[0]?.abbreviation ?? "" : state.selectedParty,
        onboardedCandidates: state.onboardedCandidates.filter((candidate) => candidate.party !== abbreviation)
      };
    }),
  publishMessage: (message) => set((state) => ({ publishedMessages: [message, ...state.publishedMessages] })),
  sendAfricaTalkingMessage: (message) =>
    set((state) => ({
      sentMessages: [
        { ...message, provider: "Africa's Talking" },
        ...state.sentMessages
      ]
    })),
  updateCreatorAccount: (account) =>
    set((state) => ({
      creatorAccount: account,
      activeIdentity: state.workspaceRole === "creator" ? account.username : state.activeIdentity,
      passwordEvents: [
        { actor: state.activeIdentity || "creator", target: "creator account", changedAt: new Date().toLocaleString() },
        ...state.passwordEvents
      ]
    })),
  addMeetingAttendee: (attendee) =>
    set((state) => ({
      meetingAttendees: [
        { ...attendee, attendedAt: new Date().toISOString() },
        ...state.meetingAttendees
      ]
    }))
    }),
    {
      name: "pios-ops-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        workspaceRole: state.workspaceRole,
        activeIdentity: state.activeIdentity,
        activeModule: state.activeModule,
        selectedParty: state.selectedParty,
        uploadedVoterFile: state.uploadedVoterFile,
        campaignName: state.campaignName,
        candidateName: state.candidateName,
        campaignSlogan: state.campaignSlogan,
        brandColor: state.brandColor,
        customVisits: state.customVisits,
        onboardedCandidates: state.onboardedCandidates,
        candidateLoginAccounts: state.candidateLoginAccounts,
        deletedCandidateNames: state.deletedCandidateNames,
        candidateStatuses: state.candidateStatuses,
        passwordEvents: state.passwordEvents,
        staffPasswords: state.staffPasswords,
        socialHandles: state.socialHandles,
        fieldAgents: state.fieldAgents,
        staffMembers: state.staffMembers,
        resourceAllocations: state.resourceAllocations,
        meetingAttendees: state.meetingAttendees,
        platformParties: state.platformParties,
        publishedMessages: state.publishedMessages,
        sentMessages: state.sentMessages,
        creatorAccount: state.creatorAccount
      })
    }
  )
);
