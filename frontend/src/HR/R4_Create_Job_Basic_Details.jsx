import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const initialForm = {
  jobTitle: "",
  jobDescription: "",
  employmentType: "Full-time",
  workSetting: "Hybrid",
  country: "India",
  state: "",
  city: "",
  experienceMin: "0",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  applicationDeadline: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50";
const labelClass = "text-sm font-semibold text-slate-700";

export default function R4_Create_Job_Basic_Details() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (!form.jobTitle.trim()) return "Enter a job title.";
    if (!form.jobDescription.trim()) return "Enter a job description.";
    if (form.experienceMin !== "" && Number(form.experienceMin) < 0) {
      return "Minimum experience cannot be negative.";
    }
    if (form.experienceMax !== "" && Number(form.experienceMax) < Number(form.experienceMin || 0)) {
      return "Maximum experience must be greater than or equal to minimum experience.";
    }
    if (form.salaryMin !== "" && Number(form.salaryMin) < 0) return "Minimum salary cannot be negative.";
    if (form.salaryMax !== "" && Number(form.salaryMax) < 0) return "Maximum salary cannot be negative.";
    if (form.salaryMin !== "" && form.salaryMax !== "" && Number(form.salaryMax) < Number(form.salaryMin)) {
      return "Maximum salary must be greater than or equal to minimum salary.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session is missing. Please sign in with your HR account again.");
      navigate("/hr/login");
      return;
    }

    const payload = {
      jobTitle: form.jobTitle.trim(),
      jobDescription: form.jobDescription.trim(),
      employmentType: form.employmentType || null,
      workSetting: form.workSetting || null,
      country: form.country.trim() || null,
      state: form.state.trim() || null,
      city: form.city.trim() || null,
      experienceMin: form.experienceMin === "" ? 0 : Number(form.experienceMin),
      experienceMax: form.experienceMax === "" ? null : Number(form.experienceMax),
      salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
      salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
      applicationDeadline: form.applicationDeadline || null,
    };

    try {
      setSubmitting(true);
      const response = await apiRequest("/api/hr/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const job = response?.data?.job;
      if (!job?.id) {
        throw new Error("The job was created, but the server did not return its ID. Check the jobs table before retrying.");
      }
      navigate(`/hr/create-job/responsibilities?jobId=${encodeURIComponent(job.id)}`, {
        state: { jobId: job.id, job },
      });
    } catch (requestError) {
      setError(requestError.message || "Could not create the job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate("/hr/dashboard")} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight">SkillVerify</span>
              <span className="block text-xs text-slate-500">Recruiter workspace</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
              <i className="fa-solid fa-lock text-emerald-600" aria-hidden="true" /> Secure job creation
            </span>
            <button type="button" onClick={() => navigate("/hr/dashboard")} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <i className="fa-solid fa-plus" aria-hidden="true" /> New job
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Create a new job</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Enter the role details. The job will be saved as a draft so you can configure its required skills and assessment next.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            Step 1 of 4 · Job details
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2 sm:gap-4">
          {["Job details", "Skills & responsibilities", "Assessment", "Publish"].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-400"}`}>
                  {index === 0 ? <i className="fa-solid fa-check" aria-hidden="true" /> : index + 1}
                </span>
                <span className={`hidden text-xs font-semibold sm:inline ${index === 0 ? "text-slate-900" : "text-slate-400"}`}>{step}</span>
              </div>
              {index < 3 && <div className={`h-px min-w-3 flex-1 ${index === 0 ? "bg-indigo-300" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-lg text-indigo-600"><i className="fa-solid fa-file-pen" aria-hidden="true" /></span>
                <div>
                  <h2 className="font-bold">Basic job details</h2>
                  <p className="mt-1 text-xs text-slate-500">Fields marked with * are required.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="jobTitle" className={labelClass}>Job title <span className="text-red-500">*</span></label>
                <input id="jobTitle" name="jobTitle" value={form.jobTitle} onChange={updateField} className={inputClass} placeholder="e.g. Frontend Developer" maxLength={200} required disabled={submitting} />
              </div>

              <div>
                <label htmlFor="jobDescription" className={labelClass}>Job description <span className="text-red-500">*</span></label>
                <textarea id="jobDescription" name="jobDescription" value={form.jobDescription} onChange={updateField} className={`${inputClass} min-h-44 resize-y leading-6`} placeholder="Describe the role, responsibilities, and what the candidate will work on..." rows={7} required disabled={submitting} />
                <p className="mt-2 text-xs text-slate-400">Write a clear description. You can add required skills on the next step.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="employmentType" className={labelClass}>Employment type</label>
                  <select id="employmentType" name="employmentType" value={form.employmentType} onChange={updateField} className={inputClass} disabled={submitting}>
                    <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Temporary</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="workSetting" className={labelClass}>Work setting</label>
                  <select id="workSetting" name="workSetting" value={form.workSetting} onChange={updateField} className={inputClass} disabled={submitting}>
                    <option>On-site</option><option>Hybrid</option><option>Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">Job location</h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-3">
                  <div><label htmlFor="country" className={labelClass}>Country</label><input id="country" name="country" value={form.country} onChange={updateField} className={inputClass} placeholder="India" disabled={submitting} /></div>
                  <div><label htmlFor="state" className={labelClass}>State</label><input id="state" name="state" value={form.state} onChange={updateField} className={inputClass} placeholder="Gujarat" disabled={submitting} /></div>
                  <div><label htmlFor="city" className={labelClass}>City</label><input id="city" name="city" value={form.city} onChange={updateField} className={inputClass} placeholder="Ahmedabad" disabled={submitting} /></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">Experience required</h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="experienceMin" className={labelClass}>Minimum (years)</label><input id="experienceMin" name="experienceMin" type="number" min="0" step="0.5" value={form.experienceMin} onChange={updateField} className={inputClass} disabled={submitting} /></div>
                  <div><label htmlFor="experienceMax" className={labelClass}>Maximum (years)</label><input id="experienceMax" name="experienceMax" type="number" min="0" step="0.5" value={form.experienceMax} onChange={updateField} className={inputClass} placeholder="No maximum" disabled={submitting} /></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">Salary range <span className="font-normal text-slate-400">(optional, numeric values)</span></h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="salaryMin" className={labelClass}>Minimum salary</label><input id="salaryMin" name="salaryMin" type="number" min="0" step="1" value={form.salaryMin} onChange={updateField} className={inputClass} placeholder="e.g. 400000" disabled={submitting} /></div>
                  <div><label htmlFor="salaryMax" className={labelClass}>Maximum salary</label><input id="salaryMax" name="salaryMax" type="number" min="0" step="1" value={form.salaryMax} onChange={updateField} className={inputClass} placeholder="e.g. 700000" disabled={submitting} /></div>
                </div>
                <p className="mt-2 text-xs text-slate-400">Enter salary in your local currency. The current database schema stores numeric amounts but has no separate currency field.</p>
              </div>

              <div>
                <label htmlFor="applicationDeadline" className={labelClass}>Application deadline <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="applicationDeadline" name="applicationDeadline" type="date" min={new Date().toISOString().slice(0, 10)} value={form.applicationDeadline} onChange={updateField} className={inputClass} disabled={submitting} />
              </div>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                <button type="button" onClick={() => navigate("/hr/dashboard")} disabled={submitting} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving job...</> : <>Save draft & continue <i className="fa-solid fa-arrow-right" aria-hidden="true" /></>}
                </button>
              </div>
            </div>
          </form>

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-500 p-6 text-white shadow-lg shadow-indigo-200">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl"><i className="fa-solid fa-list-check" aria-hidden="true" /></span>
              <h2 className="mt-5 text-xl font-extrabold">Build a skills-first role</h2>
              <p className="mt-2 text-sm leading-6 text-indigo-100">After saving the basics, you'll add required skills and set up a manual candidate assessment.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Role details", "Required skills", "MCQ assessment"].map((item) => <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><i className="fa-solid fa-check mr-1.5" aria-hidden="true" />{item}</span>)}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2"><i className="fa-solid fa-eye text-indigo-600" aria-hidden="true" /><h2 className="font-bold">Live job preview</h2></div>
              <div className="mt-5 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><i className="fa-solid fa-briefcase" aria-hidden="true" /></span>
                <div className="min-w-0"><h3 className="break-words font-bold">{form.jobTitle.trim() || "Your job title"}</h3><p className="mt-1 text-xs text-slate-500">{form.employmentType} · {form.workSetting}</p></div>
              </div>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <p><i className="fa-solid fa-location-dot mr-2 w-4 text-slate-400" aria-hidden="true" />{[form.city, form.state, form.country].filter(Boolean).join(", ") || "Location not specified"}</p>
                <p><i className="fa-solid fa-chart-line mr-2 w-4 text-slate-400" aria-hidden="true" />{form.experienceMin || 0}–{form.experienceMax || "any"} years experience</p>
                <p><i className="fa-solid fa-indian-rupee-sign mr-2 w-4 text-slate-400" aria-hidden="true" />{form.salaryMin || form.salaryMax ? `${form.salaryMin || "Not set"} – ${form.salaryMax || "Not set"}` : "Salary not specified"}</p>
              </div>
              <p className="mt-4 line-clamp-4 whitespace-pre-line text-xs leading-5 text-slate-500">{form.jobDescription || "Your job description will appear here as you type."}</p>
            </section>

            <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              <i className="fa-solid fa-shield-halved mt-0.5" aria-hidden="true" />
              <p className="leading-5">Your job is saved as a draft first. It will not be visible to candidates until you complete the publishing steps.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
