import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { commandData, emptyRegion, RegionRecord } from "./production-defaults";

export type Region = RegionRecord;
export type ImportedVoterRegion = { name: string; registeredVoters: number };
export type GisMapLevel = "county" | "constituency" | "ward" | "pollingStation";
export type GisDataLayer = {
  id: string;
  sourceImportId?: string;
  name: string;
  source: "voter-import" | "official-boundary" | "manual";
  level: GisMapLevel;
  contestArea?: string;
  regions: Region[];
  createdAt: string;
};
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
  | "inventory"
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

export type InventoryItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  custodian: string;
  custodianPhone?: string;
  status: string;
};

export type VoterImportJob = {
  id: string;
  backendId?: string;
  fileName: string;
  progress: number;
  stage: "Queued" | "Uploading" | "Parsing PDF" | "Extracting voter counts" | "Ready for review" | "Applying to GIS" | "Applied to GIS";
  message: string;
  uploadedAt: string;
  rowsParsed?: number;
  votersTotal?: number;
  regions?: ImportedVoterRegion[];
  appliedAt?: string;
  intelligenceStatus?: "Queued" | "Parsed" | "Applied" | "Needs review";
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

export type CandidateVisitRecord = {
  id?: string;
  title: string;
  type: string;
  region: string;
  attendance: number;
  sentiment: number;
  x: number;
  y: number;
  latitude?: number;
  longitude?: number;
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
  packagedDataEnabled: boolean;
  workspaceRole: WorkspaceRole;
  activeIdentity: string;
  loginError: string;
  activeModule: ModuleKey;
  selectedRegion: Region;
  generatedBriefing: string;
  fieldDrafts: Array<{ title: string; region: string; type: string }>;
  selectedParty: string;
  contestArea: string;
  uploadedVoterFile: string;
  voterImportJobs: VoterImportJob[];
  liveVoterRegions: Region[];
  gisDataLayers: GisDataLayer[];
  activeGisLayerId: string;
  mapLevel: GisMapLevel;
  campaignName: string;
  candidateName: string;
  campaignSlogan: string;
  brandColor: string;
  customVisits: CandidateVisitRecord[];
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
  inventoryItems: InventoryItem[];
  meetingAttendees: MeetingAttendee[];
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
  publishedMessages: Array<{ message: string; period: string; channels: string[]; asset: string }>;
  sentMessages: Array<{ target: string; message: string; channel: string; provider: string }>;
  creatorAccount: CreatorAccount;
  login: (credentials: { userKey: string; username: string; password: string }) => LoginResult;
  completeExternalLogin: (account: { username: string; role: WorkspaceRole; candidateName?: string }) => void;
  logout: () => void;
  setActiveModule: (activeModule: ModuleKey) => void;
  setSelectedRegion: (region: Region) => void;
  generateBriefing: () => void;
  addFieldDraft: (draft: { title: string; region: string; type: string }) => void;
  setSelectedParty: (selectedParty: string) => void;
  setContestArea: (contestArea: string) => void;
  setUploadedVoterFile: (uploadedVoterFile: string) => void;
  queueVoterImport: (fileName: string) => string;
  updateVoterImportJob: (id: string, patch: Partial<VoterImportJob>) => void;
  deleteVoterImportJob: (id: string) => void;
  setLiveVoterRegions: (regions: Region[]) => void;
  applyVoterImportToMap: (id: string, regions?: ImportedVoterRegion[]) => Region[];
  addGisDataLayer: (layer: Omit<GisDataLayer, "id" | "createdAt">) => string;
  updateGisLayerRegions: (id: string, regions: Region[]) => void;
  deleteGisDataLayer: (id: string) => void;
  setActiveGisLayer: (id: string) => void;
  setMapLevel: (level: GisMapLevel) => void;
  addCandidate: (candidate: { name: string; office: string; party: string; region: string; userKey: string; username: string; password: string }) => void;
  addVisitToSelectedRegion: () => void;
  toggleCandidateVisitAtPoint: (point: { latitude: number; longitude: number; region?: string; x?: number; y?: number }) => void;
  removeCandidateVisit: (visitKey: string) => void;
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
  addInventoryItem: (item: InventoryItem) => void;
  addPoliticalParty: (party: { name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }) => void;
  deletePoliticalParty: (abbreviation: string) => void;
  publishMessage: (message: { message: string; period: string; channels: string[]; asset: string }) => void;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
  updateCreatorAccount: (account: CreatorAccount) => void;
  addMeetingAttendee: (attendee: Omit<MeetingAttendee, "attendedAt">) => void;
  approvedSurveySlugs: string[];
  approveSurveyForDashboard: (slug: string) => void;
  clearPackagedData: () => void;
};

export function buildVoterMapRegions(regions: ImportedVoterRegion[]): Region[] {
  return regions
    .filter((region) => region.name.trim() && Number.isFinite(region.registeredVoters))
    .map((region, index) => {
      const row = Math.floor(index / 6);
      const column = index % 6;
      const support = 0;
      const risk = 0;
      const momentum = 0;
      return {
        code: region.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 58) || `REGION-${index + 1}`,
        name: region.name,
        support,
        risk,
        momentum,
        registeredVoters: region.registeredVoters,
        x: Math.min(88, 12 + column * 15),
        y: Math.min(88, 14 + row * 10)
      };
    });
}

