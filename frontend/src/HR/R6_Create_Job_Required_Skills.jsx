import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";

const LEVELS = ["Basic", "Intermediate", "Advanced"];

export default function R6_Create_Job_Required_Skills() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || location.state?.jobId || location.state?.job?.id;

  const [availableSkills, setAvailableSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/hr/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing. Start by creating the job details first.");
      setLoading(false);
      return;
    }

    let active = true;
    const loadJobSkills = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest(`/api/hr/jobs/${jobId}/skills`);
        if (!active) return;
        const savedSkills = response?.data?.skills || [];
        setSkills(savedSkills.map((item) => ({
          id: item.id,
          skillId: item.skill_id,
          name: item.skill_name,
          requiredLevel: item.required_level,
          isRequired: item.is_required,
          saved: true,
        })));
      } catch (err) {
        if (active) setError(err.message || "Could not load this job's skills.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadJobSkills();
    return () => { active = false; };
  }, [jobId]);

  useEffect(() => {
    let active = true;
    const loadAvailableSkills = async () => {
      try {
        const response = await apiRequest(`/api/skills?q=${encodeURIComponent(search)}`);
        if (active) setAvailableSkills(response?.data?.skills || []);
      } catch (err) {
        if (active) setError(err.message || "Could not load the skill database.");
      }
    };
    loadAvailableSkills();
    return () => { active = false; };
  }, [search]);

  const filteredSkills = useMemo(() => availableSkills.filter((item) =>
    !skills.some((selected) => String(selected.skillId) === String(item.id))
  ), [availableSkills, skills]);

  const addSkill = () => {
    const item = availableSkills.find((skill) => String(skill.id) === String(selectedSkillId));
    if (!item) return;
    if (skills.some((skill) => String(skill.skillId) === String(item.id))) {
      setNotice("That skill is already in the list.");
      return;
    }
    setSkills((current) => [...current, {
      id: `new-${item.id}-${Date.now()}`,
      skillId: item.id,
      name: item.skill_name,
      requiredLevel: "Intermediate",
      isRequired: true,
      saved: false,
    }]);
    setSelectedSkillId("");
    setNotice("");
  };

  const updateSkill = (id, patch) => setSkills((current) =>
    current.map((skill) => skill.id === id ? { ...skill, ...patch } : skill)
  );

  const removeSkill = async (skill) => {
    setError("");
    setNotice("");
    if (skill.saved) {
      try {
        await apiRequest(`/api/hr/jobs/${jobId}/skills/${skill.id}`, { method: "DELETE" });
      } catch (err) {
        setError(err.message || "Could not remove this saved skill.");
        return;
      }
    }
    setSkills((current) => current.filter((item) => item.id !== skill.id));
  };

  const saveAndContinue = async () => {
    setError("");
    setNotice("");
    if (!jobId) {
      setError("Job ID is missing. Please return to Job Details.");
      return;
    }
    if (skills.length === 0) {
      setError("Add at least one required skill before continuing.");
      return;
    }
    setSaving(true);
    try {
      // Save new skills and update existing ones using the backend's supported endpoints.
      for (const skill of skills) {
        if (skill.saved) {
          await apiRequest(`/api/hr/jobs/${jobId}/skills/${skill.id}`, {
            method: "PUT",
            body: JSON.stringify({ requiredLevel: skill.requiredLevel, isRequired: skill.isRequired }),
          });
        } else {
          await apiRequest(`/api/hr/jobs/${jobId}/skills`, {
            method: "POST",
            body: JSON.stringify({
              skillId: skill.skillId,
              requiredLevel: skill.requiredLevel,
              isRequired: skill.isRequired,
            }),
          });
        }
      }
      navigate(`/hr/assessment-setup?jobId=${encodeURIComponent(jobId)}`, {
        state: { jobId, skills },
      });
    } catch (err) {
      setError(err.message || "Could not save job skills.");
    } finally {
      setSaving(false);
    }
  };

  const requiredCount = skills.filter((skill) => skill.isRequired).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight">SkillVerify</p>
              <p className="text-xs text-slate-500">Recruiter Workspace</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/hr/jobs")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Exit
          </button>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">Skill requirements</span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Required skills & proficiency</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose the skills candidates need and set the minimum proficiency level expected for each one.</p>
            </div>
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Step 3 of 4</span>
          </div>
          <div className="mt-7 grid grid-cols-4 gap-2 text-xs font-semibold sm:gap-4">
            {["Job details", "Responsibilities", "Required skills", "Assessment"].map((label, index) => (
              <div key={label} className="min-w-0">
                <div className={`mb-2 h-1.5 rounded-full ${index <= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
                <span className={index === 2 ? "text-blue-700" : "text-slate-500"}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.75fr)] lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold">Skills for this role</h2>
              <p className="mt-1 text-xs text-slate-500">Requirements are saved to the job in the backend.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{skills.length} selected · {requiredCount} required</span>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>}

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading skills…</div>
            ) : skills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                <i className="fa-solid fa-layer-group text-2xl text-slate-400" />
                <p className="mt-3 font-bold">No skills selected yet</p>
                <p className="mt-1 text-sm text-slate-500">Search for a skill below and add it to this job.</p>
              </div>
            ) : skills.map((skill) => (
              <article key={skill.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><i className="fa-solid fa-code" /></div>
                    <div>
                      <h3 className="font-bold">{skill.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{skill.isRequired ? "Required skill" : "Preferred skill"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeSkill(skill)} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Minimum proficiency
                    <select value={skill.requiredLevel} onChange={(e) => updateSkill(skill.id, { requiredLevel: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={skill.isRequired} onChange={(e) => updateSkill(skill.id, { isRequired: e.target.checked })} className="h-4 w-4 accent-blue-600" />
                    Mandatory for this job
                  </label>
                </div>
              </article>
            ))}

            <div className="border-t border-slate-200 pt-5">
              <label className="block text-sm font-bold text-slate-800" htmlFor="skill-search">Add a skill from the database</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input id="skill-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills…" className="min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)} className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Choose a skill…</option>
                    {filteredSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.skill_name}</option>)}
                  </select>
                </div>
                <button type="button" onClick={addSkill} disabled={!selectedSkillId} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><i className="fa-solid fa-plus mr-2" />Add skill</button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button type="button" onClick={() => navigate(`/hr/create-job/responsibilities?jobId=${encodeURIComponent(jobId || "")}`, { state: { jobId } })} className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-white"><i className="fa-solid fa-arrow-left mr-2" />Back</button>
            <button type="button" onClick={saveAndContinue} disabled={loading || saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving skills…" : "Continue to assessment"} <i className="fa-solid fa-arrow-right ml-2" /></button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-500 p-6 text-white shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl"><i className="fa-solid fa-bullseye" /></div>
            <h2 className="mt-5 text-xl font-extrabold">Measure what matters</h2>
            <p className="mt-2 text-sm leading-6 text-blue-50">Set a consistent proficiency benchmark for every candidate. The backend supports Basic, Intermediate, and Advanced levels.</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {LEVELS.map((level) => <div key={level} className="rounded-lg bg-white/10 px-2 py-3 text-center text-xs font-bold">{level}</div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold">Your current setup</h3>
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="text-slate-500">Selected skills</span><strong>{skills.length}</strong></div>
            <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="text-slate-500">Mandatory</span><strong>{requiredCount}</strong></div>
            <div className="flex items-center justify-between py-3 text-sm"><span className="text-slate-500">Optional</span><strong>{skills.length - requiredCount}</strong></div>
          </div>
          <p className="px-1 text-xs leading-5 text-slate-500">Skills are linked to the job ID created on the first step. Keep the same job ID as you continue through assessment setup.</p>
        </aside>
      </main>
    </div>
  );
}
