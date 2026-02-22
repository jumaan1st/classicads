"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X, Check, ArrowUpDown } from "lucide-react";

type Project = {
  id: string;
  title: string;
  clientName: string;
  serviceIds: string[];
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  progressPhotos?: { url: string }[];
};
type Service = { id: string; name: string };

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
];

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Refs for click-outside detection
  const filterBtnRef = useRef<HTMLDivElement>(null);   // toolbar filter button + desktop popover
  const mobileSheetRef = useRef<HTMLDivElement>(null);  // mobile sheet panel
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects?expand=employees&page=1&limit=100").then(r => r.json()),
      fetch("/api/services").then(r => r.json()),
    ]).then(([pd, sd]) => {
      setAllProjects(pd.projects ?? []);
      const map: Record<string, string> = {};
      (sd.services ?? []).forEach((s: Service) => { map[s.id] = s.name; });
      setServicesMap(map);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      const isDesktop = window.innerWidth >= 768;
      // Desktop: close filter popover when clicking outside button+popover
      if (isDesktop && filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const toggleService = (id: string) =>
    setServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const displayed = useMemo(() => {
    let list = [...allProjects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q));
    }
    if (services.length) list = list.filter(p => services.some(sid => p.serviceIds.includes(sid)));
    if (dateFrom) list = list.filter(p => p.startDate >= dateFrom);
    if (dateTo) list = list.filter(p => p.startDate <= dateTo);
    list.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "date-asc") return a.startDate.localeCompare(b.startDate);
      return b.startDate.localeCompare(a.startDate);
    });
    return list;
  }, [allProjects, search, services, dateFrom, dateTo, sortBy]);

  const activeFilterCount = services.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Sort";
  const clearFilters = () => { setServices([]); setDateFrom(""); setDateTo(""); };

  const imageFor = (p: Project) =>
    p.progressPhotos?.[0]?.url ?? "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800";

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-12 md:pb-16">

        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">Our Projects</h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">Browse our portfolio of completed and active design projects.</p>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text" placeholder="Search projects..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-9 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter button + desktop popover */}
          <div className="relative" ref={filterBtnRef}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`relative h-10 inline-flex items-center gap-2 px-4 rounded-xl border font-semibold text-sm transition-all ${activeFilterCount > 0
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-blue-500/50"
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>

            {/* Desktop popover — below button, scrollable */}
            {filterOpen && (
              <div className="hidden md:flex absolute left-0 top-[calc(100%+8px)] z-50 w-96 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/10 max-h-[80vh] overflow-y-auto">
                <ProjectFilterContent
                  servicesMap={servicesMap} services={services} toggleService={toggleService}
                  dateFrom={dateFrom} setDateFrom={setDateFrom}
                  dateTo={dateTo} setDateTo={setDateTo}
                  activeFilterCount={activeFilterCount} resultCount={displayed.length}
                  clearFilters={clearFilters} onDone={() => setFilterOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(v => !v)}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] hover:border-blue-500/50 transition-all"
            >
              <ArrowUpDown className="h-4 w-4 text-[var(--muted)]" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
                <p className="px-4 pt-3 pb-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Sort by</p>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt.value ? "text-blue-600 dark:text-blue-400 bg-blue-500/5" : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      }`}>
                    {opt.label}
                    {sortBy === opt.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-xs font-medium text-[var(--muted)] mb-5">
            {displayed.length} result{displayed.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 && <button onClick={clearFilters} className="ml-3 text-blue-500 hover:underline">Clear filters</button>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--muted-bg)]" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-2xl font-heading font-bold text-[var(--foreground)] mb-2">No projects found</p>
            <p className="text-[var(--muted)] text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="group relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] aspect-[4/3] sm:aspect-[4/5] md:aspect-[3/4] shadow-sm block">
                <Image src={imageFor(p)} fill className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" alt={p.title} sizes="(max-width:640px) 100vw,33vw" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white/80 font-medium text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded backdrop-blur-md border border-white/10 w-max mb-3">{p.status}</span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{p.title}</h3>
                  <p className="text-white/80 text-sm font-medium">{p.clientName}</p>
                  <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-0 overflow-hidden group-hover:h-auto">
                    <div className="flex justify-between text-xs font-medium"><span className="text-white/60">Budget</span><span className="text-white">₹{p.budget.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs font-medium"><span className="text-white/60">Timeline</span><span className="text-white">{p.endDate ? `Finished ${p.endDate}` : `Started ${p.startDate}`}</span></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link href="/contact" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-blue-700 shadow-md transition-all">
            Start your project
          </Link>
        </div>
      </div>

      {/* ─── Mobile bottom sheet (z-[9999] so it sits above everything) ─── */}
      {filterOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            // Close only when tapping the dark backdrop, not the sheet itself
            if (mobileSheetRef.current && !mobileSheetRef.current.contains(e.target as Node)) {
              setFilterOpen(false);
            }
          }}
        >
          <div
            ref={mobileSheetRef}
            className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-[2rem] max-h-[88vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 flex-shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
              <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">Filter</h2>
              {/* Large, fully visible close button */}
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold shadow transition-opacity hover:opacity-80 active:opacity-70"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="overflow-y-auto flex-1">
              <ProjectFilterContent
                servicesMap={servicesMap} services={services} toggleService={toggleService}
                dateFrom={dateFrom} setDateFrom={setDateFrom}
                dateTo={dateTo} setDateTo={setDateTo}
                activeFilterCount={activeFilterCount} resultCount={displayed.length}
                clearFilters={clearFilters} onDone={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Filter panel — defined at module level, never remounts ── */
function ProjectFilterContent({
  servicesMap, services, toggleService,
  dateFrom, setDateFrom, dateTo, setDateTo,
  activeFilterCount, resultCount, clearFilters, onDone,
}: {
  servicesMap: Record<string, string>;
  services: string[];
  toggleService: (id: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  activeFilterCount: number;
  resultCount: number;
  clearFilters: () => void;
  onDone: () => void;
}) {
  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Service chips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Service</p>
          {services.length > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-0.5">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(servicesMap).map(([id, name]) => {
            const active = services.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggleService(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${active
                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                  }`}>
                {active && <Check className="h-3.5 w-3.5" />}
                {name}
              </button>
            );
          })}
        </div>
        {services.length === 0 && <p className="text-xs text-[var(--muted)] mt-2 opacity-60">Pick one or more</p>}
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Date range — native inputs, full width */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Date Range</p>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-red-400 hover:text-red-500 flex items-center gap-0.5">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--muted)]">From</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={e => setDateFrom(e.target.value)}
              style={{ fontSize: 16 }}
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--muted)]">To</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={e => setDateTo(e.target.value)}
              style={{ fontSize: 16 }}
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2 opacity-60">Both dates are optional</p>
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Footer */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={clearFilters}
          className="flex-1 h-12 rounded-xl border-2 border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:border-[var(--foreground)] transition-all">
          Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : "all"}
        </button>
        <button type="button" onClick={onDone}
          className="flex-1 h-12 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold hover:opacity-90 transition-all">
          Show {resultCount} results
        </button>
      </div>
    </div>
  );
}
