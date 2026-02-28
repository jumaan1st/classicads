"use client";

import { useState, useEffect, useRef } from "react";
import { Save, CheckCircle2, X, Cog, Settings, Loader2, Info, Image as ImageIcon, Briefcase, Plus, Tag } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { MultipleImageUpload } from "@/components/MultipleImageUpload";

type Service = {
    id?: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    priceRange: { min: number; max: number };
    timelineWeeks: { min: number; max: number };
    image: string;
    featured: boolean;
    materials?: string[];
    gallery?: string[];
};

const CATEGORIES = ["Interior", "Exterior", "Consultation", "Renovation"];

export default function ServiceFormInline({
    onClose,
    onSaved,
    serviceToEdit,
}: {
    onClose: () => void;
    onSaved: () => void;
    serviceToEdit?: Service | null;
}) {
    const [formData, setFormData] = useState<Service>({
        name: "",
        slug: "",
        category: "Interior",
        description: "",
        priceRange: { min: 1000, max: 10000 },
        timelineWeeks: { min: 4, max: 12 },
        image: "",
        featured: false,
        materials: [],
        gallery: [],
    });

    const [materialInput, setMaterialInput] = useState("");
    const materialInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (serviceToEdit) {
            setFormData({
                ...serviceToEdit,
                materials: serviceToEdit.materials ?? [],
                gallery: serviceToEdit.gallery ?? [],
            });
        }
    }, [serviceToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: parseInt(value) || 0
                }
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Always auto-generate slug (for new, and auto for edit too if slug hasn't been manually changed from the name-derived value)
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
        }));
    };

    // ----- Materials -----
    const addMaterial = () => {
        const trimmed = materialInput.trim();
        if (!trimmed || formData.materials?.includes(trimmed)) return;
        setFormData(prev => ({ ...prev, materials: [...(prev.materials ?? []), trimmed] }));
        setMaterialInput("");
        materialInputRef.current?.focus();
    };

    const removeMaterial = (m: string) => {
        setFormData(prev => ({ ...prev, materials: prev.materials?.filter(x => x !== m) }));
    };

    const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); addMaterial(); }
        if (e.key === ',' || e.key === 'Tab') { e.preventDefault(); addMaterial(); }
    };

    // ----- Submit -----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const method = serviceToEdit?.id ? "PUT" : "POST";
            const res = await fetch("/api/services", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error(await res.text() || "Failed to save service");

            setMessage({ type: "success", text: "Service saved successfully!" });
            setTimeout(() => { onSaved(); onClose(); }, 1000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 flex-1">
                    <button onClick={onClose} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <X className="w-4 h-4" /> Cancel & Return
                    </button>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <Cog className="w-6 h-6 text-blue-500" />
                        {serviceToEdit ? "Edit Service" : "Create New Service"}
                    </h1>
                    <p className="text-[var(--muted)] text-sm max-w-lg">
                        Configure the service displayed to clients. Add a cover image, gallery, materials, and pricing.
                    </p>
                </div>
                <Cog className="w-32 h-32 absolute -right-6 -bottom-6 text-blue-500/10 hidden sm:block" />
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Info className="w-5 h-5 shrink-0" />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Service Basics ── */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[var(--muted)]" /> Service Basics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Service Name</label>
                            <input
                                required type="text" name="name" value={formData.name} onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. Modern Interior Redesign"
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">URL Slug <span className="text-[10px] normal-case opacity-60">(auto-generated)</span></label>
                            <input
                                required type="text" name="slug" value={formData.slug} onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                placeholder="e.g. interior-design"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Featured toggle */}
                        <div className="space-y-2 flex flex-col justify-center">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-blue-500 transition-colors">
                                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                <div>
                                    <p className="font-semibold text-sm text-[var(--foreground)]">Featured Service</p>
                                    <p className="text-xs text-[var(--muted)]">Show prominently on the homepage.</p>
                                </div>
                            </label>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Description</label>
                            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors resize-y"
                                placeholder="Describe what is included in this service..." />
                        </div>
                    </div>
                </div>

                {/* ── Materials ── */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-[var(--muted)]" /> Materials Used
                    </h2>
                    <p className="text-xs text-[var(--muted)] mb-5">Type a material and press <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px] font-mono bg-[var(--background)]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px] font-mono bg-[var(--background)]">,</kbd> to add.</p>

                    {/* Tags display */}
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                        {(formData.materials ?? []).map(m => (
                            <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                                {m}
                                <button type="button" onClick={() => removeMaterial(m)} className="hover:text-red-500 transition-colors ml-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Input row */}
                    <div className="flex gap-2">
                        <input
                            ref={materialInputRef}
                            type="text"
                            value={materialInput}
                            onChange={e => setMaterialInput(e.target.value)}
                            onKeyDown={handleMaterialKeyDown}
                            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. Marble, Teak Wood, Italian Paint..."
                        />
                        <button type="button" onClick={addMaterial}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow shadow-blue-500/20">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </div>

                {/* ── Cover Image ── */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[var(--muted)]" /> Cover Thumbnail
                    </h2>
                    <ImageUpload
                        label="Service Cover Image"
                        value={formData.image}
                        onChange={(url) => setFormData(p => ({ ...p, image: url }))}
                    />
                </div>

                {/* ── Gallery ── */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[var(--muted)]" /> Photo Gallery
                    </h2>
                    <MultipleImageUpload
                        label="Service Gallery"
                        description="Upload additional photos shown on the service detail page. Supports multiple files at once."
                        value={formData.gallery ?? []}
                        onChange={(urls) => setFormData(p => ({ ...p, gallery: urls }))}
                    />
                </div>

                {/* ── Specs & Pricing ── */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[var(--muted)]" /> Specs & Pricing
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2">Price Range (₹)</h3>
                            <div className="flex items-center gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Min</label>
                                    <input required type="number" name="priceRange.min" min={0} value={formData.priceRange.min} onChange={handleChange}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <span className="text-[var(--muted)] mt-5">–</span>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Max</label>
                                    <input required type="number" name="priceRange.max" min={0} value={formData.priceRange.max} onChange={handleChange}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2">Timeline (Weeks)</h3>
                            <div className="flex items-center gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Min</label>
                                    <input required type="number" name="timelineWeeks.min" min={1} value={formData.timelineWeeks.min} onChange={handleChange}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <span className="text-[var(--muted)] mt-5">–</span>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Max</label>
                                    <input required type="number" name="timelineWeeks.max" min={1} value={formData.timelineWeeks.max} onChange={handleChange}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Save Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)] flex justify-end gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="px-6 py-2.5 rounded-xl font-bold bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Service"}
                    </button>
                </div>
            </form>
        </div>
    );
}