function buildManualContestRegion(name: string): Region {
  return {
    code: name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 58) || `MANUAL-${Date.now()}`,
    name,
    support: 0,
    risk: 0,
    momentum: 0,
    registeredVoters: 0,
    x: 50,
    y: 50
  };
}

function persistableGisLayers(layers: GisDataLayer[]) {
  return layers.filter((layer) => layer.source !== "official-boundary");
}

export const useOpsStore = create<OpsState>()(
  persist(
    (set, get) => ({
  isAuthenticated: false,
  packagedDataEnabled: false,
  workspaceRole: "candidate",
  activeIdentity: "",
  loginError: "",
  activeModule: "command",
  selectedRegion: emptyRegion,
  generatedBriefing: "",
  fieldDrafts: [],
  selectedParty: "",
  contestArea: "",
  uploadedVoterFile: "",
  voterImportJobs: [],
  liveVoterRegions: [],
  gisDataLayers: [],
  activeGisLayerId: "",
  mapLevel: "pollingStation",
  campaignName: "New Campaign Workspace",
  candidateName: "Unassigned Candidate",
  campaignSlogan: "Configure this workspace from onboarding.",
  brandColor: "#38bdf8",
  customVisits: [],
  onboardedCandidates: [],
  candidateLoginAccounts: [],
  deletedCandidateNames: [],
  candidateStatuses: {},
  passwordEvents: [],
  staffPasswords: {},
  socialHandles: [],
  fieldAgents: [],
  staffMembers: [],
  resourceAllocations: [],
  inventoryItems: [],
  meetingAttendees: [],
  platformParties: [],
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
      candidateName: candidateAccount?.candidateName ?? get().candidateName,
      isAuthenticated: true,
      loginError: "",
      activeModule: workspaceRole === "creator" ? "creator" : "command"
    });
    return { ok: true, message: "Logged in." };
  },
  completeExternalLogin: (account) =>
    set({
      workspaceRole: account.role,
      activeIdentity: account.username,
      candidateName: account.candidateName ?? get().candidateName,
      isAuthenticated: true,
      loginError: "",
      activeModule: account.role === "creator" ? "creator" : "command"
    }),
  logout: () => set({ isAuthenticated: false, activeModule: "command", workspaceRole: "candidate", activeIdentity: "" }),
  setActiveModule: (activeModule) => set({ activeModule }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  generateBriefing: () =>
    set(() => {
      const liveVoterRegions = get().liveVoterRegions;
      const votersTotal = liveVoterRegions.reduce((sum, region) => sum + region.registeredVoters, 0);
      const largestRegion = [...liveVoterRegions].sort((a, b) => b.registeredVoters - a.registeredVoters)[0];
      return {
        generatedBriefing: liveVoterRegions.length
          ? `Executive brief: ${liveVoterRegions.length.toLocaleString()} mapped voter regions are active with ${votersTotal.toLocaleString()} registered voters. ${largestRegion.name} is the largest immediate mobilization target with ${largestRegion.registeredVoters.toLocaleString()} voters. Use field reports, survey findings, and candidate visits to convert this voter layer into support, risk, and turnout scores.`
          : get().packagedDataEnabled
            ? "Executive brief: Nairobi West requires a cost-of-living response within 48 hours. Kibra remains the strongest mobilization opportunity. Embakasi East should receive targeted youth-jobs content and opposition-convoy monitoring."
            : "Executive brief: No live political intelligence has been imported yet. Upload voter data, collect survey responses, connect social handles, or record field activity to generate real campaign insights."
      };
    }),
  addFieldDraft: (draft) => set((state) => ({ fieldDrafts: [draft, ...state.fieldDrafts] })),
  setSelectedParty: (selectedParty) => set({ selectedParty }),
  setContestArea: (contestArea) => set({ contestArea }),
  setUploadedVoterFile: (uploadedVoterFile) => set({ uploadedVoterFile }),
  queueVoterImport: (fileName) => {
    const id = `voter-import-${Date.now()}`;
    set((state) => ({
      uploadedVoterFile: fileName,
      voterImportJobs: [
        {
          id,
          fileName,
          progress: 5,
          stage: "Queued",
          message: "File received in the browser and waiting for parser handoff.",
          uploadedAt: new Date().toISOString(),
          intelligenceStatus: "Queued"
        },
        ...state.voterImportJobs
      ]
    }));
    return id;
  },
  updateVoterImportJob: (id, patch) =>
    set((state) => ({
      voterImportJobs: state.voterImportJobs.map((job) => (job.id === id ? { ...job, ...patch } : job))
    })),
  deleteVoterImportJob: (id) =>
    set((state) => {
      const remainingLayers = state.gisDataLayers.filter((layer) => layer.id !== id && layer.sourceImportId !== id);
      const activeLayer = remainingLayers.find((layer) => layer.id === state.activeGisLayerId) ?? remainingLayers[0];
      return {
        voterImportJobs: state.voterImportJobs.filter((job) => job.id !== id && job.backendId !== id),
        gisDataLayers: remainingLayers,
        activeGisLayerId: activeLayer?.id ?? "",
        liveVoterRegions: activeLayer?.regions ?? [],
        selectedRegion: activeLayer?.regions[0] ?? emptyRegion
      };
    }),
  setLiveVoterRegions: (liveVoterRegions) =>
    set((state) => ({
      liveVoterRegions,
      selectedRegion: liveVoterRegions[0] ?? state.selectedRegion,
      gisDataLayers: state.gisDataLayers.length
        ? state.gisDataLayers
        : liveVoterRegions.length
          ? [
              {
                id: "backend-voter-layer",
                name: "Applied backend voter layer",
                source: "voter-import",
                level: "pollingStation",
                contestArea: state.contestArea,
                regions: liveVoterRegions,
                createdAt: new Date().toISOString()
              }
            ]
          : state.gisDataLayers,
      activeGisLayerId: state.activeGisLayerId || (liveVoterRegions.length ? "backend-voter-layer" : "")
    })),
  applyVoterImportToMap: (id, suppliedRegions) => {
    const job = get().voterImportJobs.find((item) => item.id === id || item.backendId === id);
    const sourceRegions = suppliedRegions ?? job?.regions ?? [];
    const liveVoterRegions = buildVoterMapRegions(sourceRegions);
    if (!liveVoterRegions.length) return [];
    const layerId = `gis-layer-${Date.now()}`;
    set((state) => ({
      liveVoterRegions,
      selectedRegion: liveVoterRegions[0],
      gisDataLayers: [
        {
          id: layerId,
          name: job?.fileName ?? "Imported voter register",
          sourceImportId: job?.backendId,
          source: "voter-import",
          level: "pollingStation",
          contestArea: state.contestArea,
          regions: liveVoterRegions,
          createdAt: new Date().toISOString()
        },
        ...state.gisDataLayers
      ],
      activeGisLayerId: layerId,
      mapLevel: "pollingStation",
      voterImportJobs: state.voterImportJobs.map((item) =>
        item.id === id || item.backendId === id
          ? {
              ...item,
              progress: 100,
              stage: "Applied to GIS",
              intelligenceStatus: "Applied",
              appliedAt: new Date().toISOString(),
              message: `${liveVoterRegions.length.toLocaleString()} voter regions are now active on the GIS political map and dashboard intelligence layer.`
            }
          : item
      )
    }));
    return liveVoterRegions;
  },
  addGisDataLayer: (layer) => {
    const id = `gis-layer-${Date.now()}`;
    set((state) => ({
      gisDataLayers: [{ ...layer, id, createdAt: new Date().toISOString() }, ...state.gisDataLayers],
      activeGisLayerId: id,
      liveVoterRegions: layer.regions,
      selectedRegion: layer.regions[0] ?? state.selectedRegion,
      mapLevel: layer.level
    }));
    return id;
  },
  updateGisLayerRegions: (id, regions) =>
    set((state) => ({
      gisDataLayers: state.gisDataLayers.map((layer) => (layer.id === id ? { ...layer, regions } : layer)),
      liveVoterRegions: state.activeGisLayerId === id ? regions : state.liveVoterRegions,
      selectedRegion: state.activeGisLayerId === id ? regions[0] ?? state.selectedRegion : state.selectedRegion
    })),
  deleteGisDataLayer: (id) =>
    set((state) => {
      const remainingLayers = state.gisDataLayers.filter((layer) => layer.id !== id);
      const activeLayer = state.activeGisLayerId === id ? remainingLayers[0] : remainingLayers.find((layer) => layer.id === state.activeGisLayerId);
      return {
        gisDataLayers: remainingLayers,
        activeGisLayerId: activeLayer?.id ?? "",
        liveVoterRegions: activeLayer?.regions ?? [],
        selectedRegion: activeLayer?.regions[0] ?? emptyRegion
      };
    }),
  setActiveGisLayer: (id) =>
    set((state) => {
      const layer = state.gisDataLayers.find((item) => item.id === id);
      if (!layer) return {};
      return {
        activeGisLayerId: id,
        liveVoterRegions: layer.regions,
        selectedRegion: layer.regions[0] ?? state.selectedRegion,
        mapLevel: layer.level
      };
    }),
  setMapLevel: (mapLevel) => set({ mapLevel }),
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
    set((state) => {
      const fallbackName = state.contestArea.trim();
      const existingManualRegion = fallbackName
        ? state.liveVoterRegions.find((region) => region.name.toLowerCase() === fallbackName.toLowerCase())
        : undefined;
      const derivedRegion =
        state.selectedRegion.code !== emptyRegion.code
          ? state.selectedRegion
          : existingManualRegion ?? (fallbackName ? buildManualContestRegion(fallbackName) : emptyRegion);
      const needsManualLayer =
        derivedRegion.code !== emptyRegion.code &&
        state.selectedRegion.code === emptyRegion.code &&
        !existingManualRegion;
      const manualLayerId = needsManualLayer ? `manual-layer-${Date.now()}` : state.activeGisLayerId;
      return {
        selectedRegion: derivedRegion,
        liveVoterRegions: needsManualLayer ? [derivedRegion, ...state.liveVoterRegions] : state.liveVoterRegions,
        gisDataLayers: needsManualLayer
          ? [
              {
                id: manualLayerId,
                name: `${fallbackName} manual region`,
                source: "manual",
                level: state.mapLevel,
                contestArea: fallbackName,
                regions: [derivedRegion]
                ,
                createdAt: new Date().toISOString()
              },
              ...state.gisDataLayers
            ]
          : state.gisDataLayers,
        activeGisLayerId: needsManualLayer ? manualLayerId : state.activeGisLayerId,
        customVisits: derivedRegion.code === emptyRegion.code
          ? state.customVisits
          : [
              {
                id: `visit-${Date.now()}`,
                title: `${state.candidateName} visit to ${derivedRegion.name}`,
                type: "Candidate visit",
                region: derivedRegion.name,
                attendance: 0,
                sentiment: 0,
                x: derivedRegion.x,
                y: derivedRegion.y,
                latitude: derivedRegion.latitude,
                longitude: derivedRegion.longitude
              },
              ...state.customVisits
            ]
      };
    }),
  toggleCandidateVisitAtPoint: (point) =>
    set((state) => {
      const closeVisit = state.customVisits.find((visit) => {
        if (visit.latitude === undefined || visit.longitude === undefined) return false;
        const distance = Math.hypot(visit.latitude - point.latitude, visit.longitude - point.longitude);
        return distance < 0.012;
      });
      if (closeVisit?.id) {
        return { customVisits: state.customVisits.filter((visit) => visit.id !== closeVisit.id) };
      }
      const region =
        point.region?.trim() ||
        (state.selectedRegion.name !== emptyRegion.name ? state.selectedRegion.name : state.contestArea || "Visited location");
      return {
        customVisits: [
          {
            id: `visit-${Date.now()}`,
            title: `${state.candidateName} visit to ${region}`,
            type: "Candidate visit",
            region,
            attendance: 0,
            sentiment: 0,
            x: point.x ?? state.selectedRegion.x,
            y: point.y ?? state.selectedRegion.y,
            latitude: point.latitude,
            longitude: point.longitude
          },
          ...state.customVisits
        ]
      };
    }),
  removeCandidateVisit: (visitKey) =>
    set((state) => ({
      customVisits: state.customVisits.filter((visit, index) => (visit.id ?? `${visit.title}-${visit.region}-${index}`) !== visitKey)
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
  addInventoryItem: (item) => set((state) => ({ inventoryItems: [item, ...state.inventoryItems] })),
  addPoliticalParty: (party) => set((state) => ({ platformParties: [party, ...state.platformParties] })),
  deletePoliticalParty: (abbreviation) =>
    set((state) => {
      const remainingParties = state.platformParties.filter((party) => party.abbreviation !== abbreviation);
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
    })),
  approvedSurveySlugs: [],
  approveSurveyForDashboard: (slug) =>
    set((state) => ({
      approvedSurveySlugs: state.approvedSurveySlugs.includes(slug) ? state.approvedSurveySlugs : [...state.approvedSurveySlugs, slug]
    })),
  clearPackagedData: () =>
    set((state) => ({
      packagedDataEnabled: false,
      candidateLoginAccounts: state.candidateLoginAccounts.filter((account) => account.candidateName !== commandData.campaign.candidate),
      deletedCandidateNames: commandData.candidates.map((candidate) => candidate.name),
      fieldAgents: [],
      staffMembers: [],
      staffPasswords: {},
      resourceAllocations: [],
      inventoryItems: [],
      socialHandles: [],
      publishedMessages: [],
      sentMessages: [],
      customVisits: [],
      fieldDrafts: [],
      meetingAttendees: [],
      platformParties: state.platformParties.filter((party) => !commandData.parties.some((packagedParty) => packagedParty.abbreviation === party.abbreviation)),
      uploadedVoterFile: "",
      voterImportJobs: [],
      liveVoterRegions: [],
      gisDataLayers: [],
      activeGisLayerId: "",
      mapLevel: "pollingStation",
      contestArea: "",
      generatedBriefing: "",
      campaignName: "New Campaign Workspace",
      candidateName: "Unassigned Candidate",
      campaignSlogan: "Configure this workspace from onboarding.",
      activeModule: "creator"
    }))
    }),
    {
      name: "pios-live-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const gisDataLayers = persistableGisLayers(state.gisDataLayers);
        return {
          isAuthenticated: state.isAuthenticated,
          packagedDataEnabled: state.packagedDataEnabled,
          workspaceRole: state.workspaceRole,
          activeIdentity: state.activeIdentity,
          activeModule: state.activeModule,
          selectedParty: state.selectedParty,
          contestArea: state.contestArea,
          uploadedVoterFile: state.uploadedVoterFile,
          voterImportJobs: state.voterImportJobs,
          liveVoterRegions: state.liveVoterRegions,
          gisDataLayers,
          activeGisLayerId: gisDataLayers.some((layer) => layer.id === state.activeGisLayerId) ? state.activeGisLayerId : "",
          mapLevel: state.mapLevel,
          campaignName: state.campaignName,
          candidateName: state.candidateName,
          campaignSlogan: state.campaignSlogan,
          brandColor: state.brandColor,
          customVisits: state.customVisits,
          onboardedCandidates: state.onboardedCandidates,
          candidateLoginAccounts: state.candidateLoginAccounts.map((account) => ({ ...account, password: "" })),
          deletedCandidateNames: state.deletedCandidateNames,
          candidateStatuses: state.candidateStatuses,
          passwordEvents: state.passwordEvents,
          staffPasswords: {},
          socialHandles: state.socialHandles,
          fieldAgents: state.fieldAgents,
          staffMembers: state.staffMembers,
          resourceAllocations: state.resourceAllocations,
          inventoryItems: state.inventoryItems,
          meetingAttendees: state.meetingAttendees,
          approvedSurveySlugs: state.approvedSurveySlugs,
          platformParties: state.platformParties,
          publishedMessages: state.publishedMessages,
          sentMessages: state.sentMessages,
          creatorAccount: { ...state.creatorAccount, password: "" }
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<OpsState>;
        const wasPackagedWorkspace = persisted.packagedDataEnabled === true;
        const packagedCandidateNames = new Set(commandData.candidates.map((candidate) => candidate.name));
        const packagedPartyAbbreviations = new Set(commandData.parties.map((party) => party.abbreviation));
        const packagedDataEnabled = false;
        const candidateLoginAccounts = persisted.candidateLoginAccounts?.length
          ? persisted.candidateLoginAccounts.map((account) => ({ ...account, password: "" }))
              .filter((account) => !packagedCandidateNames.has(account.candidateName))
          : [];
        const sanitizedPersisted = wasPackagedWorkspace
          ? {
              ...persisted,
              campaignName: currentState.campaignName,
              candidateName: currentState.candidateName,
              campaignSlogan: currentState.campaignSlogan,
              selectedParty: "",
              contestArea: "",
              customVisits: [],
              fieldDrafts: [],
              socialHandles: [],
              fieldAgents: [],
              staffMembers: [],
              resourceAllocations: [],
              inventoryItems: [],
              meetingAttendees: [],
              publishedMessages: [],
              sentMessages: [],
              uploadedVoterFile: "",
              voterImportJobs: [],
              liveVoterRegions: [],
              gisDataLayers: [],
              activeGisLayerId: "",
              mapLevel: "pollingStation" as GisMapLevel,
              generatedBriefing: "",
              onboardedCandidates: persisted.onboardedCandidates?.filter((candidate) => !packagedCandidateNames.has(candidate.name)) ?? [],
              platformParties: persisted.platformParties?.filter((party) => !packagedPartyAbbreviations.has(party.abbreviation)) ?? [],
              candidateStatuses: Object.fromEntries(Object.entries(persisted.candidateStatuses ?? {}).filter(([name]) => !packagedCandidateNames.has(name))) as Record<string, "Active" | "Suspended">
            }
          : persisted;
        const gisDataLayers = persistableGisLayers(sanitizedPersisted.gisDataLayers ?? []);
        const activeGisLayerId = gisDataLayers.some((layer) => layer.id === sanitizedPersisted.activeGisLayerId)
          ? sanitizedPersisted.activeGisLayerId ?? ""
          : "";
        return {
          ...currentState,
          ...sanitizedPersisted,
          packagedDataEnabled,
          creatorAccount: currentState.creatorAccount,
          staffPasswords: {},
          approvedSurveySlugs: sanitizedPersisted.approvedSurveySlugs ?? [],
          liveVoterRegions: sanitizedPersisted.liveVoterRegions ?? [],
          gisDataLayers,
          activeGisLayerId,
          mapLevel: sanitizedPersisted.mapLevel ?? ("pollingStation" as GisMapLevel),
          contestArea: sanitizedPersisted.contestArea ?? "",
          candidateLoginAccounts
        };
      }
    }
  )
);
