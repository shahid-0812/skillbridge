import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const JOB_ASSESSMENT_DURATION_MINUTES = 30;

export default function C13_Job_Specific_Assessment() {
    const navigate = useNavigate();
    const location = useLocation();

    const job = location.state?.job || {};
    const applicationId =
        location.state?.applicationId ||
        location.state?.application?.id ||
        location.state?.application?.application_id;

    const [questions, setQuestions] = useState([]);
    const [assessment, setAssessment] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(JOB_ASSESSMENT_DURATION_MINUTES * 60);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadAssessment = async () => {
            try {
                setLoading(true);
                setError("");

                if (!applicationId) {
                    throw new Error(
                        "Application ID is missing. Open this page after submitting an application."
                    );
                }

                // Start or resume the assessment attempt on the server.
                const startResponse = await apiRequest(
                    `/api/candidate/applications/${applicationId}/assessment/start`,
                    { method: "POST" }
                );

                // Fetch the candidate-safe assessment payload (no correct answers).
                const response = await apiRequest(
                    `/api/candidate/applications/${applicationId}/assessment`
                );

                const payload = response?.data || {};
                const startPayload = startResponse?.data || {};
                const backendQuestions =
                    payload.questions ||
                    payload.assessment?.questions ||
                    startPayload.questions ||
                    startPayload.assessment?.questions ||
                    [];

                const attempt =
                    payload.attempt ||
                    payload.assessmentAttempt ||
                    startPayload.attempt ||
                    startPayload.assessmentAttempt ||
                    null;

                if (!Array.isArray(backendQuestions) || backendQuestions.length === 0) {
                    throw new Error(
                        "No assessment questions were returned by the server. Check that the job assessment is published and contains questions."
                    );
                }

                if (attempt?.status === "Expired") {
                    throw new Error("This assessment attempt has expired. Retakes are not allowed.");
                }

                if (attempt?.status === "Completed") {
                    throw new Error("This assessment has already been completed.");
                }

                // The server is the source of truth for the time limit.
                const durationMinutes = Number(
                    payload.duration_minutes ||
                    payload.durationMinutes ||
                    payload.assessment?.duration_minutes ||
                    startPayload.duration_minutes ||
                    startPayload.durationMinutes ||
                    startPayload.assessment?.duration_minutes ||
                    JOB_ASSESSMENT_DURATION_MINUTES
                );

                let remainingSeconds = Math.max(1, durationMinutes * 60);
                if (attempt?.started_at) {
                    const elapsed = Math.floor(
                        (Date.now() - new Date(attempt.started_at).getTime()) / 1000
                    );
                    remainingSeconds = Math.max(0, durationMinutes * 60 - elapsed);
                }

                if (remainingSeconds <= 0) {
                    throw new Error("Your assessment time has expired.");
                }

                if (!cancelled) {
                    setAssessment({ ...payload, attempt, durationMinutes });
                    setQuestions(
                        backendQuestions.map((question, index) => ({
                            ...question,
                            question_number:
                                question.question_number ?? question.questionNumber ?? index + 1,
                            question_text:
                                question.question_text ??
                                question.question ??
                                question.text ??
                                "",
                            // Backend returns MCQ choices as option_a through option_d,
                            // not necessarily as an `options` array.
                            options: (() => {
                                if (Array.isArray(question.options)) return question.options;
                                if (typeof question.options === "string") {
                                    try {
                                        const parsed = JSON.parse(question.options);
                                        if (Array.isArray(parsed)) return parsed;
                                    } catch { /* fall back to option_a–option_d below */ }
                                }
                                return [
                                    ["A", question.option_a],
                                    ["B", question.option_b],
                                    ["C", question.option_c],
                                    ["D", question.option_d],
                                ]
                                    .filter(([, text]) => text !== undefined && text !== null && String(text).trim() !== "")
                                    .map(([letter, text]) => ({ value: letter, label: String(text) }));
                            })(),
                        }))
                    );
                    setTimeLeft(remainingSeconds);
                }
            } catch (err) {
                if (!cancelled) setError(err.message || "Unable to load the assessment.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadAssessment();
        return () => { cancelled = true; };
    }, [applicationId]);

    useEffect(() => {
        if (loading || error || questions.length === 0 || timeLeft <= 0 || submitting) {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            setTimeLeft((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [loading, error, questions.length, timeLeft, submitting]);

    const current = questions[currentQuestion];
    const answeredCount = Object.keys(answers).filter(
        (key) => answers[key] !== undefined && answers[key] !== ""
    ).length;

    const progress = useMemo(
        () => (questions.length ? (answeredCount / questions.length) * 100 : 0),
        [answeredCount, questions.length]
    );

    const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(
        timeLeft % 60
    ).padStart(2, "0")}`;

    const chooseAnswer = (value) => {
        setAnswers((previous) => ({ ...previous, [currentQuestion]: value }));
    };

    const submitAssessment = async () => {
        if (timeLeft <= 0) {
            setError("Your assessment time has expired. Please contact the recruiter if you need help.");
            return;
        }

        const unanswered = questions.findIndex(
            (_, index) => answers[index] === undefined || answers[index] === ""
        );

        if (unanswered !== -1) {
            setCurrentQuestion(unanswered);
            setError(`Please answer question ${unanswered + 1} before submitting.`);
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const formattedAnswers = questions.map((question, index) => ({
                questionId: Number(question.id),
                selectedOption: String(answers[index]).toUpperCase(),
            }));

            const result = await apiRequest(
                `/api/candidate/applications/${applicationId}/assessment/submit`,
                {
                    method: "POST",
                    body: JSON.stringify({ answers: formattedAnswers }),
                }
            );

            sessionStorage.setItem(
                "jobAssessmentResult",
                JSON.stringify({
                    applicationId,
                    job,
                    result: result?.data || result,
                })
            );

            navigate("/candidate/eligibility", {
                state: {
                    job,
                    applicationId,
                    assessmentResult: result?.data || result,
                },
            });
        } catch (err) {
            setError(err.message || "Failed to submit the assessment.");
        } finally {
            setSubmitting(false);
        }
    };

    const goBack = () => {
        navigate("/candidate/applications", {
            state: { job, applicationId },
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                    <h1 className="text-xl font-bold text-slate-900">Loading assessment</h1>
                    <p className="mt-2 text-sm text-slate-500">Connecting to the assessment service…</p>
                </div>
            </main>
        );
    }

    if (error && questions.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
                <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-600">
                        <i className="fa-solid fa-triangle-exclamation text-xl" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">SkillVerify assessment</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">Assessment unavailable</h1>
                    <p className="mt-3 leading-7 text-slate-600">{error}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button onClick={() => navigate("/candidate/job-details", { state: { job } })} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                            Back to job
                        </button>
                        <button onClick={() => navigate("/candidate/applications")} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
                            My applications
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!current) return null;

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-5 rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-500 text-lg font-extrabold">
                                {(job.company || "SV").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Job assessment</p>
                                <h1 className="mt-1 truncate text-lg font-bold sm:text-xl">{job.title || "Role assessment"}</h1>
                                <p className="mt-1 text-sm text-slate-300">{job.company || "Company assessment"}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 self-start rounded-xl px-4 py-3 font-mono text-xl font-bold sm:self-auto ${timeLeft <= 60 ? "bg-rose-500/20 text-rose-200" : "bg-white/10 text-white"}`}>
                            <i className="fa-regular fa-clock" />
                            {formattedTime}
                        </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-300">
                        <span>{answeredCount} of {questions.length} answered</span>
                        <span>{Math.round(progress)}% complete</span>
                    </div>
                </header>

                {error && (
                    <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {timeLeft <= 0 && (
                    <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        The assessment timer has ended. Submission may be rejected if the server-side deadline has passed.
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="text-xs font-medium capitalize text-slate-500">
                                {(current.question_type || current.type || "Assessment question").toString().replaceAll("_", " ")}
                            </span>
                        </div>

                        <h2 className="mt-6 whitespace-pre-wrap text-lg font-bold leading-8 text-slate-900 sm:text-xl">
                            {current.question_text || "Question text is unavailable."}
                        </h2>
                        {current.description && (
                            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{current.description}</p>
                        )}

                        {current.options.length > 0 ? (
                            <div className="mt-6 space-y-3">
                                {current.options.map((option, index) => {
                                    const value = typeof option === "string" ? option : option.value ?? option.text ?? option.label ?? JSON.stringify(option);
                                    const label = typeof option === "string" ? option : option.label ?? option.text ?? option.value ?? value;
                                    const selected = answers[currentQuestion] === value;

                                    return (
                                        <label key={`${current.id ?? currentQuestion}-${index}`} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selected ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion}`}
                                                value={value}
                                                checked={selected}
                                                onChange={() => chooseAnswer(value)}
                                                className="mt-1 h-4 w-4 accent-teal-700"
                                            />
                                            <span className="text-sm leading-6 text-slate-700">{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <textarea
                                value={answers[currentQuestion] || ""}
                                onChange={(event) => chooseAnswer(event.target.value)}
                                rows={7}
                                placeholder="Write your answer here…"
                                className="mt-6 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />
                        )}

                        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                disabled={currentQuestion === 0 || submitting}
                                onClick={() => { setError(""); setCurrentQuestion((value) => Math.max(0, value - 1)); }}
                                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <i className="fa-solid fa-arrow-left mr-2" />Previous
                            </button>

                            {currentQuestion < questions.length - 1 ? (
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => {
                                        if (answers[currentQuestion] === undefined || answers[currentQuestion] === "") {
                                            setError("Please answer this question before continuing.");
                                            return;
                                        }
                                        setError("");
                                        setCurrentQuestion((value) => value + 1);
                                    }}
                                    className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    Next question <i className="fa-solid fa-arrow-right ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={submitting || timeLeft <= 0}
                                    onClick={submitAssessment}
                                    className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? "Submitting…" : "Submit assessment"}
                                    {!submitting && <i className="fa-solid fa-check ml-2" />}
                                </button>
                            )}
                        </div>
                    </section>

                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900">Assessment progress</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">Select a question to review your answer.</p>
                        <div className="mt-5 grid grid-cols-5 gap-2 lg:grid-cols-4">
                            {questions.map((question, index) => {
                                const answered = answers[index] !== undefined && answers[index] !== "";
                                const active = currentQuestion === index;
                                return (
                                    <button
                                        key={question.id ?? index}
                                        type="button"
                                        aria-label={`Go to question ${index + 1}`}
                                        onClick={() => { setError(""); setCurrentQuestion(index); }}
                                        className={`grid h-10 place-items-center rounded-lg border text-sm font-bold transition ${active ? "border-teal-700 bg-teal-700 text-white" : answered ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-teal-700" />Current question</p>
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-teal-100 ring-1 ring-teal-200" />Answered</p>
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-200" />Not answered</p>
                        </div>
                        <button type="button" onClick={goBack} className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Exit assessment
                        </button>
                    </aside>
                </div>

                <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                    Your answers are submitted to the server for scoring. Correct answers are not exposed in this screen.
                </p>
            </div>
        </main>
    );
}
