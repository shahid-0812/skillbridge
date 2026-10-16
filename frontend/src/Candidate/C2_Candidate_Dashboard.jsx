import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const C2_Candidate_Dashboard = () => {
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const profileResponse =
                    await apiRequest("/api/candidates/me");

                setCandidate(profileResponse.data.candidate);

                try {
                    const skillsResponse =
                        await apiRequest("/api/candidates/me/skills");

                    setSkills(skillsResponse.data.skills || []);
                } catch (skillError) {
                    console.error(
                        "Failed to load skills:",
                        skillError
                    );

                    setSkills([]);
                }
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load your dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    /* LOGOUT */
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("candidate");

        sessionStorage.clear();

        navigate("/");
    };

    /* LOADING */
    if (loading) {
        return (
            <section className="min-h-screen bg-slate-50 px-6 py-10">
                <div className="max-w-screen-2xl mx-auto animate-pulse">

                    <div className="h-4 w-40 rounded bg-slate-200" />

                    <div className="h-9 w-72 rounded-lg bg-slate-200 mt-3" />

                    <div className="h-4 w-96 max-w-full rounded bg-slate-200 mt-3" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
                        <div className="h-24 rounded-xl bg-white border border-slate-200" />
                        <div className="h-24 rounded-xl bg-white border border-slate-200" />
                        <div className="h-24 rounded-xl bg-white border border-slate-200" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                        <div className="h-80 rounded-2xl bg-white border border-slate-200" />
                        <div className="h-80 rounded-2xl bg-white border border-slate-200" />
                    </div>

                </div>
            </section>
        );
    }

    /* ERROR */
    if (error) {
        return (
            <section className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

                <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-center">

                    <div className="w-12 h-12 mx-auto grid place-items-center rounded-xl bg-red-50 text-red-600">
                        <i className="fa-solid fa-triangle-exclamation" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-5 h-10 px-5 rounded-lg bg-[#4338ec] text-white text-sm font-semibold hover:bg-[#3730a3] transition cursor-pointer"
                    >
                        Try again
                    </button>

                </div>

            </section>
        );
    }

    const firstName =
        candidate?.first_name || "Candidate";

    /* PROFILE COMPLETION */

    const profileComplete =
        Boolean(candidate?.first_name) &&
        Boolean(candidate?.last_name) &&
        Boolean(candidate?.professional_headline) &&
        Boolean(candidate?.phone_number) &&
        Boolean(candidate?.country) &&
        Boolean(candidate?.state) &&
        Boolean(candidate?.city);

    /* VERIFIED SKILLS */

    const verifiedSkills =
        skills.filter(
            (skill) =>
                skill.verification_status === "Verified"
        );

    const claimedSkills = skills.length;

    const verificationProgress =
        claimedSkills > 0
            ? Math.round(
                (verifiedSkills.length / claimedSkills) * 100
            )
            : 0;

    return (
        <section className="min-h-screen bg-slate-50 text-slate-900">

            <div className="w-full max-w-screen-2xl mx-auto px-6 lg:px-8 pt-7 pb-14">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-7">

                    <div>

                        <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.16em] text-blue-600 uppercase">

                            <span className="w-2 h-2 rounded-full bg-blue-600" />

                            Candidate Dashboard

                        </div>

                        <h1 className="mt-2 text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-950">

                            Welcome back, {firstName} 👋

                        </h1>

                        <p className="mt-2 text-sm text-slate-500">

                            Keep your profile and verified skills
                            ready for your next opportunity.

                        </p>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate-profile-setup"
                                )
                            }
                            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                        >

                            <i className="fa-solid fa-user-pen" />

                            Edit profile

                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition cursor-pointer"
                        >

                            <i className="fa-solid fa-right-from-bracket" />

                            Logout

                        </button>

                    </div>

                </header>


                {/* =====================================================
                    QUICK STATUS
                ====================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

                    <StatusCard
                        icon="fa-user"
                        label="Profile"
                        value={
                            profileComplete
                                ? "Complete"
                                : "Incomplete"
                        }
                        detail={
                            profileComplete
                                ? "Your basic profile is ready"
                                : "Complete your basic information"
                        }
                        complete={profileComplete}
                    />

                    <StatusCard
                        icon="fa-code"
                        label="Verified skills"
                        value={verifiedSkills.length}
                        detail={
                            verifiedSkills.length === 0
                                ? "No skills verified yet"
                                : `${claimedSkills} skill${claimedSkills === 1
                                    ? ""
                                    : "s"
                                } added`
                        }
                        complete={
                            verifiedSkills.length > 0
                        }
                    />

                    <StatusCard
                        icon="fa-chart-simple"
                        label="Verification progress"
                        value={`${verificationProgress}%`}
                        detail={
                            claimedSkills === 0
                                ? "Add skills to begin verification"
                                : "Based on your added skills"
                        }
                        complete={
                            claimedSkills > 0 &&
                            verifiedSkills.length > 0
                        }
                    />

                </div>


                {/* =====================================================
                    PROFILE + SKILLS
                ====================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


                    {/* PROFILE */}

                    <DashboardCard
                        icon="fa-user"
                        title="Your Profile"
                        description="Keep your professional information complete and up to date."
                        action={
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/candidate-profile-setup"
                                    )
                                }
                                className="h-10 px-4 rounded-lg bg-[#4338ec] text-white text-sm font-semibold hover:bg-[#3730a3] transition cursor-pointer"
                            >
                                Edit Profile
                            </button>
                        }
                    >

                        <div className="space-y-3">

                            <DashboardItem
                                done={
                                    Boolean(
                                        candidate?.first_name &&
                                        candidate?.last_name
                                    )
                                }
                                text="Basic information"
                            />

                            <DashboardItem
                                done={Boolean(
                                    candidate?.professional_headline
                                )}
                                text="Professional headline"
                            />

                            <DashboardItem
                                done={
                                    Boolean(
                                        candidate?.country &&
                                        candidate?.state &&
                                        candidate?.city
                                    )
                                }
                                text="Location"
                            />

                            <DashboardItem
                                done={Boolean(
                                    candidate?.phone_number
                                )}
                                text="Phone number"
                            />

                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

                            <span className="text-xs text-slate-500">

                                {profileComplete
                                    ? "Your basic profile is complete."
                                    : "A few details still need attention."}

                            </span>

                            <span
                                className={`text-xs font-bold ${profileComplete
                                        ? "text-green-600"
                                        : "text-amber-600"
                                    }`}
                            >

                                {profileComplete
                                    ? "100%"
                                    : "In progress"}

                            </span>

                        </div>

                    </DashboardCard>


                    {/* SKILLS */}

                    <DashboardCard
                        icon="fa-code"
                        title="Skills Verification"
                        description="Verify your skills through skill-based assessments."
                        action={
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/candidate/skills"
                                    )
                                }
                                className="h-10 px-4 rounded-lg bg-[#4338ec] text-white text-sm font-semibold hover:bg-[#3730a3] transition cursor-pointer"
                            >

                                {verifiedSkills.length > 0
                                    ? "Manage skills"
                                    : "Add skills"}

                            </button>
                        }
                    >

                        {verifiedSkills.length > 0 ? (

                            <div className="space-y-2.5">

                                <div className="flex items-center justify-between mb-3">

                                    <span className="text-sm font-bold text-slate-800">
                                        Verified skills
                                    </span>

                                    <span className="text-xs font-semibold text-green-600">
                                        {verifiedSkills.length} verified
                                    </span>

                                </div>


                                {verifiedSkills
                                    .slice(0, 3)
                                    .map((skill) => (

                                        <div
                                            key={skill.id}
                                            className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                        >

                                            <div className="flex items-center gap-3 min-w-0">

                                                <div className="w-8 h-8 flex-shrink-0 grid place-items-center rounded-lg bg-green-50 text-green-600">

                                                    <i className="fa-solid fa-check text-xs" />

                                                </div>

                                                <div className="min-w-0">

                                                    <div className="text-sm font-semibold text-slate-800 truncate">

                                                        {skill.skill_name}

                                                    </div>

                                                    <div className="text-xs text-slate-500 mt-0.5">

                                                        Verified skill

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="text-right flex-shrink-0">

                                                <div className="text-xs font-bold text-blue-600">

                                                    {skill.verified_level}

                                                </div>

                                                <div className="text-xs text-slate-500 mt-0.5">

                                                    {skill.verified_score}/100

                                                </div>

                                            </div>

                                        </div>

                                    ))}


                                {verifiedSkills.length > 3 && (

                                    <p className="pt-1 text-xs text-slate-500">

                                        + {verifiedSkills.length - 3} more
                                        verified{" "}

                                        {verifiedSkills.length - 3 === 1
                                            ? "skill"
                                            : "skills"}

                                    </p>

                                )}

                            </div>

                        ) : (

                            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">

                                <div className="flex gap-3">

                                    <div className="w-9 h-9 flex-shrink-0 grid place-items-center rounded-lg bg-white text-blue-600 shadow-sm">

                                        <i className="fa-solid fa-shield-halved" />

                                    </div>

                                    <div>

                                        <h3 className="text-sm font-bold text-slate-800">

                                            Start skill verification

                                        </h3>

                                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">

                                            Add your skills and verify your
                                            knowledge through skill-based
                                            assessments.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </DashboardCard>

                </div>


                {/* =====================================================
                    CAREER JOURNEY
                ====================================================== */}

                <section className="mt-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-blue-600 grid place-items-center">

                            <i className="fa-solid fa-compass" />

                        </div>

                        <div>

                            <h2 className="text-lg font-bold">

                                Your Career Journey

                            </h2>

                            <p className="text-xs text-slate-500 mt-1">

                                Continue building your profile and
                                verified skill record.

                            </p>

                        </div>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        <JourneyCard
                            icon="fa-user"
                            title="Profile"
                            description="Maintain your professional information."
                            buttonText="Edit Profile"
                            onClick={() =>
                                navigate(
                                    "/candidate-profile-setup"
                                )
                            }
                            active={profileComplete}
                        />

                        <JourneyCard
                            icon="fa-code"
                            title="Skills"
                            description="Select and verify your technical skills."
                            buttonText="Manage Skills"
                            onClick={() =>
                                navigate(
                                    "/candidate/skills"
                                )
                            }
                            active={
                                verifiedSkills.length > 0
                            }
                        />

                        <JourneyCard
                            icon="fa-briefcase"
                            title="Jobs"
                            description="Explore opportunities that match your profile."
                            buttonText="View Jobs"
                            onClick={() =>
                                navigate(
                                    "/candidate/jobs"
                                )
                            }
                            active={false}
                        />

                    </div>

                </section>


                {/* FOOTER */}

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">

                    <span>
                        Keep your profile and verified skills up to date.
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/candidate/skills"
                            )
                        }
                        className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                    >

                        Manage verification

                        <i className="fa-solid fa-arrow-right ml-2" />

                    </button>

                </div>

            </div>

        </section>
    );
};


