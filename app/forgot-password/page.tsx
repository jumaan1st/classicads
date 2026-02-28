"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldAlert, KeyRound } from "lucide-react";

type ForgotStep = "EMAIL" | "OTP" | "NEW_PASSWORD";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<ForgotStep>("EMAIL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        emailOrPhone: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const requestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.emailOrPhone }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to request OTP");

            setSuccess("An OTP has been sent to your email.");
            setStep("OTP");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyAndReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.emailOrPhone,
                    token: formData.otp,
                    newPassword: formData.newPassword
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset password");

            setSuccess("Password reset successfully! Redirecting...");
            setTimeout(() => router.push("/login"), 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background aesthetics */}
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative z-10">
                <Link href="/login" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8 w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-[var(--foreground)] mb-2">
                        Recover Access
                    </h1>
                    <p className="text-[var(--muted)] text-sm">
                        {step === "EMAIL" && "Enter your registered email or phone number to receive an OTP."}
                        {step === "OTP" && "Enter the 6-digit code sent to your email."}
                        {step === "NEW_PASSWORD" && "Create a new strong password."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-medium text-center">
                        {success}
                    </div>
                )}

                {step === "EMAIL" && (
                    <form onSubmit={requestOTP} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Email or Phone</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.emailOrPhone}
                                    onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="admin@classicads.com"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !formData.emailOrPhone}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 mt-4 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white"
                        >
                            {loading ? "Sending..." : "Send Reset Code"}
                        </button>
                    </form>
                )}

                {(step === "OTP" || step === "NEW_PASSWORD") && (
                    <form onSubmit={step === "OTP" ? (e) => { e.preventDefault(); setStep("NEW_PASSWORD"); } : verifyAndReset} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">6-Digit OTP</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-amber-500 transition-colors tracking-widest text-lg font-bold"
                                    placeholder="000000"
                                    required
                                    disabled={step === "NEW_PASSWORD"}
                                />
                            </div>
                        </div>

                        {step === "NEW_PASSWORD" && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"><Lock className="w-5 h-5" /></div>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-amber-500 transition-colors"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"><Lock className="w-5 h-5" /></div>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-amber-500 transition-colors"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (step === "OTP" ? formData.otp.length < 6 : !formData.newPassword || !formData.confirmPassword)}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 mt-4 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white"
                        >
                            {loading ? "Processing..." : step === "OTP" ? "Verify Code" : "Reset Password"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
