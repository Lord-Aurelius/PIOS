"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Database,
  Eye,
  EyeOff,
  FileText,
  Handshake,
  Landmark,
  Layers,
  LogOut,
  Menu,
  MapPin,
  Megaphone,
  MessageSquare,
  Palette,
  Plus,
  QrCode,
  Radio,
  ShieldCheck,
  Siren,
  Truck,
  UserCog,
  Users,
  X
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { commandData, emptyRegion } from "@/lib/production-defaults";
import { CandidateLoginAccount, CreatorAccount, InventoryItem, MeetingAttendee, ModuleKey, Region, ResourceAllocation, StaffMember, useOpsStore, VoterImportJob, WorkspaceRole } from "@/lib/ops-store";
import {
  defaultSurveyQuestions,
  questionTypes,
  storageKeyForSurveyResponses,
  storageKeyForSurvey,
  SurveyResponse,
  SurveyQuestion
} from "@/lib/survey-questions";

type Tone = "positive" | "neutral" | "negative";

function toneClass(tone: Tone) {
  if (tone === "positive") return "text-emerald-300";
  if (tone === "negative") return "text-rose-300";
  return "text-slate-300";
}

function severityClass(severity: string) {
  if (severity === "CRITICAL") return "border-rose-400/60 bg-rose-500/10 text-rose-200";
  if (severity === "HIGH") return "border-amber-400/60 bg-amber-500/10 text-amber-100";
  return "border-sky-400/50 bg-sky-500/10 text-sky-100";
}

function regionMapStyle(region: Region, selected: boolean) {
  const importedOnly = region.support === 0 && region.risk === 0 && region.momentum === 0 && region.registeredVoters > 0;
  const importedFill = region.registeredVoters >= 8000 ? "#e879f9" : region.registeredVoters >= 5000 ? "#f97316" : region.registeredVoters >= 2500 ? "#06b6d4" : "#22c55e";
  const fill = importedOnly ? importedFill : region.risk >= 70 ? "#ef4444" : region.support >= 58 ? "#22c55e" : region.momentum < 0 ? "#f59e0b" : "#38bdf8";
  const ring = selected ? "#ffffff" : region.risk >= 70 ? "#fecaca" : region.support >= 58 ? "#bbf7d0" : region.momentum < 0 ? "#fde68a" : "#bae6fd";
  const importedGlow = region.registeredVoters >= 8000 ? "232,121,249" : region.registeredVoters >= 5000 ? "249,115,22" : region.registeredVoters >= 2500 ? "6,182,212" : "34,197,94";
  const glow = importedOnly ? importedGlow : region.risk >= 70 ? "239,68,68" : region.support >= 58 ? "34,197,94" : region.momentum < 0 ? "245,158,11" : "56,189,248";
  return {
    background: fill,
    borderColor: ring,
    boxShadow: `0 0 ${selected ? 34 : 22}px rgba(${glow}, .65)`
  };
}

export function CommandCenter() {
  const {
    isAuthenticated,
    packagedDataEnabled,
    workspaceRole,
    activeIdentity,
    loginError,
    activeModule,
    selectedRegion,
    generatedBriefing,
    fieldDrafts,
    selectedParty,
    uploadedVoterFile,
    voterImportJobs,
    liveVoterRegions,
    campaignName,
    candidateName,
    campaignSlogan,
    brandColor,
    customVisits,
    onboardedCandidates,
    candidateLoginAccounts,
    deletedCandidateNames,
    candidateStatuses,
    passwordEvents,
    staffPasswords,
    socialHandles,
    fieldAgents,
    staffMembers,
    resourceAllocations,
    inventoryItems,
    meetingAttendees,
    platformParties,
    publishedMessages,
    sentMessages,
    creatorAccount,
    login,
    completeExternalLogin,
    logout,
    setActiveModule,
    setSelectedRegion,
    generateBriefing,
    addFieldDraft,
    setSelectedParty,
    setUploadedVoterFile,
    queueVoterImport,
    updateVoterImportJob,
    setLiveVoterRegions,
    applyVoterImportToMap,
    addCandidate,
    addVisitToSelectedRegion,
    updateCampaignProfile,
    changePassword,
    suspendCandidate,
    deleteCandidate,
    setStaffPassword,
    addSocialHandle,
    updateSocialHandle,
    addFieldAgent,
    updateFieldAgent,
    deleteFieldAgent,
    addStaffMember,
    updateStaffAccess,
    addResourceAllocation,
    addInventoryItem,
    addPoliticalParty,
    deletePoliticalParty,
    publishMessage,
    sendAfricaTalkingMessage,
    updateCreatorAccount,
    addMeetingAttendee,
    approvedSurveySlugs,
    approveSurveyForDashboard
  } = useOpsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const mapRegions = useMemo(
    () => (liveVoterRegions.length ? liveVoterRegions : packagedDataEnabled ? commandData.regions : []),
    [liveVoterRegions, packagedDataEnabled]
  );
  useEffect(() => {
    if (mapRegions.length && (selectedRegion.code === emptyRegion.code || !mapRegions.some((region) => region.code === selectedRegion.code))) {
      setSelectedRegion(mapRegions[0]);
    }
  }, [mapRegions, selectedRegion.code, setSelectedRegion]);
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase || liveVoterRegions.length) return;
    let cancelled = false;
    async function loadAppliedVoterRegions() {
      try {
        const response = await fetch(`${apiBase}/api/v1/public/voter-imports/gis-regions`);
        if (!response.ok) return;
        const regions = (await response.json()) as Array<{ name: string; registeredVoters?: number }>;
        if (cancelled || !regions.length) return;
        setLiveVoterRegions(
          regions.map((region, index) => ({
            code: region.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 58) || `REGION-${index + 1}`,
            name: region.name,
            support: 0,
            risk: 0,
            momentum: 0,
            registeredVoters: region.registeredVoters ?? 0,
            x: Math.min(88, 12 + (index % 6) * 15),
            y: Math.min(88, 14 + Math.floor(index / 6) * 10)
          }))
        );
      } catch {
        // The map can still be populated by applying a newly parsed import in the UI.
      }
    }
    loadAppliedVoterRegions();
    return () => {
      cancelled = true;
    };
  }, [liveVoterRegions.length, setLiveVoterRegions]);
  useEffect(() => {
    async function loadSurveyResponses() {
      const localSurveySlugs = Object.keys(defaultSurveyQuestions);
      const responses = localSurveySlugs.flatMap((slug) => {
        const saved = window.localStorage.getItem(storageKeyForSurveyResponses(slug));
        return saved ? (JSON.parse(saved) as SurveyResponse[]) : [];
      });
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (apiBase) {
        try {
          const apiResponse = await fetch(`${apiBase}/api/v1/public/surveys/responses`);
          if (apiResponse.ok) {
            const apiResponses = (await apiResponse.json()) as SurveyResponse[];
            setSurveyResponses([...apiResponses, ...responses]);
            return;
          }
        } catch {
          setSurveyResponses(responses);
          return;
        }
      }
      setSurveyResponses(responses);
    }
    loadSurveyResponses();
    window.addEventListener("storage", loadSurveyResponses);
    window.addEventListener("pios-survey-response", loadSurveyResponses);
    return () => {
      window.removeEventListener("storage", loadSurveyResponses);
      window.removeEventListener("pios-survey-response", loadSurveyResponses);
    };
  }, []);
  const selectedSignals = useMemo(
    () =>
      packagedDataEnabled
        ? commandData.posts.filter((signal) => signal.region.name === selectedRegion.name).length +
          commandData.reports.filter((report) => report.region.name === selectedRegion.name).length
        : 0,
    [packagedDataEnabled, selectedRegion]
  );

  if (!isAuthenticated) {
    return <LoginScreen login={login} completeExternalLogin={completeExternalLogin} loginError={loginError} />;
  }

  const packagedCandidates = packagedDataEnabled ? commandData.candidates.filter((candidate) => !deletedCandidateNames.includes(candidate.name)) : [];
  const creatorClimateMetrics = [
    { label: "Tracked candidates", value: String([...onboardedCandidates, ...packagedCandidates].length), change: 12, tone: "positive" },
    { label: "Regions monitored", value: String(mapRegions.length), change: mapRegions.length ? 4 : 0, tone: "neutral" },
    { label: "Platform access users", value: String((packagedDataEnabled ? commandData.candidateAccounts.length : 0) + candidateLoginAccounts.length + staffMembers.length), change: 9, tone: "positive" },
    { label: "Climate risk index", value: "Medium", change: -3, tone: "neutral" }
  ];
  const blankCandidateMetrics = [
    { label: "Win probability", value: "0%", change: 0, tone: "neutral" },
    { label: "Positive field signals", value: "0", change: 0, tone: "neutral" },
    { label: "Negative social spikes", value: "0", change: 0, tone: "neutral" },
    { label: "Priority swing areas", value: "0", change: 0, tone: "neutral" }
  ];
  const liveVoterTotal = liveVoterRegions.reduce((sum, region) => sum + region.registeredVoters, 0);
  const largestVoterRegion = [...liveVoterRegions].sort((a, b) => b.registeredVoters - a.registeredVoters)[0];
  const voterIntelligenceMetrics = [
    { label: "Registered voters mapped", value: liveVoterTotal.toLocaleString(), change: 100, tone: "positive" },
    { label: "Polling areas mapped", value: String(liveVoterRegions.length), change: 100, tone: "positive" },
    { label: "Largest voter target", value: largestVoterRegion ? largestVoterRegion.registeredVoters.toLocaleString() : "0", change: 0, tone: "neutral" },
    { label: "Priority swing areas", value: String(liveVoterRegions.length), change: 0, tone: "neutral" }
  ];
  const candidateMetricSource = liveVoterRegions.length ? voterIntelligenceMetrics : packagedDataEnabled ? commandData.metrics : blankCandidateMetrics;
  const visibleMetrics = workspaceRole === "creator" ? creatorClimateMetrics : workspaceRole === "clerk" ? candidateMetricSource.slice(1, 3) : candidateMetricSource;
  const approvedSurveyResponses = surveyResponses.filter((response) => approvedSurveySlugs.includes(response.slug));
  const candidateMetrics = workspaceRole === "creator" ? visibleMetrics : visibleMetrics.map((metric) => (metric.label === "Positive field signals" ? { ...metric, value: String(Number(metric.value) + approvedSurveyResponses.length) } : metric));
  const headerTitle = workspaceRole === "creator" ? "House Aurelius PIOS" : candidateName;
  const headerSubtitle =
    workspaceRole === "creator"
      ? "Creator administration for candidate tenants, access, usage, and political climate monitoring"
      : campaignSlogan;
  const headerContext = workspaceRole === "creator" ? "House Aurelius Creator Console" : `${workspaceRole} workspace`;
  const workspaceSwitcherLabel = workspaceRole === "creator" ? "House Aurelius Platform" : campaignName;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: `${brandColor}33` }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border text-sky-200" style={{ borderColor: `${brandColor}88`, background: `${brandColor}18` }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-sky-200/80">
                {headerContext}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                {headerTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <button onClick={() => setMobileMenuOpen(true)} className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-3 hover:bg-white/[.08] lg:hidden">
              <Menu size={16} />
              Menu
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-3 hover:bg-white/[.08]">
              {workspaceSwitcherLabel}
              <ChevronDown size={16} />
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md px-3 font-semibold text-slate-950 hover:brightness-110" style={{ background: brandColor }}>
              <Radio size={16} />
              Live Room
            </button>
            <button onClick={logout} className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-3 hover:bg-white/[.08]">
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </header>
        <div className="rounded-md border border-white/10 bg-white/[.035] px-3 py-2 text-sm text-slate-300">
          Signed in as <span className="font-semibold text-white">{activeIdentity}</span>.
          {workspaceRole === "creator" ? (
            <> This is the House Aurelius platform administration workspace.</>
          ) : (
            <> Candidate staff access is tied to the candidate user key configured by the creator.</>
          )}
        </div>

        <ModuleNav activeModule={activeModule} setActiveModule={setActiveModule} workspaceRole={workspaceRole} />
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu backdrop" className="absolute inset-0 bg-slate-950/75" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute bottom-0 left-0 top-0 flex w-[86vw] max-w-sm flex-col border-r border-white/10 bg-command-950 p-4 shadow-intel">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-sky-200">House Aurelius</p>
                  <h2 className="text-lg font-semibold text-white">Workspace Menu</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <ModuleNav activeModule={activeModule} setActiveModule={(module) => { setActiveModule(module); setMobileMenuOpen(false); }} workspaceRole={workspaceRole} mobile />
            </aside>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {candidateMetrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-white/10 bg-white/[.045] p-4 shadow-intel">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{metric.label}</p>
                <Activity size={16} className={toneClass(metric.tone as Tone)} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <strong className="text-3xl font-semibold text-white">{metric.value}</strong>
                <span className={`text-sm font-semibold ${toneClass(metric.tone as Tone)}`}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
              </div>
            </div>
          ))}
        </section>

        {activeModule === "command" && workspaceRole === "creator" ? <CreatorClimateModule packagedDataEnabled={packagedDataEnabled} onboardedCandidates={onboardedCandidates} /> : null}
        {activeModule === "command" && workspaceRole !== "creator" ? (
          <CommandModule
            selectedRegion={selectedRegion}
            selectedSignals={selectedSignals}
            setSelectedRegion={setSelectedRegion}
            mapRegions={mapRegions}
            customVisits={customVisits}
            meetingAttendees={meetingAttendees}
            packagedDataEnabled={packagedDataEnabled}
            addVisitToSelectedRegion={addVisitToSelectedRegion}
          />
        ) : null}

        {activeModule === "field" ? (
          <FieldModule
            addFieldDraft={addFieldDraft}
            fieldDrafts={fieldDrafts}
            fieldAgents={fieldAgents}
            addFieldAgent={addFieldAgent}
            updateFieldAgent={updateFieldAgent}
            deleteFieldAgent={deleteFieldAgent}
            packagedDataEnabled={packagedDataEnabled}
            mapRegions={mapRegions}
          />
        ) : null}
        {activeModule === "social" ? (
          <SocialModule publishedMessages={publishedMessages} publishMessage={publishMessage} socialHandles={socialHandles} packagedDataEnabled={packagedDataEnabled} />
        ) : null}
        {activeModule === "ai" ? (
          <AiModule generatedBriefing={generatedBriefing} generateBriefing={generateBriefing} surveyResponses={approvedSurveyResponses} packagedDataEnabled={packagedDataEnabled} />
        ) : null}
        {activeModule === "crm" ? <CrmModule selectedParty={selectedParty} platformParties={platformParties} meetingAttendees={meetingAttendees} /> : null}
        {activeModule === "surveys" ? <SurveyModule surveyResponses={surveyResponses} approvedSurveySlugs={approvedSurveySlugs} approveSurveyForDashboard={approveSurveyForDashboard} /> : null}
        {activeModule === "alerts" ? <AlertsModule surveyResponses={approvedSurveyResponses} packagedDataEnabled={packagedDataEnabled} /> : null}
        {activeModule === "deployment" ? (
          <DeploymentModule
            resourceAllocations={resourceAllocations}
            inventoryItems={inventoryItems}
            addResourceAllocation={addResourceAllocation}
            sendAfricaTalkingMessage={sendAfricaTalkingMessage}
          />
        ) : null}
        {activeModule === "inventory" ? <InventoryModule inventoryItems={inventoryItems} addInventoryItem={addInventoryItem} /> : null}
        {activeModule === "voters" ? (
          <VoterImportModule
            uploadedVoterFile={uploadedVoterFile}
            setUploadedVoterFile={setUploadedVoterFile}
            voterImportJobs={voterImportJobs}
            liveVoterRegions={liveVoterRegions}
            queueVoterImport={queueVoterImport}
            updateVoterImportJob={updateVoterImportJob}
            applyVoterImportToMap={applyVoterImportToMap}
            packagedDataEnabled={packagedDataEnabled}
          />
        ) : null}
        {activeModule === "party" ? (
          <PartyModule selectedParty={selectedParty} setSelectedParty={setSelectedParty} platformParties={platformParties} />
        ) : null}
        {activeModule === "creator" ? (
          <CreatorModule
            addCandidate={addCandidate}
            onboardedCandidates={onboardedCandidates}
            candidateLoginAccounts={candidateLoginAccounts}
            deletedCandidateNames={deletedCandidateNames}
            candidateStatuses={candidateStatuses}
            passwordEvents={passwordEvents}
            changePassword={changePassword}
            suspendCandidate={suspendCandidate}
            deleteCandidate={deleteCandidate}
            addPoliticalParty={addPoliticalParty}
            deletePoliticalParty={deletePoliticalParty}
            platformParties={platformParties}
            creatorAccount={creatorAccount}
            updateCreatorAccount={updateCreatorAccount}
            packagedDataEnabled={packagedDataEnabled}
          />
        ) : null}
        {activeModule === "access" ? (
          <AccessModule
            changePassword={changePassword}
            passwordEvents={passwordEvents}
            staffPasswords={staffPasswords}
            setStaffPassword={setStaffPassword}
            socialHandles={socialHandles}
            addSocialHandle={addSocialHandle}
            updateSocialHandle={updateSocialHandle}
            staffMembers={staffMembers}
            addStaffMember={addStaffMember}
            updateStaffAccess={updateStaffAccess}
          />
        ) : null}
        {activeModule === "meetings" ? (
          <MeetingsModule
            meetingAttendees={meetingAttendees}
            addMeetingAttendee={addMeetingAttendee}
            sendAfricaTalkingMessage={sendAfricaTalkingMessage}
            mapRegions={mapRegions}
          />
        ) : null}
        {activeModule === "comms" ? (
          <CommunicationsModule
            sentMessages={sentMessages}
            sendAfricaTalkingMessage={sendAfricaTalkingMessage}
            fieldAgents={fieldAgents}
            staffMembers={staffMembers}
            meetingAttendees={meetingAttendees}
          />
        ) : null}
        {activeModule === "customize" ? (
          <CustomizeModule
            campaignName={campaignName}
            candidateName={candidateName}
            campaignSlogan={campaignSlogan}
            brandColor={brandColor}
            updateCampaignProfile={updateCampaignProfile}
          />
        ) : null}
      </div>
    </main>
  );
}

