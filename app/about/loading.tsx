export default function Loading() {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            {/* ─── Hero Section Skeleton ─── */}
            <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-24 animate-pulse">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="h-6 w-32 bg-[var(--muted-bg)] rounded-full mx-auto mb-6"></div>
                    <div className="h-14 lg:h-20 w-3/4 max-w-3xl bg-[var(--muted-bg)] rounded-2xl mx-auto mb-6"></div>
                    <div className="h-6 w-5/6 max-w-2xl bg-[var(--muted-bg)] rounded mx-auto mb-10"></div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)]">
                                <div className="h-10 w-20 bg-[var(--muted-bg)] rounded-xl mx-auto mb-2"></div>
                                <div className="h-4 w-24 bg-[var(--muted-bg)] rounded mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Our Story Section Skeleton ─── */}
            <section className="py-20 lg:py-28 bg-[var(--card)] animate-pulse">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Image Placeholder */}
                        <div className="aspect-square lg:aspect-[4/5] rounded-[2rem] bg-[var(--muted-bg)]"></div>

                        {/* Text Content */}
                        <div className="space-y-6">
                            <div className="h-6 w-32 bg-[var(--muted-bg)] rounded-full"></div>
                            <div className="h-12 w-3/4 bg-[var(--muted-bg)] rounded-xl"></div>
                            <div className="space-y-3 mt-6">
                                <div className="h-4 w-full bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-4 w-11/12 bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-4 w-full bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-4 w-5/6 bg-[var(--muted-bg)] rounded"></div>
                                <div className="h-4 w-full bg-[var(--muted-bg)] rounded"></div>
                            </div>

                            {/* Founder/Business Profile block */}
                            <div className="mt-8 pt-8 border-t border-[var(--border)] flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-[var(--muted-bg)]"></div>
                                <div className="space-y-2">
                                    <div className="h-5 w-32 bg-[var(--muted-bg)] rounded"></div>
                                    <div className="h-4 w-24 bg-[var(--muted-bg)] rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
