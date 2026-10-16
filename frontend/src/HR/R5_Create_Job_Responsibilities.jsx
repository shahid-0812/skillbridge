import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OPTIONS = [
  { title: "Build and maintain CI/CD pipelines", category: "DevOps", icon: "↗" },
  { title: "Manage cloud infrastructure and services", category: "Cloud", icon: "☁" },
  { title: "Automate deployments using Docker and Kubernetes", category: "Automation", icon: "⚙" },
  { title: "Monitor production systems and troubleshoot issues", category: "Reliability", icon: "⌁" },
  { title: "Design scalable infrastructure solutions", category: "Architecture", icon: "◇" },
  { title: "Implement infrastructure as code using Terraform", category: "Infrastructure", icon: "▤" },
  { title: "Collaborate with engineering and product teams", category: "Collaboration", icon: "♧" },
  { title: "Improve security, reliability and system performance", category: "Security", icon: "✓" },
];

const STORAGE_KEY = "skillverify_job_responsibilities";

export default function R5_Create_Job_Responsibilities() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get("jobId") || location.state?.jobId || location.state?.job?.id || "";
  const [selected, setSelected] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`${STORAGE_KEY}_${jobId || "draft"}`) || "null");
      return Array.isArray(saved?.selected) ? saved.selected : [0, 1, 2, 3, 4];
    } catch { return [0, 1, 2, 3, 4]; }
  });
  const [customText, setCustomText] = useState("");
  const [customItems, setCustomItems] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`${STORAGE_KEY}_${jobId || "draft"}`) || "null");
      return Array.isArray(saved?.customItems) ? saved.customItems : [];
    } catch { return []; }
  });
  const [error, setError] = useState("");

  const totalSelected = selected.length + customItems.length;
  const responsibilities = useMemo(
    () => [...selected.map((index) => OPTIONS[index]?.title).filter(Boolean), ...customItems.map((item) => item.title)],
    [selected, customItems]
  );

  const persist = (nextSelected = selected, nextCustom = customItems) => {
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${jobId || "draft"}`, JSON.stringify({
        selected: nextSelected,
        customItems: nextCustom,
        responsibilities: [...nextSelected.map((index) => OPTIONS[index]?.title).filter(Boolean), ...nextCustom.map((item) => item.title)],
      }));
    } catch { /* Storage may be disabled; the current page still works. */ }
  };

  const toggleResponsibility = (index) => {
    setSelected((current) => {
      const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      persist(next, customItems);
      return next;
    });
    setError("");
  };

  const addResponsibility = () => {
    const title = customText.trim();
    if (!title) return;
    if (responsibilities.some((item) => item.toLowerCase() === title.toLowerCase())) {
      setError("That responsibility is already selected.");
      return;
    }
    const next = [...customItems, { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title }];
    setCustomItems(next);
    persist(selected, next);
    setCustomText("");
    setError("");
  };

  const removeCustom = (id) => {
    const next = customItems.filter((item) => item.id !== id);
    setCustomItems(next);
    persist(selected, next);
  };

  const continueToSkills = () => {
    if (!jobId) {
      setError("The job ID is missing. Return to Job Details and create/save the job first.");
      return;
    }
    if (totalSelected === 0) {
      setError("Select at least one responsibility or add your own.");
      return;
    }
    persist();
    navigate(`/hr/create-job/skills?jobId=${encodeURIComponent(jobId)}`, {
      state: { jobId, responsibilities },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-200">S</div>
            <div><p className="text-base font-extrabold tracking-tight">SkillVerify</p><p className="text-xs text-slate-500">Recruiter Workspace</p></div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Job creation · Step 2 of 4</div>
          <button type="button" onClick={() => navigate("/hr/jobs")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Exit</button>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">Job requirements</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Define responsibilities</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Choose the work this person will actually do. Select the suggestions that fit the role or add your own.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><span className="font-bold text-blue-700">{totalSelected}</span><span className="text-slate-500"> responsibilities selected</span></div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4">
            {["Job details", "Responsibilities", "Required skills", "Assessment"].map((label, index) => (
              <div key={label} className="min-w-0">
                <div className={`mb-2 h-1.5 rounded-full ${index <= 1 ? "bg-blue-600" : "bg-slate-200"}`} />
                <p className={`truncate text-xs font-semibold sm:text-sm ${index === 1 ? "text-blue-700" : index < 1 ? "text-slate-700" : "text-slate-400"}`}>{index + 1}. {label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,0.8fr)] lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div><h2 className="font-extrabold">What will this person be responsible for?</h2><p className="mt-1 text-sm text-slate-500">Select all responsibilities that apply.</p></div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{totalSelected} selected</span>
          </div>
          <div className="p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              {OPTIONS.map((item, index) => {
                const active = selected.includes(index);
                return <button key={item.title} type="button" aria-pressed={active} onClick={() => toggleResponsibility(index)} className={`flex min-h-24 items-center gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{item.icon}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold leading-5">{item.title}</span><span className={`mt-1 block text-xs font-semibold ${active ? "text-blue-700" : "text-slate-400"}`}>{item.category}</span></span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"}`}>✓</span>
                </button>;
              })}
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <label htmlFor="custom-responsibility" className="block text-sm font-bold">Add another responsibility</label>
              <p className="mt-1 text-xs text-slate-500">Add role-specific work that is not listed above.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input id="custom-responsibility" value={customText} onChange={(event) => setCustomText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addResponsibility(); } }} placeholder="e.g. Lead incident response meetings" maxLength={180} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
                <button type="button" onClick={addResponsibility} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">＋ Add responsibility</button>
              </div>
              {customItems.length > 0 && <div className="mt-3 space-y-2">{customItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3"><p className="text-sm font-medium">{item.title}</p><button type="button" aria-label={`Remove ${item.title}`} onClick={() => removeCustom(item.id)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white hover:text-red-600">✕</button></div>)}</div>}
              {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <span className="text-xl">💡</span><div><p className="text-sm font-bold text-slate-800">Why this matters</p><p className="mt-1 text-sm leading-5 text-slate-600">Clear responsibilities help your team align the role description and assessment with the actual work.</p></div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={() => navigate(`/hr/create-job${jobId ? `?jobId=${encodeURIComponent(jobId)}` : ""}`, { state: { jobId } })} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100">← Back</button>
              <button type="button" onClick={continueToSkills} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Continue to skills →</button>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-600 p-6 text-white shadow-lg shadow-blue-200">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="relative"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">⌘</div><h2 className="text-xl font-extrabold">Turn work into proof</h2><p className="mt-2 text-sm leading-6 text-blue-100">Describe real responsibilities so the job setup reflects what the successful candidate will need to do.</p><div className="mt-6 grid grid-cols-3 gap-2">{[["01", "Work"], ["02", "Skills"], ["03", "Assess"]].map(([number, label]) => <div key={label} className="rounded-xl bg-white/10 p-3 text-center"><p className="text-xs font-bold text-blue-100">{number}</p><p className="mt-1 text-xs font-semibold">{label}</p></div>)}</div></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold">Your selection</h3><p className="mt-1 text-sm text-slate-500">A quick overview before moving on.</p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-600">Suggested responsibilities</span><span className="font-extrabold">{selected.length}</span></div>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-600">Custom responsibilities</span><span className="font-extrabold">{customItems.length}</span></div>
            <div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Next step</p><p className="mt-1 text-sm font-semibold">Define the required technical and professional skills.</p></div>
          </div>
          <p className="px-1 text-xs leading-5 text-slate-400">Job ID: {jobId || "Missing — return to Job Details"}</p>
        </aside>
      </main>
    </div>
  );
}