/* ============================================================
   DASHBOARD CARD
============================================================ */

function DashboardCard({
    icon,
    title,
    description,
    action,
    children,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="flex items-start justify-between gap-4 mb-5">

                <div className="flex items-center gap-3 min-w-0">

                    <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-indigo-50 text-blue-600 grid place-items-center">

                        <i
                            className={`fa-solid ${icon}`}
                        />

                    </div>

                    <div className="min-w-0">

                        <h2 className="text-lg font-bold text-slate-900">

                            {title}

                        </h2>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                            {description}

                        </p>

                    </div>

                </div>

                {action}

            </div>

            {children}

        </div>
    );
}


/* ============================================================
   STATUS CARD
============================================================ */

function StatusCard({
    icon,
    label,
    value,
    detail,
    complete,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-4">

            <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0">

                    <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-slate-50 text-slate-600 grid place-items-center">

                        <i
                            className={`fa-solid ${icon} text-sm`}
                        />

                    </div>

                    <div className="min-w-0">

                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">

                            {label}

                        </div>

                        <div className="text-lg font-extrabold text-slate-900 mt-0.5">

                            {value}

                        </div>

                    </div>

                </div>

                <i
                    className={`fa-solid ${complete
                            ? "fa-circle-check text-green-500"
                            : "fa-circle text-slate-200"
                        }`}
                />

            </div>

            <p className="mt-2 pl-12 text-xs text-slate-500 truncate">

                {detail}

            </p>

        </div>
    );
}


