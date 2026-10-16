import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

function unwrapResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.applications)) return response.applications;
  if (Array.isArray(response?.data?.applications)) return response.data.applications;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("reject") || normalized.includes("closed") || normalized.includes("expired")) {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (normalized.includes("offer") || normalized.includes("passed") || normalized.includes("completed")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (normalized.includes("interview") || normalized.includes("review") || normalized.includes("progress")) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function C14_My_Applications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/api/candidate/applications", { method: "GET" });
      setApplications(unwrapResponse(response));
    } catch (err) {
      setError(err?.message || "Unable to load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = useMemo(() => {
    const normalized = applications.map((app) => String(app.status || "").toLowerCase());
    return {
      total: applications.length,
      active: normalized.filter((s) => !s.includes("reject") && !s.includes("closed") && !s.includes("offer")).length,
      offers: normalized.filter((s) => s.includes("offer")).length,
      closed: normalized.filter((s) => s.includes("reject") || s.includes("closed")).length,
    };
  }, [applications]);

  const getJobTitle = (app) =>
    app.job_title || app.title || app.job?.title || app.role || "Job application";
  const getCompany = (app) =>
    app.company_name || app.company?.name || app.company || app.job?.company_name || "Company";
  const getAppliedDate = (app) =>
    app.applied_at || app.applied_on || app.created_at || app.createdAt || app.application_date;
  const getStatus = (app) => app.status || app.application_status || "Submitted";
  const getId = (app) => app.id ?? app.application_id;

  const openApplication = (application) => {
    // A dedicated application-details route is not implemented yet.
    // Keep navigation on the applications page rather than inventing a route.
    navigate("/candidate/applications", { state: { application } });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              <span aria-hidden="true">▦</span> Career activity
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track the applications you've submitted and check their latest status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/candidate/jobs")}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Browse jobs
            </button>
            <button
              type="button"
              onClick={loadApplications}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Application overview</p>
          <h2 className="mt-2 text-xl font-bold">Your applications in one place</h2>
          <p className="mt-1 text-sm text-slate-300">
            Counts below are calculated from the applications returned by the backend.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total applications", counts.total],
              ["Active", counts.active],
              ["Offers", counts.offers],
              ["Closed", counts.closed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button type="button" onClick={loadApplications} className="shrink-0 rounded-lg border border-red-300 px-3 py-2 font-semibold hover:bg-red-100">
              Try again
            </button>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Application activity</h2>
              <p className="mt-1 text-sm text-slate-500">Your submitted applications and current statuses.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {loading ? "Loading…" : `${applications.length} ${applications.length === 1 ? "application" : "applications"}`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Loading applications">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-5">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                  <div className="mt-4 h-3 w-1/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700" aria-hidden="true">▣</div>
              <h3 className="mt-4 text-base font-bold">No applications yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                When you apply for a job, it will appear here with the status recorded by the platform.
              </p>
              <button type="button" onClick={() => navigate("/candidate/jobs")} className="mt-5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                Browse jobs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application, index) => {
                const id = getId(application);
                const title = getJobTitle(application);
                const company = getCompany(application);
                const status = getStatus(application);
                return (
                  <article key={id ?? index} className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-300 hover:shadow-sm sm:p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-extrabold text-teal-800">
                          {String(company).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold">{title}</h3>
                          <p className="mt-1 text-sm font-medium text-slate-600">{typeof company === "string" ? company : company?.name || "Company"}</p>
                          <p className="mt-2 text-xs text-slate-500">Applied: {formatDate(getAppliedDate(application))}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(status)}`}>
                          {status}
                        </span>
                        {id != null && <span className="text-xs text-slate-500">Application ID: #{id}</span>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500">
                        {application.assessment_score != null
                          ? `Assessment score: ${application.assessment_score}%`
                          : application.assessmentScore != null
                            ? `Assessment score: ${application.assessmentScore}%`
                            : "Assessment score not available"}
                      </p>
                      <button type="button" onClick={() => openApplication(application)} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                        View application <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => navigate("/candidate/eligibility", { state: { applicationId: location.state?.applicationId, job: location.state?.job } })} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            ← Back to result
          </button>
          <p className="text-xs text-slate-500">Application statuses are provided by the backend.</p>
        </footer>
      </div>
    </main>
  );
}
