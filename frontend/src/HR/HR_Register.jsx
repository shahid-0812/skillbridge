import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const HR_Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        companyName: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim().toLowerCase();
        const companyName = form.companyName.trim();

        if (!firstName || !lastName || !email || !companyName || !form.password || !form.confirmPassword) {
            setError("Please complete all fields.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiRequest("/api/hr-auth/register", {
                method: "POST",
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    companyName,
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                }),
            });

            const token = response?.data?.token;
            if (!token) {
                throw new Error("Registration succeeded, but the server did not return a login token. Please sign in using your new account.");
            }

            // The registration endpoint creates the HR user and company membership.
            // Its returned JWT can be used by the protected HR routes.
            localStorage.setItem("token", token);
            navigate("/hr/dashboard", { replace: true });
        } catch (registerError) {
            console.error("HR registration failed:", registerError);
            setError(registerError.message || "Unable to create your recruiter account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f6fc] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(34,37,80,0.12)] lg:grid-cols-2">
                {/* Brand panel */}
                <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#211b65] via-[#3830a0] to-[#6257f2] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
                    <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/15" />
                    <div className="absolute -right-8 -top-4 h-48 w-48 rounded-full border border-white/15" />
                    <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#3930a3] shadow-lg">S</div>
                        <div>
                            <p className="text-lg font-bold tracking-tight">SkillVerify</p>
                            <p className="text-xs text-indigo-100">ACADEMIA • INDUSTRY • CAREERS</p>
                        </div>
                    </div>

                    <div className="relative z-10 my-12 max-w-md">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-50">
                            <span className="h-2 w-2 rounded-full bg-emerald-300" /> RECRUITER REGISTRATION
                        </div>
                        <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                            Build your team
                            <br />with verified skills.
                        </h1>
                        <p className="mt-5 max-w-sm text-base leading-7 text-indigo-100">
                            Create your company workspace to publish opportunities, assess relevant skills, and manage your hiring process.
                        </p>
                        <div className="mt-10 space-y-4">
                            {[
                                "Set up your recruiter workspace",
                                "Create structured job opportunities",
                                "Use manual MCQ assessments to evaluate applicants",
                            ].map((item) => (
                                <div className="flex items-center gap-3" key={item}>
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm text-white">✓</span>
                                    <span className="text-sm text-indigo-50">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-indigo-200">One workspace for skill-focused hiring.</p>
                </section>

                {/* Registration form */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4338ca] text-lg font-black text-white">S</div>
                            <div>
                                <p className="font-bold text-[#191847]">SkillVerify</p>
                                <p className="text-xs text-slate-500">Recruiter workspace</p>
                            </div>
                        </div>

                        <div className="mb-7">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#5b50d6]">Get started</p>
                            <h2 className="text-3xl font-bold tracking-tight text-[#171735] sm:text-[2.1rem]">Register your company</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">Create an HR account to start publishing skill-focused jobs.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="hr-first-name" className="mb-2 block text-sm font-semibold text-slate-700">First name</label>
                                    <input id="hr-first-name" name="firstName" type="text" autoComplete="given-name" required maxLength={80} placeholder="First name" value={form.firstName} onChange={updateField} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b60e8] focus:ring-4 focus:ring-[#6b60e8]/10" />
                                </div>
                                <div>
                                    <label htmlFor="hr-last-name" className="mb-2 block text-sm font-semibold text-slate-700">Last name</label>
                                    <input id="hr-last-name" name="lastName" type="text" autoComplete="family-name" required maxLength={80} placeholder="Last name" value={form.lastName} onChange={updateField} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b60e8] focus:ring-4 focus:ring-[#6b60e8]/10" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="hr-company-name" className="mb-2 block text-sm font-semibold text-slate-700">Company name</label>
                                <input id="hr-company-name" name="companyName" type="text" autoComplete="organization" required maxLength={150} placeholder="Your company name" value={form.companyName} onChange={updateField} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b60e8] focus:ring-4 focus:ring-[#6b60e8]/10" />
                            </div>

                            <div>
                                <label htmlFor="hr-register-email" className="mb-2 block text-sm font-semibold text-slate-700">Work email address</label>
                                <input id="hr-register-email" name="email" type="email" autoComplete="email" required maxLength={255} placeholder="you@company.com" value={form.email} onChange={updateField} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b60e8] focus:ring-4 focus:ring-[#6b60e8]/10" />
                            </div>

                            <div>
                                <label htmlFor="hr-register-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#6b60e8] focus-within:ring-4 focus-within:ring-[#6b60e8]/10">
                                    <input id="hr-register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" value={form.password} onChange={updateField} className="h-12 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="ml-3 shrink-0 text-xs font-semibold text-slate-500 transition hover:text-[#4d43c6]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="hr-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
                                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#6b60e8] focus-within:ring-4 focus-within:ring-[#6b60e8]/10">
                                    <input id="hr-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="Re-enter your password" value={form.confirmPassword} onChange={updateField} className="h-12 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                                    <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="ml-3 shrink-0 text-xs font-semibold text-slate-500 transition hover:text-[#4d43c6]" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{showConfirmPassword ? "Hide" : "Show"}</button>
                                </div>
                            </div>

                            <p className="text-xs leading-5 text-slate-500">Use at least 8 characters. Your company workspace will be created with your account.</p>

                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">{error}</div>
                            )}

                            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4b40cf] px-5 text-sm font-semibold text-white shadow-lg shadow-[#4b40cf]/20 transition hover:bg-[#3d34b6] focus:outline-none focus:ring-4 focus:ring-[#4b40cf]/20 disabled:cursor-not-allowed disabled:opacity-60">
                                {loading ? (
                                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Creating account...</>
                                ) : (
                                    <>Create recruiter account <span aria-hidden="true">→</span></>
                                )}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-slate-600">
                            Already have a recruiter account?{" "}
                            <Link to="/hr/login" className="font-semibold text-[#4b40cf] hover:text-[#31289f] hover:underline">Sign in</Link>
                        </p>
                        <p className="mt-6 text-center text-xs leading-5 text-slate-400">By creating an account, you confirm that you are authorized to register this company workspace.</p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default HR_Register;
