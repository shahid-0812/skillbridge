import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";

const INITIAL_OPTIONS = [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
];

export default function R10_Manual_Question_Entry() {
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
    const requestedQuestionCount = Math.max(
        1,
        Number.parseInt(searchParams.get("questionCount") || location.state?.questionCount || "8", 10) || 8
    );

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(INITIAL_OPTIONS);
    const [correctOption, setCorrectOption] = useState("A");
    const [marks, setMarks] = useState("1");
    const [questionOrder, setQuestionOrder] = useState("1");
    const [savedCount, setSavedCount] = useState(0);
    const [loadingExisting, setLoadingExisting] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        const loadExistingQuestions = async () => {
            setLoadingExisting(true);
            setError("");
            try {
                if (!jobId || !assessmentId) {
                    throw new Error("Missing job or assessment ID. Open this page from Assessment Setup.");
                }
                const response = await apiRequest(
                    `/api/hr/jobs/${encodeURIComponent(jobId)}/assessment/${encodeURIComponent(assessmentId)}/questions`
                );

                const possibleLists = [
                    response?.data?.questions,
                    response?.questions,
                    response?.data?.data?.questions,
                    response?.data
                ];
                const questions = possibleLists.find(Array.isArray);
                if (!questions) {
                    throw new Error("Could not read the existing question list from the server.");
                }

                if (active) {
                    setSavedCount(questions.length);
                    setQuestionOrder(String(questions.length + 1));
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Could not load existing questions.");
                }
            } finally {
                if (active) setLoadingExisting(false);
            }
        };

        loadExistingQuestions();
        return () => { active = false; };
    }, [jobId, assessmentId]);

    const limitReached = savedCount >= requestedQuestionCount;

    const updateOption = (key, text) => {
        setOptions((current) =>
            current.map((option) => option.key === key ? { ...option, text } : option)
        );
    };

    const handleSaveQuestion = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (loadingExisting) {
            setError("Please wait while the existing questions are loaded.");
            return;
        }
        if (limitReached) {
            setError(`You have reached the ${requestedQuestionCount}-question limit. Continue to review the assessment.`);
            return;
        }
        if (!jobId || !assessmentId) {
            setError("Missing job or assessment ID. Open this page from Assessment Setup after creating the assessment.");
            return;
        }

        if (!question.trim()) {
            setError("Enter the question text.");
            return;
        }

        if (options.some((option) => !option.text.trim())) {
            setError("Fill in all four answer options.");
            return;
        }

        if (!options.some((option) => option.key === correctOption)) {
            setError("Choose the correct answer.");
            return;
        }

        const parsedMarks = Number(marks);
        const parsedOrder = Number(questionOrder);
        if (!Number.isFinite(parsedMarks) || parsedMarks <= 0) {
            setError("Marks must be greater than zero.");
            return;
        }
        if (!Number.isInteger(parsedOrder) || parsedOrder <= 0) {
            setError("Question order must be a positive whole number.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                questionText: question.trim(),
                questionType: "MCQ",
                optionA: options[0].text.trim(),
                optionB: options[1].text.trim(),
                optionC: options[2].text.trim(),
                optionD: options[3].text.trim(),
                correctOption,
                marks: parsedMarks,
                questionOrder: parsedOrder,
            };

            await apiRequest(
                `/api/hr/jobs/${encodeURIComponent(jobId)}/assessment/${encodeURIComponent(assessmentId)}/questions`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const nextCount = savedCount + 1;
            setSavedCount(nextCount);
            setSuccess(
                nextCount >= requestedQuestionCount
                    ? `Question ${nextCount} of ${requestedQuestionCount} saved. You have reached the limit. Continue to review the assessment.`
                    : `Question ${nextCount} of ${requestedQuestionCount} saved.`
            );
            setQuestion("");
            setOptions(INITIAL_OPTIONS.map((option) => ({ ...option })));
            setCorrectOption("A");
            setQuestionOrder(String(nextCount + 1));
        } catch (err) {
            setError(err.message || "Could not save the question.");
        } finally {
            setSaving(false);
        }
    };

    const goToReview = () => {
        const params = new URLSearchParams();
        if (jobId) params.set("jobId", jobId);
        if (assessmentId) params.set("assessmentId", assessmentId);
        navigate(`/hr/question-review?${params.toString()}`, {
            state: { jobId, assessmentId },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-500 text-lg text-white shadow-lg shadow-blue-200">
                            <i className="fa-solid fa-shield-halved" />
                        </div>
                        <div>
                            <div className="font-extrabold tracking-tight">SkillVerify</div>
                            <div className="text-xs text-slate-500">Recruiter Workspace</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={goToReview}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                </div>
            </header>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                                <i className="fa-solid fa-pen-to-square" /> Manual question
                            </div>
                            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Add a question</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Write a multiple-choice question and save it directly to this job assessment.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
                                Job ID: {jobId || "Missing"}
                            </span>
                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
                                Assessment ID: {assessmentId || "Missing"}
                            </span>
                            <span className={`rounded-xl border px-3 py-2 font-semibold ${limitReached ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                                Questions: {savedCount}/{requestedQuestionCount}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
                <form onSubmit={handleSaveQuestion} className="space-y-6">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">01</div>
                            <div>
                                <h2 className="text-lg font-extrabold">Question text</h2>
                                <p className="mt-1 text-sm text-slate-500">Keep the wording clear and specific.</p>
                            </div>
                        </div>
                        <textarea
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            rows={5}
                            maxLength={2000}
                            placeholder="For example: Which command helps you inspect the previous logs of a Kubernetes pod?"
                            className="mt-5 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            required
                        />
                        <div className="mt-2 text-right text-xs text-slate-400">{question.length}/2000</div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">02</div>
                            <div>
                                <h2 className="text-lg font-extrabold">Answer options</h2>
                                <p className="mt-1 text-sm text-slate-500">Enter all four options and select the correct answer.</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3">
                            {options.map((option) => {
                                const isCorrect = correctOption === option.key;
                                return (
                                    <div key={option.key} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${isCorrect ? "border-blue-300 bg-blue-50/70" : "border-slate-200 bg-white"}`}>
                                        <label className="flex shrink-0 cursor-pointer items-center gap-2" title={`Mark option ${option.key} as correct`}>
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                value={option.key}
                                                checked={isCorrect}
                                                onChange={() => setCorrectOption(option.key)}
                                                className="h-4 w-4 accent-blue-700"
                                            />
                                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold ${isCorrect ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>{option.key}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(event) => updateOption(option.key, event.target.value)}
                                            placeholder={`Answer option ${option.key}`}
                                            maxLength={1000}
                                            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400"
                                            required
                                        />
                                        {isCorrect && <span className="hidden text-xs font-bold text-blue-700 sm:inline">Correct answer</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs text-slate-400">The current backend supports MCQ questions with exactly four options (A–D).</p>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">03</div>
                            <div>
                                <h2 className="text-lg font-extrabold">Scoring and order</h2>
                                <p className="mt-1 text-sm text-slate-500">Set how much this question is worth and where it appears.</p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Marks
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={marks}
                                    onChange={(event) => setMarks(event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    required
                                />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Question order
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={questionOrder}
                                    onChange={(event) => setQuestionOrder(event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    required
                                />
                            </label>
                        </div>
                    </section>

                    {loadingExisting && (
                        <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                            Loading saved questions and checking the {requestedQuestionCount}-question limit…
                        </div>
                    )}
                    {!loadingExisting && limitReached && (
                        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            You have {savedCount} saved question(s). The limit is {requestedQuestionCount}; adding more is disabled. Click “Next: Review assessment” to continue.
                        </div>
                    )}
                    {error && (
                        <div role="alert" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <i className="fa-solid fa-circle-exclamation mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div role="status" className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <i className="fa-solid fa-circle-check mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={goToReview}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            <i className="fa-solid fa-arrow-left mr-2" /> Back to question review
                        </button>
                        {limitReached ? (
                            <button
                                type="button"
                                onClick={goToReview}
                                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                            >
                                Next: Review assessment <i className="fa-solid fa-arrow-right ml-2" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={saving || loadingExisting || !jobId || !assessmentId || !!error && savedCount === 0}
                                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? <><i className="fa-solid fa-spinner mr-2 animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk mr-2" /> Save question ({savedCount}/{requestedQuestionCount})</>}
                            </button>
                        )}
                    </div>
                </form>

                <aside className="space-y-5">
                    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 p-6 text-white shadow-xl shadow-blue-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                            <i className="fa-solid fa-list-check" />
                        </div>
                        <h2 className="mt-5 text-xl font-extrabold">Make every answer count</h2>
                        <p className="mt-2 text-sm leading-6 text-blue-100/80">
                            A clear question, plausible distractors, and one unambiguous correct answer make scoring more consistent.
                        </p>
                        <div className="mt-6 space-y-3">
                            {["One correct option", "Four answer choices", "Positive marks", "Saved to this assessment"].map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm">
                                    <i className="fa-solid fa-check text-emerald-300" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-extrabold">Question preview</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{question.trim() || "Your question will appear here."}</p>
                        <div className="mt-4 space-y-2">
                            {options.map((option) => (
                                <div key={option.key} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${correctOption === option.key ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-600"}`}>
                                    <span className="font-extrabold">{option.key}.</span>
                                    <span className="min-w-0 break-words">{option.text || `Option ${option.key}`}</span>
                                    {correctOption === option.key && <i className="fa-solid fa-check ml-auto mt-1 shrink-0" />}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                            <span>{marks || 0} mark(s)</span>
                            <span>Question {questionOrder || "—"}</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
