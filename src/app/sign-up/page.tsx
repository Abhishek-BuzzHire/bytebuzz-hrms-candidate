"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";

interface StoredUser {
    username: string;
    password: string;
}

const STORAGE_KEY = "buzzbyte_user";

export default function SignupPage() {
    const router = useRouter();

    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [signupError, setSignupError] = useState<string | null>(null);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError(null);

        if (signupPassword !== confirmPassword) {
            setSignupError("Passwords do not match");
            return;
        }

        const newUser: StoredUser = {
            username: signupUsername,
            password: signupPassword,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans">

            <div className="w-full max-w-md">


                <div className="px-10 py-10 space-y-4">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Image src="/logo.webp" alt="" height={26} width={26} />
                        </div>
                        <h2 className="text-[22px] font-bold tracking-tight text-slate-900 mb-1">
                            Create your account
                        </h2>
                        <p className="text-sm text-slate-400">
                            Join BuzzByte and get started today
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">

                        {/* Username */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Username
                            </label>
                            <div className="relative group">
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 group-focus-within:text-blue-500 transition-colors duration-150"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={signupUsername}
                                    onChange={(e) => setSignupUsername(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-150"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Password
                            </label>
                            <div className="relative group">
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 group-focus-within:text-blue-500 transition-colors duration-150"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showSignupPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-150"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 group-focus-within:text-blue-500 transition-colors duration-150"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-150"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {signupError && (
                            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                <span className="text-[13px] text-red-600">{signupError}</span>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-slate-100 pt-1" />

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full py-3 text-[14.5px] font-semibold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                        >
                            Create Account
                        </button>

                    </form>

                    {/* Login link */}
                    <div className="gap-2.5"><p className="text-center mt-6 text-[13px] text-slate-400">
                        Already have an account?{" "}
                        <span
                            onClick={() => router.push("/login")}
                            className="text-blue-600 font-semibold cursor-pointer hover:underline"
                        >
                            Sign in
                        </span>
                    </p></div>

                    {/* Google */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={() => console.log("login")}
                            onError={() => console.log("Login Failed")}
                            theme="outline"
                            size="large"
                            width="352"
                            text="signin_with"
                            logo_alignment="center"
                        />
                    </div>


                </div>

                {/* Footer note */}
                <p className="text-center mt-5 text-[12px] text-slate-400">
                    By signing up, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-slate-600 transition-colors">
                        Terms of Service
                    </span>
                </p>

            </div>
        </div>
    );
}