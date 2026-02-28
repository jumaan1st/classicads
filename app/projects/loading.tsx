export default function Loading() {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-12 md:pb-16 animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-8 flex flex-col items-center justify-center sm:mb-10 text-center space-y-4">
                    <div className="h-10 w-48 bg-[var(--muted-bg)] rounded-xl"></div>
                    <div className="h-4 w-72 bg-[var(--muted-bg)] rounded"></div>
                </div>

                {/* Toolbar Skeleton */}
                <div className="flex items-center gap-2 sm:gap-3 mb-6">
                    <div className="h-10 w-full sm:flex-1 bg-[var(--muted-bg)] rounded-xl border border-[var(--border)]"></div>
                    <div className="h-10 w-24 bg-[var(--muted-bg)] rounded-xl border border-[var(--border)] hidden sm:block"></div>
                    <div className="h-10 w-28 bg-[var(--muted-bg)] rounded-xl border border-[var(--border)] hidden sm:block"></div>
                </div>

                {/* Count Skeleton */}
                <div className="h-4 w-32 bg-[var(--muted-bg)] rounded mb-5"></div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="aspect-[4/3] sm:aspect-[4/5] md:aspect-[3/4] rounded-3xl bg-[var(--muted-bg)] border border-[var(--border)] p-6 flex flex-col justify-end"
                        >
                            <div className="h-4 w-16 bg-white/20 rounded mb-3"></div>
                            <div className="h-6 w-3/4 bg-white/20 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
