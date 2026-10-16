import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";

export default function R11_Assessment_Preview_Publish() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const jobId =
    searchParams.get("jobId") ||
    location.state?.jobId ||
    sessionStorage.getItem("hrCurrentJobId");
  const assessmentId =
    searchParams.get("assessmentId") ||
    location.state?.assessmentId ||
    sessionStorage.getItem("hrCurrentAssessmentId");
  const requestedCount = Math.max(
    1,
    Number.parseInt(
      searchParams.get("questionCount") || location.state?.questionCount || "8",
      10,
    ) || 8,
  );

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [jobPublished, setJobPublished] = useState(false);
  const [publishingJob, setPublishingJob] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setLoading(true);
      setError("");
      try {
        if (!jobId || !assessmentId)
          throw new Error(
            "Missing job ID or assessment ID. Open this page from the assessment workflow.",
          );
        const response = await apiRequest(
          `/api/hr/jobs/${encodeURIComponent(jobId)}/assessment/${encodeURIComponent(assessmentId)}/questions`,
        );
        const data = response?.data || {};
        const list = data.questions || response?.questions;
        if (!Array.isArray(list))
          throw new Error(
            "The server response did not contain a questions list.",
          );
        if (active) {
          setAssessment(data.assessment || response?.assessment || null);
          setQuestions(list);
          if ((data.assessment || response?.assessment)?.status === "Published")
            setPublished(true);
        }
      } catch (err) {
        if (active)
          setError(err.message || "Could not load assessment preview.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPreview();
    return () => {
      active = false;
    };
  }, [jobId, assessmentId]);

  const currentQuestion = questions[previewIndex];
  const duration = assessment?.duration_minutes ?? assessment?.durationMinutes;
  const passingScore = assessment?.passing_score ?? assessment?.passingScore;
  const assessmentTitle = assessment?.title || "Assessment preview";
  const isReady =
    !!jobId &&
    !!assessmentId &&
    questions.length > 0 &&
    questions.length <= requestedCount;
  const formatOption = (q, key) =>
    q?.[`option_${key.toLowerCase()}`] ?? q?.[`option${key}`] ?? "";

  const goToManualQuestions = () => {
    const params = new URLSearchParams({
      jobId: String(jobId || ""),
      assessmentId: String(assessmentId || ""),
      questionCount: String(requestedCount),
    });
    navigate(`/hr/manual-questions?${params.toString()}`, {
      state: { jobId, assessmentId, questionCount: requestedCount },
    });
  };

  const handlePublish = async () => {
    setError("");
    setNotice("");
    if (!jobId || !assessmentId)
      return setError("Missing job ID or assessment ID.");
    if (questions.length === 0)
      return setError("Add at least one question before publishing.");
    if (questions.length > requestedCount)
      return setError(
        `This assessment has ${questions.length} questions, but the configured limit is ${requestedCount}. Remove extra questions before publishing.`,
      );
    if (published) return;
    setPublishing(true);
    try {
      await apiRequest(
        `/api/hr/jobs/${encodeURIComponent(jobId)}/assessment/${encodeURIComponent(assessmentId)}/publish`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setPublished(true);
      setNotice(
        "Assessment published successfully. The job itself has not been published by this action.",
      );
    } catch (err) {
      setError(err.message || "Could not publish assessment.");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishJob = async () => {
    setError("");
    setNotice("");
    if (!jobId) return setError("Missing job ID.");
    if (!published)
      return setError("Publish the assessment before publishing the job.");
    if (jobPublished) return;
    setPublishingJob(true);
    try {
      const response = await apiRequest(
        `/api/hr/jobs/${encodeURIComponent(jobId)}/publish`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      setJobPublished(true);
      setNotice(
        response?.message ||
          "Job published successfully. It is now eligible to appear in the candidate job list if its deadline is valid.",
      );
    } catch (err) {
      setError(err.message || "Could not publish job.");
    } finally {
      setPublishingJob(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-500 text-lg text-white shadow-lg">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">SkillVerify</div>
              <div className="text-xs text-slate-500">Recruiter Workspace</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">
              <i className="fa-solid fa-eye mr-2" />
              Final preview
            </span>
            <button
              onClick={() => navigate("/hr/jobs")}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div>
            <span
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${published ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
            >
              <i
                className={`fa-solid ${published ? "fa-circle-check" : "fa-eye"}`}
              />
              {published ? "Published" : "Final assessment preview"}
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Review your assessment
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review the questions saved for this assessment before publishing
              it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
              Job ID: {jobId || "Missing"}
            </span>
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
              Assessment ID: {assessmentId || "Missing"}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold">Assessment summary</h2>
            <p className="mt-1 break-words text-sm text-slate-500">
              {assessmentTitle}
            </p>
            <div className="mt-4 divide-y divide-slate-100">
              <div className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-slate-500">Questions saved</span>
                <strong>
                  {loading ? "…" : `${questions.length} / ${requestedCount}`}
                </strong>
              </div>
              <div className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-slate-500">Time limit</span>
                <strong>
                  {duration != null ? `${duration} min` : "Not provided"}
                </strong>
              </div>
              <div className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-slate-500">Passing score</span>
                <strong>
                  {passingScore != null ? `${passingScore}%` : "Not provided"}
                </strong>
              </div>
              <div className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-slate-500">Status</span>
                <strong
                  className={published ? "text-emerald-700" : "text-amber-700"}
                >
                  {assessment?.status || (published ? "Published" : "Draft")}
                </strong>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <i className="fa-solid fa-list-check" />
              </div>
              <div>
                <h3 className="font-extrabold">Publish checklist</h3>
                <p className="text-xs text-slate-500">
                  Check before going live
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2">
                <i
                  className={`fa-solid ${questions.length ? "fa-circle-check text-emerald-600" : "fa-circle-xmark text-rose-500"} mt-0.5`}
                />
                At least one question saved
              </li>
              <li className="flex gap-2">
                <i
                  className={`fa-solid ${questions.length <= requestedCount ? "fa-circle-check text-emerald-600" : "fa-circle-xmark text-rose-500"} mt-0.5`}
                />
                Within the {requestedCount}-question limit
              </li>
              <li className="flex gap-2">
                <i
                  className={`fa-solid ${!!assessmentId ? "fa-circle-check text-emerald-600" : "fa-circle-xmark text-rose-500"} mt-0.5`}
                />
                Assessment identified
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold">Ready to publish?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Publish the assessment first, then use “Publish job” to make the
              job visible to candidates.
            </p>
            <button
              onClick={handlePublish}
              disabled={loading || publishing || published || !isReady}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i
                className={`fa-solid ${publishing ? "fa-spinner fa-spin" : published ? "fa-check" : "fa-paper-plane"}`}
              />
              {publishing
                ? "Publishing…"
                : published
                  ? "Assessment published"
                  : "Publish assessment"}
            </button>
            <button
              onClick={handlePublishJob}
              disabled={loading || publishingJob || !published || jobPublished}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i
                className={`fa-solid ${publishingJob ? "fa-spinner fa-spin" : jobPublished ? "fa-check" : "fa-briefcase"}`}
              />
              {publishingJob
                ? "Publishing job…"
                : jobPublished
                  ? "Job published"
                  : "Publish job"}
            </button>
            <button
              onClick={() => navigate("/hr/jobs")}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Save as draft / Exit
            </button>
          </section>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold">Candidate preview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Question text and answer choices loaded from your backend.
              </p>
            </div>
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              {questions.length
                ? `Question ${previewIndex + 1} of ${questions.length}`
                : "No questions"}
            </span>
          </div>

          <div className="bg-slate-50 p-4 sm:p-7">
            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
                <i className="fa-solid fa-spinner fa-spin mr-2" />
                Loading assessment questions…
              </div>
            ) : error && questions.length === 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                {error}
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                No questions found. Add questions before publishing.
                <button
                  onClick={goToManualQuestions}
                  className="mt-3 block rounded-lg bg-amber-700 px-4 py-2 font-bold text-white"
                >
                  Add questions
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h3 className="font-extrabold">{assessmentTitle}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      SkillVerify candidate assessment
                    </p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    <i className="fa-regular fa-clock mr-1" />
                    {duration != null ? `${duration} min` : "Timed assessment"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${((previewIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="p-5 sm:p-7">
                  <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                    Question {previewIndex + 1}
                  </div>
                  <h4 className="mt-3 whitespace-pre-wrap text-lg font-bold leading-7">
                    {currentQuestion?.question_text ||
                      currentQuestion?.questionText ||
                      "Question text unavailable"}
                  </h4>
                  <div className="mt-5 space-y-3">
                    {["A", "B", "C", "D"].map((key) => {
                      const text = formatOption(currentQuestion, key);
                      const selected = selectedAnswer === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedAnswer(key)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${selected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}
                          >
                            {key}
                          </span>
                          <span className="pt-1">
                            {text || `Option ${key}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="text-xs text-slate-500">
                      {currentQuestion?.marks ?? 1} mark(s)
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={previewIndex === 0}
                        onClick={() => {
                          setPreviewIndex((i) => i - 1);
                          setSelectedAnswer(null);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={previewIndex >= questions.length - 1}
                        onClick={() => {
                          setPreviewIndex((i) => i + 1);
                          setSelectedAnswer(null);
                        }}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                      >
                        Next question{" "}
                        <i className="fa-solid fa-arrow-right ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {(notice || (error && questions.length > 0)) && (
            <div
              className={`border-t p-4 text-sm ${notice ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
            >
              {notice || error}
            </div>
          )}
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center">
            <button
              onClick={goToManualQuestions}
              disabled={published}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <i className="fa-solid fa-arrow-left mr-2" />
              Edit questions
            </button>
            <span className="text-xs text-slate-500">
              Job {jobId || "—"} · Assessment {assessmentId || "—"}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
