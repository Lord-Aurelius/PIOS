"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Database,
  FileText,
  Handshake,
  Landmark,
  Layers,
  LogOut,
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
  Users
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { commandData } from "@/lib/demo-data";
import { ModuleKey, useOpsStore, WorkspaceRole } from "@/lib/ops-store";
import {
  defaultSurveyQuestions,
  questionTypes,
  storageKeyForSurvey,
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

export function CommandCenter() {
  const {
    isAuthenticated,
    workspaceRole,
    activeIdentity,
    loginError,
    activeModule,
    selectedRegion,
    generatedBriefing,
    fieldDrafts,
    selectedParty,
    uploadedVoterFile,
    campaignName,
    candidateName,
    campaignSlogan,
    brandColor,
    customVisits,
    onboardedCandidates,
    candidateStatuses,
    passwordEvents,
    publishedMessages,
    sentMessages,
    login,
    logout,
    setActiveModule,
    setSelectedRegion,
    generateBriefing,
    addFieldDraft,
    setSelectedParty,
    setUploadedVoterFile,
    addCandidate,
    addVisitToSelectedRegion,
    updateCampaignProfile,
    changePassword,
    suspendCandidate,
    deleteCandidate,
    publishMessage,
    sendAfricaTalkingMessage
  } = useOpsStore();
  const selectedSignals = useMemo(
    () =>
      commandData.posts.filter((signal) => signal.region.name === selectedRegion.name).length +
      commandData.reports.filter((report) => report.region.name === selectedRegion.name).length,
    [selectedRegion]
  );

  if (!isAuthenticated) {
    return <LoginScreen login={login} loginError={loginError} />;
  }

  const visibleMetrics = workspaceRole === "clerk" ? commandData.metrics.slice(1, 3) : commandData.metrics;

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
                {workspaceRole === "creator" ? "Creator Console" : `${workspaceRole} workspace`}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                {candidateName}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{campaignSlogan}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <button className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-3 hover:bg-white/[.08]">
              {campaignName}
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
          Signed in as <span className="font-semibold text-white">{activeIdentity}</span>. Candidate staff access is tied to user key <span className="font-semibold text-sky-100">AMINA-2027</span>.
        </div>

        <ModuleNav activeModule={activeModule} setActiveModule={setActiveModule} workspaceRole={workspaceRole} />

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleMetrics.map((metric) => (
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

        {activeModule === "command" ? (
          <CommandModule
            selectedRegion={selectedRegion}
            selectedSignals={selectedSignals}
            setSelectedRegion={setSelectedRegion}
            customVisits={customVisits}
            addVisitToSelectedRegion={addVisitToSelectedRegion}
          />
        ) : null}

        {activeModule === "field" ? <FieldModule addFieldDraft={addFieldDraft} fieldDrafts={fieldDrafts} /> : null}
        {activeModule === "social" ? (
          <SocialModule publishedMessages={publishedMessages} publishMessage={publishMessage} />
        ) : null}
        {activeModule === "ai" ? (
          <AiModule generatedBriefing={generatedBriefing} generateBriefing={generateBriefing} />
        ) : null}
        {activeModule === "crm" ? <CrmModule /> : null}
        {activeModule === "surveys" ? <SurveyModule /> : null}
        {activeModule === "alerts" ? <AlertsModule /> : null}
        {activeModule === "deployment" ? <DeploymentModule /> : null}
        {activeModule === "voters" ? (
          <VoterImportModule uploadedVoterFile={uploadedVoterFile} setUploadedVoterFile={setUploadedVoterFile} />
        ) : null}
        {activeModule === "party" ? (
          <PartyModule selectedParty={selectedParty} setSelectedParty={setSelectedParty} />
        ) : null}
        {activeModule === "creator" ? (
          <CreatorModule
            addCandidate={addCandidate}
            onboardedCandidates={onboardedCandidates}
            candidateStatuses={candidateStatuses}
            passwordEvents={passwordEvents}
            changePassword={changePassword}
            suspendCandidate={suspendCandidate}
            deleteCandidate={deleteCandidate}
          />
        ) : null}
        {activeModule === "access" ? (
          <AccessModule changePassword={changePassword} passwordEvents={passwordEvents} />
        ) : null}
        {activeModule === "comms" ? (
          <CommunicationsModule sentMessages={sentMessages} sendAfricaTalkingMessage={sendAfricaTalkingMessage} />
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
  loginError
}: {
  login: (credentials: { userKey: string; username: string; password: string }) => { ok: boolean; message: string };
  loginError: string;
}) {
  const [userKey, setUserKey] = useState("CREATOR-HQ");
  const [username, setUsername] = useState("creator@pios.local");
  const [password, setPassword] = useState("Creator123!");

  function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    login({ userKey, username, password });
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex min-h-[520px] flex-col justify-between rounded-md border border-white/10 bg-command-900/90 p-6 shadow-intel">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-sky-300/40 bg-sky-300/10 text-sky-200">
              <ShieldCheck />
            </div>
            <p className="text-sm uppercase text-sky-200">Political Intelligence OS</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Secure campaign login</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              A single secure portal routes creator, candidate, and candidate-staff accounts into the correct workspace.
            </p>
          </div>
          <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-6 text-sky-50">
            Creator accounts onboard and control candidates. Candidate staff accounts are tied to a candidate user key and have scoped module access.
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
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
            {loginError ? <p className="rounded-md border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{loginError}</p> : null}
            <button className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
              Sign in
            </button>
          </form>
          <div className="mt-6 grid gap-2">
            {commandData.demoAccounts.map((account) => (
              <button
                key={`${account.userKey}-${account.username}`}
                type="button"
                onClick={() => {
                  setUserKey(account.userKey);
                  setUsername(account.username);
                  setPassword(account.password);
                }}
                className="rounded-md border border-white/10 bg-white/[.035] p-3 text-left text-sm hover:bg-white/[.07]"
              >
                <span className="font-semibold text-white">{account.label}</span>
              <span className="mt-1 block text-slate-400">{account.userKey} / {account.username} / {account.password}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ModuleNav({
  activeModule,
  setActiveModule,
  workspaceRole
}: {
  activeModule: ModuleKey;
  setActiveModule: (module: ModuleKey) => void;
  workspaceRole: WorkspaceRole;
}) {
  const allModules: Array<{ key: ModuleKey; label: string; icon: React.ReactNode; roles?: WorkspaceRole[] }> = [
    { key: "creator", label: "Creator", icon: <UserCog size={16} />, roles: ["creator"] },
    { key: "command", label: "Command", icon: <Layers size={16} />, roles: ["creator", "candidate", "media", "clerk", "field"] },
    { key: "field", label: "Field", icon: <ClipboardList size={16} />, roles: ["candidate", "clerk", "field"] },
    { key: "social", label: "Social", icon: <Megaphone size={16} />, roles: ["candidate", "media"] },
    { key: "ai", label: "AI", icon: <BrainCircuit size={16} />, roles: ["candidate", "media"] },
    { key: "crm", label: "CRM", icon: <Handshake size={16} />, roles: ["candidate", "clerk"] },
    { key: "surveys", label: "Surveys", icon: <FileText size={16} />, roles: ["candidate", "clerk", "field"] },
    { key: "comms", label: "Comms", icon: <MessageSquare size={16} />, roles: ["candidate", "media", "clerk", "field"] },
    { key: "alerts", label: "Alerts", icon: <Siren size={16} />, roles: ["candidate", "media"] },
    { key: "deployment", label: "Resources", icon: <Truck size={16} />, roles: ["candidate", "field"] },
    { key: "voters", label: "Voters", icon: <Database size={16} />, roles: ["candidate", "clerk"] },
    { key: "party", label: "Party", icon: <Landmark size={16} />, roles: ["candidate"] },
    { key: "access", label: "Access", icon: <Users size={16} />, roles: ["candidate"] },
    { key: "customize", label: "Customize", icon: <Palette size={16} />, roles: ["candidate"] }
  ];
  const modules = allModules.filter((module) => module.roles?.includes(workspaceRole) ?? true);

  return (
    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">
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
  customVisits,
  addVisitToSelectedRegion
}: {
  selectedRegion: (typeof commandData.regions)[number];
  selectedSignals: number;
  setSelectedRegion: (region: (typeof commandData.regions)[number]) => void;
  customVisits: Array<{ title: string; type: string; region: string; attendance: number; sentiment: number; x: number; y: number }>;
  addVisitToSelectedRegion: () => void;
}) {
  const visits = [...customVisits, ...commandData.candidateVisits];
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
                <span className="rounded-sm border border-emerald-300/30 px-2 py-1 text-emerald-200">Support</span>
                <span className="rounded-sm border border-rose-300/30 px-2 py-1 text-rose-200">Risk</span>
                <span className="rounded-sm border border-sky-300/30 px-2 py-1 text-sky-200">Signals</span>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div className="map-grid relative min-h-[420px] overflow-hidden bg-[#07101d]">
                <div className="absolute inset-6 rounded-md border border-sky-300/10" />
                {commandData.regions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => setSelectedRegion(region)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  >
                    <span
                      className={`h-16 w-16 rounded-full border ${
                        selectedRegion.code === region.code
                          ? "border-sky-200 bg-sky-300/25"
                          : "border-white/20 bg-white/10"
                      }`}
                      style={{
                        boxShadow: `0 0 ${18 + region.risk / 2}px rgba(${
                          region.risk > 60 ? "244,63,94" : "56,189,248"
                        }, .35)`
                      }}
                    />
                    <span className="max-w-28 rounded-sm bg-slate-950/80 px-2 py-1 text-xs font-medium text-slate-100">
                      {region.name}
                    </span>
                  </button>
                ))}
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
              </div>
              <aside className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
                <p className="text-sm text-slate-400">Selected region</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedRegion.name}</h3>
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
              {commandData.alerts.map((alert) => (
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
              {commandData.insights.map((insight) => (
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
              {commandData.posts.map((post) => (
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
              {commandData.reports.map((report) => (
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
  addFieldDraft
}: {
  fieldDrafts: Array<{ title: string; region: string; type: string }>;
  addFieldDraft: (draft: { title: string; region: string; type: string }) => void;
}) {
  const [title, setTitle] = useState("Polling station queue irregularity");
  const [region, setRegion] = useState("Nairobi West");
  const [type, setType] = useState("POLLING_STATION");

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Mobile Field Intake" icon={<ClipboardList size={20} />}>
        <div className="space-y-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={region} onChange={(event) => setRegion(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            {commandData.regions.map((item) => <option key={item.code}>{item.name}</option>)}
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
          {[...fieldDrafts, ...commandData.reports.map((report) => ({ title: report.title, region: report.region.name, type: report.type }))].map((report, index) => (
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
          <div className="grid gap-3 md:grid-cols-3">
            {commandData.fieldAgents.map((agent) => (
              <article key={agent.phone} className="rounded-md border border-white/10 bg-white/[.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <span className={agent.status === "Active" ? "text-xs text-emerald-200" : "text-xs text-rose-200"}>{agent.status}</span>
                </div>
                <p className="mt-2 text-sm text-sky-100">{agent.phone}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.pollingStation}</p>
                <p className="text-xs text-slate-500">{agent.ward}</p>
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
  publishMessage
}: {
  publishedMessages: Array<{ message: string; period: string; channels: string[]; asset: string }>;
  publishMessage: (message: { message: string; period: string; channels: string[]; asset: string }) => void;
}) {
  const [sentiment, setSentiment] = useState("ALL");
  const [message, setMessage] = useState(commandData.mediaStrategies[0].message);
  const [period, setPeriod] = useState(commandData.mediaStrategies[0].period);
  const [asset, setAsset] = useState(commandData.mediaStrategies[0].assets[0]);
  const posts = commandData.posts.filter((post) => sentiment === "ALL" || post.sentiment === sentiment);
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <Panel title="Media Strategy Room" icon={<Megaphone size={20} />}>
        <div className="space-y-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={period} onChange={(event) => setPeriod(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={asset} onChange={(event) => setAsset(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            {commandData.mediaStrategies.flatMap((item) => item.assets).map((item) => <option key={item}>{item}</option>)}
          </select>
          <button
            onClick={() => publishMessage({ message, period, asset, channels: ["X", "Facebook", "TikTok", "WhatsApp"] })}
            className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200"
          >
            Publish Everywhere
          </button>
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
  generateBriefing
}: {
  generatedBriefing: string;
  generateBriefing: () => void;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <Panel title="Strategic Advisor" icon={<BrainCircuit size={20} />}>
        <button data-testid="generate-briefing" onClick={generateBriefing} className="mb-4 h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950 hover:bg-sky-200">Generate Executive Briefing</button>
        <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-50">
          {generatedBriefing || "Click generate to simulate the AI briefing workflow. The FastAPI service also exposes /analyze/signals and /briefings/executive for live model-backed use."}
        </div>
      </Panel>
      <Panel title="Recommendation Queue" icon={<CircleDot size={20} />}>
        <div className="space-y-3">
          {commandData.insights.map((insight) => (
            <article key={insight.title} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <h3 className="font-semibold text-white">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{insight.recommendation}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CrmModule() {
  return (
    <Panel title="Political CRM" icon={<Handshake size={20} />}>
      <div className="grid gap-3 md:grid-cols-3">
        {commandData.crm.map((contact) => (
          <article key={contact.name} className="rounded-md border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs text-slate-400">{contact.type.replaceAll("_", " ")} / {contact.region}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{contact.name}</h3>
            <p className="mt-3 text-sm text-slate-300">Support score {contact.score}%</p>
            <p className="mt-3 border-l border-sky-300/40 pl-3 text-sm leading-6 text-sky-100">{contact.next}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SurveyModule() {
  const baseUrl = "http://localhost:3000/survey";
  const [selectedSlug, setSelectedSlug] = useState(commandData.surveys[0].slug);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(defaultSurveyQuestions[selectedSlug]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKeyForSurvey(selectedSlug));
    setQuestions(saved ? JSON.parse(saved) : defaultSurveyQuestions[selectedSlug]);
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
    const defaults = defaultSurveyQuestions[selectedSlug];
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

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.95fr_1.05fr]">
      <Panel title="Polling & Survey Engine" icon={<FileText size={20} />}>
        <div className="grid gap-3">
          {commandData.surveys.map((survey) => (
            <article key={survey.name} className={`rounded-md border p-4 ${selectedSlug === survey.slug ? "border-sky-300 bg-sky-300/10" : "border-white/10 bg-white/[.035]"}`}>
              <button className="w-full text-left" onClick={() => setSelectedSlug(survey.slug)}>
                <h3 className="font-semibold text-white">{survey.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{survey.responses.toLocaleString()} responses</p>
                <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-sky-300" style={{ width: `${survey.complete}%` }} /></div>
                <p className="mt-3 text-sm text-slate-300">Sentiment score {survey.sentiment}</p>
                <p className="mt-2 text-xs text-slate-400">Target: {survey.target}</p>
              </button>
              <QrPreview value={`${baseUrl}/${survey.slug}`} />
              <a className="mt-3 block rounded-md border border-sky-300/40 px-3 py-2 text-center text-sm font-semibold text-sky-100 hover:bg-sky-300/10" href={`/survey/${survey.slug}`}>
                Open field form
              </a>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Questionnaire Builder" icon={<QrCode size={20} />}>
        <div className="mb-4 rounded-md border border-sky-300/20 bg-sky-300/10 p-3 text-sm leading-6 text-sky-50">
          Editing questions here changes the public survey form in this browser. In production, these edits would save through the survey API and generate a permanent QR link.
        </div>
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
    </section>
  );
}

function QrPreview({ value }: { value: string }) {
  const cells = Array.from({ length: 49 }, (_, index) => {
    const code = value.charCodeAt(index % value.length);
    return (code + index * 7) % 3 !== 0;
  });
  return (
    <div className="mt-4 inline-grid grid-cols-7 gap-0.5 rounded-md bg-white p-2" aria-label={`QR preview for ${value}`}>
      {cells.map((filled, index) => (
        <span key={index} className={`h-2 w-2 ${filled ? "bg-slate-950" : "bg-white"}`} />
      ))}
    </div>
  );
}

function AlertsModule() {
  return (
    <Panel title="Alert Operations" icon={<Siren size={20} />}>
      <div className="space-y-3">
        {commandData.alerts.map((alert) => (
          <article key={alert.title} className={`rounded-md border p-4 ${severityClass(alert.severity)}`}>
            <div className="flex justify-between text-xs"><span>{alert.severity}</span><span>{alert.region.name}</span></div>
            <h3 className="mt-2 font-semibold text-white">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{alert.message}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function DeploymentModule() {
  return (
    <Panel title="Resource Deployment" icon={<Truck size={20} />}>
      <div className="grid gap-3 md:grid-cols-3">
        {commandData.deployments.map((deployment) => (
          <article key={deployment.resource} className="rounded-md border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs text-slate-400">{deployment.region}</p>
            <h3 className="mt-2 font-semibold text-white">{deployment.resource}</h3>
            <p className="mt-3 text-sm text-slate-300">{deployment.quantity} units / {deployment.status}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function CommunicationsModule({
  sentMessages,
  sendAfricaTalkingMessage
}: {
  sentMessages: Array<{ target: string; message: string; channel: string; provider: string }>;
  sendAfricaTalkingMessage: (message: { target: string; message: string; channel: string }) => void;
}) {
  const [target, setTarget] = useState("Nairobi West agents");
  const [channel, setChannel] = useState("SMS");
  const [message, setMessage] = useState("Please submit polling-station updates by 5 PM.");

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Africa's Talking Communications" icon={<MessageSquare size={20} />}>
        <div className="space-y-3">
          <select value={target} onChange={(event) => setTarget(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>Nairobi West agents</option>
            <option>All field agents</option>
            <option>Media response group</option>
            <option>Clerks</option>
          </select>
          <select value={channel} onChange={(event) => setChannel(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            <option>SMS</option>
            <option>WhatsApp</option>
            <option>Voice</option>
          </select>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-sky-300" />
          <button onClick={() => sendAfricaTalkingMessage({ target, channel, message })} className="h-11 w-full rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
            Send via Africa's Talking
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

function CreatorModule({
  addCandidate,
  onboardedCandidates,
  candidateStatuses,
  passwordEvents,
  changePassword,
  suspendCandidate,
  deleteCandidate
}: {
  addCandidate: (candidate: { name: string; office: string; party: string; region: string }) => void;
  onboardedCandidates: Array<{ name: string; office: string; party: string; region: string }>;
  candidateStatuses: Record<string, "Active" | "Suspended">;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
  changePassword: (target: string) => void;
  suspendCandidate: (name: string) => void;
  deleteCandidate: (name: string) => void;
}) {
  const [name, setName] = useState("New Candidate");
  const [office, setOffice] = useState("Governor");
  const [party, setParty] = useState(commandData.parties[0].abbreviation);
  const [region, setRegion] = useState("Nairobi County");
  const candidates = [...onboardedCandidates, ...commandData.candidates];
  const activeCandidateCount = candidates.filter((candidate) => candidateStatuses[candidate.name] !== "Suspended").length;
  const accessCount = commandData.candidateAccounts.length + activeCandidateCount;

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Creator Candidate Onboarding" icon={<UserCog size={20} />}>
        <div className="space-y-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <input value={office} onChange={(event) => setOffice(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <select value={party} onChange={(event) => setParty(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300">
            {commandData.parties.map((item) => <option key={item.abbreviation}>{item.abbreviation}</option>)}
          </select>
          <input value={region} onChange={(event) => setRegion(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-300" />
          <button onClick={() => addCandidate({ name, office, party, region })} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-300 font-semibold text-slate-950 hover:bg-sky-200">
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
        <Panel title="Creator Password Control" icon={<ShieldCheck size={20} />}>
          <div className="grid gap-3 md:grid-cols-[auto_1fr]">
            <button onClick={() => changePassword("creator@pios.local")} className="h-11 rounded-md bg-sky-300 px-4 font-semibold text-slate-950">
              Change My Password
            </button>
            <div className="rounded-md border border-white/10 bg-white/[.035] p-3 text-sm text-slate-300">
              Creator controls candidate access by resetting passwords, suspending usage, or deleting candidate accounts.
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
    </section>
  );
}

function AccessModule({
  changePassword,
  passwordEvents
}: {
  changePassword: (target: string) => void;
  passwordEvents: Array<{ actor: string; target: string; changedAt: string }>;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel title="Staff Access Control" icon={<Users size={20} />}>
        <div className="space-y-3">
          {commandData.staffRoles.map((staff) => (
            <article key={staff.role} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{staff.role}</h3>
                <span className="text-sm text-sky-100">{staff.members} users</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{staff.purpose}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {staff.access.map((item) => (
                  <span key={item} className="rounded-sm border border-sky-300/30 px-2 py-1 text-xs text-sky-100">{item}</span>
                ))}
              </div>
            </article>
          ))}
          <div className="rounded-md border border-sky-300/20 bg-sky-300/10 p-4">
            <h3 className="font-semibold text-white">Password control</h3>
            <div className="mt-3 grid gap-2">
              {commandData.candidateAccounts.map((account) => (
                <button key={account.username} onClick={() => changePassword(account.username)} className="flex items-center justify-between rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-left text-sm text-slate-200">
                  <span>{account.role}: {account.username}</span>
                  <span className="text-sky-100">Reset</span>
                </button>
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
          {commandData.socialHandles.map((handle) => (
            <article key={handle.handle} className="rounded-md border border-white/10 bg-white/[.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{handle.network}</h3>
                <span className="text-xs text-emerald-200">{handle.status}</span>
              </div>
              <p className="mt-2 text-sm text-sky-100">{handle.handle}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{handle.risk}</p>
            </article>
          ))}
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sky-300/40 text-sm font-semibold text-sky-100 hover:bg-sky-300/10">
            <Plus size={16} />
            Connect Social Handle
          </button>
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
  setUploadedVoterFile
}: {
  uploadedVoterFile: string;
  setUploadedVoterFile: (file: string) => void;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="IEBC Voter Register Import" icon={<Database size={20} />}>
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-sky-300/40 bg-sky-300/5 p-6 text-center hover:bg-sky-300/10">
          <input
            className="hidden"
            type="file"
            accept="application/pdf"
            onChange={(event) => setUploadedVoterFile(event.target.files?.[0]?.name ?? "")}
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
      </Panel>
      <Panel title="Voter Count Coverage" icon={<Layers size={20} />}>
        <div className="space-y-3">
          {commandData.voterImports.map((item) => (
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
          {commandData.regions.map((region) => (
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
  setSelectedParty
}: {
  selectedParty: string;
  setSelectedParty: (party: string) => void;
}) {
  const party = commandData.parties.find((item) => item.abbreviation === selectedParty) ?? commandData.parties[0];
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.75fr_1.25fr]">
      <Panel title="Candidate Party Selection" icon={<Landmark size={20} />}>
        <div className="space-y-3">
          {commandData.parties.map((item) => (
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
