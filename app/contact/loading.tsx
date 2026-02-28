import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Loading() {
    return (
        <div className="bg-[var(--background)] min-h-screen pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Left Side: Contact Info Skeleton */}
                <div className="space-y-10 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-6 w-32 bg-[var(--muted-bg)] rounded-md"></div>
                        <div className="h-12 w-3/4 max-w-[400px] bg-[var(--muted-bg)] rounded-xl"></div>
                        <div className="h-16 w-full max-w-[500px] bg-[var(--muted-bg)] rounded-md mt-4"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="h-8 w-48 bg-[var(--muted-bg)] rounded-md mb-6"></div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Phone box skeleton */}
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-blue-500/10 rounded-xl mb-4 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-blue-400 opacity-50" />
                                </div>
                                <div className="h-4 w-24 bg-[var(--muted-bg)] rounded mb-2"></div>
                                <div className="h-6 w-32 bg-[var(--muted-bg)] rounded"></div>
                            </div>

                            {/* Email box skeleton */}
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-indigo-500/10 rounded-xl mb-4 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-indigo-400 opacity-50" />
                                </div>
                                <div className="h-4 w-24 bg-[var(--muted-bg)] rounded mb-2"></div>
                                <div className="h-6 w-32 bg-[var(--muted-bg)] rounded"></div>
                            </div>

                            {/* Location box skeleton */}
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm sm:col-span-2">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 shrink-0 bg-emerald-500/10 rounded-xl flex items-center justify-center mt-1">
                                        <MapPin className="h-5 w-5 text-emerald-400 opacity-50" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="h-4 w-24 bg-[var(--muted-bg)] rounded mb-3"></div>
                                        <div className="h-5 w-full bg-[var(--muted-bg)] rounded mb-2"></div>
                                        <div className="h-5 w-3/4 bg-[var(--muted-bg)] rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Web Form Skeleton */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg shadow-[var(--shadow)] animate-pulse">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-2.5 w-12 bg-blue-500/30 rounded-full"></div>
                        <div className="h-4 w-32 bg-[var(--muted-bg)] rounded"></div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-12 w-full bg-[var(--muted-bg)] rounded-xl"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-12 w-full bg-[var(--muted-bg)] rounded-xl"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-16 bg-[var(--muted-bg)] rounded"></div>
                            <div className="h-12 w-full bg-[var(--muted-bg)] rounded-xl"></div>
                        </div>

                        <div className="space-y-2 text-left">
                            <div className="h-4 w-24 bg-[var(--muted-bg)] rounded"></div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-10 w-24 bg-[var(--muted-bg)] rounded-full"></div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-[var(--muted-bg)] rounded"></div>
                            <div className="h-32 w-full bg-[var(--muted-bg)] rounded-xl"></div>
                        </div>

                        <div className="pt-2">
                            <div className="h-14 w-full bg-blue-500/20 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
