import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

export default function C11_Apply_Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedJob = location.state?.job;

  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Accept either the frontend job shape or the raw API field names.
  const job = selectedJob
    ? {
        ...selectedJob,
        id: selectedJob.id ?? selectedJob.job_id,
        title: selectedJob.title ?? selectedJob.job_title ?? "Job opportunity",
        company:
          selectedJob.company ??
          selectedJob.company_name ??
          selectedJob.companyName ??
          "Company",
        location:
          selectedJob.location ||
          [selectedJob.city, selectedJob.state, selectedJob.country]
            .filter(Boolean)
            .join(", ") ||
          "Location not specified",
        type:
          selectedJob.type ??
          selectedJob.employment_type ??
          selectedJob.employmentType ??
          "Employment type not specified",
      }
    : null;

  const handleApply = async () => {
    setError("");

    if (!consent) {
      setError("Please consent to sharing your verified profile before continuing.");
      return;
    }

    if (!job?.id) {
      setError(
        "The job ID is missing. Please return to Jobs and open this opportunity from the live job list."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiRequest("/api/candidate/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: Number(job.id) }),
      });

      const application = response?.data?.application;
      if (!application?.id) {
        throw new Error("The application was submitted, but the server did not return an application ID.");
      }

      // The next page needs this ID to start the job-specific assessment.
      navigate("/candidate/job-assessment", {
        state: {
          job,
          applicationId: application.id,
          application,
        },
      });
    } catch (err) {
      setError(err.message || "Unable to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/candidate/job-details", {
      state: job ? { job } : undefined,
    });
  };

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <i className="fa-solid fa-circle-exclamation text-xl" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">No job selected</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Open a job from the Jobs page first, then select Apply. This page needs that job's details and ID to submit an application.
          </p>
          <button
            type="button"
            onClick={() => navigate("/candidate/jobs")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to jobs
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={goBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-teal-800"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to job
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="relative overflow-hidden bg-gradient-to-r from-teal-800 to-teal-600 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[28px] border-white/10" />
            <div className="relative flex items-start gap-4 sm:items-center sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-extrabold sm:h-16 sm:w-16">
                {(job.company || "C").trim().slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-100">Application</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Apply for this opportunity</h1>
                <p className="mt-2 text-sm text-teal-50 sm:text-base">{job.title} · {job.company}</p>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-9">
            <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2"><i className="fa-solid fa-building text-teal-700" aria-hidden="true" />{job.company}</span>
                  <span className="inline-flex items-center gap-2"><i className="fa-solid fa-location-dot text-teal-700" aria-hidden="true" />{job.location || "Location not specified"}</span>
                  <span className="inline-flex items-center gap-2"><i className="fa-solid fa-briefcase text-teal-700" aria-hidden="true" />{job.type || "Employment type not specified"}</span>
                </div>
              </div>
              <div className="rounded-xl bg-teal-50 px-4 py-3 text-left sm:min-w-36 sm:text-center">
                <div className="text-sm font-bold text-teal-800">Verified skills</div>
                <div className="mt-1 text-xs text-teal-700">Used as evidence in your profile</div>
              </div>
            </div>

            <section className="mt-7">
              <h3 className="text-base font-bold text-slate-900">What happens next?</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { n: "1", title: "Submit application", text: "Your application is recorded for this published opportunity.", color: "bg-teal-700" },
                  { n: "2", title: "Complete assessment", text: "Answer the role-specific questions within the assessment rules.", color: "bg-indigo-600" },
                  { n: "3", title: "Recruiter review", text: "The recruiter can review your application and assessment result.", color: "bg-violet-600" },
                ].map((step) => (
                  <div key={step.n} className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${step.color} text-sm font-extrabold text-white`}>{step.n}</div>
                    <h4 className="mt-4 text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <h3 className="text-base font-bold text-slate-900">Before you continue</h3>
              <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                <div className="flex gap-3 p-4 sm:p-5">
                  <i className="fa-solid fa-shield-halved mt-1 text-teal-700" aria-hidden="true" />
                  <div><h4 className="text-sm font-bold text-slate-900">Verified profile sharing</h4><p className="mt-1 text-sm leading-6 text-slate-600">Your verified skills and relevant profile information may be shared with {job.company} for recruitment.</p></div>
                </div>
                <div className="flex gap-3 p-4 sm:p-5">
                  <i className="fa-solid fa-clipboard-check mt-1 text-indigo-600" aria-hidden="true" />
                  <div><h4 className="text-sm font-bold text-slate-900">Role-specific assessment</h4><p className="mt-1 text-sm leading-6 text-slate-600">After your application is created, you will continue to the assessment for this role. The assessment duration will be shown by the assessment page.</p></div>
                </div>
                <div className="flex gap-3 p-4 sm:p-5">
                  <i className="fa-solid fa-lock mt-1 text-violet-600" aria-hidden="true" />
                  <div><h4 className="text-sm font-bold text-slate-900">Assessment integrity</h4><p className="mt-1 text-sm leading-6 text-slate-600">Follow the instructions shown before starting. Your answers are submitted for server-side evaluation.</p></div>
                </div>
              </div>
            </section>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-teal-700"
              />
              <span className="text-sm leading-6 text-slate-700">
                <strong className="text-slate-900">I consent to sharing my verified skills and relevant profile information</strong> with {job.company} for this application.
              </span>
            </label>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button type="button" onClick={goBack} disabled={submitting} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!consent || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Submitting application…</> : <>Submit application & continue <i className="fa-solid fa-arrow-right" aria-hidden="true" /></>}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