function LoginScreen({
  login,
  completeExternalLogin,
  loginError
}: {
  login: (credentials: { userKey: string; username: string; password: string }) => { ok: boolean; message: string };
  completeExternalLogin: (account: { username: string; role: WorkspaceRole; candidateName?: string }) => void;
  loginError: string;
}) {
  const [userKey, setUserKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remoteLoginError, setRemoteLoginError] = useState("");

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setRemoteLoginError("");
    const localResult = login({ userKey, username, password });
    if (localResult.ok) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) return;
    try {
      const response = await fetch(`${apiBase}/api/v1/public/accounts/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userKey, username, password })
      });
      const result = (await response.json()) as { ok?: boolean; username?: string; role?: WorkspaceRole; candidateName?: string; message?: string };
      if (response.ok && result.ok && result.username && result.role) {
        completeExternalLogin({ username: result.username, role: result.role, candidateName: result.candidateName });
        return;
      }
      setRemoteLoginError(result.message ?? "Invalid user key, username, or password.");
    } catch {
      setRemoteLoginError("Could not reach the account service. Check the deployed API URL.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex min-h-[520px] flex-col justify-between rounded-md border border-white/10 bg-command-900/90 p-6 shadow-intel">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-sky-300/40 bg-sky-300/10 text-sky-200">
              <ShieldCheck />
            </div>
            <p className="text-sm uppercase text-sky-200">House Aurelius</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">PIOS secure login</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              A House Aurelius product for political intelligence, candidate operations, and campaign command.
            </p>
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-command-900/90 p-6 shadow-intel">
          <h2 className="text-2xl font-semibold text-white">One login portal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Candidate staff log in with the candidate user key plus their own username and password.
          </p>
          <form onSubmit={submitLogin} className="mt-6 space-y-3">
            <input value={userKey} onChange={(event) => setUserKey(event.target.value)} placeholder="User key" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username or email" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <div className="flex h-11 items-center rounded-md border border-white/10 bg-slate-950/60 focus-within:border-sky-300">
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="flex h-full w-12 items-center justify-center text-slate-300 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError || remoteLoginError ? <p className="rounded-md border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{remoteLoginError || loginError}</p> : null}
            <button className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ModuleNav({
  activeModule,
  setActiveModule,
  workspaceRole,
  mobile = false
}: {
  activeModule: ModuleKey;
  setActiveModule: (module: ModuleKey) => void;
  workspaceRole: WorkspaceRole;
  mobile?: boolean;
}) {
  const allModules: Array<{ key: ModuleKey; label: string; icon: React.ReactNode; roles?: WorkspaceRole[] }> = [
    { key: "creator", label: "Creator", icon: <UserCog size={16} />, roles: ["creator"] },
    { key: "command", label: "Command", icon: <Layers size={16} />, roles: ["creator", "candidate", "media", "clerk", "field"] },
    { key: "field", label: "Field", icon: <ClipboardList size={16} />, roles: ["candidate", "clerk", "field"] },
    { key: "social", label: "Social", icon: <Megaphone size={16} />, roles: ["candidate", "media"] },
    { key: "ai", label: "AI", icon: <BrainCircuit size={16} />, roles: ["candidate", "media"] },
    { key: "crm", label: "Contacts", icon: <Handshake size={16} />, roles: ["candidate", "clerk"] },
    { key: "surveys", label: "Surveys", icon: <FileText size={16} />, roles: ["candidate", "clerk", "field"] },
    { key: "comms", label: "Comms", icon: <MessageSquare size={16} />, roles: ["candidate", "media", "clerk", "field"] },
    { key: "alerts", label: "Alerts", icon: <Siren size={16} />, roles: ["candidate", "media"] },
    { key: "deployment", label: "Resources", icon: <Truck size={16} />, roles: ["candidate", "field"] },
    { key: "inventory", label: "Inventory", icon: <Database size={16} />, roles: ["candidate", "clerk", "field"] },
    { key: "voters", label: "Voters", icon: <Database size={16} />, roles: ["candidate", "clerk"] },
    { key: "party", label: "Party", icon: <Landmark size={16} />, roles: ["candidate"] },
    { key: "access", label: "Access", icon: <Users size={16} />, roles: ["candidate"] },
    { key: "meetings", label: "Meetings", icon: <MapPin size={16} />, roles: ["candidate", "clerk"] },
    { key: "customize", label: "Customize", icon: <Palette size={16} />, roles: ["candidate"] }
  ];
  const modules = allModules.filter((module) => module.roles?.includes(workspaceRole) ?? true);

  return (
    <nav className={mobile ? "grid gap-2 overflow-y-auto" : "hidden gap-2 lg:grid lg:grid-cols-5 xl:grid-cols-10"}>
      {modules.map((module) => (
        <button
          key={module.key}
          data-testid={`module-${module.key}`}
          onClick={() => setActiveModule(module.key)}
          className={`flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold ${
            activeModule === module.key
              ? "border-sky-300/60 bg-sky-300 text-slate-950"
              : "border-white/10 bg-white/[.04] text-slate-300 hover:bg-white/[.08]"
          }`}
        >
          {module.icon}
          {module.label}
        </button>
      ))}
    </nav>
  );
}

function CommandModule({
  selectedRegion,
  selectedSignals,
  setSelectedRegion,
  mapRegions,
  customVisits,
  meetingAttendees,
  packagedDataEnabled,
  addVisitToSelectedRegion
}: {
  selectedRegion: Region;
  selectedSignals: number;
  setSelectedRegion: (region: Region) => void;
  mapRegions: Region[];
  customVisits: Array<{ title: string; type: string; region: string; attendance: number; sentiment: number; x: number; y: number }>;
  meetingAttendees: MeetingAttendee[];
  packagedDataEnabled: boolean;
  addVisitToSelectedRegion: () => void;
}) {
  const visits = [...customVisits, ...(packagedDataEnabled ? commandData.candidateVisits : [])];
  const commandAlerts = packagedDataEnabled ? commandData.alerts : [];
  const commandInsights = packagedDataEnabled ? commandData.insights : [];
  const commandPosts = packagedDataEnabled ? commandData.posts : [];
  const commandReports = packagedDataEnabled ? commandData.reports : [];
  return (
    <>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_.9fr]">
          <div className="rounded-md border border-white/10 bg-command-900/80 shadow-intel">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">GIS Political Map</h2>
                <p className="text-sm text-slate-400">Support, risk, incidents, and mobilization gaps by region</p>
              </div>
              <div className="flex gap-2 text-xs text-slate-300">
                <span className="rounded-sm border border-emerald-300/60 bg-emerald-400/15 px-2 py-1 text-emerald-100">Support</span>
                <span className="rounded-sm border border-rose-300/60 bg-rose-400/15 px-2 py-1 text-rose-100">Risk</span>
                <span className="rounded-sm border border-amber-300/60 bg-amber-400/15 px-2 py-1 text-amber-100">Decline</span>
                <span className="rounded-sm border border-sky-300/60 bg-sky-400/15 px-2 py-1 text-sky-100">Growth</span>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div className="map-grid relative min-h-[420px] overflow-hidden bg-[#07101d]">
                <div className="absolute inset-6 rounded-md border border-sky-300/10" />
                {mapRegions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => setSelectedRegion(region)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  >
                    <span className="h-16 w-16 rounded-full border-4" style={regionMapStyle(region, selectedRegion.code === region.code)} />
                    <span className="max-w-28 rounded-sm bg-slate-950/80 px-2 py-1 text-xs font-medium text-slate-100">
                      {region.name}
                    </span>
                  </button>
                ))}
                {!mapRegions.length ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md rounded-md border border-sky-300/20 bg-slate-950/80 p-4 text-sm leading-6 text-slate-300">
                      Upload an IEBC voter-register PDF, review the extracted rows, then apply it to GIS to activate the political map.
                    </div>
                  </div>
                ) : null}
                {visits.map((visit) => (
                  <button
                    key={visit.title}
                    className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
                    style={{ left: `${visit.x}%`, top: `${visit.y - 8}%` }}
                    title={visit.title}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-300 text-slate-950 shadow-intel">
                      <Radio size={16} />
                    </span>
                    <span className="max-w-32 rounded-sm bg-slate-950/90 px-2 py-1 text-[11px] font-medium text-amber-100">
                      Visit
                    </span>
                  </button>
                ))}
                {meetingAttendees.map((attendee) => (
                  <button
                    key={`${attendee.phone}-${attendee.attendedAt}`}
                    className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
                    style={{ left: `${attendee.x}%`, top: `${attendee.y}%` }}
                    title={`${attendee.name} / ${attendee.location}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-300 text-slate-950 shadow-intel">
                      <Users size={15} />
                    </span>
                    <span className="max-w-32 rounded-sm bg-slate-950/90 px-2 py-1 text-[11px] font-medium text-emerald-100">
                      Meeting
                    </span>
                  </button>
                ))}
              </div>
              <aside className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
                <p className="text-sm text-slate-400">Selected region</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedRegion.name}</h3>
                {selectedRegion.registeredVoters ? (
                  <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3">
                    <p className="text-sm text-cyan-100">Registered voters</p>
                    <strong className="mt-1 block text-2xl text-white">{selectedRegion.registeredVoters.toLocaleString()}</strong>
                  </div>
                ) : null}
                <div className="mt-5 space-y-4">
                  {[
                    { label: "Support", value: selectedRegion.support, color: "bg-emerald-300" },
                    { label: "Risk", value: selectedRegion.risk, color: "bg-rose-300" },
                    { label: "Momentum", value: Math.abs(selectedRegion.momentum), color: "bg-sky-300" }
                  ].map(({ label, value, color }) => (
                    <div key={String(label)}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-semibold text-white">
                          {label === "Momentum" && selectedRegion.momentum > 0 ? "+" : ""}
                          {label === "Momentum" ? selectedRegion.momentum : value}
                          {label === "Momentum" ? "%" : "%"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-md border border-sky-300/20 bg-sky-300/10 p-3">
                  <p className="text-sm text-sky-100">Fresh signals</p>
                  <strong className="mt-1 block text-2xl text-white">{selectedSignals}</strong>
                </div>
                <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3">
                  <p className="text-sm text-amber-100">Candidate visits</p>
                  <strong className="mt-1 block text-2xl text-white">
                    {visits.filter((visit) => visit.region === selectedRegion.name).length}
                  </strong>
                </div>
                <div className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3">
                  <p className="text-sm text-emerald-100">Meeting attendees</p>
                  <strong className="mt-1 block text-2xl text-white">
                    {meetingAttendees.filter((attendee) => attendee.location === selectedRegion.name).length}
                  </strong>
                </div>
                <button onClick={addVisitToSelectedRegion} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-amber-300 font-semibold text-slate-950 hover:bg-amber-200">
                  <MapPin size={16} />
                  Mark Candidate Visit
                </button>
              </aside>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-command-900/80 shadow-intel">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Alert Center</h2>
                <p className="text-sm text-slate-400">Threats requiring command attention</p>
              </div>
              <Siren className="text-rose-200" size={20} />
            </div>
            <div className="scrollbar-thin max-h-[520px] space-y-3 overflow-auto p-4">
              {commandAlerts.map((alert) => (
                <article key={alert.title} className={`rounded-md border p-4 ${severityClass(alert.severity)}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold">{alert.severity}</span>
                    <span className="text-xs">{alert.region.name}</span>
                  </div>
                  <h3 className="font-semibold text-white">{alert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{alert.message}</p>
                </article>
              ))}
            </div>
          </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel title="AI Strategy Engine" icon={<BrainCircuit size={20} />}>
            <div className="space-y-3">
              {commandInsights.map((insight) => (
                <article key={insight.title} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <span className="text-xs text-sky-200">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{insight.summary}</p>
                  <p className="mt-3 border-l border-sky-300/50 pl-3 text-sm leading-6 text-sky-100">
                    {insight.recommendation}
                  </p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Narrative Feed" icon={<CircleDot size={20} />}>
            <div className="space-y-3">
              {commandPosts.map((post) => (
                <article key={post.text} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{post.source} / {post.authorHandle}</span>
                    <span>{post.engagement.toLocaleString()} reach</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{post.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{post.region.name}</span>
                    <span className={post.sentiment === "NEGATIVE" ? "text-xs text-rose-200" : "text-xs text-emerald-200"}>
                      {post.sentiment}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Field Operations" icon={<Users size={20} />}>
            <div className="space-y-3">
              {commandReports.map((report) => (
                <article key={report.title} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{report.type.replaceAll("_", " ")}</span>
                    <span>{report.region.name}</span>
                  </div>
                  <h3 className="font-semibold text-white">{report.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{report.body}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <AlertTriangle size={14} />
                    {report.reporter.name}
                  </div>
                </article>
              ))}
            </div>
          </Panel>
      </section>
    </>
  );
}

function FieldModule({
  fieldDrafts,
  addFieldDraft,
  fieldAgents,
  addFieldAgent,
  updateFieldAgent,
  deleteFieldAgent,
  packagedDataEnabled,
  mapRegions
}: {
  fieldDrafts: Array<{ title: string; region: string; type: string }>;
  addFieldDraft: (draft: { title: string; region: string; type: string }) => void;
  fieldAgents: Array<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>;
  addFieldAgent: (agent: { name: string; phone: string; pollingStation: string; ward: string; status: string }) => void;
  updateFieldAgent: (phone: string, patch: Partial<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>) => void;
  deleteFieldAgent: (phone: string) => void;
  packagedDataEnabled: boolean;
  mapRegions: Region[];
}) {
  const [title, setTitle] = useState("Polling station queue irregularity");
  const [region, setRegion] = useState("Nairobi West");
  const [type, setType] = useState("POLLING_STATION");
  const [agentName, setAgentName] = useState("New Agent");
  const [agentPhone, setAgentPhone] = useState("+254700000000");
  const [agentStation, setAgentStation] = useState("Polling station name");

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Mobile Field Intake" icon={<ClipboardList size={20} />}>
        <div className="space-y-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={region} onChange={(event) => setRegion(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option value="">Select mapped polling station or ward</option>
            {mapRegions.map((item) => <option key={item.code}>{item.name}</option>)}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>HOUSEHOLD_VISIT</option>
            <option>RALLY_ATTENDANCE</option>
            <option>COMMUNITY_ISSUE</option>
            <option>OPPOSITION_ACTIVITY</option>
            <option>SECURITY_INCIDENT</option>
            <option>POLLING_STATION</option>
          </select>
          <button data-testid="queue-field-report" onClick={() => addFieldDraft({ title, region, type })} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
            Queue Offline Report
          </button>
          <p className="text-sm leading-6 text-slate-400">Reports are modeled for offline-first sync with GPS, media attachments, survey answers, and conflict-safe offline IDs.</p>
        </div>
      </Panel>
      <Panel title="Sync Queue" icon={<Database size={20} />}>
        <div className="space-y-3">
          {[...fieldDrafts, ...(packagedDataEnabled ? commandData.reports.map((report) => ({ title: report.title, region: report.region.name, type: report.type })) : [])].map((report, index) => (
            <article key={`${report.title}-${index}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{report.type.replaceAll("_", " ")}</span>
                <span>{report.region}</span>
              </div>
              <h3 className="mt-2 font-semibold text-white">{report.title}</h3>
              <p className="mt-2 text-sm text-emerald-200">{index < fieldDrafts.length ? "Queued locally" : "Synced to command center"}</p>
            </article>
          ))}
        </div>
      </Panel>
      <div className="xl:col-span-2">
        <Panel title="Clerk Agent Panel" icon={<Users size={20} />}>
          <div className="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={agentPhone} onChange={(event) => setAgentPhone(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={agentStation} onChange={(event) => setAgentStation(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <button onClick={() => addFieldAgent({ name: agentName, phone: agentPhone, pollingStation: agentStation, ward: region, status: "Active" })} className="h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950">Add</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {fieldAgents.map((agent) => (
              <article key={agent.phone} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <span className={agent.status === "Active" ? "text-xs text-emerald-200" : "text-xs text-rose-200"}>{agent.status}</span>
                </div>
                <p className="mt-2 text-sm text-sky-100">{agent.phone}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.pollingStation}</p>
                <p className="text-xs text-slate-500">{agent.ward}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => updateFieldAgent(agent.phone, { status: agent.status === "Active" ? "Inactive" : "Active" })} className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-200">
                    Toggle status
                  </button>
                  <button onClick={() => deleteFieldAgent(agent.phone)} className="rounded-md border border-rose-300/40 px-2 py-1 text-xs font-semibold text-rose-100">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function SocialModule({
  publishedMessages,
  publishMessage,
  socialHandles,
  packagedDataEnabled
}: {
  publishedMessages: Array<{ message: string; period: string; channels: string[]; asset: string }>;
  publishMessage: (message: { message: string; period: string; channels: string[]; asset: string }) => void;
  socialHandles: Array<{ network: string; handle: string; status: string; risk: string }>;
  packagedDataEnabled: boolean;
}) {
  const [sentiment, setSentiment] = useState("ALL");
  const firstStrategy = packagedDataEnabled ? commandData.mediaStrategies[0] : undefined;
  const [message, setMessage] = useState(firstStrategy?.message ?? "");
  const [period, setPeriod] = useState(firstStrategy?.period ?? "");
  const [asset, setAsset] = useState(firstStrategy?.assets[0] ?? "");
  const [uploadedAssetPreview, setUploadedAssetPreview] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const posts = packagedDataEnabled ? commandData.posts.filter((post) => sentiment === "ALL" || post.sentiment === sentiment) : [];
  function uploadMediaAsset(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAsset(file.name);
    const reader = new FileReader();
    reader.onload = () => setUploadedAssetPreview(String(reader.result));
    reader.readAsDataURL(file);
  }
  async function publishEverywhere() {
    const handles = socialHandles.map((handle) => ({ network: handle.network, handle: handle.handle })).filter((handle) => handle.handle.trim());
    if (!handles.length) {
      setPublishStatus("Connect candidate social handles in Access before publishing.");
      return;
    }
    const channelLabels = handles.map((handle) => `${handle.network}: ${handle.handle}`);
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      try {
        const response = await fetch(`${apiBase}/api/v1/public/social/publish`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, period, asset, handles })
        });
        if (!response.ok) throw new Error("Social publishing queue rejected the message.");
        const result = await response.json();
        setPublishStatus(result.note ?? "Queued to connected handles.");
      } catch (error) {
        setPublishStatus(error instanceof Error ? error.message : "Unable to queue social publishing.");
      }
    } else {
      setPublishStatus("No API URL is configured, so the post is saved locally only.");
    }
    publishMessage({ message, period, asset, channels: channelLabels });
  }
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <Panel title="Media Strategy Room" icon={<Megaphone size={20} />}>
        <div className="space-y-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={period} onChange={(event) => setPeriod(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={asset} onChange={(event) => setAsset(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            {commandData.mediaStrategies.flatMap((item) => item.assets).map((item) => <option key={item}>{item}</option>)}
            {asset && !commandData.mediaStrategies.flatMap((item) => item.assets).includes(asset) ? <option>{asset}</option> : null}
          </select>
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-sky-300/40 bg-sky-300/5 p-4 text-center hover:bg-sky-300/10">
            <input className="hidden" type="file" accept="image/*" onChange={uploadMediaAsset} />
            {uploadedAssetPreview ? (
              <img src={uploadedAssetPreview} alt="Uploaded media strategy asset preview" className="max-h-40 rounded-md object-contain" />
            ) : (
              <>
                <Megaphone className="mb-2 text-sky-200" />
                <span className="text-sm font-semibold text-white">Upload campaign image</span>
                <span className="mt-1 text-xs text-slate-400">PNG, JPG, or WebP for the selected media push</span>
              </>
            )}
          </label>
          <button
            onClick={publishEverywhere}
            className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200"
          >
            Publish to Connected Handles
          </button>
          {publishStatus ? <p className="rounded-md border border-sky-300/20 bg-sky-300/10 p-3 text-sm text-sky-50">{publishStatus}</p> : null}
          <div className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm leading-6 text-slate-300">
            {socialHandles.length ? `${socialHandles.length} connected handles available: ${socialHandles.map((handle) => `${handle.network} ${handle.handle}`).join(", ")}` : "No connected handles yet. Add the candidate's handles in Access."}
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {publishedMessages.map((item, index) => (
            <article key={`${item.message}-${index}`} className="rounded-md border border-emerald-300/30 bg-emerald-300/10 p-3">
              <p className="text-sm font-semibold text-emerald-100">Published to {item.channels.join(", ")}</p>
              <p className="mt-2 text-sm text-slate-200">{item.message}</p>
              <p className="mt-1 text-xs text-slate-400">{item.period} / {item.asset}</p>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Social Listening Workbench" icon={<CircleDot size={20} />}>
        <div className="mb-4 flex flex-wrap gap-2">
          {["ALL", "NEGATIVE", "POSITIVE", "MIXED"].map((item) => (
            <button key={item} onClick={() => setSentiment(item)} className={`h-9 rounded-md border px-3 text-sm ${sentiment === item ? "border-sky-300 bg-sky-300 text-slate-950" : "border-white/10 bg-white/[.04] text-slate-300"}`}>{item}</button>
          ))}
        </div>
        <div className="grid gap-3">
          {posts.map((post) => (
            <article key={post.text} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="mb-2 flex justify-between text-xs text-slate-400"><span>{post.source}</span><span>{post.region.name}</span></div>
              <p className="text-sm leading-6 text-slate-200">{post.text}</p>
              <p className="mt-3 text-xs text-sky-200">{post.engagement.toLocaleString()} engagement / {post.sentiment}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function AiModule({
  generatedBriefing,
  generateBriefing,
  surveyResponses,
  packagedDataEnabled
}: {
  generatedBriefing: string;
  generateBriefing: () => void;
  surveyResponses: SurveyResponse[];
  packagedDataEnabled: boolean;
}) {
  const latestSurvey = surveyResponses[0];
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <Panel title="Strategic Advisor" icon={<BrainCircuit size={20} />}>
        <button data-testid="generate-briefing" onClick={generateBriefing} className="mb-4 h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950 hover:bg-sky-200">Generate Executive Briefing</button>
        <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-50">
          {generatedBriefing || "Click generate to simulate the AI briefing workflow. The FastAPI service also exposes /analyze/signals and /briefings/executive for live model-backed use."}
        </div>
        {latestSurvey ? (
          <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-50">
            Survey signal loaded: {surveyResponses.length} public responses available for issue clustering, support scoring, and regional insight generation. Latest response came from {String(latestSurvey.answers.location ?? "an unknown location")}.
          </div>
        ) : null}
      </Panel>
      <Panel title="Recommendation Queue" icon={<CircleDot size={20} />}>
        <div className="space-y-3">
          {(packagedDataEnabled ? commandData.insights : []).map((insight) => (
            <article key={insight.title} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <h3 className="font-semibold text-white">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{insight.recommendation}</p>
            </article>
          ))}
          {surveyResponses.length ? (
            <article className="rounded-md border border-emerald-300/30 bg-emerald-300/10 p-4">
              <h3 className="font-semibold text-white">Survey-driven insight</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {surveyResponses.length} submitted field responses are now feeding dashboard metrics. Prioritize wards with repeated cost-of-living or undecided-voter answers.
              </p>
            </article>
          ) : null}
        </div>
      </Panel>
    </section>
  );
}

function CrmModule({
  selectedParty,
  platformParties,
  meetingAttendees
}: {
  selectedParty: string;
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
  meetingAttendees: MeetingAttendee[];
}) {
  const party = platformParties.find((item) => item.abbreviation === selectedParty);
  const rankedContacts = [...meetingAttendees].sort((a, b) => b.supportScore - a.supportScore);
  return (
    <Panel title={party ? `${party.name} Contact Registry` : "Candidate Contact Registry"} icon={<Handshake size={20} />}>
      <div className="mb-4 rounded-md border border-sky-300/20 bg-sky-300/10 p-3 text-sm leading-6 text-sky-50">
        Contacts are populated from candidate meetings, public survey submissions, voter imports, and field-agent collection. No packaged contact records are included in the build.
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rankedContacts.map((contact) => (
          <article key={`${contact.phone}-${contact.attendedAt}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs text-slate-400">{contact.meetingType} / {contact.location}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{contact.name}</h3>
            <p className="mt-3 text-sm text-slate-300">{contact.phone}</p>
            <p className="mt-3 border-l border-sky-300/40 pl-3 text-sm leading-6 text-sky-100">Support score {contact.supportScore}%</p>
          </article>
        ))}
        {!rankedContacts.length ? (
          <div className="rounded-md border border-white/10 bg-white/[.035] p-4 text-sm leading-6 text-slate-300 md:col-span-3">
            No contacts have been recorded yet. Add meeting attendance, collect survey responses, or import voter/contact files to build this registry.
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function SurveyModule({
  surveyResponses,
  approvedSurveySlugs,
  approveSurveyForDashboard
}: {
  surveyResponses: SurveyResponse[];
  approvedSurveySlugs: string[];
  approveSurveyForDashboard: (slug: string) => void;
}) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/survey");
  const surveyTemplates = Object.keys(defaultSurveyQuestions).map((slug) => ({
    name: slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    slug,
    responses: surveyResponses.filter((response) => response.slug === slug).length,
    sentiment: 0,
    complete: 0,
    target: "Configured field questionnaire"
  }));
  const [selectedSlug, setSelectedSlug] = useState(surveyTemplates[0]?.slug ?? "cost-of-living-pulse");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(defaultSurveyQuestions[selectedSlug] ?? []);
  const [qrVersions, setQrVersions] = useState<Record<string, number>>({});

  useEffect(() => {
    setBaseUrl(`${process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? window.location.origin}/survey`);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKeyForSurvey(selectedSlug));
    setQuestions(saved ? JSON.parse(saved) : defaultSurveyQuestions[selectedSlug] ?? []);
  }, [selectedSlug]);

  function addQuestion() {
    setQuestions((items) => {
      const next = [
        ...items,
        {
          id: `custom-${Date.now()}`,
          label: "New campaign question",
          type: "SHORT_TEXT" as const
        }
      ];
      window.localStorage.setItem(storageKeyForSurvey(selectedSlug), JSON.stringify(next));
      return next;
    });
  }

  function removeQuestion(id: string) {
    setQuestions((items) => {
      const next = items.filter((item) => item.id !== id);
      window.localStorage.setItem(storageKeyForSurvey(selectedSlug), JSON.stringify(next));
      return next;
    });
  }

  function resetQuestions() {
    const defaults = defaultSurveyQuestions[selectedSlug] ?? [];
    window.localStorage.removeItem(storageKeyForSurvey(selectedSlug));
    setQuestions(defaults);
  }

  function saveQuestions() {
    window.localStorage.setItem(storageKeyForSurvey(selectedSlug), JSON.stringify(questions));
  }

  function updateQuestion(id: string, patch: Partial<SurveyQuestion>) {
    setQuestions((items) => {
      const next = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
      window.localStorage.setItem(storageKeyForSurvey(selectedSlug), JSON.stringify(next));
      return next;
    });
  }
  const selectedResponses = surveyResponses.filter((response) => response.slug === selectedSlug);
  const selectedApproved = approvedSurveySlugs.includes(selectedSlug);
  const answerSummary = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {};
    selectedResponses.forEach((response) => {
      Object.entries(response.answers).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];
        values.filter(Boolean).forEach((entry) => {
          totals[key] = totals[key] ?? {};
          totals[key][String(entry)] = (totals[key][String(entry)] ?? 0) + 1;
        });
      });
    });
    return totals;
  }, [selectedResponses]);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Polling & Survey Engine" icon={<FileText size={20} />}>
        <div className="grid gap-3">
          {surveyTemplates.map((survey) => (
            <article key={survey.name} className={`rounded-md border p-4 ${selectedSlug === survey.slug ? "border-sky-300 bg-sky-300/10" : "border-white/10 bg-white/[.035]"}`}>
              <button className="w-full text-left" onClick={() => setSelectedSlug(survey.slug)}>
                <h3 className="font-semibold text-white">{survey.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{survey.responses.toLocaleString()} responses</p>
                <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-sky-300" style={{ width: `${survey.complete}%` }} /></div>
                <p className="mt-3 text-sm text-slate-300">Sentiment score {survey.sentiment}</p>
                <p className="mt-2 text-xs text-slate-400">Target: {survey.target}</p>
              </button>
              <QrPreview value={`${baseUrl}/${survey.slug}`} cacheKey={String(qrVersions[survey.slug] ?? 1)} />
              <button
                onClick={() => setQrVersions((versions) => ({ ...versions, [survey.slug]: Date.now() }))}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-200 hover:bg-white/[.06]"
                type="button"
              >
                <QrCode size={16} />
                Regenerate QR
              </button>
              <a className="mt-3 block rounded-md border border-sky-300/40 px-3 py-2 text-center text-sm font-semibold text-sky-100 hover:bg-sky-300/10" href={`/survey/${survey.slug}`}>
                Open field form
              </a>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Survey Findings Review" icon={<Activity size={20} />}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MetricMini label="Responses under review" value={String(selectedResponses.length)} />
          <MetricMini label="Questions" value={String(questions.length)} />
          <MetricMini label="Dashboard status" value={selectedApproved ? "Approved" : "Held"} />
        </div>
        <div className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm leading-6 text-slate-300">
          Survey results stay in review until the candidate or clerk approves them. Only approved surveys feed AI briefings, alerts, and dashboard signal counts.
        </div>
        <div className="mt-4 grid gap-3">
          {Object.entries(answerSummary).map(([questionId, counts]) => {
            const question = questions.find((item) => item.id === questionId);
            return (
              <article key={questionId} className="rounded-md border border-white/10 bg-slate-950/35 p-4">
                <h3 className="font-semibold text-white">{question?.label ?? questionId}</h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(counts).slice(0, 8).map(([answer, count]) => (
                    <div key={answer} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                      <span className="truncate text-slate-300">{answer}</span>
                      <span className="font-semibold text-sky-100">{count}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
          {!selectedResponses.length ? (
            <div className="rounded-md border border-white/10 bg-white/[.035] p-4 text-sm leading-6 text-slate-300">
              No responses have been submitted for this survey yet. Share the QR link with field agents, then review the findings here before approving dashboard use.
            </div>
          ) : null}
        </div>
        <button
          onClick={() => approveSurveyForDashboard(selectedSlug)}
          disabled={!selectedResponses.length || selectedApproved}
          className="mt-4 h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedApproved ? "Approved for AI Dashboards" : "Approve Survey for AI Dashboards"}
        </button>
      </Panel>
      <div className="xl:col-span-2">
      <Panel title="Questionnaire Builder" icon={<QrCode size={20} />}>
        <div className="mb-4 rounded-md border border-sky-300/20 bg-sky-300/10 p-3 text-sm leading-6 text-sky-50">
          Editing questions here changes the public survey form in this browser. In production, these edits would save through the survey API and generate a permanent QR link.
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <MetricMini label="Submitted responses" value={String(selectedResponses.length)} />
          <MetricMini label="AI-ready signals" value={String(surveyResponses.length)} />
        </div>
        {selectedResponses[0] ? (
          <div className="mb-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-50">
            Latest: {Object.entries(selectedResponses[0].answers).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" / ")}
          </div>
        ) : null}
        <div className="space-y-3">
          {questions.map((question) => (
            <article key={question.id} className="rounded-md border border-white/10 bg-white/[.035] p-3">
              <input
                value={question.label}
                onChange={(event) => updateQuestion(question.id, { label: event.target.value })}
                className="h-10 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300"
              />
              <select
                value={question.type}
                onChange={(event) => updateQuestion(question.id, { type: event.target.value as SurveyQuestion["type"] })}
                className="mt-2 h-10 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <button onClick={() => removeQuestion(question.id)} className="mt-2 text-xs font-semibold text-rose-200" type="button">
                Remove
              </button>
            </article>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button onClick={addQuestion} className="h-11 rounded-md border border-sky-300/40 px-3 font-semibold text-sky-100 hover:bg-sky-300/10">
            Add Question
          </button>
          <button onClick={resetQuestions} className="h-11 rounded-md border border-white/10 px-3 font-semibold text-slate-200 hover:bg-white/[.06]">
            Reset
          </button>
          <button onClick={saveQuestions} className="h-11 rounded-md bg-sky-300 px-3 font-semibold text-slate-950 hover:bg-sky-200">
            Save Questionnaire
          </button>
        </div>
      </Panel>
      </div>
    </section>
  );
}

function QrPreview({ value, cacheKey }: { value: string; cacheKey: string }) {
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&margin=8&data=${encodeURIComponent(value)}&cache=${cacheKey}`;
  return (
    <div className="mt-4 inline-flex">
      <img src={qrSource} alt="Public survey QR code" className="h-32 w-32 rounded-md bg-white p-1" />
    </div>
  );
}

function AlertsModule({ surveyResponses, packagedDataEnabled }: { surveyResponses: SurveyResponse[]; packagedDataEnabled: boolean }) {
  const surveyAlerts = surveyResponses.slice(0, 3).map((response) => ({
    severity: "HIGH",
    title: "Fresh survey signal submitted",
    message: `New public survey response from ${String(response.answers.location ?? "unknown location")} is ready for AI triage and dashboard scoring.`,
    region: { name: String(response.answers.location ?? "Survey") }
  }));
  const alerts = [...surveyAlerts, ...(packagedDataEnabled ? commandData.alerts : [])];
  return (
    <Panel title="Alert Operations" icon={<Siren size={20} />}>
      <div className="mb-4 rounded-md border border-white/10 bg-white/[.035] p-3 text-sm leading-6 text-slate-300">
        Alerts are fed by social velocity spikes, field incidents, survey submissions, voter-import anomalies, media negativity, and resource inactivity thresholds.
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <article key={`${alert.title}-${index}`} className={`rounded-md border p-4 ${severityClass(alert.severity)}`}>
            <div className="flex justify-between text-xs"><span>{alert.severity}</span><span>{alert.region.name}</span></div>
            <h3 className="mt-2 font-semibold text-white">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{alert.message}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function DeploymentModule({
  resourceAllocations,
  inventoryItems,
  addResourceAllocation,
  sendAfricaTalkingMessage
}: {
  resourceAllocations: ResourceAllocation[];
  inventoryItems: InventoryItem[];
  addResourceAllocation: (allocation: ResourceAllocation) => void;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
}) {
  const [resource, setResource] = useState("Volunteer kits");
  const [resourceRegion, setResourceRegion] = useState("Nairobi West");
  const [quantity, setQuantity] = useState(100);
  const [recipientName, setRecipientName] = useState("Grace Atieno");
  const [recipientPhone, setRecipientPhone] = useState("+254733444555");
  const [location, setLocation] = useState("Nairobi West Primary");
  const groupedAllocations = useMemo(
    () =>
      resourceAllocations.reduce<Record<string, ResourceAllocation[]>>((groups, allocation) => {
        groups[allocation.resource] = [...(groups[allocation.resource] ?? []), allocation];
        return groups;
      }, {}),
    [resourceAllocations]
  );
  const inventoryByName = useMemo(
    () =>
      inventoryItems.reduce<Record<string, number>>((totals, item) => {
        totals[item.name] = (totals[item.name] ?? 0) + item.quantity;
        return totals;
      }, {}),
    [inventoryItems]
  );

  return (
    <Panel title="Resource Deployment" icon={<Truck size={20} />}>
      <div className="mb-4 grid gap-2 lg:grid-cols-[1fr_1fr_110px_1fr_1fr_1fr_auto]">
        <select value={resource} onChange={(event) => setResource(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
          <option>{resource}</option>
          {inventoryItems.map((item) => <option key={`${item.name}-${item.location}`} value={item.name}>{item.name}</option>)}
        </select>
        <input value={resourceRegion} onChange={(event) => setResourceRegion(event.target.value)} placeholder="Region" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
        <input value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} type="number" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
        <input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Recipient name" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
        <input value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} placeholder="Phone" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
        <button
          onClick={() => addResourceAllocation({ resource, region: resourceRegion, quantity, contact: recipientName, recipientName, recipientPhone, location, status: "Allocated" })}
          className="h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950"
        >
          Allocate
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedAllocations).map(([resourceName, allocations]) => (
          <section key={resourceName} className="rounded-md border border-white/10 bg-white/[.025] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-white">{resourceName}</h3>
              <span className="text-sm text-sky-100">
                {allocations.length} recipients / {allocations.reduce((sum, item) => sum + item.quantity, 0)} units used / {inventoryByName[resourceName] ?? 0} in inventory
              </span>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {allocations.map((deployment) => (
                <article key={`${deployment.resource}-${deployment.recipientPhone}-${deployment.location}`} className="rounded-md border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">{deployment.region} / {deployment.location}</p>
                      <h4 className="mt-1 font-semibold text-white">{deployment.recipientName}</h4>
                    </div>
                    <span className="text-xs text-emerald-200">{deployment.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{deployment.quantity} units allocated</p>
                  <p className="mt-2 text-sm text-sky-100">{deployment.recipientPhone}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => sendAfricaTalkingMessage({ target: deployment.recipientPhone, channel: "SMS", message: `${deployment.recipientName}, confirm receipt of ${deployment.quantity} ${deployment.resource} for ${deployment.location}.` })} className="rounded-md border border-sky-300/40 px-2 py-2 text-xs font-semibold text-sky-100">
                      SMS
                    </button>
                    <button onClick={() => sendAfricaTalkingMessage({ target: deployment.recipientPhone, channel: "WhatsApp", message: `${deployment.recipientName}, confirm receipt of ${deployment.quantity} ${deployment.resource} for ${deployment.location}.` })} className="rounded-md border border-emerald-300/40 px-2 py-2 text-xs font-semibold text-emerald-100">
                      WhatsApp
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {!resourceAllocations.length ? (
          <div className="rounded-md border border-white/10 bg-white/[.035] p-4 text-sm leading-6 text-slate-300">
            No resource allocations have been recorded yet. Add campaign supplies in Inventory first, then allocate them here for transparency.
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function InventoryModule({
  inventoryItems,
  addInventoryItem
}: {
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
}) {
  const [draft, setDraft] = useState<InventoryItem>({
    name: "Volunteer kits",
    category: "Field supplies",
    quantity: 0,
    unit: "units",
    location: "Main campaign office",
    custodian: "Operations lead",
    status: "Available"
  });
  const totals = useMemo(
    () =>
      inventoryItems.reduce<Record<string, number>>((groups, item) => {
        groups[item.category] = (groups[item.category] ?? 0) + item.quantity;
        return groups;
      }, {}),
    [inventoryItems]
  );
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Campaign Inventory Intake" icon={<Database size={20} />}>
        <div className="space-y-3">
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Resource name" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Category" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} type="number" placeholder="Quantity" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value })} placeholder="Unit" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Storage location" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={draft.custodian} onChange={(event) => setDraft({ ...draft, custodian: event.target.value })} placeholder="Custodian" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
              <option>Available</option>
              <option>Reserved</option>
              <option>Needs audit</option>
            </select>
          </div>
          <button onClick={() => addInventoryItem(draft)} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
            Add Inventory Item
          </button>
        </div>
      </Panel>
      <Panel title="Inventory Ledger" icon={<Layers size={20} />}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {Object.entries(totals).map(([category, quantity]) => <MetricMini key={category} label={category} value={String(quantity)} />)}
          {!Object.keys(totals).length ? <MetricMini label="Inventory records" value="0" /> : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {inventoryItems.map((item, index) => (
            <article key={`${item.name}-${item.location}-${index}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <span className="text-xs text-sky-100">{item.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{item.quantity} {item.unit} / {item.category}</p>
              <p className="mt-2 text-sm text-slate-400">{item.location}</p>
              <p className="mt-2 text-xs text-slate-500">Custodian: {item.custodian}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CommunicationsModule({
  sentMessages,
  sendAfricaTalkingMessage,
  fieldAgents,
  staffMembers,
  meetingAttendees
}: {
  sentMessages: Array<{ target: string; message: string; channel: string; provider: string }>;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
  fieldAgents: Array<{ name: string; phone: string; pollingStation: string; ward: string; status: string }>;
  staffMembers: StaffMember[];
  meetingAttendees: MeetingAttendee[];
}) {
  const [target, setTarget] = useState("Nairobi West agents");
  const [channel, setChannel] = useState("SMS");
  const [message, setMessage] = useState("Please submit polling-station updates by 5 PM.");
  const targetRecipients = useMemo(() => {
    if (target === "All field agents") return fieldAgents.map((agent) => ({ name: agent.name, phone: agent.phone }));
    if (target === "All staff") return staffMembers.map((member) => ({ name: member.name, phone: member.phone }));
    if (target === "Media team") return staffMembers.filter((member) => member.role === "media").map((member) => ({ name: member.name, phone: member.phone }));
    if (target === "Clerks") return staffMembers.filter((member) => member.role === "clerk").map((member) => ({ name: member.name, phone: member.phone }));
    if (target === "Meeting attendees") return meetingAttendees.map((attendee) => ({ name: attendee.name, phone: attendee.phone }));
    return fieldAgents.filter((agent) => agent.ward === "Nairobi West").map((agent) => ({ name: agent.name, phone: agent.phone }));
  }, [fieldAgents, meetingAttendees, staffMembers, target]);

  function sendBulkMessage() {
    targetRecipients.forEach((recipient) => {
      sendAfricaTalkingMessage({ target: `${recipient.name} ${recipient.phone}`, channel, message });
    });
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Africa's Talking Communications" icon={<MessageSquare size={20} />}>
        <div className="space-y-3">
          <select value={target} onChange={(event) => setTarget(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>Nairobi West agents</option>
            <option>All field agents</option>
            <option>All staff</option>
            <option>Meeting attendees</option>
            <option>Media team</option>
            <option>Clerks</option>
          </select>
          <select value={channel} onChange={(event) => setChannel(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>SMS</option>
            <option>WhatsApp</option>
            <option>Voice</option>
          </select>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-sky-300" />
          <div className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm text-slate-300">
            {targetRecipients.length} recipients selected for this bulk send.
          </div>
          <button onClick={sendBulkMessage} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
            Bulk Send via Africa's Talking
          </button>
        </div>
      </Panel>
      <Panel title="Communication Log" icon={<Radio size={20} />}>
        <div className="space-y-3">
          {[...sentMessages, ...commandData.communications.map((item) => ({ target: item.target, message: `${item.count} messages ${item.status.toLowerCase()}`, channel: item.channel, provider: item.provider }))].map((item, index) => (
            <article key={`${item.target}-${index}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{item.target}</h3>
                <span className="text-xs text-sky-100">{item.channel}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.message}</p>
              <p className="mt-2 text-xs text-slate-500">{item.provider}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CreatorClimateModule({
  packagedDataEnabled,
  onboardedCandidates
}: {
  packagedDataEnabled: boolean;
  onboardedCandidates: Array<{ name: string; office: string; party: string; region: string }>;
}) {
  const climateCandidates = [...onboardedCandidates, ...(packagedDataEnabled ? commandData.candidates : [])];
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel title="Overall Political Climate" icon={<Activity size={20} />}>
        <div className="space-y-3">
          {[
            ["National mood", "Cost-of-living pressure remains the strongest cross-candidate issue."],
            ["Regional risk", "Urban constituencies show higher volatility than peri-urban wards."],
            ["Narrative trend", "Youth jobs and county service delivery are the highest opportunity themes."],
            ["Platform action", "Review suspended campaigns, party setup, and voter import completeness weekly."]
          ].map(([label, body]) => (
            <article key={label} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <h3 className="font-semibold text-white">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Candidate Portfolio Climate" icon={<Users size={20} />}>
        <div className="space-y-3">
          {climateCandidates.map((candidate) => (
            <article key={candidate.name} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{candidate.name}</h3>
                <span className="text-xs text-sky-100">{candidate.office}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{candidate.region} / {candidate.party}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CreatorModule({
  addCandidate,
  onboardedCandidates,
  candidateLoginAccounts,
  deletedCandidateNames,
  candidateStatuses,
  passwordEvents,
  changePassword,
  suspendCandidate,
  deleteCandidate,
  addPoliticalParty,
  deletePoliticalParty,
  platformParties,
  creatorAccount,
  updateCreatorAccount,
  packagedDataEnabled
}: {
  addCandidate: (candidate: { name: string; office: string; party: string; region: string; userKey: string; username: string; password: string }) => void;
  onboardedCandidates: Array<{ name: string; office: string; party: string; region: string }>;
  candidateLoginAccounts: CandidateLoginAccount[];
  deletedCandidateNames: string[];
  candidateStatuses: Record<string, "Active" | "Suspended">;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
  changePassword: (target: string) => void;
  suspendCandidate: (name: string) => void;
  deleteCandidate: (name: string) => void;
  addPoliticalParty: (party: { name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }) => void;
  deletePoliticalParty: (abbreviation: string) => void;
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
  creatorAccount: CreatorAccount;
  updateCreatorAccount: (account: CreatorAccount) => void;
  packagedDataEnabled: boolean;
}) {
  const [name, setName] = useState("New Candidate");
  const [office, setOffice] = useState("Governor");
  const [party, setParty] = useState(platformParties[0]?.abbreviation ?? "");
  const [region, setRegion] = useState("Nairobi County");
  const [userKey, setUserKey] = useState("CLIENT-2027");
  const [username, setUsername] = useState("candidate@example.com");
  const [password, setPassword] = useState("Candidate123!");
  const [creatorDraft, setCreatorDraft] = useState(creatorAccount);
  const [partyName, setPartyName] = useState("New Political Party");
  const [partyAbbr, setPartyAbbr] = useState("NPP");
  const packagedCandidates = packagedDataEnabled ? commandData.candidates.filter((candidate) => !deletedCandidateNames.includes(candidate.name)) : [];
  const candidates = [...onboardedCandidates, ...packagedCandidates];
  const activeCandidateCount = candidates.filter((candidate) => candidateStatuses[candidate.name] !== "Suspended").length;
  const accessCount = candidateLoginAccounts.length + activeCandidateCount;
  async function onboardCandidate() {
    const account = { name, office, party, region, userKey, username, password };
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      await fetch(`${apiBase}/api/v1/public/accounts/candidates`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(account)
      });
    }
    addCandidate(account);
  }
  async function saveCreatorAccount() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      await fetch(`${apiBase}/api/v1/public/accounts/creator`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(creatorDraft)
      });
    }
    updateCreatorAccount(creatorDraft);
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Creator Candidate Onboarding" icon={<UserCog size={20} />}>
        <div className="space-y-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={office} onChange={(event) => setOffice(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={party} onChange={(event) => setParty(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            {!platformParties.length ? <option value="">Create a party first</option> : null}
            {platformParties.map((item) => <option key={item.abbreviation} value={item.abbreviation}>{item.name} ({item.abbreviation})</option>)}
          </select>
          <input value={region} onChange={(event) => setRegion(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-3">
            <h3 className="text-sm font-semibold text-white">Client login details</h3>
            <div className="mt-3 grid gap-2">
              <input value={userKey} onChange={(event) => setUserKey(event.target.value)} placeholder="Client user key" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username or email" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Temporary password" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            </div>
          </div>
          <button onClick={onboardCandidate} disabled={!party} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} />
            Onboard Candidate
          </button>
        </div>
      </Panel>
      <Panel title="Creator Admin Dashboard" icon={<Users size={20} />}>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricMini label="Candidates" value={String(candidates.length)} />
          <MetricMini label="Active candidates" value={String(activeCandidateCount)} />
          <MetricMini label="People with access" value={String(accessCount)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {candidates.map((candidate) => (
            <article key={`${candidate.name}-${candidate.region}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">{candidate.office} / {candidate.region}</p>
                <span className={candidateStatuses[candidate.name] === "Suspended" ? "text-xs text-rose-200" : "text-xs text-emerald-200"}>
                  {candidateStatuses[candidate.name] ?? "Active"}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">{candidate.name}</h3>
              <p className="mt-3 text-sm text-sky-100">Party: {candidate.party}</p>
              {candidateLoginAccounts.find((account) => account.candidateName === candidate.name) ? (
                <p className="mt-2 text-xs text-slate-400">
                  Login: {candidateLoginAccounts.find((account) => account.candidateName === candidate.name)?.userKey} / {candidateLoginAccounts.find((account) => account.candidateName === candidate.name)?.username}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-slate-400">Workspace, campaign, roles, surveys, and GIS boundaries will be isolated under this tenant candidate record.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button onClick={() => changePassword(candidate.name)} className="rounded-md border border-sky-300/40 px-2 py-2 text-xs font-semibold text-sky-100">Password</button>
                <button onClick={() => suspendCandidate(candidate.name)} className="rounded-md border border-amber-300/40 px-2 py-2 text-xs font-semibold text-amber-100">Suspend</button>
                <button onClick={() => deleteCandidate(candidate.name)} className="rounded-md border border-rose-300/40 px-2 py-2 text-xs font-semibold text-rose-100">Delete</button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <div className="xl:col-span-2">
        <Panel title="Creator Credential Control" icon={<ShieldCheck size={20} />}>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input value={creatorDraft.userKey} onChange={(event) => setCreatorDraft({ ...creatorDraft, userKey: event.target.value })} placeholder="Creator user key" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={creatorDraft.username} onChange={(event) => setCreatorDraft({ ...creatorDraft, username: event.target.value })} placeholder="Creator username" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={creatorDraft.password} onChange={(event) => setCreatorDraft({ ...creatorDraft, password: event.target.value })} placeholder="Creator password" type="password" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <button onClick={saveCreatorAccount} className="h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950">
              Save
            </button>
            <div className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm text-slate-300">
              The creator can change their own user key, username, and password. Candidate access remains controlled from onboarding and candidate records.
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {passwordEvents.map((event, index) => (
              <div key={`${event.target}-${index}`} className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm text-slate-300">
                {event.actor} changed password for <span className="font-semibold text-white">{event.target}</span> at {event.changedAt}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="xl:col-span-2">
        <Panel title="Political Party Setup" icon={<Landmark size={20} />}>
          <div className="mb-4 grid gap-2 md:grid-cols-[1fr_120px_auto]">
            <input value={partyName} onChange={(event) => setPartyName(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={partyAbbr} onChange={(event) => setPartyAbbr(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <button
              onClick={() => {
                addPoliticalParty({ name: partyName, abbreviation: partyAbbr, color: "#38bdf8", ideology: "Configured by creator", influenceScore: 50, sentimentScore: 0, strongholds: [], risks: [] });
                setParty(partyAbbr);
              }}
              className="h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950"
            >
              Add Party
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {platformParties.map((party) => (
              <article key={party.abbreviation} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                <p className="text-xs text-slate-400">{party.abbreviation}</p>
                <h3 className="mt-2 font-semibold text-white">{party.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{party.ideology}</p>
                <button
                  onClick={() => deletePoliticalParty(party.abbreviation)}
                  className="mt-4 rounded-md border border-rose-300/40 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-300/10"
                >
                  Delete Party
                </button>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function AccessModule({
  changePassword,
  passwordEvents,
  staffPasswords,
  setStaffPassword,
  socialHandles,
  addSocialHandle,
  updateSocialHandle,
  staffMembers,
  addStaffMember,
  updateStaffAccess
}: {
  changePassword: (target: string) => void;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
  staffPasswords: Record<string, string>;
  setStaffPassword: (username: string, password: string) => void;
  socialHandles: Array<{ network: string; handle: string; status: string; risk: string }>;
  addSocialHandle: (handle: { network: string; handle: string; status: string; risk: string }) => void;
  updateSocialHandle: (network: string, handle: string) => void;
  staffMembers: StaffMember[];
  addStaffMember: (member: StaffMember) => void;
  updateStaffAccess: (email: string, access: ModuleKey[]) => void;
}) {
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [network, setNetwork] = useState("Instagram");
  const [handle, setHandle] = useState("@candidatehandle");
  const [staffDraft, setStaffDraft] = useState<StaffMember>({
    name: "New Staff Member",
    email: "staff.member@campaign.local",
    phone: "+254700000000",
    role: "media",
    access: ["social", "comms"],
    status: "Active"
  });
  const assignableModules: ModuleKey[] = ["command", "field", "social", "ai", "crm", "surveys", "alerts", "deployment", "voters", "party", "customize", "comms"];
  function toggleAccess(email: string, currentAccess: ModuleKey[], module: ModuleKey) {
    updateStaffAccess(email, currentAccess.includes(module) ? currentAccess.filter((item) => item !== module) : [...currentAccess, module]);
  }
  function toggleDraftAccess(module: ModuleKey) {
    setStaffDraft((draft) => ({
      ...draft,
      access: draft.access.includes(module) ? draft.access.filter((item) => item !== module) : [...draft.access, module]
    }));
  }
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel title="Candidate Staff Registry" icon={<Users size={20} />}>
        <div className="space-y-3">
          <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4">
            <h3 className="font-semibold text-white">Register staff member</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input value={staffDraft.name} onChange={(event) => setStaffDraft({ ...staffDraft, name: event.target.value })} placeholder="Full name" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
              <input value={staffDraft.email} onChange={(event) => setStaffDraft({ ...staffDraft, email: event.target.value })} placeholder="Email" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
              <input value={staffDraft.phone} onChange={(event) => setStaffDraft({ ...staffDraft, phone: event.target.value })} placeholder="Phone" className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
              <select value={staffDraft.role} onChange={(event) => setStaffDraft({ ...staffDraft, role: event.target.value as WorkspaceRole })} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
                <option value="media">Media team</option>
                <option value="clerk">Clerk</option>
                <option value="field">Field coordinator</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {assignableModules.map((module) => (
                <button
                  key={module}
                  onClick={() => toggleDraftAccess(module)}
                  className={`rounded-sm border px-2 py-1 text-xs font-semibold ${staffDraft.access.includes(module) ? "border-sky-300 bg-sky-300 text-slate-950" : "border-white/10 text-slate-300"}`}
                  type="button"
                >
                  {module}
                </button>
              ))}
            </div>
            <button onClick={() => addStaffMember(staffDraft)} className="mt-3 h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950">
              Register Staff
            </button>
          </div>
          {staffMembers.map((staff) => (
            <article key={staff.email} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{staff.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{staff.email}</p>
                  <p className="mt-1 text-sm text-sky-100">{staff.phone}</p>
                </div>
                <span className="rounded-sm border border-emerald-300/30 px-2 py-1 text-xs text-emerald-100">{staff.role}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {assignableModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => toggleAccess(staff.email, staff.access, module)}
                    className={`rounded-sm border px-2 py-1 text-xs font-semibold ${staff.access.includes(module) ? "border-sky-300 bg-sky-300 text-slate-950" : "border-white/10 text-slate-300"}`}
                    type="button"
                  >
                    {module}
                  </button>
                ))}
              </div>
            </article>
          ))}
          <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4">
            <h3 className="font-semibold text-white">Password control</h3>
            <div className="mt-3 grid gap-2">
              {staffMembers.map((account) => (
                <div key={account.email} className="rounded-md border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-sm font-semibold text-white">{account.name}: {account.email}</p>
                  <input value={passwordDrafts[account.email] ?? ""} onChange={(event) => setPasswordDrafts({ ...passwordDrafts, [account.email]: event.target.value })} placeholder={staffPasswords[account.email] ?? "New password"} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
                  <button onClick={() => setStaffPassword(account.email, passwordDrafts[account.email] || "ManualPassword123!")} className="mt-2 rounded-md border border-sky-300/40 px-2 py-1 text-xs font-semibold text-sky-100">
                    Set specific password
                  </button>
                </div>
              ))}
            </div>
            {passwordEvents.length ? (
              <p className="mt-3 text-xs text-slate-400">Latest reset: {passwordEvents[0].target} at {passwordEvents[0].changedAt}</p>
            ) : null}
          </div>
        </div>
      </Panel>
      <Panel title="Connected Social Handles" icon={<Megaphone size={20} />}>
        <div className="space-y-3">
          <div className="mb-4 grid gap-2 md:grid-cols-[120px_1fr_auto]">
            <input value={network} onChange={(event) => setNetwork(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <input value={handle} onChange={(event) => setHandle(event.target.value)} className="h-11 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <button onClick={() => addSocialHandle({ network, handle, status: "Connected", risk: "Manual handle added" })} className="h-11 rounded-md bg-sky-300 px-3 font-semibold text-slate-950">Add</button>
          </div>
          {socialHandles.map((social) => (
            <article key={social.network} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{social.network}</h3>
                <span className="text-xs text-emerald-200">{social.status}</span>
              </div>
              <input value={social.handle} onChange={(event) => updateSocialHandle(social.network, event.target.value)} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-sky-100 outline-none focus:border-sky-300" />
              <p className="mt-3 text-sm leading-6 text-slate-300">{social.risk}</p>
            </article>
          ))}
          <button onClick={() => addSocialHandle({ network, handle, status: "Connected", risk: "Awaiting media activity" })} className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sky-300/40 text-sm font-semibold text-sky-100 hover:bg-sky-300/10">
            <Plus size={16} />
            Connect Social Handle
          </button>
        </div>
      </Panel>
    </section>
  );
}

function MeetingsModule({
  meetingAttendees,
  addMeetingAttendee,
  sendAfricaTalkingMessage,
  mapRegions
}: {
  meetingAttendees: MeetingAttendee[];
  addMeetingAttendee: (attendee: Omit<MeetingAttendee, "attendedAt">) => void;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
  mapRegions: Region[];
}) {
  const [name, setName] = useState("Home meeting attendee");
  const [phone, setPhone] = useState("+254700000000");
  const [location, setLocation] = useState(mapRegions[0]?.name ?? "");
  const [meetingType, setMeetingType] = useState("Home meeting");
  const [supportScore, setSupportScore] = useState(70);
  const selectedRegion = mapRegions.find((region) => region.name === location) ?? emptyRegion;
  const rankedAttendees = [...meetingAttendees].sort((a, b) => b.supportScore - a.supportScore);
  useEffect(() => {
    if (!location && mapRegions[0]) setLocation(mapRegions[0].name);
  }, [location, mapRegions]);

  function addAttendee() {
    addMeetingAttendee({
      name,
      phone,
      location,
      meetingType,
      supportScore,
      x: selectedRegion.x + Math.min(8, Math.max(-8, (supportScore - 50) / 6)),
      y: selectedRegion.y + Math.min(8, Math.max(-8, (50 - supportScore) / 6))
    });
  }

  function bulkMessageLocation(targetLocation: string) {
    meetingAttendees
      .filter((attendee) => attendee.location === targetLocation)
      .forEach((attendee) => {
        sendAfricaTalkingMessage({
          target: `${attendee.name} ${attendee.phone}`,
          channel: "SMS",
          message: `Thank you for attending the ${attendee.meetingType}. We will share the next campaign update for ${attendee.location}.`
        });
      });
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Meeting Attendance Capture" icon={<Users size={20} />}>
        <div className="space-y-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Attendee name" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Meeting location or ward" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={location} onChange={(event) => setLocation(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option value="">Select mapped region when available</option>
            {mapRegions.map((region) => <option key={region.code}>{region.name}</option>)}
          </select>
          <select value={meetingType} onChange={(event) => setMeetingType(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>Home meeting</option>
            <option>Estate caucus</option>
            <option>Ward elders meeting</option>
            <option>Youth group meeting</option>
            <option>Women organizers meeting</option>
          </select>
          <label className="block text-sm text-slate-300">
            Support rank
            <input value={supportScore} onChange={(event) => setSupportScore(Number(event.target.value))} type="range" min="0" max="100" className="mt-2 w-full" />
          </label>
          <button onClick={addAttendee} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950">
            Record Attendance
          </button>
        </div>
      </Panel>
      <Panel title="Ranked Attendee List" icon={<MapPin size={20} />}>
        <div className="mb-4 grid gap-2 md:grid-cols-3">
          {mapRegions.map((region) => (
            <button key={region.code} onClick={() => bulkMessageLocation(region.name)} className="rounded-md border border-sky-300/40 px-3 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-300/10">
              Message {region.name}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {rankedAttendees.map((attendee, index) => (
            <article key={`${attendee.phone}-${attendee.attendedAt}`} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">Rank #{index + 1} / {attendee.location}</p>
                  <h3 className="mt-1 font-semibold text-white">{attendee.name}</h3>
                  <p className="mt-1 text-sm text-sky-100">{attendee.phone}</p>
                </div>
                <span className="rounded-sm border border-emerald-300/30 px-2 py-1 text-xs text-emerald-100">{attendee.supportScore}%</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{attendee.meetingType}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CustomizeModule({
  campaignName,
  candidateName,
  campaignSlogan,
  brandColor,
  updateCampaignProfile
}: {
  campaignName: string;
  candidateName: string;
  campaignSlogan: string;
  brandColor: string;
  updateCampaignProfile: (profile: { campaignName: string; candidateName: string; campaignSlogan: string; brandColor: string }) => void;
}) {
  const [draft, setDraft] = useState({ campaignName, candidateName, campaignSlogan, brandColor });

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Campaign Customization" icon={<Palette size={20} />}>
        <div className="space-y-3">
          <input value={draft.candidateName} onChange={(event) => setDraft({ ...draft, candidateName: event.target.value })} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={draft.campaignName} onChange={(event) => setDraft({ ...draft, campaignName: event.target.value })} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <textarea value={draft.campaignSlogan} onChange={(event) => setDraft({ ...draft, campaignSlogan: event.target.value })} className="min-h-24 w-full rounded-md border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={draft.brandColor} onChange={(event) => setDraft({ ...draft, brandColor: event.target.value })} type="color" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 p-1" />
          <button onClick={() => updateCampaignProfile(draft)} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
            Apply Customization
          </button>
        </div>
      </Panel>
      <Panel title="Workspace Preview" icon={<ShieldCheck size={20} />}>
        <div className="rounded-md border p-5" style={{ borderColor: `${draft.brandColor}66`, background: `${draft.brandColor}12` }}>
          <p className="text-sm uppercase" style={{ color: draft.brandColor }}>Candidate workspace</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{draft.candidateName}</h3>
          <p className="mt-2 text-lg text-slate-200">{draft.campaignName}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">{draft.campaignSlogan}</p>
        </div>
      </Panel>
    </section>
  );
}

function VoterImportModule({
  uploadedVoterFile,
  setUploadedVoterFile,
  voterImportJobs,
  liveVoterRegions,
  queueVoterImport,
  updateVoterImportJob,
  applyVoterImportToMap,
  packagedDataEnabled
}: {
  uploadedVoterFile: string;
  setUploadedVoterFile: (file: string) => void;
  voterImportJobs: VoterImportJob[];
  liveVoterRegions: Region[];
  queueVoterImport: (fileName: string) => string;
  updateVoterImportJob: (id: string, patch: Partial<VoterImportJob>) => void;
  applyVoterImportToMap: (id: string) => Region[];
  packagedDataEnabled: boolean;
}) {
  useEffect(() => {
    const activeJobs = voterImportJobs.filter((job) => job.progress < 100);
    if (!activeJobs.length) return;
    const timer = window.setInterval(() => {
      activeJobs.forEach((job) => {
        const nextProgress = Math.min(100, job.progress + 15);
        const nextStage =
          nextProgress >= 100
            ? "Ready for review"
            : nextProgress >= 70
              ? "Extracting voter counts"
              : nextProgress >= 30
                ? "Parsing PDF"
                : "Uploading";
        const nextMessage =
          nextProgress >= 100
            ? "Parsing pass complete. Review extracted regions before using this file for dashboard totals."
            : nextProgress >= 70
              ? "Extracting regional voter totals and checking table consistency."
              : nextProgress >= 30
                ? "Reading PDF pages and detecting polling-station tables."
                : "Uploading file metadata and preparing the parser job.";
        updateVoterImportJob(job.id, { progress: nextProgress, stage: nextStage, message: nextMessage });
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [updateVoterImportJob, voterImportJobs]);

  function handleUpload(file?: File) {
    if (!file) return;
    setUploadedVoterFile(file.name);
    const jobId = queueVoterImport(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) {
        updateVoterImportJob(jobId, {
          progress: 35,
          stage: "Parsing PDF",
          message: "No API URL is configured, so this file cannot reach the backend parser yet."
        });
        return;
      }
      updateVoterImportJob(jobId, { progress: 20, stage: "Uploading", message: "Uploading PDF to the backend parser worker." });
      try {
        const response = await fetch(`${apiBase}/api/v1/public/voter-imports`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileBase64: String(reader.result), sourceName: "IEBC voter register upload" })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? "Parser request failed.");
        updateVoterImportJob(jobId, {
          backendId: result.id,
          progress: 100,
          stage: "Ready for review",
          rowsParsed: result.rowsParsed ?? 0,
          votersTotal: result.votersTotal ?? 0,
          regions: result.regions ?? [],
          intelligenceStatus: "Parsed",
          message: `Backend parser complete: ${result.rowsParsed ?? 0} rows and ${(result.votersTotal ?? 0).toLocaleString()} registered voters. Review this import, then apply it to GIS so dashboards and the map can use it.`
        });
      } catch (error) {
        updateVoterImportJob(jobId, {
          progress: 100,
          stage: "Ready for review",
          intelligenceStatus: "Needs review",
          message: `Parser could not complete automatically: ${error instanceof Error ? error.message : "unknown parser error"}. Review the file or try a text-based PDF.`
        });
      }
    };
    reader.readAsDataURL(file);
  }

  async function applyToGis(job: VoterImportJob) {
    if (!job.regions?.length) {
      updateVoterImportJob(job.id, {
        intelligenceStatus: "Needs review",
        message: "This import has no extracted regions available. Re-upload the PDF so the backend can attach the parsed rows to the review step."
      });
      return;
    }
    updateVoterImportJob(job.id, { stage: "Applying to GIS", message: "Writing voter counts into the GIS intelligence layer." });
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase && job.backendId) {
      try {
        const response = await fetch(`${apiBase}/api/v1/public/voter-imports/${job.backendId}/apply`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ regions: job.regions })
        });
        const result = await response.json();
        if (!response.ok || result.ok === false) throw new Error(result.message ?? "GIS apply request failed.");
      } catch (error) {
        updateVoterImportJob(job.id, {
          stage: "Ready for review",
          message: `Backend GIS persistence failed: ${error instanceof Error ? error.message : "unknown error"}. The local map layer can still be applied for this session.`
        });
      }
    }
    applyVoterImportToMap(job.id);
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="IEBC Voter Register Import" icon={<Database size={20} />}>
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-sky-300/40 bg-sky-300/5 p-6 text-center hover:bg-sky-300/10">
          <input
            className="hidden"
            type="file"
            accept="application/pdf"
            onChange={(event) => handleUpload(event.target.files?.[0])}
          />
          <Database className="mb-3 text-sky-200" />
          <span className="font-semibold text-white">Upload IEBC PDF register</span>
          <span className="mt-2 text-sm leading-6 text-slate-400">
            The parser maps county, constituency, ward, registration centre, polling station, and registered voters.
          </span>
        </label>
        {uploadedVoterFile ? (
          <div className="mt-4 rounded-md border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
            Queued for parsing: {uploadedVoterFile}
          </div>
        ) : null}
        <div className="mt-4 space-y-3">
          {voterImportJobs.map((job) => (
            <article key={job.id} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{job.fileName}</h3>
                  <p className="mt-1 text-sm text-slate-400">{job.stage}</p>
                </div>
                <span className="text-sm font-semibold text-sky-100">{job.progress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-sky-300 transition-all" style={{ width: `${job.progress}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{job.message}</p>
              {job.rowsParsed !== undefined || job.votersTotal !== undefined ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricMini label="Rows parsed" value={(job.rowsParsed ?? 0).toLocaleString()} />
                  <MetricMini label="Registered voters" value={(job.votersTotal ?? 0).toLocaleString()} />
                </div>
              ) : null}
              {job.regions?.length ? (
                <div className="mt-4 max-h-36 overflow-auto rounded-md border border-white/10 bg-slate-950/50">
                  {job.regions.slice(0, 12).map((region) => (
                    <div key={`${job.id}-${region.name}`} className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-sm last:border-b-0">
                      <span className="text-slate-300">{region.name}</span>
                      <span className="font-semibold text-white">{region.registeredVoters.toLocaleString()}</span>
                    </div>
                  ))}
                  {job.regions.length > 12 ? <p className="px-3 py-2 text-xs text-slate-500">+{job.regions.length - 12} more rows</p> : null}
                </div>
              ) : null}
              {job.intelligenceStatus !== "Applied" && job.regions?.length ? (
                <button onClick={() => applyToGis(job)} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200">
                  <MapPin size={16} />
                  Apply to GIS Map and Intelligence
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Voter Count Coverage" icon={<Layers size={20} />}>
        <div className="space-y-3">
          {(packagedDataEnabled ? commandData.voterImports : []).map((item) => (
            <article key={item.fileName} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{item.sourceName}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.fileName}</p>
                </div>
                <span className="rounded-sm border border-emerald-300/30 px-2 py-1 text-xs text-emerald-100">{item.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MetricMini label="Rows parsed" value={item.rowsParsed.toLocaleString()} />
                <MetricMini label="Registered voters" value={item.votersTotal.toLocaleString()} />
              </div>
            </article>
          ))}
          {voterImportJobs.filter((job) => job.intelligenceStatus === "Applied").map((job) => (
            <article key={`applied-${job.id}`} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4">
              <h3 className="font-semibold text-white">{job.fileName}</h3>
              <p className="mt-2 text-sm text-cyan-100">{(job.regions?.length ?? 0).toLocaleString()} mapped regions are active for GIS and dashboard intelligence.</p>
            </article>
          ))}
          {liveVoterRegions.map((region) => (
            <div key={`live-${region.code}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[.025] px-4 py-3">
              <span className="text-sm text-slate-300">{region.name}</span>
              <span className="font-semibold text-white">{region.registeredVoters.toLocaleString()} voters</span>
            </div>
          ))}
          {(packagedDataEnabled ? commandData.regions : []).map((region) => (
            <div key={region.code} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[.025] px-4 py-3">
              <span className="text-sm text-slate-300">{region.name}</span>
              <span className="font-semibold text-white">{region.registeredVoters.toLocaleString()} voters</span>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function PartyModule({
  selectedParty,
  setSelectedParty,
  platformParties
}: {
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  platformParties: Array<{ name: string; abbreviation: string; color: string; ideology: string; influenceScore: number; sentimentScore: number; strongholds: string[]; risks: string[] }>;
}) {
  const party = platformParties.find((item) => item.abbreviation === selectedParty) ?? platformParties[0];
  if (!party) {
    return (
      <Panel title="Party Influence on Campaign" icon={<Landmark size={20} />}>
        <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-50">
          No political party has been created yet. The creator must add parties in the creator console before a candidate can select one.
        </div>
      </Panel>
    );
  }
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.75fr_1.25fr]">
      <Panel title="Candidate Party Selection" icon={<Landmark size={20} />}>
        <div className="space-y-3">
          {platformParties.map((item) => (
            <button
              key={item.abbreviation}
              onClick={() => setSelectedParty(item.abbreviation)}
              className={`flex w-full items-center justify-between rounded-md border p-4 text-left ${
                selectedParty === item.abbreviation ? "border-sky-300 bg-sky-300/10" : "border-white/10 bg-white/[.035]"
              }`}
            >
              <span>
                <span className="block font-semibold text-white">{item.name}</span>
                <span className="text-sm text-slate-400">{item.ideology}</span>
              </span>
              <span className="h-5 w-5 rounded-full" style={{ background: item.color }} />
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Party Influence on Campaign" icon={<Activity size={20} />}>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricMini label="Influence score" value={`${party.influenceScore}%`} />
          <MetricMini label="Party sentiment" value={`${party.sentimentScore > 0 ? "+" : ""}${party.sentimentScore}%`} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-md border border-white/10 bg-white/[.035] p-4">
            <h3 className="font-semibold text-white">Strongholds</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{party.strongholds.join(", ")}</p>
          </article>
          <article className="rounded-md border border-white/10 bg-white/[.035] p-4">
            <h3 className="font-semibold text-white">Campaign risks</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{party.risks.join(", ")}</p>
          </article>
        </div>
        <p className="mt-5 rounded-md border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-50">
          Party influence is calculated from regional party strength, local sentiment, historical vote transfer, current narrative drag, and organizer density.
        </p>
      </Panel>
    </section>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <strong className="mt-2 block text-2xl text-white">{value}</strong>
    </div>
  );
}

function Panel({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/10 bg-command-900/80 shadow-intel">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-sky-200">{icon}</span>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
