import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const C8_Skill_DNA = () => {
    const navigate = useNavigate();
    const location = useLocation();

    /*
     * ============================================================
     * BACKEND INTEGRATION
     * ============================================================
     *
     * Later the backend will provide:
     * - overall Skill DNA score
     * - verified skills
     * - skill levels
     * - assessment performance
     * - practical task history
     * - career fit
     * - strengths
     * - growth areas
     *
     * For now these values are FRONTEND PREVIEW DATA ONLY.
     */

    const skillDNA = location.state?.skillDNA || {
        overallScore: 84,
        level: "Advanced",
        percentile: 28,
        improvement: 12,

        verifiedSkills: 6,
        practicalTasks: 12,
        handsOnTime: "7h 24m",
        successRate: 92,

        commandsExecuted: 145,
        scenariosSolved: 8,

        careerFit: 88,
        careerRole: "DevOps Engineer",

        verificationStatus: "Integrity Verified",

        strengths: [
            {
                name: "Problem solving",
                score: 91,
            },
            {
                name: "Command proficiency",
                score: 88,
            },
            {
                name: "System recovery",
                score: 93,
            },
        ],

        growthAreas: [
            {
                name: "Networking concepts",
                score: 68,
            },
            {
                name: "Shell scripting",
                score: 75,
            },
            {
                name: "CI/CD automation",
                score: 79,
            },
        ],
    };

    const topSkills = [
        {
            name: "Linux",
            score: 91,
            level: "Expert",
        },
        {
            name: "Git",
            score: 87,
            level: "Expert",
        },
        {
            name: "Docker",
            score: 82,
            level: "Expert",
        },
        {
            name: "CI/CD",
            score: 79,
            level: "Advanced",
        },
        {
            name: "Shell Scripting",
            score: 75,
            level: "Advanced",
        },
        {
            name: "Networking",
            score: 68,
            level: "Intermediate",
        },
    ];

    const downloadReport = () => {
        /*
         * Later this will call the backend report-generation API.
         */

        const report = `
SKILLVERIFY — SKILL DNA REPORT
================================

Overall Skill DNA Score: ${skillDNA.overallScore}%
Level: ${skillDNA.level}

Verified Skills: ${skillDNA.verifiedSkills}
Practical Tasks Completed: ${skillDNA.practicalTasks}
Hands-on Time: ${skillDNA.handsOnTime}
Success Rate: ${skillDNA.successRate}%

Career Fit:
${skillDNA.careerRole} — ${skillDNA.careerFit}%

VERIFIED SKILLS
----------------
${topSkills
                .map(
                    (skill) =>
                        `${skill.name}: ${skill.score}% — ${skill.level}`
                )
                .join("\n")}

Verification Status:
${skillDNA.verificationStatus}

This report will be replaced by the official backend-generated
Skill DNA report after system integration.
`;

        const blob = new Blob([report], {
            type: "text/plain",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "Skill-DNA-Report.txt";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <section className="min-h-screen pt-7 px-8 pb-11 bg-slate-50">
            <div className="w-full max-w-screen-2xl mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-start gap-5 mb-6">

                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 flex-shrink-0 grid place-items-center rounded-2xl text-white bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg">
                            <i className="fa-solid fa-dna" />
                        </div>

                        <div>
                            <h1 className="m-0 text-2xl font-extrabold leading-tight">Your Skill DNA</h1>
                            <p className="mt-1.5 mb-0 text-slate-500 text-xs leading-relaxed">
                                A verified, evidence-backed map of your technical
                                strengths, capabilities and growth areas.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2.5">
                        <button type="button" className="btn btn-outline" onClick={downloadReport}>
                            <i className="fa-solid fa-download" />
                            Download report
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate("/candidate/jobs")}
                        >
                            <i className="fa-solid fa-briefcase" />
                            Browse jobs
                        </button>
                    </div>
                </header>

                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* Overall Score */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-chart-line text-blue-600" />
                            Overall Skill DNA
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 flex-shrink-0 relative grid place-items-center">
                                <svg viewBox="0 0 92 92" className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="46" cy="46" r="37" fill="none" className="stroke-slate-100" strokeWidth="9" />
                                    <circle
                                        cx="46"
                                        cy="46"
                                        r="37"
                                        fill="none"
                                        className="stroke-blue-600"
                                        strokeWidth="9"
                                        strokeLinecap="round"
                                        strokeDasharray="232.5"
                                        strokeDashoffset={232.5 - (232.5 * skillDNA.overallScore) / 100}
                                    />
                                </svg>

                                <div className="relative z-10 text-center">
                                    <div className="text-lg font-black text-slate-900">{skillDNA.overallScore}%</div>
                                    <div className="text-slate-500 text-xs">Score</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-extrabold">{skillDNA.level}</div>
                                <div className="mt-1 text-slate-500 text-xs leading-snug">
                                    Top {skillDNA.percentile}% of candidates in your target role.
                                </div>
                                <div className="inline-flex items-center gap-1.5 mt-2 text-green-700 text-xs font-extrabold">
                                    <i className="fa-solid fa-arrow-up" />
                                    {skillDNA.improvement}% since last assessment
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Skills */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-shield-check text-blue-600" />
                            Verified skills
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.verifiedSkills}</div>
                        <div className="mt-2 text-slate-500 text-xs">
                            Skills verified through practical assessment
                        </div>

                        <span className="badge badge-green mt-10">
                            <i className="fa-solid fa-circle-check" />
                            Verified
                        </span>
                    </div>

                    {/* Practical Work */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-terminal text-blue-600" />
                            Practical experience
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.practicalTasks}</div>
                        <div className="mt-2 text-slate-500 text-xs">Practical tasks completed</div>

                        <div className="inline-flex items-center gap-1.5 mt-2 text-green-700 text-xs font-extrabold">
                            {skillDNA.handsOnTime} hands-on time
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-bullseye text-blue-600" />
                            Success rate
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.successRate}%</div>
                        <div className="mt-2 text-slate-500 text-xs">Successful practical outcomes</div>

                        <span className="badge badge-green mt-10">
                            <i className="fa-solid fa-check" />
                            Strong
                        </span>
                    </div>
                </div>

                {/* MAIN SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-18">

                    {/* RADAR */}
                    <div className="lg:col-span-5 border border-slate-200 rounded-2xl bg-white shadow-sm p-5">
                        <div className="flex justify-between items-center gap-4 mb-5">
                            <h2 className="m-0 text-sm font-extrabold">Verified skills radar</h2>
                            <span className="text-slate-500 text-xs">Evidence-backed capability profile</span>
                        </div>

                        <svg className="w-full h-72" viewBox="0 0 360 285">
                            {/* Outer radar */}
                            <g className="stroke-slate-200" fill="none">
                                <polygon points="180,25 302,96 302,190 180,260 58,190 58,96" />
                                <polygon points="180,65 268,116 268,170 180,220 92,170 92,116" />
                                <polygon points="180,105 232,135 232,150 180,180 128,150 128,135" />
                            </g>

                            {/* Radar axes */}
                            <g className="stroke-slate-200" strokeWidth="1">
                                <line x1="180" y1="25" x2="180" y2="260" />
                                <line x1="58" y1="96" x2="302" y2="190" />
                                <line x1="58" y1="190" x2="302" y2="96" />
                            </g>

                            {/* Capability polygon */}
                            <polygon
                                points="180,40 284,105 270,182 180,235 92,175 75,103"
                                className="fill-blue-600/15 stroke-blue-600"
                                strokeWidth="2.5"
                            />

                            {/* Labels */}
                            <g fontFamily="Poppins" fontSize="10" className="fill-slate-700" fontWeight="600">
                                <text x="180" y="15" textAnchor="middle">
                                    Linux 91%
                                </text>
                                <text x="308" y="92">
                                    Git 87%
                                </text>
                                <text x="308" y="195">
                                    Docker 82%
                                </text>
                                <text x="180" y="280" textAnchor="middle">
                                    CI/CD 79%
                                </text>
                                <text x="52" y="195" textAnchor="end">
                                    Networking 68%
                                </text>
                                <text x="52" y="92" textAnchor="end">
                                    Scripting 75%
                                </text>
                            </g>
                        </svg>
                    </div>

                    {/* TOP SKILLS */}
                    <div className="lg:col-span-4 border border-slate-200 rounded-2xl bg-white shadow-sm p-5">
                        <div className="flex justify-between items-center gap-4 mb-5">
                            <h2 className="m-0 text-sm font-extrabold">Top verified skills</h2>
                            <span className="text-slate-500 text-xs">6 skills</span>
                        </div>

                        <div className="grid gap-1.5">
                            {topSkills.map((skill) => (
                                <div className="py-3 border-b border-slate-200 last:border-b-0" key={skill.name}>
                                    <div className="flex justify-between items-center gap-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-600" />

                                            <div>
                                                <strong className="text-xs">{skill.name}</strong>
                                                <div className="mt-1 text-slate-500 text-xs">{skill.level}</div>
                                            </div>
                                        </div>

                                        <div className="text-xs font-extrabold">{skill.score}%</div>
                                    </div>

                                    <div className="h-1.5 mt-2 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                            style={{ width: `${skill.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="lg:col-span-3 grid gap-5">

                        {/* DNA STATUS */}
                        <div className="min-h-36 p-6 text-white rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 shadow-xl">
                            <div className="w-10 h-10 grid place-items-center rounded-xl bg-white/10 text-blue-200 text-lg">
                                <i className="fa-solid fa-dna" />
                            </div>

                            <div className="mt-3.5 text-sm font-extrabold">{skillDNA.level} Practitioner</div>

                            <div className="mt-1.5 text-slate-300 text-xs leading-relaxed">
                                Your Skill DNA combines verified skills,
                                assessment evidence and practical performance
                                into one professional capability profile.
                            </div>

                            <span className="badge badge-green mt-12">
                                <i className="fa-solid fa-shield-check" />
                                {skillDNA.verificationStatus}
                            </span>
                        </div>

                        {/* CAREER FIT */}
                        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-5">
                            <div className="flex justify-between items-center gap-4 mb-5">
                                <h2 className="m-0 text-sm font-extrabold">Career fit</h2>
                                <span className="text-slate-500 text-xs">Target role</span>
                            </div>

                            <div className="flex items-center justify-center gap-5">
                                <svg className="w-24 h-24 flex-shrink-0" viewBox="0 0 90 90">
                                    <circle cx="45" cy="45" r="36" fill="none" className="stroke-slate-100" strokeWidth="9" />
                                    <circle
                                        cx="45"
                                        cy="45"
                                        r="36"
                                        fill="none"
                                        className="stroke-green-600"
                                        strokeWidth="9"
                                        strokeLinecap="round"
                                        strokeDasharray="226"
                                        strokeDashoffset={226 - (226 * skillDNA.careerFit) / 100}
                                        transform="rotate(-90 45 45)"
                                    />
                                    <text
                                        x="45"
                                        y="50"
                                        textAnchor="middle"
                                        fontSize="17"
                                        fontWeight="800"
                                        className="fill-slate-900"
                                    >
                                        {skillDNA.careerFit}%
                                    </text>
                                </svg>

                                <div>
                                    <strong className="block text-sm">{skillDNA.careerRole}</strong>
                                    <span className="block mt-1.5 text-slate-500 text-xs leading-snug">
                                        Excellent alignment with your
                                        verified technical capabilities.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STRENGTHS + GROWTH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-18">

                    {/* STRENGTHS */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-5">
                        <div className="flex items-center gap-2.5 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-star text-amber-500" />
                            Your strengths
                        </div>

                        <div className="grid gap-3.5">
                            {skillDNA.strengths.map((item) => (
                                <div className="flex justify-between items-center gap-4" key={item.name}>
                                    <span className="text-xs">{item.name}</span>
                                    <span className="min-w-10 text-right text-xs font-extrabold">{item.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GROWTH */}
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-5">
                        <div className="flex items-center gap-2.5 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-seedling text-green-600" />
                            Growth areas
                        </div>

                        <div className="grid gap-3.5">
                            {skillDNA.growthAreas.map((item) => (
                                <div className="flex justify-between items-center gap-4" key={item.name}>
                                    <span className="text-xs">{item.name}</span>
                                    <span className="min-w-10 text-right text-xs font-extrabold">{item.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ACTIVITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-18">
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-list-check text-blue-600" />
                            Practical tasks
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.practicalTasks}</div>
                        <div className="mt-2 text-slate-500 text-xs">Completed successfully</div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-regular fa-clock text-blue-600" />
                            Hands-on time
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.handsOnTime}</div>
                        <div className="mt-2 text-slate-500 text-xs">Practical learning and assessment time</div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-terminal text-blue-600" />
                            Commands executed
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.commandsExecuted}</div>
                        <div className="mt-2 text-slate-500 text-xs">Technical actions recorded</div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm min-h-36 p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold">
                            <i className="fa-solid fa-puzzle-piece text-blue-600" />
                            Scenarios solved
                        </div>

                        <div className="text-2xl font-extrabold leading-none">{skillDNA.scenariosSolved}</div>
                        <div className="mt-2 text-slate-500 text-xs">Real-world technical scenarios</div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between gap-4 mt-5 pt-1">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 border-0 bg-transparent text-slate-500 cursor-pointer text-xs hover:text-slate-900"
                        onClick={() => navigate("/candidate/assessment-result")}
                    >
                        <i className="fa-solid fa-arrow-left" />
                        Back to assessment result
                    </button>

                    <span className="text-slate-500 text-xs">
                        Skill DNA values shown currently are frontend preview data
                        and will be synchronized with the backend.
                    </span>
                </div>
            </div>
        </section>
    );
};

export default C8_Skill_DNA;