import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import apiRequest from '../services/api';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");

        if (!firstName.trim() || !lastName.trim()) {
            setError("First name and last name are required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // 1. Create the account
            await apiRequest("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password,
                    confirmPassword,
                }),
            });

            // 2. Automatically log the new user in
            const loginResponse = await apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            // 3. Save JWT token
            const token = loginResponse.data.token;
            localStorage.setItem("token", token);

            // 4. New candidates must complete their profile
            navigate("/candidate-profile-setup");

        } catch (error) {
            console.error("Registration failed:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-white px-5 py-10">
            <div className="flex flex-col gap-6 w-full max-w-xl p-10 shadow-xl border border-[#00000011] rounded-3xl">
                <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-3xl bold">Welcome back</h1>
                    <span className="text-sm text-[#8b8b8b]">Sign in to continue to your SkillVerify account</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm bold">First Name</label>
                        <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 focus-within:border-[#6053f0] transition duration-300">
                            <i className="bi bi-person text-[#a0a0a0]"></i>
                            <input
                                type="text"
                                placeholder="Alex"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                className="w-full outline-none text-sm placeholder:text-[#a0a0a0]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm bold">Last Name</label>
                        <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 focus-within:border-[#6053f0] transition duration-300">
                            <i className="bi bi-envelope text-[#a0a0a0]"></i>
                            <input
                                type="text"
                                placeholder="John"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                className="w-full outline-none text-sm placeholder:text-[#a0a0a0]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm bold">Email address</label>
                    <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 focus-within:border-[#6053f0] transition duration-300">
                        <i className="bi bi-envelope text-[#a0a0a0]"></i>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full outline-none text-sm placeholder:text-[#a0a0a0]"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm bold">Password</label>
                        <a href="#" className="text-sm semibold text-[#6053f0] hover:opacity-80 transition duration-300">
                            Forgot password?
                        </a>
                    </div>
                    <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 focus-within:border-[#6053f0] transition duration-300">
                        <i className="bi bi-lock text-[#a0a0a0]"></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full outline-none text-sm placeholder:text-[#a0a0a0]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer text-[#a0a0a0] hover:text-[#6053f0] transition duration-300"
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm bold">Confirm Password</label>

                    <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 focus-within:border-[#6053f0] transition duration-300">
                        <i className="bi bi-lock text-[#a0a0a0]"></i>

                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="w-full outline-none text-sm placeholder:text-[#a0a0a0]"
                        />
                    </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2 -mt-2">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        className="w-4 h-4 accent-[#6053f0] cursor-pointer"
                    />
                    <span className="text-sm text-[#4a4a4a]">Remember me</span>
                </div>
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#4338ec] px-8 py-4 rounded-lg text-sm text-white w-full semibold hover:opacity-90 transition duration-300 cursor-pointer shadow-lg shadow-[#4338ec]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="bi bi-box-arrow-in-right"></i>
                    {loading ? "Creating account..." : "Create account"}
                </button>

                <div className="h-px bg-[#e5e5e5] my-1"></div>

                <div className="flex items-center justify-center gap-1 text-sm -mt-2">
                    <span className="text-[#8b8b8b]">Already have an account?</span>
                    <Link to="/" className="bold text-[#4338ec] hover:opacity-80 transition duration-300">
                        Log In
                    </Link>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <span className="text-xs bold text-[#a0a0a0] tracking-wider">CHOOSE ANOTHER PATH</span>

                    <div className="flex flex-col gap-3">
                        <Link to="/hr/register">
                            <div className="flex items-center gap-4 border border-[#e5e5e5] hover:border-[#6053f0] transition duration-300 rounded-xl p-4 cursor-pointer group">
                                <div className="flex items-center justify-center bg-[#eeecfd] rounded-lg w-10 h-10 shrink-0">
                                    <i className="bi bi-building-fill text-[#4338ec]"></i>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm bold">Register Recruiter / Company</span>
                                    <span className="text-xs text-[#a0a0a0]">Access your hiring workspace</span>
                                </div>
                                <i className="bi bi-arrow-right text-[#a0a0a0] group-hover:text-[#6053f0] group-hover:translate-x-1 transition duration-300"></i>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register
