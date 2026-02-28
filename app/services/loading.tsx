export default function Loading() {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-pulse">

                {/* Header Skeleton */}
                <div className="max-w-3xl space-y-4 mb-12">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl"></div>
                    <div className="h-12 w-64 bg-[var(--muted-bg)] rounded-xl"></div>
                    <div className="h-6 w-full max-w-xl bg-[var(--muted-bg)] rounded"></div>
                    <div className="h-6 w-3/4 max-w-md bg-[var(--muted-bg)] rounded"></div>
                </div>

                {/* Filters/Toolbar Skeleton */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-10">
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 w-24 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]"></div>
                        ))}
                    </div>
                    <div className="h-10 w-64 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)]"></div>
                </div>

                {/* Main Layout Grid */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Services List Skeleton */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="p-5 sm:p-6 rounded-3xl border border-[var(--border)] bg-[var(--muted-bg)] flex justify-between items-center"
                            >
                                <div className="space-y-3 w-full">
                                    <div className="h-6 w-48 bg-white/20 rounded"></div>
                                    <div className="h-4 w-32 bg-white/20 rounded"></div>
                                    <div className="h-4 w-full bg-white/10 rounded mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Service Detail Placeholder Skeleton */}
                    <div className="hidden lg:block lg:col-span-7 xl:col-span-8 rounded-[2rem] bg-[var(--muted-bg)] border border-[var(--border)] p-12">
                        <div className="h-64 w-full bg-white/10 rounded-2xl mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-8 w-1/3 bg-white/20 rounded"></div>
                            <div className="h-4 w-full bg-white/10 rounded"></div>
                            <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                            <div className="h-4 w-4/6 bg-white/10 rounded"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
