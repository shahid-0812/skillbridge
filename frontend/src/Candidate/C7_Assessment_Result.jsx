import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SecondaryButton from "../Components/SecondaryButton";
import PrimaryButton from "../Components/PrimaryButton";

const C7_Assessment_Result = () => {
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadResult = () => {
            try {
                const storedResult = sessionStorage.getItem("assessmentResult");

                if (!storedResult) {
                    throw new Error(
                        "Assessment result was not found. Please complete the assessment again."
                    );
                }

                const parsedResult = JSON.parse(storedResult);

                if (
                    parsedResult.score === undefined ||
                    parsedResult.correctAnswers === undefined ||
                    parsedResult.totalQuestions === undefined ||
                    !parsedResult.verifiedLevel
                ) {
                    throw new Error(
                        "Assessment result data is incomplete."
                    );
                }

                setResult(parsedResult);
            } catch (err) {
                console.error("Failed to load assessment result:", err);

                setError(
                    err.message ||
                    "Failed to load assessment result."
                );
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, []);

    const getScoreMessage = (score) => {
        if (score >= 90) {
            return {
                title: "Excellent performance",
                text: "You demonstrated a very strong understanding of the assessed skill.",
            };
        }

        if (score >= 70) {
            return {
                title: "Strong performance",
                text: "You demonstrated a solid understanding of the assessed skill.",
            };
        }

        if (score >= 40) {
            return {
                title: "Good foundation",
                text: "You have a good foundation with some areas that can be strengthened.",
            };
        }

        return {
            title: "Keep improving",
            text: "Use this result to identify areas where you can continue improving.",
        };
    };

    const handleCertificate = () => {
        alert(
            "Certificate download will be connected to the backend certificate service."
        );
    };

    if (loading) {
        return (
            <section className="min-h-screen grid place-items-center bg-slate-50 px-5">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 grid place-items-center rounded-2xl bg-indigo-50 text-blue-600 text-xl">
                        <i className="fa-solid fa-spinner fa-spin" />
                    </div>

                    <h2 className="text-lg font-extrabold">
                        Loading assessment result...
                    </h2>

                    <p className="mt-2 text-slate-500 text-xs">
                        Please wait while we load your result.
                    </p>
                </div>
            </section>
        );
    }

    if (error || !result) {
        return (
            <section className="min-h-screen grid place-items-center bg-slate-50 px-5">
                <div className="max-w-lg w-full p-7 text-center border border-slate-200 rounded-3xl bg-white shadow-lg">
                    <div className="w-14 h-14 mx-auto mb-4 grid place-items-center rounded-2xl bg-red-50 text-red-600 text-xl">
                        <i className="fa-solid fa-circle-exclamation" />
                    </div>

                    <h1 className="text-lg font-extrabold">
                        Result unavailable
                    </h1>

                    <p className="mt-2 text-slate-500 text-xs leading-relaxed">
                        {error ||
                            "The assessment result could not be loaded."}
                    </p>

                    <div className="mt-5">
                        <PrimaryButton
                            onClick={() =>
                                navigate(
                                    "/candidate/skill-assessment"
                                )
                            }
                        >
                            Back to Assessment
                            <i className="fa-solid fa-arrow-left" />
                        </PrimaryButton>
                    </div>
                </div>
            </section>
        );
    }

    const scoreMessage = getScoreMessage(result.score);

    const score = Number(result.score) || 0;
    const correctAnswers = Number(result.correctAnswers) || 0;
    const totalQuestions = Number(result.totalQuestions) || 5;

    const incorrectAnswers = Math.max(
        totalQuestions - correctAnswers,
        0
    );

    return (
        <section className="min-h-screen pt-7 px-8 pb-11 bg-slate-50">
            <div className="w-full max-w-7xl mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-start gap-5 mb-6">

                    <div className="flex items-start gap-3.5">

                        <div className="w-12 h-12 flex-shrink-0 grid place-items-center rounded-2xl text-white bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg">
                            <i className="fa-solid fa-chart-column" />
                        </div>

                        <div>
                            <h1 className="m-0 text-2xl font-extrabold leading-tight">
                                Assessment Result
                            </h1>

                            <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                Your skill verification assessment has been evaluated.
                            </p>
                        </div>

                    </div>

                    <div className="inline-flex items-center gap-2 py-2 px-3 rounded-full bg-green-50 text-green-700 text-xs font-extrabold">
                        <i className="fa-solid fa-shield-check" />
                        Verified Result
                    </div>

                </header>


                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

                    {/* LEFT SUMMARY */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-3xl bg-white shadow-lg p-7 text-center">

                        {/* SCORE CIRCLE */}
                        <div className="w-48 h-48 mt-1 mx-auto mb-5 relative grid place-items-center">

                            <svg
                                viewBox="0 0 190 190"
                                className="absolute inset-0 w-full h-full -rotate-90"
                            >

                                <circle
                                    cx="95"
                                    cy="95"
                                    r="78"
                                    fill="none"
                                    className="stroke-slate-100"
                                    strokeWidth="15"
                                />

                                <circle
                                    cx="95"
                                    cy="95"
                                    r="78"
                                    fill="none"
                                    className="stroke-green-600"
                                    strokeWidth="15"
                                    strokeLinecap="round"
                                    strokeDasharray="490"
                                    strokeDashoffset={
                                        490 - (490 * score) / 100
                                    }
                                />

                            </svg>

                            <div className="relative z-10 text-center">

                                <div className="text-5xl leading-none font-black text-slate-900">
                                    {score}%
                                </div>

                                <div className="mt-1.5 text-slate-500 text-xs">
                                    Overall Score
                                </div>

                            </div>

                        </div>


                        {/* VERIFIED LEVEL */}
                        <h2 className="m-0 text-lg font-extrabold">
                            Skill Verification
                        </h2>

                        <div className="inline-flex items-center gap-2 mt-3 py-2 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold">
                            <i className="fa-solid fa-circle-check" />
                            {result.verifiedLevel}
                        </div>


                        <p className="mt-4 mx-auto max-w-xs text-slate-500 text-xs leading-relaxed">
                            {scoreMessage.text}
                        </p>


                        {/* PERFORMANCE MESSAGE */}
                        <div className="my-5 p-3.5 rounded-xl bg-slate-50 text-left">

                            <div className="text-xs font-extrabold mb-1.5">
                                <i className="fa-solid fa-chart-simple" />
                                &nbsp;
                                {scoreMessage.title}
                            </div>

                            <div className="text-slate-500 text-xs leading-relaxed">
                                Your verified skill level based on this assessment is{" "}
                                <strong>{result.verifiedLevel}</strong>.
                            </div>

                        </div>


                        {/* ACTIONS */}
                        <div className="grid gap-2.5">

                            <PrimaryButton
                                onClick={() =>
                                    navigate("/candidate/skill-dna", {
                                        state: {
                                            result,
                                        },
                                    })
                                }
                            >
                                View full Skill DNA
                                <i className="fa-solid fa-arrow-right" />
                            </PrimaryButton>


                            <SecondaryButton onClick={handleCertificate}>
                                <i className="fa-solid fa-certificate" />
                                Download certificate
                            </SecondaryButton>

                        </div>


                        {/* STATS */}
                        <div className="grid grid-cols-3 gap-2.5 mt-5">

                            <div className="py-3 px-2 border border-slate-200 rounded-xl bg-white">

                                <strong className="block text-sm font-extrabold">
                                    {totalQuestions}
                                </strong>

                                <span className="block mt-1 text-slate-500 text-xs">
                                    Total questions
                                </span>

                            </div>


                            <div className="py-3 px-2 border border-slate-200 rounded-xl bg-white">

                                <strong className="block text-sm font-extrabold">
                                    {correctAnswers}
                                </strong>

                                <span className="block mt-1 text-slate-500 text-xs">
                                    Correct answers
                                </span>

                            </div>


                            <div className="py-3 px-2 border border-slate-200 rounded-xl bg-white">

                                <strong className="block text-sm font-extrabold">
                                    {result.verifiedLevel}
                                </strong>

                                <span className="block mt-1 text-slate-500 text-xs">
                                    Verified level
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-3 border border-slate-200 rounded-3xl bg-white shadow-lg p-7">

                        {/* PERFORMANCE BREAKDOWN */}
                        <div className="flex justify-between items-center gap-4 mb-5">

                            <h2 className="m-0 text-base font-extrabold">
                                Assessment performance
                            </h2>

                            <span className="text-slate-500 text-xs">
                                {totalQuestions} questions
                            </span>

                        </div>


                        <div className="grid gap-5">

                            {/* SCORE */}
                            <div className="pb-4 border-b border-slate-200">

                                <div className="flex justify-between items-center gap-4 mb-2">

                                    <span className="text-xs font-bold">
                                        Overall assessment score
                                    </span>

                                    <span className="text-xs font-extrabold">
                                        {score}%
                                    </span>

                                </div>

                                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                                        style={{
                                            width: `${score}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* CORRECT ANSWERS */}
                            <div className="pb-4 border-b border-slate-200">

                                <div className="flex justify-between items-center gap-4 mb-2">

                                    <span className="text-xs font-bold">
                                        Correct answers
                                    </span>

                                    <span className="text-xs font-extrabold">
                                        {correctAnswers} / {totalQuestions}
                                    </span>

                                </div>

                                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                                        style={{
                                            width: `${totalQuestions > 0
                                                    ? (correctAnswers /
                                                        totalQuestions) *
                                                    100
                                                    : 0
                                                }%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* INCORRECT ANSWERS */}
                            <div className="pb-4 border-b border-slate-200">

                                <div className="flex justify-between items-center gap-4 mb-2">

                                    <span className="text-xs font-bold">
                                        Incorrect answers
                                    </span>

                                    <span className="text-xs font-extrabold">
                                        {incorrectAnswers} / {totalQuestions}
                                    </span>

                                </div>

                                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-500"
                                        style={{
                                            width: `${totalQuestions > 0
                                                    ? (incorrectAnswers /
                                                        totalQuestions) *
                                                    100
                                                    : 0
                                                }%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* VERIFIED LEVEL */}
                            <div className="pb-4 border-b border-slate-200">

                                <div className="flex justify-between items-center gap-4 mb-2">

                                    <span className="text-xs font-bold">
                                        Verified skill level
                                    </span>

                                    <span className="text-xs font-extrabold">
                                        {result.verifiedLevel}
                                    </span>

                                </div>

                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 grid place-items-center rounded-xl bg-white text-blue-600">
                                            <i className="fa-solid fa-award" />
                                        </div>

                                        <div>

                                            <strong className="block text-sm">
                                                {result.verifiedLevel}
                                            </strong>

                                            <span className="block mt-1 text-slate-500 text-xs">
                                                This level has been assigned based on your assessment score.
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* PERFORMANCE INSIGHT */}
                        <div className="mt-6 p-4 rounded-2xl border border-indigo-100 bg-indigo-50">

                            <div className="flex items-center gap-2.5 mb-1.5 text-xs font-extrabold">

                                <i className="fa-solid fa-lightbulb text-blue-600" />

                                Performance insight

                            </div>

                            <p className="m-0 text-slate-500 text-xs leading-relaxed">
                                You answered{" "}
                                <strong>
                                    {correctAnswers} out of {totalQuestions}
                                </strong>{" "}
                                questions correctly and received a verified level of{" "}
                                <strong>{result.verifiedLevel}</strong>.
                            </p>

                        </div>


                        {/* NEXT STEP */}
                        <div className="mt-5 p-5 rounded-2xl bg-blue-950 text-white flex flex-col">

                            <div className="flex items-center gap-2.5">

                                <i className="fa-solid fa-dna text-blue-300" />

                                <strong className="text-xs">
                                    Continue to Skill DNA
                                </strong>

                            </div>

                            <p className="mt-2 mb-3.5 text-slate-300 text-xs leading-relaxed">
                                Your verified skill result can now contribute to your overall Skill DNA profile.
                            </p>

                            <PrimaryButton
                                onClick={() =>
                                    navigate("/candidate/skill-dna", {
                                        state: {
                                            result,
                                        },
                                    })
                                }
                            >
                                Explore Skill DNA
                                <i className="fa-solid fa-arrow-right" />
                            </PrimaryButton>

                        </div>

                    </div>

                </div>


                {/* FOOTER */}
                <div className="flex items-center justify-between gap-4 mt-5 py-3.5">

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-slate-500 bg-transparent border-0 cursor-pointer text-xs hover:text-slate-900"
                        onClick={() =>
                            navigate(
                                "/candidate/skills/assessment-instruction"
                            )
                        }
                    >
                        <i className="fa-solid fa-arrow-left" />
                        Back to assessment
                    </button>


                    <span className="text-slate-500 text-xs">
                        Assessment result verified by the assessment system.
                    </span>

                </div>

            </div>
        </section>
    );
};

export default C7_Assessment_Result;