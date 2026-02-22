"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X, Check, ArrowUpDown } from "lucide-react";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceRange: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  image: string;
  featured: boolean;
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "consultation", label: "Consultation" },
];

export default function ServicesPage() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [pageContent, setPageContent] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);   // multi-select
  const [sortBy, setSortBy] = useState("name-asc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/pages?slug=services")
      .then((r) => r.json())
      .then((d) => (d.slug ? setPageContent({ title: d.title, description: d.description }) : setPageContent(null)))
      .catch(() => setPageContent(null));
  }, []);

  useEffect(() => {
    fetch("/api/services?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setAllServices(d.services ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function down(e: MouseEvent) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile && filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  useEffect(() => {
    if (filterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const toggleCategory = (val: string) =>
    setCategories((prev) => prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]);

  const displayed = useMemo(() => {
    let list = [...allServices];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (categories.length) list = list.filter((s) => categories.includes(s.category));
    list.sort((a, b) => {
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return a.priceRange.min - b.priceRange.min;
      if (sortBy === "price-desc") return b.priceRange.min - a.priceRange.min;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [allServices, search, categories, sortBy]);

  const activeFilterCount = categories.length;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";
  const clearFilters = () => setCategories([]);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-12 md:pb-16">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {pageContent?.title ?? "Our Services"}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">Explore our full range of interior and exterior design services.</p>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-9 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
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

            {/* Desktop popover */}
            {filterOpen && (
              <div className="hidden md:block absolute left-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/10 p-5">
                <ServiceFilterPanel
                  categories={categories}
                  toggleCategory={toggleCategory}
                  activeFilterCount={activeFilterCount}
                  resultCount={displayed.length}
                  clearFilters={clearFilters}
                  onDone={() => setFilterOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] hover:border-blue-500/50 transition-all"
            >
              <ArrowUpDown className="h-4 w-4 text-[var(--muted)]" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/10 overflow-hidden">
                <p className="px-4 pt-3 pb-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Sort by</p>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt.value ? "text-blue-600 dark:text-blue-400 bg-blue-500/5" : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      }`}
                  >
                    {opt.label}
                    {sortBy === opt.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs font-medium text-[var(--muted)] mb-5">
            {displayed.length} result{displayed.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 && <button onClick={clearFilters} className="ml-3 text-blue-500 hover:underline">Clear filters</button>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-2xl font-heading font-bold text-[var(--foreground)] mb-2">No services found</p>
            <p className="text-[var(--muted)] text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="group relative rounded-[2rem] p-3 sm:p-4 bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 block overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] mb-5 sm:mb-6 bg-[var(--muted-bg)]">
                  <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,33vw" />
                  <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[1.75rem] ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-sm">
                    <span className="text-[10px] sm:text-xs font-medium text-white tracking-widest uppercase">{s.timelineWeeks.min}-{s.timelineWeeks.max} Wks</span>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/10 dark:border-blue-500/20">
                      ₹{s.priceRange.min.toLocaleString()} - {s.priceRange.max.toLocaleString()}
                    </span>
                  </div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--foreground)] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</h2>
                  <p className="line-clamp-2 text-sm text-[var(--muted)] leading-relaxed mb-6">{s.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Explore Service
                    <svg className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile bottom sheet — z-[9999] sits above everything */}
      {filterOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (mobileSheetRef.current && !mobileSheetRef.current.contains(e.target as Node)) {
              setFilterOpen(false);
            }
          }}
        >
          <div
            ref={mobileSheetRef}
            className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-[2rem] max-h-[88vh] flex flex-col"
          >
            <div className="flex justify-center pt-3 flex-shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-[var(--border)]" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
              <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">Filter</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold shadow transition-opacity hover:opacity-80 active:opacity-70"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ServiceFilterPanel
                categories={categories}
                toggleCategory={toggleCategory}
                activeFilterCount={activeFilterCount}
                resultCount={displayed.length}
                clearFilters={clearFilters}
                onDone={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

/* ── Stable filter panel (defined outside page component) ── */
function ServiceFilterPanel({
  categories, toggleCategory,
  activeFilterCount, resultCount, clearFilters, onDone,
}: {
  categories: string[];
  toggleCategory: (v: string) => void;
  activeFilterCount: number;
  resultCount: number;
  clearFilters: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Category</p>
          {categories.length > 0 && (
            <button onClick={clearFilters} className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors flex items-center gap-0.5">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label }) => {
            const active = categories.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${active
                  ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                  }`}
              >
                {active && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                {label}
              </button>
            );
          })}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-[var(--muted)] mt-2 opacity-60">Select one or more to filter</p>
        )}
      </div>

      <div className="h-px bg-[var(--border)]" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={clearFilters}
          className="flex-1 h-11 rounded-xl border-2 border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
        >
          Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : "all"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 h-11 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold hover:opacity-90 transition-all"
        >
          Show {resultCount} results
        </button>
      </div>
    </div>
  );
}
