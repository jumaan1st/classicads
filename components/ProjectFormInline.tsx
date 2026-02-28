"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, X, Folder, Calendar, DollarSign, Loader2, Info, Image as ImageIcon } from "lucide-react";
import { MultipleImageUpload } from "@/components/MultipleImageUpload";

type Project = {
    id?: string;
    title: string;
    clientName: string;
    clientEmail?: string | null;
    status: string;
    startDate: string;
    endDate?: string | null;
    budget: number;
    content?: string | null;
    serviceIds: string[];
    progressPhotos?: { url: string }[];
};

export default function ProjectFormInline({
    onClose,
    onSaved,
    projectToEdit,
    servicesMap
}: {
    onClose: () => void;
    onSaved: () => void;
    projectToEdit?: Project | null;
    servicesMap: Record<string, string>;
}) {
    const [formData, setFormData] = useState<Project & { gallery: string[] }>({
        title: "",
        clientName: "",
        clientEmail: "",
        status: "Planning",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        budget: 0,
        content: "",
        serviceIds: [],
        gallery: []
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                ...projectToEdit,
                startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : "",
                endDate: projectToEdit.endDate ? new Date(projectToEdit.endDate).toISOString().split('T')[0] : "",
                serviceIds: projectToEdit.serviceIds || [],
                gallery: projectToEdit.progressPhotos?.map(p => p.url) || []
            });
        }
    }, [projectToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "budget" ? (parseInt(value) || 0) : value
        }));
    };

    const toggleService = (id: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(id)
                ? prev.serviceIds.filter(s => s !== id)
                : [...prev.serviceIds, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const url = "/api/projects";
            const method = projectToEdit?.id ? "PUT" : "POST";

            const payload = { ...formData };
            if (!payload.endDate) delete payload.endDate;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to save project");
            }

            setMessage({ type: "success", text: "Project saved successfully!" });
            setTimeout(() => {
                onSaved();
                onClose();
            }, 1000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header section */}
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 flex-1">
                    <button onClick={onClose} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <X className="w-4 h-4" /> Cancel & Return
                    </button>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <Folder className="w-6 h-6 text-blue-500" />
                        {projectToEdit ? "Edit Project" : "Create New Project"}
                    </h1>
                    <p className="text-[var(--muted)] text-sm max-w-lg">
                        Fill out the details below to structure your portfolio case study. Upload a high-quality showcase image for maximum impact.
                    </p>
                </div>
                <div className="hidden sm:block text-blue-500/20">
                    <Folder className="w-32 h-32 absolute -right-6 -bottom-6" />
                </div>
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 transition-all ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Information */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--muted)]" /> Core Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Project Title</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. Skyline Minimalist Villa"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Current Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Client Name</label>
                            <input
                                required
                                type="text"
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Client Email (Optional)</label>
                            <input
                                type="email"
                                name="clientEmail"
                                value={formData.clientEmail || ""}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="hello@example.com"
                            />
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Project Overview / Description</label>
                            <textarea
                                required
                                name="content"
                                rows={4}
                                value={formData.content || ""}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors resize-y custom-scrollbar"
                                placeholder="Provide a rich description of the project challenges and successful delivery..."
                            />
                        </div>
                    </div>
                </div>

                {/* Media Uploads */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[var(--muted)]" /> Visuals
                    </h2>

                    <MultipleImageUpload
                        label="Project Gallery"
                        description="Upload one or more photos. The first photo will be used as the project thumbnail."
                        value={formData.gallery}
                        onChange={(urls) => setFormData(p => ({ ...p, gallery: urls }))}
                    />
                </div>

                {/* Timeline and Budget */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[var(--muted)]" /> Timeline & Budget
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Total Budget (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    required
                                    type="number"
                                    name="budget"
                                    min={0}
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Start Date</label>
                            <input
                                required
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">End Date (Optional)</label>
                            <input
                                type="date"
                                name="endDate"
                                min={formData.startDate}
                                value={formData.endDate || ""}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Services Toggles */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[var(--muted)]" /> Services Rendered
                    </h2>

                    <div className="flex flex-wrap gap-3">
                        {Object.entries(servicesMap).map(([id, name]) => {
                            const isSelected = formData.serviceIds.includes(id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => toggleService(id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isSelected
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                                        }`}
                                >
                                    {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                                    {name}
                                </button>
                            );
                        })}
                        {Object.keys(servicesMap).length === 0 && (
                            <p className="text-sm text-[var(--muted)]">No services are currently logged in the database.</p>
                        )}
                    </div>
                </div>

                {/* Floating Save Button Area */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)] flex justify-end gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl font-bold bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Project"}
                    </button>
                </div>
            </form>
        </div>
    );
}
