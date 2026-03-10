"use client";

import { GoogleLogin } from "@react-oauth/google";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fetchLogin } from "@/apis/user";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [verifiedMessage, setVerifiedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const verified = searchParams.get("verified");
        const reason = searchParams.get("reason");

        if (verified === "true") {
            setVerifiedMessage({ type: "success", text: "Your email has been verified. Please log in." });
        } else if (verified === "false") {
            setVerifiedMessage({
                type: "error",
                text: reason === "link_expired"
                    ? "Verification link has expired. Please sign up again."
                    : "Email verification failed. Please try again."
            });
        }
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const data = await fetchLogin({
                email: username,
                password,
            });

            if (data?.access) {
                localStorage.setItem("access_token", data.access);
            }
            if (data?.refresh) {
                localStorage.setItem("refresh_token", data.refresh);
            }

            router.push(returnUrl || "/dashboard");

        } catch (err) {
            const error = err as AxiosError<any>;
            setError(
                error.response?.data?.message || "Invalid username or password"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-sans">
            <div className="w-full max-w-[400px] px-6">

                {/* Header */}
                <div className="text-center mb-7">
                    <div className="w-[52px] h-[52px] rounded-[14px] bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-5">
                        <Image src="/logo.webp" alt="" height={30} width={30} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-[-0.025em] text-slate-900 mb-1.5">
                        Log in to your account
                    </h2>
                    <p className="text-sm text-slate-500">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* ✅ Verified message banner */}
                {verifiedMessage && (
                    <div className={`mb-5 rounded-lg border px-3 py-2.5 text-sm ${verifiedMessage.type === "success"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}>
                        {verifiedMessage.text}
                    </div>
                )}

                {/* Username */}
                <div className="mb-4">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Username
                    </label>
                    <div className="relative group">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 group-focus-within:text-blue-600 transition"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-[11px] bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Password
                    </label>
                    <div className="relative group">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 group-focus-within:text-blue-600 transition"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-[11px] bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Forgot */}
                <div className="text-center mt-1 mb-5">
                    <span
                        onClick={() => router.push("/forget-password")}
                        className="text-[12px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition"
                    >
                        Forgot Password?
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                        <span className="text-[13px] text-red-600">{error}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={submitting}
                    className="w-full py-3 text-[15px] font-semibold rounded-[10px] bg-blue-600 text-white transition shadow-[0_1px_3px_rgba(37,99,235,0.25),0_4px_12px_rgba(37,99,235,0.15)] hover:bg-blue-700 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting ? "Signing in..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">or continue with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

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

                {/* Sign Up */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <span
                            onClick={() => router.push("/sign-up")}
                            className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer transition"
                        >
                            Sign up
                        </span>
                    </span>
                </div>

            </div>
        </div>
    );
}