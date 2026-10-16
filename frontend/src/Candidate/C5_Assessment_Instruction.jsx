import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";

const C5_Assessment_Instructions = () => {
    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const [consent, setConsent] = useState(false);

    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "https://skillbridge-adca.onrender.com/api/candidates/me/skills",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        data.error ||
                        "Failed to load your skills"
                    );
                }

                setSkills(data.data.skills || []);
            } catch (err) {
                console.error("Failed to load skills:", err);
                setError(err.message || "Failed to load skills");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();


    }, []);
    const handleSelectSkill = (skill) => {
        setSelectedSkill(skill);
        setConsent(false);
        setError("");
    };
    const handleStartAssessment = async () => {
        if (!selectedSkill || !consent) {
            return;
        }

        try {
            setStarting(true);
            setError("");

            const token = localStorage.getItem("token");

            const skillId = selectedSkill.skill_id;

            /*
             * 1. Check whether this skill already has an assessment attempt.
             *
             * This prevents creating duplicate attempts when:
             * - an attempt was created but not started
             * - an assessment is already in progress
             */
            const statusResponse = await fetch(
                `https://skillbridge-adca.onrender.com/api/candidates/me/skills/${skillId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                throw new Error(
                    statusData.message ||
                    statusData.error ||
                    "Failed to check assessment status"
                );
            }

            const existingAttempt = statusData.data?.attempt;

            /*
             * 2. If an assessment is already STARTED,
             * resume that exact assessment.
             */
            if (existingAttempt?.status === "Started") {
                sessionStorage.setItem(
                    "currentSkillAssessment",
                    JSON.stringify({
                        skillId: skillId,
                        skillName: selectedSkill.skill_name,
                        attemptId: existingAttempt.id,
                    })
                );

                navigate("/candidate/skill-assessment");
                return;
            }

            /*
             * 3. If an assessment was CREATED but never started,
             * start that existing attempt.
             */
            if (existingAttempt?.status === "Created") {
                const startResponse = await fetch(
                    `https://skillbridge-adca.onrender.com/api/candidates/me/skills/${skillId}/verify/start`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const startData = await startResponse.json();

                if (!startResponse.ok) {
                    throw new Error(
                        startData.message ||
                        startData.error ||
                        "Failed to start assessment"
                    );
                }

                const startedAttempt = startData.data?.attempt;

                if (!startedAttempt?.id) {
                    throw new Error("Assessment attempt ID was not returned");
                }

                sessionStorage.setItem(
                    "currentSkillAssessment",
                    JSON.stringify({
                        skillId: skillId,
                        skillName: selectedSkill.skill_name,
                        attemptId: startedAttempt.id,
                    })
                );

                navigate("/candidate/skill-assessment");
                return;
            }

            /*
             * 4. If there is no active attempt,
             * create a new assessment attempt.
             *
             * This also allows a completed/verified skill to be retaken.
             */
            const createResponse = await fetch(
                `https://skillbridge-adca.onrender.com/api/candidates/me/skills/${skillId}/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const createData = await createResponse.json();

            if (!createResponse.ok) {
                throw new Error(
                    createData.message ||
                    createData.error ||
                    "Failed to create assessment"
                );
            }

            /*
             * 5. Start the newly created attempt.
             */
            const startResponse = await fetch(
                `https://skillbridge-adca.onrender.com/api/candidates/me/skills/${skillId}/verify/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const startData = await startResponse.json();

            if (!startResponse.ok) {
                throw new Error(
                    startData.message ||
                    startData.error ||
                    "Failed to start assessment"
                );
            }

            const startedAttempt = startData.data?.attempt;

            if (!startedAttempt?.id) {
                throw new Error("Assessment attempt ID was not returned");
            }

            /*
             * 6. Store the information C6 needs.
             */
            sessionStorage.setItem(
                "currentSkillAssessment",
                JSON.stringify({
                    skillId: skillId,
                    skillName: selectedSkill.skill_name,
                    attemptId: startedAttempt.id,
                })
            );

            /*
             * 7. Move to C6.
             */
            navigate("/candidate/skill-assessment");

        } catch (err) {
            console.error("Failed to start assessment:", err);
            setError(err.message || "Failed to start assessment");
        } finally {
            setStarting(false);
        }
    };
    const assessmentInfo = [
        {
            icon: "fa-list-ol",
            title: "5 questions",
            text: "5 scenario-based questions",
        },
        {
            icon: "fa-clock",
            title: "35 minutes",
            text: "Maximum assessment time",
        },
        {
            icon: "fa-layer-group",
            title: "Skill focused",
            text: "Questions are based on the selected skill",
        },
        {
            icon: "fa-rotate-left",
            title: "Unlimited retakes",
            text: "You can retake the assessment when eligible",
        },
    ];

    const rules = [
        {
            icon: "fa-wifi",
            title: "Stable connection",
            text: "Make sure you have a reliable internet connection before starting.",
        },
        {
            icon: "fa-user-check",
            title: "Complete the assessment yourself",
            text: "Answer the questions based on your own knowledge and practical experience.",
        },
        {
            icon: "fa-expand",
            title: "Focused assessment",
            text: "Stay on the assessment screen while completing your questions.",
        },
        {
            icon: "fa-ban",
            title: "No external assistance",
            text: "Do not use external AI tools, search engines or unauthorized collaboration.",
        },
        {
            icon: "fa-paper-plane",
            title: "Submit carefully",
            text: "Review your answers before submitting because submission may be final.",
        },
    ];

    const checks = [
        {
            icon: "fa-wifi",
            title: "Internet connection",
            status: "Required",
        },
        {
            icon: "fa-clock",
            title: "Time limit",
            status: "35 minutes",
        },
        {
            icon: "fa-list-check",
            title: "Questions",
            status: "5 questions",
        },
    ];

    return (
        <section className="min-h-screen p-8 bg-slate-50">
            {!selectedSkill ? (
                <section className="min-h-screen p-8 bg-slate-50">
                    <div className="max-w-5xl mx-auto">

                        <div className="flex items-center justify-between gap-5 mb-7">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg">
                                    <i className="fa-solid fa-shield-halved" />
                                </div>

                                <div>
                                    <strong className="block text-sm">
                                        SkillVerify
                                    </strong>

                                    <span className="block mt-0.5 text-xs text-slate-500">
                                        Skill verification workspace
                                    </span>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 py-2 px-3 border border-slate-200 rounded-full bg-white text-slate-500 text-xs font-semibold">
                                <i className="fa-solid fa-lock text-green-600" />
                                Secure assessment environment
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-3xl bg-white shadow-xl overflow-hidden">

                            <div className="p-7 text-white bg-gradient-to-br from-blue-950 via-blue-900 to-blue-600">

                                <div className="inline-flex items-center gap-2 py-2 px-3 rounded-full bg-white/10 text-indigo-100 text-xs font-bold tracking-wider">
                                    <i className="fa-solid fa-list-check" />
                                    SKILL VERIFICATION
                                </div>

                                <h1 className="mt-5 mb-2 text-3xl leading-tight font-extrabold">
                                    Choose your assessment
                                </h1>

                                <p className="max-w-2xl m-0 text-indigo-200 leading-relaxed text-sm">
                                    Choose which skill you want to verify first.
                                    You can complete your remaining skill assessments
                                    in any order.
                                </p>

                            </div>

                            <div className="p-8">

                                <div className="mb-6">
                                    <h2 className="m-0 text-lg font-extrabold">
                                        Your selected skills
                                    </h2>

                                    <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                        Select any skill to begin its verification assessment.
                                    </p>
                                </div>

                                {loading && (
                                    <div className="py-10 text-center text-sm text-slate-500">
                                        Loading your skills...
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                {!loading && skills.length === 0 && (
                                    <div className="py-10 text-center text-sm text-slate-500">
                                        No skills found. Please select your skills first.
                                    </div>
                                )}

                                <div className="grid gap-3">

                                    {skills.map((skill) => (
                                        <div
                                            key={skill.skill_id}
                                            className="flex items-center justify-between gap-4 p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-300 hover:shadow-sm transition"
                                        >

                                            <div className="flex items-center gap-4">

                                                <div className="w-11 h-11 flex-shrink-0 grid place-items-center rounded-xl bg-indigo-50 text-blue-600">
                                                    <i className="fa-solid fa-code" />
                                                </div>

                                                <div>
                                                    <strong className="block text-sm">
                                                        {skill.skill_name}
                                                    </strong>

                                                    <span className="block mt-1 text-xs text-slate-500">
                                                        Claimed level:{" "}
                                                        <span className="font-semibold text-slate-700">
                                                            {skill.claimed_level}
                                                        </span>
                                                    </span>
                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSelectSkill(skill)}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition whitespace-nowrap"
                                            >
                                                {skill.verification_status === "Verified"
                                                    ? "Retake Assessment"
                                                    : "Start Assessment"}

                                                <i className="fa-solid fa-arrow-right" />
                                            </button>

                                        </div>
                                    ))}

                                </div>

                                <div className="mt-6 pt-5 border-t border-slate-200">
                                    <BackButton
                                        onClick={() =>
                                            navigate("/candidate/skill-level")
                                        }
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="max-w-7xl mx-auto">

                    {/* TOP BAR */}
                    <div className="flex items-center justify-between gap-5 mb-7">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg">
                                <i className="fa-solid fa-shield-halved" />
                            </div>

                            <div>
                                <strong className="block text-sm">SkillVerify</strong>
                                <span className="block mt-0.5 text-xs text-slate-500">
                                    Skill verification workspace
                                </span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 py-2 px-3 border border-slate-200 rounded-full bg-white text-slate-500 text-xs font-semibold">
                            <i className="fa-solid fa-lock text-green-600" />
                            Secure assessment environment
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* MAIN */}
                        <div className="lg:col-span-2 border border-slate-200 rounded-3xl bg-white shadow-xl overflow-hidden">

                            <div className="p-7 text-white bg-gradient-to-br from-blue-950 via-blue-900 to-blue-600">
                                <div className="inline-flex items-center gap-2 py-2 px-3 rounded-full bg-white/10 text-indigo-100 text-xs font-bold tracking-wider">
                                    <i className="fa-solid fa-flask" />
                                    SKILL VERIFICATION ASSESSMENT
                                </div>

                                <h1 className="mt-5 mb-2 text-3xl leading-tight font-extrabold">
                                    {selectedSkill?.skill_name} Skill Verification
                                </h1>

                                <p className="max-w-3xl m-0 text-indigo-200 leading-relaxed text-sm">
                                    Demonstrate how you apply your skills in realistic technical
                                    situations. This assessment evaluates practical capability,
                                    not simple memorization.
                                </p>

                                <div className="inline-flex items-center gap-2 mt-5 py-2 px-3.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold">
                                    <i className="fa-solid fa-layer-group" />
                                    <span>
                                        Skill assessed: {selectedSkill?.skill_name}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-2 mt-3 py-2 px-3.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold">
                                    <i className="fa-solid fa-chart-simple" />
                                    Claimed level: {selectedSkill?.claimed_level}
                                </div>
                            </div>

                            <div className="pt-7 px-8 pb-8">

                                {/* OVERVIEW */}
                                <div className="mb-4">
                                    <h2 className="m-0 text-lg font-extrabold">Assessment overview</h2>
                                    <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                        Please review the assessment structure before you begin.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {assessmentInfo.map((item) => (
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50" key={item.title}>
                                            <div className="w-9 h-9 grid place-items-center rounded-lg bg-indigo-50 text-blue-600 mb-3">
                                                <i className={`fa-solid ${item.icon}`} />
                                            </div>

                                            <strong className="block text-sm">{item.title}</strong>
                                            <span className="block mt-1 text-slate-500 text-xs leading-snug">
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4 mt-5">
                                    <h2 className="m-0 text-lg font-extrabold">What you'll be assessed on</h2>
                                    <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                        Your real questions will be supplied by the assessment
                                        system when the assessment starts.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 mt-5">

                                    <div className="p-4 border border-slate-200 rounded-xl bg-blue-50">
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <i className="fa-solid fa-triangle-exclamation text-blue-600" />
                                            <strong className="text-sm">5 scenario-based questions</strong>
                                        </div>

                                        <p className="m-0 text-slate-500 text-xs leading-relaxed">
                                            Solve realistic workplace situations and explain how you
                                            would diagnose problems, choose an approach and recover
                                            from failures.
                                        </p>
                                    </div>



                                </div>

                                {/* RULES */}
                                <div className="mb-4 mt-5">
                                    <h2 className="m-0 text-lg font-extrabold">Before you start</h2>
                                    <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                        Complete these checks and make sure you understand the rules.
                                    </p>
                                </div>

                                <div className="grid gap-2.5">
                                    {rules.map((rule) => (
                                        <div className="flex gap-3 items-start py-3 px-3.5 border border-slate-200 rounded-xl" key={rule.title}>
                                            <div className="w-8 h-8 flex-shrink-0 grid place-items-center rounded-lg bg-green-50 text-green-600 text-xs">
                                                <i className={`fa-solid ${rule.icon}`} />
                                            </div>

                                            <div>
                                                <strong className="block text-xs">{rule.title}</strong>
                                                <p className="mt-1 mb-0 text-slate-500 text-xs leading-relaxed">
                                                    {rule.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* CONSENT */}
                                <label className="flex gap-2.5 items-start mt-5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs leading-relaxed cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(event) => setConsent(event.target.checked)}
                                        className="mt-1 accent-blue-600"
                                    />

                                    <span>
                                        I have read and understood the assessment rules. I consent
                                        to the verification measures required for this assessment
                                        and understand that my results may be used for skill
                                        verification and job matching.
                                    </span>
                                </label>

                                {/* ACTIONS */}
                                <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-200 sm:flex-row flex-col sm:items-center items-start">

                                    <BackButton onClick={() => navigate("/candidate/skill-level")} />


                                    <PrimaryButton
                                        onClick={handleStartAssessment}
                                        disabled={!consent || starting}
                                    >
                                        {starting ? "Starting Assessment..." : "Start Assessment"}
                                        <i className="fa-solid fa-arrow-right" />
                                    </PrimaryButton>


                                </div>

                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="grid gap-4">

                            {/* SYSTEM CHECK */}
                            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">

                                <div className="flex items-center gap-2.5 mb-4">
                                    <i className="fa-solid fa-circle-check text-blue-600" />
                                    <strong className="text-sm">Before you begin</strong>
                                </div>

                                <div className="grid gap-2.5">
                                    {checks.map((check) => (
                                        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-200 last:border-b-0" key={check.title}>
                                            <div className="flex items-center gap-2.5 text-xs font-semibold">
                                                <i className={`fa-solid ${check.icon} text-slate-500`} />
                                                {check.title}
                                            </div>

                                            <span className="py-1.5 px-2.5 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                                                {check.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            {/* PROCESS */}
                            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">

                                <div className="flex items-center gap-2.5 mb-4">
                                    <i className="fa-solid fa-route text-blue-600" />
                                    <strong className="text-sm">Assessment process</strong>
                                </div>

                                <div className="grid gap-3.5">

                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 flex-shrink-0 grid place-items-center rounded-full bg-indigo-50 text-blue-600 text-xs font-extrabold">
                                            1
                                        </div>

                                        <div>
                                            <strong className="block text-xs">Instructions</strong>
                                            <span className="block mt-0.5 text-slate-500 text-xs leading-snug">
                                                Review the assessment rules and structure.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 flex-shrink-0 grid place-items-center rounded-full bg-indigo-50 text-blue-600 text-xs font-extrabold">
                                            2
                                        </div>

                                        <div>
                                            <strong className="block text-xs">Assessment</strong>
                                            <span className="block mt-0.5 text-slate-500 text-xs leading-snug">
                                                Complete the 5 scenario-based questions.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 flex-shrink-0 grid place-items-center rounded-full bg-indigo-50 text-blue-600 text-xs font-extrabold">
                                            3
                                        </div>

                                        <div>
                                            <strong className="block text-xs">Evaluation</strong>
                                            <span className="block mt-0.5 text-slate-500 text-xs leading-snug">
                                                Your responses are evaluated against the assessment
                                                criteria.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 flex-shrink-0 grid place-items-center rounded-full bg-indigo-50 text-blue-600 text-xs font-extrabold">
                                            4
                                        </div>

                                        <div>
                                            <strong className="block text-xs">Verified result</strong>
                                            <span className="block mt-0.5 text-slate-500 text-xs leading-snug">
                                                Your skill-level results contribute to your Skill DNA.
                                            </span>
                                        </div>
                                    </div>

                                </div>

                            </div>

                            {/* IMPORTANT NOTE */}
                            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">

                                <div className="flex items-center gap-2.5 mb-4">
                                    <i className="fa-solid fa-circle-info text-blue-600" />
                                    <strong className="text-sm">Important</strong>
                                </div>

                                <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
                                    <i className="fa-solid fa-lightbulb mt-0.5" />

                                    <span>
                                        The questions are generated and delivered by the assessment
                                        system. No sample or placeholder questions are being shown
                                        on this screen.
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            )
            }

        </section >
    );
};

export default C5_Assessment_Instructions;