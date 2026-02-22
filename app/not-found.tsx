"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 overflow-hidden bg-[var(--background)]">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">

                {/* Animated 404 Graphic */}
                <div className="relative">
                    <h1 className="text-[8rem] md:text-[12rem] font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/10 leading-none select-none tracking-tighter drop-shadow-2xl">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-amber-500/20 mix-blend-overlay blur-3xl rounded-full" />
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl md:text-4xl font-heading font-bold text-[var(--foreground)] tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-[var(--muted)] font-medium max-w-md mx-auto leading-relaxed">
                        The page you're looking for doesn't exist, has been removed, or is temporarily unavailable.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-2 px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wider text-sm rounded-none border border-[var(--foreground)] hover:bg-transparent hover:text-[var(--foreground)] transition-all duration-300"
                    >
                        <Home className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[var(--foreground)] font-bold uppercase tracking-wider text-sm rounded-none border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>

            {/* Decorative lines */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>
    );
}
