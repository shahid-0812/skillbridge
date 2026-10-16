import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";

export default function R7_Assessment_Setup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get("jobId");
    const [questions, setQuestions] = useState(8);
    const [timeLimit, setTimeLimit] = useState(28);
    const [passingScore, setPassingScore] = useState(65);
    const [instructions, setInstructions] = useState("Answer all questions. Select one option for each multiple-choice question.");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const continueToQuestions = async () => {
        setError("");
        if (!jobId) return setError("Job ID is missing from the URL. Open this page from the job creation flow.");
        if (!localStorage.getItem("token")) return navigate("/hr/login");
        if (!Number.isInteger(Number(questions)) || Number(questions) < 1 || Number(questions) > 50) return setError("Number of questions must be between 1 and 50.");
        if (!Number.isFinite(Number(passingScore)) || Number(passingScore) < 0 || Number(passingScore) > 100) return setError("Passing score must be between 0 and 100.");
        setLoading(true);
        try {
            const result = await apiRequest(`/api/hr/jobs/${encodeURIComponent(jobId)}/assessment`, {
                method: "POST",
                body: JSON.stringify({
                    title: "Job Assessment",
                    instructions: instructions.trim() || null,
                    passingScore: Number(passingScore),
                    durationMinutes: Number(timeLimit),
                }),
            });
            const assessmentId = result?.data?.assessment?.id;
            if (!assessmentId) throw new Error("Assessment was created but the API did not return its ID.");
            navigate(`/hr/manual-questions?jobId=${encodeURIComponent(jobId)}&assessmentId=${encodeURIComponent(assessmentId)}&questionCount=${Number(questions)}`, { state: { jobId, assessmentId, assessment: result.data.assessment, questionCount: Number(questions) } });
        } catch (err) {
            setError(err.message || "Could not create the assessment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-xl text-white">✓</div><div><p className="font-extrabold">SkillVerify</p><p className="text-xs text-slate-500">Recruiter Workspace</p></div></div><button onClick={() => navigate("/hr/jobs")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Exit</button></div></header>
            <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700">ASSESSMENT SETUP · STEP 4 OF 4</span><h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Configure the assessment</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Set the time limit and passing score, create the draft assessment, and then add questions manually.</p><div className="mt-7 grid grid-cols-4 gap-2 text-xs font-semibold sm:gap-4">{["Job details", "Responsibilities", "Required skills", "Assessment"].map((step, i) => <div key={step} className={`rounded-lg px-2 py-3 text-center ${i === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}><span className="mr-1">{i < 3 ? "✓" : "4"}</span>{step}</div>)}</div></div></section>
            <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.8fr)] lg:px-8">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><h2 className="text-lg font-bold">Assessment configuration</h2><p className="mt-1 text-sm text-slate-500">These settings will be saved to the backend.</p></div>
                    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-semibold text-blue-900">Manual questions</p><p className="mt-1 text-sm text-blue-800">AI question generation is skipped. The next step should use the manual MCQ entry page.</p></div>
                    <div className="grid gap-5 sm:grid-cols-3"><label className="block text-sm font-semibold">Number of questions<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min="1" max="50" value={questions} onChange={e => setQuestions(e.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">1–50 questions</span></label><label className="block text-sm font-semibold">Time limit<select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))}><option value={20}>20 minutes</option><option value={28}>28 minutes</option><option value={40}>40 minutes</option><option value={60}>60 minutes</option></select></label><label className="block text-sm font-semibold">Passing score (%)<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min="0" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">0–100%</span></label></div>
                    <label className="mt-6 block text-sm font-semibold">Candidate instructions<textarea className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} maxLength={2000} /></label>
                    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><button disabled={loading} onClick={() => navigate(`/hr/create-job/skills?jobId=${encodeURIComponent(jobId || "")}`)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">← Back</button><button disabled={loading} onClick={continueToQuestions} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Saving assessment…" : "Save & add questions →"}</button></div>
                </section>
                <aside className="space-y-5"><div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-500 p-6 text-white shadow-lg"><div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-2xl">◎</div><h2 className="mt-5 text-xl font-extrabold">A consistent evaluation</h2><p className="mt-2 text-sm leading-6 text-blue-50">Every candidate receives the same assessment rules and passing threshold.</p><div className="mt-6 grid grid-cols-3 gap-2">{[[questions, "Questions"], [`${timeLimit}m`, "Duration"], [`${passingScore}%`, "Pass score"]].map(([value, label]) => <div key={label} className="rounded-xl bg-white/10 p-3 text-center"><p className="text-lg font-extrabold">{value}</p><p className="mt-1 text-xs text-blue-100">{label}</p></div>)}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Backend connection</h3><p className="mt-2 text-sm leading-6 text-slate-500">Creates a draft assessment using <code className="rounded bg-slate-100 px-1">POST /api/hr/jobs/:jobId/assessment</code>. Questions are added on the next page.</p></div></aside>
            </main>
        </div>
    );
}
