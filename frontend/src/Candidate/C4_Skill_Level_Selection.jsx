import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";

const C4_Skill_Level_Selection = () => {
    const navigate = useNavigate();

    // These are the skills selected on C4.
    // Later, these will come from the backend/database.
    const [skills, setSkills] = useState([]);
    const [levels, setLevels] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSelectedSkills = async () => {
            try {
                setLoading(true);
                setError("");

                const savedSkillIds = sessionStorage.getItem(
                    "candidateSelectedSkillIds"
                );

                if (!savedSkillIds) {
                    throw new Error(
                        "No skills were selected. Please go back and select your skills."
                    );
                }

                const skillIds = JSON.parse(savedSkillIds);

                if (!Array.isArray(skillIds) || skillIds.length === 0) {
                    throw new Error(
                        "No skills were selected. Please go back and select your skills."
                    );
                }

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "https://skillbridge-adca.onrender.com/api/skills",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load skills"
                    );
                }

                const allSkills = data.data.skills || [];

                const selected = allSkills.filter((skill) =>
                    skillIds.includes(Number(skill.id))
                );

                setSkills(selected);

                const initialLevels = {};

                selected.forEach((skill) => {
                    initialLevels[skill.id] = "";
                });

                setLevels(initialLevels);
            } catch (error) {
                console.error(
                    "Failed to load selected skills:",
                    error
                );

                setError(
                    error.message || "Failed to load selected skills"
                );
            } finally {
                setLoading(false);
            }
        };

        loadSelectedSkills();
    }, []);

    const selectLevel = (skillId, level) => {
        setLevels((current) => ({
            ...current,
            [skillId]: level,
        }));
    };
    const completedCount = Object.keys(levels).filter(
        (skill) => levels[skill]
    ).length;

    const getLevelClasses = (level, selected) => {
        const base =
            "rounded-lg min-h-11 cursor-pointer text-xs font-bold transition";

        if (!selected) {
            return `${base} border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-slate-50`;
        }

        const selectedColor =
            level === "Basic"
                ? "bg-slate-500"
                : level === "Intermediate"
                    ? "bg-blue-600"
                    : "bg-violet-600";

        return `${base} border border-transparent text-white shadow-md ${selectedColor}`;
    };
    const handleContinue = async () => {
        if (skills.length === 0) {
            alert("No skills selected.");
            return;
        }

        const incompleteSkills = skills.filter(
            (skill) => !levels[skill.id]
        );

        if (incompleteSkills.length > 0) {
            alert(
                "Please select a level for every skill before continuing."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const token = localStorage.getItem("token");

            for (const skill of skills) {
                const response = await fetch(
                    "https://skillbridge-adca.onrender.com/api/candidates/me/skills",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            skill_id: Number(skill.id),
                            claimed_level: levels[skill.id],
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        `Failed to save ${skill.skill_name}`
                    );
                }
            }

            sessionStorage.removeItem(
                "candidateSelectedSkillIds"
            );

            navigate("/candidate/skills/assessment-instruction");
        } catch (error) {
            console.error(
                "Failed to save skills:",
                error
            );

            setError(
                error.message || "Failed to save skills"
            );
        } finally {
            setSaving(false);
        }
    };
    return (
        <section className="min-h-screen bg-slate-50 text-slate-900 pt-8 px-7 pb-16">
            <div className="flex items-center justify-center gap-3 mb-8 overflow-x-auto p-1">
                <Step number="✓" label="Account" status="done" />
                <div className="w-16 h-0.5 bg-blue-600 shrink-0" />
                <Step number="2" label="Profile" status="done" />
                <div className="w-16 h-0.5 bg-gray-200 shrink-0" />
                <Step number="3" label="Skills" status="current" />
                <div className="w-16 h-0.5 bg-gray-200 shrink-0" />
                <Step number="4" label="Preferences" status="" />
                <div className="w-16 h-0.5 bg-gray-200 shrink-0" />
                <Step number="5" label="Verification" status="" />
            </div>
            <div className="max-w-7xl w-full mx-auto">


                {/* STEPPER */}
                {/* <div className="flex items-center py-5 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-x-auto">

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border border-indigo-200 bg-indigo-50 text-blue-600">
                            <i className="fa-solid fa-check"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-500">Account</span>
                    </div>

                    <div className="h-px min-w-9 flex-1 bg-indigo-200 mx-2.5"></div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border border-indigo-200 bg-indigo-50 text-blue-600">
                            <i className="fa-solid fa-check"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-500">Profile</span>
                    </div>

                    <div className="h-px min-w-9 flex-1 bg-indigo-200 mx-2.5"></div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border border-indigo-200 bg-indigo-50 text-blue-600">
                            <i className="fa-solid fa-check"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-500">Skills</span>
                    </div>

                    <div className="h-px min-w-9 flex-1 bg-indigo-200 mx-2.5"></div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold bg-blue-600 text-white shadow-md">
                            4
                        </div>
                        <span className="text-xs font-bold text-slate-900">Skill level</span>
                    </div>

                    <div className="h-px min-w-9 flex-1 bg-slate-200 mx-2.5"></div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border border-slate-200 bg-slate-50 text-slate-500">
                            5
                        </div>
                        <span className="text-xs font-bold text-slate-500">Verification</span>
                    </div>

                </div> */}

                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-7 text-white shadow-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700">

                        <div className="absolute w-56 h-56 rounded-full -right-24 -top-24 bg-white/10"></div>

                        <div className="relative text-xs tracking-widest font-extrabold text-indigo-300 mb-2">
                            SKILL CALIBRATION
                        </div>

                        <h1 className="relative m-0 text-3xl leading-tight tracking-tight font-extrabold">
                            Tell us where you are today.
                        </h1>

                        <p className="relative max-w-2xl mt-3 text-indigo-200 text-sm leading-relaxed">
                            Choose the level that best represents your current ability
                            for each selected skill. Your assessment will adapt to these
                            levels so your final verification reflects your actual capability.
                        </p>

                        <div className="relative inline-flex items-center gap-2 mt-5 py-2 px-3 rounded-lg bg-white/10 border border-white/10 text-indigo-100 text-xs font-semibold">
                            <i className="fa-solid fa-lightbulb"></i>
                            Be honest — accuracy matters more than a higher starting level.
                        </div>

                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

                        <div className="flex justify-between items-center text-xs font-bold mb-3">
                            <span>Skill levels completed</span>
                            <strong className="text-blue-600 text-lg">
                                {completedCount}/{skills.length}
                            </strong>
                        </div>

                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"
                                style={{
                                    width: `${(completedCount / skills.length) * 100}%`,
                                }}
                            ></div>
                        </div>

                        <p className="mt-3 text-slate-500 text-xs leading-relaxed">
                            Select one level for every skill before continuing to
                            verification.
                        </p>

                    </div>

                </div> */}

                {/* SKILL LEVEL SECTION */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">

                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="m-0 text-lg font-extrabold tracking-tight">
                                Rate your current skill level
                            </h2>
                            <p className="mt-1.5 mb-0 text-slate-500 text-xs">
                                These are the skills you selected on the previous step.
                            </p>
                        </div>

                        <div className="py-2 px-3 rounded-full bg-indigo-50 text-blue-600 text-xs font-extrabold whitespace-nowrap">
                            {skills.length} skills selected
                        </div>
                    </div>
                    {loading && (
                        <div className="col-span-full text-center py-10 text-slate-500 text-sm">
                            Loading your selected skills...
                        </div>
                    )}

                    {error && (
                        <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {skills.map((skill) => {
                            const currentLevel = levels[skill.id];

                            return (
                                <div
                                    className="border border-slate-200 rounded-2xl p-5 bg-slate-50 transition hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                                    key={skill.id}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-blue-600 text-sm">
                                                <i className="fa-solid fa-code"></i>
                                            </div>

                                            <div>
                                                <h3 className="m-0 text-sm font-extrabold">{skill.skill_name}</h3>
                                                <p className="mt-1 mb-0 text-slate-500 text-xs">
                                                    {skill.description}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-xs py-1.5 px-2.5 rounded-full bg-indigo-50 text-blue-600 whitespace-nowrap font-extrabold">
                                            {currentLevel}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {["Basic", "Intermediate", "Advanced"].map((level) => {
                                            const selected = currentLevel === level;

                                            return (
                                                <button
                                                    type="button"
                                                    key={level}
                                                    className={getLevelClasses(level, selected)}
                                                    onClick={() => selectLevel(skill.id, level)}
                                                >
                                                    {selected && (
                                                        <i className="fa-solid fa-check mr-1.5"></i>
                                                    )}
                                                    {level}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* LEVEL EXPLANATION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                            <strong className="block text-xs mb-1.5">Basic</strong>
                            <span className="block text-slate-500 text-xs leading-relaxed">
                                You understand the fundamentals and can complete
                                guided tasks.
                            </span>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                            <strong className="block text-xs mb-1.5">Intermediate</strong>
                            <span className="block text-slate-500 text-xs leading-relaxed">
                                You can work independently on common real-world
                                tasks and troubleshoot issues.
                            </span>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                            <strong className="block text-xs mb-1.5">Advanced</strong>
                            <span className="block text-slate-500 text-xs leading-relaxed">
                                You can handle complex problems, optimize solutions
                                and guide others.
                            </span>
                        </div>
                    </div>

                </div>

                {/* WHY THIS MATTERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                    <div className="rounded-2xl p-5 border border-indigo-200 bg-indigo-50">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-blue-600 mb-3">
                            <i className="fa-solid fa-sliders"></i>
                        </div>

                        <h3 className="mb-1.5 text-sm font-extrabold">Why does your level matter?</h3>

                        <p className="m-0 text-slate-500 text-xs leading-relaxed">
                            SkillVerify uses your selected level to calibrate the
                            verification experience. This helps create a more meaningful
                            skill score instead of treating every candidate the same.
                        </p>
                    </div>

                    <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-blue-600 mb-3">
                            <i className="fa-solid fa-chart-line"></i>
                        </div>

                        <h3 className="mb-1.5 text-sm font-extrabold">Your level can change</h3>

                        <p className="m-0 text-slate-500 text-xs leading-relaxed">
                            Your selected level is only your starting point. Your
                            verification result will provide evidence-based scores for
                            your actual demonstrated capability.
                        </p>
                    </div>

                </div>

                <div className="flex items-center justify-between gap-4 mt-5">
                    <BackButton onClick={() => navigate("/candidate/skills")} />



                    <PrimaryButton
                        onClick={handleContinue}
                        disabled={saving || loading}
                    >
                        {saving ? "Saving..." : "Continue to Verification"}
                        <i className="fa-solid fa-arrow-right" />
                    </PrimaryButton>

                </div>
            </div>
        </section>
    );
};
function Step({ number, label, status }) {
    const active = status === "done" || status === "current";

    return (
        <div
            className={`flex items-center gap-1.5 shrink-0 text-xs font-bold ${active ? "text-blue-600" : "text-gray-400"
                }`}
        >
            <div
                className={`w-7 h-7 rounded-full grid place-items-center border text-xs ${status === "done"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : status === "current"
                        ? "border-blue-600 text-blue-600 ring-4 ring-blue-600/10 bg-white"
                        : "border-gray-200 bg-white"
                    }`}
            >
                {number}
            </div>
            <span>{label}</span>
        </div>
    );
}
export default C4_Skill_Level_Selection;