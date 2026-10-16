import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function C10_Job_Details() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedJob = location.state?.job;
  const [saved, setSaved] = useState(false);

  const job = selectedJob || null;

  const skills = useMemo(() => {
    const list = job?.requiredSkills || job?.required_skills || job?.skills || job?.jobSkills || [];
    return Array.isArray(list) ? list : [];
  }, [job]);

  const responsibilities = useMemo(() => {
    if (Array.isArray(job?.responsibilities)) return job.responsibilities;
    if (typeof job?.responsibilities === "string") {
      return job.responsibilities.split(/\n|•/).map((item) => item.trim()).filter(Boolean);
    }
    return [];
  }, [job]);

  const title = job?.title || job?.jobTitle || job?.job_title || "Job details";
  const company =
    job?.companyName ||
    job?.company_name ||
    job?.company?.name ||
    (typeof job?.company === "string" ? job.company : "") ||
    "Company not specified";
  const locationText =
    job?.location ||
    job?.jobLocation ||
    job?.job_location ||
    [job?.city, job?.state, job?.country].filter(Boolean).join(", ");
  const jobType = job?.type || job?.employmentType || job?.employment_type;
  const experience = job?.experienceLevel || job?.experience_level || job?.level;
  const salary = job?.salaryRange || job?.salary_range || job?.salary;
  const description = job?.description || job?.jobDescription || job?.job_description;
  const posted = job?.postedAt || job?.posted_at || job?.createdAt || job?.created_at;
  const jobId = job?.id || job?.jobId || job?.job_id;

  const handleApply = () => {
    if (!job) return;
    navigate("/candidate/apply", { state: { job } });
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  const skillName = (skill) =>
    typeof skill === "string"
      ? skill
      : skill?.name || skill?.skillName || skill?.skill_name || skill?.title || "Skill";

  const skillLevel = (skill) =>
    typeof skill === "object"
      ? skill?.requiredLevel || skill?.required_level || skill?.level || skill?.proficiencyLevel
      : "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <button
          type="button"
          onClick={() => navigate("/candidate/jobs")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span aria-hidden="true">←</span>
          Back to jobs
        </button>

        {!job ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
              <span aria-hidden="true">⌕</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">No job selected</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Open a job from the jobs page to view its details. Job information will appear here
              when you select a listing.
            </p>
            <button
              type="button"
              onClick={() => navigate("/candidate/jobs")}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse jobs
            </button>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400" />
              <div className="p-5 pt-7 sm:p-8 sm:pt-10">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 gap-4 sm:gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-lg font-extrabold text-white shadow-lg shadow-blue-900/10 sm:h-16 sm:w-16 sm:text-xl">
                      {(company || "CO")
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          Published opportunity
                        </span>
                        {job.status && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {job.status}
                          </span>
                        )}
                      </div>
                      <h1 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        {title}
                      </h1>
                      <p className="mt-2 text-base font-semibold text-slate-600">{company}</p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        {locationText && (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-blue-600" aria-hidden="true">⌖</span>
                            {locationText}
                          </span>
                        )}
                        {jobType && (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-blue-600" aria-hidden="true">▣</span>
                            {jobType}
                          </span>
                        )}
                        {experience && (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-blue-600" aria-hidden="true">◇</span>
                            {experience}
                          </span>
                        )}
                        {posted && (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-blue-600" aria-hidden="true">◷</span>
                            Posted {formatDate(posted)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
                    <button
                      type="button"
                      onClick={handleApply}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Apply for this job <span aria-hidden="true">→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaved((value) => !value)}
                      aria-pressed={saved}
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${saved
                          ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                    >
                      <span aria-hidden="true">{saved ? "✓" : "☆"}</span>
                      {saved ? "Saved for later" : "Save for later"}
                    </button>
                  </div>
                </div>

                {(salary || job.deadline || job.applicationDeadline || job.application_deadline) && (
                  <div className="mt-7 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                    {salary && (
                      <div className="rounded-2xl bg-blue-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Compensation</p>
                        <p className="mt-1 text-base font-bold text-slate-900">{salary}</p>
                      </div>
                    )}
                    {(job.deadline || job.applicationDeadline || job.application_deadline) && (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Application deadline</p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                          {formatDate(job.deadline || job.applicationDeadline || job.application_deadline)}
                        </p>
                      </div>
                    )}
                    {jobId && (
                      <div className="rounded-2xl bg-teal-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Job reference</p>
                        <p className="mt-1 text-base font-bold text-slate-900">#{jobId}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
                      <span aria-hidden="true">▤</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">About the role</h2>
                      <p className="mt-0.5 text-sm text-slate-500">Role overview and expectations</p>
                    </div>
                  </div>
                  {description ? (
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{description}</p>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                      The recruiter has not provided a role description yet.
                    </p>
                  )}

                  {responsibilities.length > 0 && (
                    <>
                      <div className="my-6 border-t border-slate-100" />
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">
                        Responsibilities
                      </h3>
                      <ul className="space-y-3">
                        {responsibilities.map((responsibility, index) => (
                          <li key={`${index}-${responsibility}`} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                              ✓
                            </span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-700">
                        <span aria-hidden="true">⌘</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Required skills</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Skills listed by the recruiter for this role</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {skills.length} {skills.length === 1 ? "skill" : "skills"}
                    </span>
                  </div>

                  {skills.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {skills.map((skill, index) => (
                        <div
                          key={`${skillName(skill)}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200">
                              {skillName(skill).slice(0, 1).toUpperCase()}
                            </span>
                            <span className="break-words text-sm font-semibold text-slate-800">{skillName(skill)}</span>
                          </div>
                          {skillLevel(skill) && (
                            <span className="shrink-0 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {skillLevel(skill)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-sm font-medium text-slate-700">No required skills listed</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Skill requirements have not been added to this job listing.
                      </p>
                    </div>
                  )}
                </section>

                {job.companyDescription && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
                        <span aria-hidden="true">▦</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">About {company}</h2>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{job.companyDescription}</p>
                  </section>
                )}
              </div>

              <aside className="space-y-5 lg:sticky lg:top-6">
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Next step</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Ready to apply?</h2>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-6 text-slate-600">
                      Review the role and its required skills before continuing to the application.
                    </p>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Continue to application <span aria-hidden="true">→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/candidate/jobs")}
                      className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Browse more jobs
                    </button>
                  </div>
                </section>

                <section className="rounded-3xl border border-teal-100 bg-teal-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-teal-700 shadow-sm">
                      ✓
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-teal-900">Evidence-based matching</h3>
                      <p className="mt-1.5 text-xs leading-5 text-teal-800/80">
                        Skill verification helps candidates demonstrate their abilities with assessment evidence.
                        Your application and the employer’s selection process determine the final outcome.
                      </p>
                    </div>
                  </div>
                </section>

                {saved && (
                  <div role="status" className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-white p-4 text-sm font-semibold text-teal-700 shadow-sm">
                    <span aria-hidden="true">✓</span>
                    This job is saved in this session.
                  </div>
                )}
              </aside>
            </div>

            <div className="mt-7 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/candidate/jobs")}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700"
              >
                <span aria-hidden="true">←</span> Back to all jobs
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply for this job <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
