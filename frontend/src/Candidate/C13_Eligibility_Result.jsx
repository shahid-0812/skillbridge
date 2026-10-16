import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

export default function C13_Eligibility_Result() {
    const navigate = useNavigate();
    const location = useLocation();

    const job = location.state?.job || {};
    const applicationId =
        location.state?.applicationId ||
        location.state?.application?.id ||
        location.state?.application?.application_id ||
        location.state?.assessmentResult?.application?.id ||
        location.state?.assessmentResult?.applicationId;

    const [result, setResult] = useState(
        location.state?.assessmentResult?.result
            ? location.state.assessmentResult
            : null
    );
    const [loading, setLoading] = useState(Boolean(applicationId));
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadResult() {
            if (!applicationId) {
                setLoading(false);
                setError("Application ID is missing. Open this page from your submitted job assessment.");
                return;
            }

            setLoading(true);
            setError("");
            try {
                const response = await apiRequest(
                    `/api/candidate/applications/${applicationId}/assessment/result`
                );
                const payload = response?.data ?? response?.resultData ?? response;
                if (!payload?.result && !payload?.attempt) {
                    throw new Error("The server did not return a completed assessment result.");
                }
                if (!cancelled) setResult(payload);
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || "Could not load your assessment result.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadResult();
        return () => {
            cancelled = true;
        };
    }, [applicationId]);

    const assessment = result?.assessment || {};
    const attempt = result?.attempt || {};
    const scoreValue = result?.result?.score ?? result?.score ?? attempt?.score;
    const passingValue =
        result?.result?.passingScore ??
        result?.result?.passing_score ??
        assessment?.passing_score;
    const score = Number(scoreValue);
    const passingScore = Number(passingValue);
    const hasScore = Number.isFinite(score);
    const hasPassingScore = Number.isFinite(passingScore);
    const passed =
        typeof result?.result?.passed === "boolean"
            ? result.result.passed
            : hasScore && hasPassingScore
                ? score >= passingScore
                : null;

    const displayTitle = job.title || assessment.title || "Job assessment";
    const displayCompany = job.company || "";
    const displayLocation = job.location || "";

    const handleBack = () => {
        navigate("/candidate/job-assessment", {
            state: { job, applicationId },
        });
    };

    const handleApplications = () => {
        navigate("/candidate/applications");
    };

    const handleBrowseJobs = () => {
        navigate("/candidate/jobs");
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-5">
                <header className="rounded-2xl bg-slate-950 px-5 py-5 text-white shadow-sm sm:px-7">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-sm font-extrabold">
                            {(displayCompany || "JR").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
                                Assessment result
                            </p>
                            <h1 className="mt-1 text-xl font-bold sm:text-2xl">{displayTitle}</h1>
                            {(displayCompany || displayLocation) && (
                                <p className="mt-1 text-sm text-slate-300">
                                    {[displayCompany, displayLocation].filter(Boolean).join(" · ")}
                                </p>
                            )}
                        </div>
                        {result && !loading && !error && passed !== null && (
                            <span
                                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${passed
                                        ? "bg-emerald-400/15 text-emerald-300"
                                        : "bg-rose-400/15 text-rose-300"
                                    }`}
                            >
                                {passed ? "Assessment passed" : "Passing score not reached"}
                            </span>
                        )}
                    </div>
                </header>

                {loading && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                        <p className="mt-4 font-semibold text-slate-800">Loading your result…</p>
                        <p className="mt-1 text-sm text-slate-500">Checking the result returned by the server.</p>
                    </section>
                )}

                {!loading && error && (
                    <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                !
                            </span>
                            <div>
                                <h2 className="font-bold text-slate-900">Unable to load result</h2>
                                <p className="mt-1 text-sm leading-6 text-rose-700">{error}</p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Make sure the assessment was submitted successfully and this page received the correct application ID.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {!loading && !error && result && (
                    <>
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <div
                                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold ${passed
                                            ? "bg-emerald-50 text-emerald-600"
                                            : passed === false
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {passed ? "✓" : passed === false ? "!" : "•"}
                                </div>
                                <h2 className="mt-4 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                                    {passed === true
                                        ? "You passed the job assessment"
                                        : passed === false
                                            ? "You did not reach the passing score"
                                            : "Your assessment is complete"}
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                                    {passed === true
                                        ? "Your result meets the assessment's passing threshold. The recruiter makes the final hiring decision."
                                        : passed === false
                                            ? "Your result is below the assessment's passing threshold. Check your application for any next steps."
                                            : "Your assessment result has been retrieved. The pass status could not be determined from the returned data."}
                                </p>
                            </div>

                            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-medium text-slate-500">Your score</p>
                                    <p className="mt-2 text-3xl font-extrabold text-slate-950">
                                        {hasScore ? `${score}%` : "—"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-medium text-slate-500">Passing score</p>
                                    <p className="mt-2 text-3xl font-extrabold text-slate-950">
                                        {hasPassingScore ? `${passingScore}%` : "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h3 className="font-bold text-slate-950">Assessment details</h3>
                            <dl className="mt-4 divide-y divide-slate-100">
                                <div className="flex flex-wrap justify-between gap-2 py-3">
                                    <dt className="text-sm text-slate-500">Assessment</dt>
                                    <dd className="text-right text-sm font-semibold text-slate-800">
                                        {assessment.title || displayTitle}
                                    </dd>
                                </div>
                                <div className="flex flex-wrap justify-between gap-2 py-3">
                                    <dt className="text-sm text-slate-500">Attempt status</dt>
                                    <dd className="text-sm font-semibold text-slate-800">
                                        {attempt.status || "Completed"}
                                    </dd>
                                </div>
                                {attempt.submitted_at && (
                                    <div className="flex flex-wrap justify-between gap-2 py-3">
                                        <dt className="text-sm text-slate-500">Submitted</dt>
                                        <dd className="text-sm font-semibold text-slate-800">
                                            {new Date(attempt.submitted_at).toLocaleString()}
                                        </dd>
                                    </div>
                                )}
                                {applicationId && (
                                    <div className="flex flex-wrap justify-between gap-2 py-3">
                                        <dt className="text-sm text-slate-500">Application ID</dt>
                                        <dd className="text-sm font-semibold text-slate-800">{applicationId}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
                            <h3 className="font-bold text-slate-900">What this result means</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                This page displays your job assessment score and whether it meets the configured passing score. It does not calculate verified-skill eligibility or guarantee a job offer. The recruiter remains responsible for reviewing your application and making the final decision.
                            </p>
                        </section>
                    </>
                )}

                <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        ← Back to assessment
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleBrowseJobs}
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Browse jobs
                        </button>
                        <button
                            type="button"
                            onClick={handleApplications}
                            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                        >
                            View my applications →
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    );
}
