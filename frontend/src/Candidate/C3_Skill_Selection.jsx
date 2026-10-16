import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../Components/PrimaryButton";
import BackButton from "../Components/BackButton";


const C3_Skill_Selection = () => {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");



    useEffect(() => {
        const loadSkills = async () => {
            try {
                setLoading(true);
                setError("");

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

                setSkills(data.data.skills || []);
            } catch (error) {
                console.error("Failed to load skills:", error);
                setError(error.message || "Failed to load skills");
            } finally {
                setLoading(false);
            }
        };

        loadSkills();
    }, []);
    useEffect(() => {
        const savedSkills = sessionStorage.getItem(
            "candidateSelectedSkillIds"
        );

        if (savedSkills) {
            try {
                const parsedSkills = JSON.parse(savedSkills);

                if (Array.isArray(parsedSkills)) {
                    setSelectedSkills(parsedSkills);
                }
            } catch (error) {
                console.error(
                    "Failed to restore selected skills:",
                    error
                );
            }
        }
    }, []);



    const filteredSkills = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return skills;
        }

        return skills.filter((skill) =>
            skill.skill_name.toLowerCase().includes(value)
        );
    }, [skills, search]);

    function toggleSkill(skillId) {
        setSelectedSkills((current) => {
            if (current.includes(skillId)) {
                return current.filter((id) => id !== skillId);
            }

            if (current.length >= 40) {
                alert("You can select up to 40 skills.");
                return current;
            }

            return [...current, skillId];
        });
    }

    function removeSkill(skillId) {
        setSelectedSkills((current) =>
            current.filter((id) => id !== skillId)
        );
    }
    function handleContinue() {
        if (selectedSkills.length === 0) {
            alert("Please select at least one skill.");
            return;
        }

        setSaving(true);

        sessionStorage.setItem(
            "candidateSelectedSkillIds",
            JSON.stringify(selectedSkills)
        );

        navigate("/candidate/skills/selection");
    }
    return (
        <section className="min-h-screen bg-slate-50 text-slate-900 pt-8 px-10 pb-16 box-border">
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
            <div className="max-w-7xl mx-auto">

                {/* TOP HEADER */}
                <div className="flex justify-between items-center gap-5 mb-7">
                    <div>
                        <div className="text-xs font-extrabold tracking-widest text-blue-700 mb-2">
                            SKILL VERIFICATION
                        </div>

                        <h1 className="m-0 text-3xl leading-tight font-extrabold tracking-tight">
                            Choose the skills you want to verify
                        </h1>

                        <p className="mt-2.5 mb-0 text-slate-500 text-sm max-w-3xl">
                            Select the technical and professional skills you want to
                            demonstrate through SkillVerify assessments.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">
                    <div className="lg:col-span-2 min-w-0">

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
                            <div className="text-sm font-bold mb-2.5">Search the skill library</div>

                            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5">
                                <span className="text-slate-500 text-lg">⌕</span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search skills..."
                                    className="w-full border-0 outline-none bg-transparent py-3.5 font-sans text-sm text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Selected skills */}
                        <div className="bg-linear-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-5 mb-5">
                            <div className="flex justify-between items-center gap-4 mb-3.5">
                                <div>
                                    <h2 className="m-0 text-base font-extrabold">Your selected skills</h2>
                                    <p className="mt-1 mb-0 text-xs text-slate-500">
                                        These skills will be used for verification.
                                    </p>
                                </div>

                                <span className="bg-blue-700 text-white rounded-full py-1.5 px-2.5 text-xs font-extrabold">
                                    {selectedSkills.length} selected
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedSkills.map((skillId) => {
                                    const skill = skills.find(
                                        (item) => Number(item.id) === Number(skillId)
                                    );

                                    if (!skill) return null;

                                    return (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            onClick={() => removeSkill(skill.id)}
                                            className="border border-indigo-200 bg-white text-blue-700 rounded-full py-2 px-2.5 text-xs font-bold cursor-pointer"
                                        >
                                            ✓ {skill.skill_name} ×
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Skill categories */}
                        {loading && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                                Loading skills...
                            </div>
                        )}

                        {error && (
                            <div className="bg-white border border-red-200 rounded-2xl p-10 text-center text-red-600">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredSkills.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {filteredSkills.map((skill) => {
                                        const selected = selectedSkills.includes(
                                            Number(skill.id)
                                        );

                                        return (
                                            <button
                                                key={skill.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleSkill(Number(skill.id))
                                                }
                                                className={`rounded-lg py-2.5 px-3 text-left font-sans text-xs cursor-pointer transition ${selected
                                                    ? "border border-indigo-200 bg-indigo-50 text-blue-700 font-extrabold"
                                                    : "border border-slate-200 bg-white text-slate-700 font-semibold"
                                                    }`}
                                            >
                                                <span
                                                    className={`mr-1.5 font-black ${selected
                                                        ? "text-green-600"
                                                        : "text-slate-400"
                                                        }`}
                                                >
                                                    {selected ? "✓" : "+"}
                                                </span>

                                                {skill.skill_name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!loading && !error && filteredSkills.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                                No skills found for{" "}
                                <strong className="text-slate-900">
                                    "{search}"
                                </strong>
                            </div>
                        )}

                        {/* Bottom actions */}
                        <div className="flex items-center justify-between gap-4 mt-5">
                            <BackButton onClick={() => navigate("/candidate-profile-setup")} />



                            <PrimaryButton
                                onClick={handleContinue}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Continue to Skills"}
                                <i className="fa-solid fa-arrow-right" />
                            </PrimaryButton>

                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
}

/* PROGRESS STEP */
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

/* SKILL CATEGORY */


/* INFO CARD */
function InfoCard({ icon, label, title, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-blue-700 flex items-center justify-center font-extrabold">
                    {icon}
                </div>

                <div>
                    {label && (
                        <div className="text-xs font-extrabold tracking-wider text-blue-700 mb-0.5">
                            {label}
                        </div>
                    )}

                    <h3 className="m-0 text-sm font-extrabold">{title}</h3>
                </div>
            </div>

            <div className="text-slate-500 text-xs leading-relaxed">{children}</div>
        </div>
    );
}

/* INFO POINT */
function InfoPoint({ text }) {
    return (
        <div className="flex gap-2 items-start mt-2 text-slate-700 font-semibold">
            <span className="text-green-600 font-black">✓</span>
            <span>{text}</span>
        </div>
    );
}

export default C3_Skill_Selection