/* ============================================================
   DASHBOARD ITEM
============================================================ */

function DashboardItem({
    done,
    text,
}) {
    return (
        <div className="flex items-center gap-3 text-sm">

            <i
                className={`fa-solid ${done
                        ? "fa-circle-check text-green-600"
                        : "fa-circle text-slate-300"
                    }`}
            />

            <span
                className={
                    done
                        ? "text-slate-700"
                        : "text-slate-400"
                }
            >
                {text}
            </span>

            <span className="ml-auto text-xs font-medium">

                {done ? (
                    <span className="text-green-600">
                        Done
                    </span>
                ) : (
                    <span className="text-slate-400">
                        Pending
                    </span>
                )}

            </span>

        </div>
    );
}


/* ============================================================
   JOURNEY CARD
============================================================ */

function JourneyCard({
    icon,
    title,
    description,
    buttonText,
    onClick,
    active,
}) {
    return (
        <div className="group border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition">

            <div className="flex items-center justify-between gap-3">

                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-blue-600 grid place-items-center">

                    <i
                        className={`fa-solid ${icon}`}
                    />

                </div>

                {active && (
                    <span className="text-[11px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">

                        Active

                    </span>
                )}

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">

                {title}

            </h3>

            <p className="text-xs text-slate-500 mt-2 min-h-[40px] leading-relaxed">

                {description}

            </p>

            <button
                type="button"
                onClick={onClick}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >

                {buttonText}

                <i className="fa-solid fa-arrow-right ml-2" />

            </button>

        </div>
    );
}

export default C2_Candidate_Dashboard;