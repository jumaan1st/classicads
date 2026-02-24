"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft, ArrowRight, Save, Check, X,
    Building2, FileText, CheckCircle2, IndianRupee,
    Plus, Trash2, ToggleLeft, ToggleRight
} from "lucide-react";
import Card from "@/components/Card";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type Service = {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    priceRange: { min: number; max: number };
};

type SelectedService = {
    serviceId: string;        // "other-N" for custom
    name: string;
    description: string;
    amount: string;
    isCustom?: boolean;
};

type MiscItem = {
    id: string;
    name: string;
    amount: string;
};

type FormData = {
    clientName: string;
    clientEmail: string;
    clientNumber: string;
    clientGst: string;
    projectTitle: string;
    issueDate: string;
    dueDate: string;
    gstPercent: string;
};

const CATEGORY_LABELS: Record<string, string> = {
    interior: "Interior",
    exterior: "Exterior",
    consultation: "Consultation",
};
const CATEGORY_COLORS: Record<string, string> = {
    interior: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    exterior: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    consultation: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

let otherCounter = 0;

export default function CreateInvoicePage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [miscItems, setMiscItems] = useState<MiscItem[]>([{ id: "m0", name: "", amount: "" }]);
    const [markedPaid, setMarkedPaid] = useState(false);
    const amountRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [formData, setFormData] = useState<FormData>({
        clientName: "",
        clientEmail: "",
        clientNumber: "",
        clientGst: "",
        projectTitle: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        gstPercent: "18",
    });

    useEffect(() => {
        fetch("/api/services?page=1&limit=100")
            .then((r) => r.json())
            .then((d) => setAvailableServices(d.services ?? []))
            .finally(() => setServicesLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // ── Service card toggle ──────────────────────────────────────────────────
    const toggleService = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.serviceId === service.id);
            if (exists) return prev.filter((s) => s.serviceId !== service.id);
            const next = [...prev, {
                serviceId: service.id,
                name: service.name,
                description: service.description,
                amount: String(service.priceRange.min),
            }];
            setTimeout(() => amountRefs.current[service.id]?.focus(), 80);
            return next;
        });
    };

    const updateServiceAmount = (serviceId: string, amount: string) =>
        setSelectedServices((prev) => prev.map((s) => s.serviceId === serviceId ? { ...s, amount } : s));

    const updateServiceName = (serviceId: string, name: string) =>
        setSelectedServices((prev) => prev.map((s) => s.serviceId === serviceId ? { ...s, name } : s));

    // ── Add "Other" custom entry ─────────────────────────────────────────────
    const addOtherService = () => {
        const newId = `other-${++otherCounter}`;
        setSelectedServices((prev) => [...prev, { serviceId: newId, name: "", description: "", amount: "", isCustom: true }]);
        setTimeout(() => amountRefs.current[`name-${newId}`]?.focus(), 80);
    };

    // ── Misc items ───────────────────────────────────────────────────────────
    const addMiscItem = () =>
        setMiscItems((prev) => [...prev, { id: `m${Date.now()}`, name: "", amount: "" }]);

    const updateMisc = (id: string, field: "name" | "amount", value: string) =>
        setMiscItems((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));

    const removeMisc = (id: string) =>
        setMiscItems((prev) => prev.filter((m) => m.id !== id));

    // ── Totals ───────────────────────────────────────────────────────────────
    const calculateTotal = () => {
        const serviceTotal = selectedServices.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
        const miscTotal = miscItems.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
        const subtotal = serviceTotal + miscTotal;
        const gstPct = parseFloat(formData.gstPercent) || 0;
        const gstAmt = subtotal * (gstPct / 100);
        return { serviceTotal, miscTotal, subtotal, gstAmt, total: subtotal + gstAmt };
    };
    const { serviceTotal, miscTotal, subtotal, gstAmt, total } = calculateTotal();

    const canStep1 =
        formData.clientName.trim() &&
        formData.projectTitle.trim() &&
        formData.issueDate &&
        formData.dueDate;

    // At least one service selected OR at least one misc item with name+amount
    const hasValidService = selectedServices.length > 0;
    const hasValidMisc = miscItems.some((m) => m.name.trim() && m.amount);
    const canStep2 = hasValidService || hasValidMisc;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); router.push("/dashboard/invoices"); }, 1000);
    };

    const invoiceNumber = `INV-2025-${String(Math.floor(Math.random() * 900) + 100)}`;
    const categories = ["interior", "exterior", "consultation"];

    // All line items for invoice table
    const allLineItems = [
        ...selectedServices.filter((s) => s.name),
        ...miscItems.filter((m) => m.name.trim() && m.amount).map((m) => ({
            serviceId: m.id,
            name: m.name,
            description: "Miscellaneous item",
            amount: m.amount,
            isCustom: true,
        })),
    ];

    const finalStatus = markedPaid ? "paid" : "draft";

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {step === 1 ? (
                        <Link href="/dashboard/invoices" className="p-2 rounded-full hover:bg-[var(--muted-bg)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    ) : (
                        <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="p-2 rounded-full hover:bg-[var(--muted-bg)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
                            {step === 1 ? "Create Invoice" : step === 2 ? "Miscellaneous Items" : "Preview & Confirm"}
                        </h1>
                        <p className="text-[var(--muted)] text-sm">
                            {step === 1 ? "Step 1 of 3 — Client & Services" : step === 2 ? "Step 2 of 3 — Extra Charges" : "Step 3 of 3 — Review & Save"}
                        </p>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2">
                    {([1, 2, 3] as const).map((n, i) => (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${step > n ? "border-emerald-500 bg-emerald-500 text-white" : step === n ? "border-blue-500 bg-blue-500 text-white" : "border-[var(--border)] text-[var(--muted)]"}`}>
                                {step > n ? <Check className="w-4 h-4" /> : n}
                            </div>
                            {i < 2 && <div className={`w-8 h-0.5 transition-all ${step > n ? "bg-emerald-500" : "bg-[var(--border)]"}`} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── STEP 1: Client + Services ────────────────────────────────── */}
            {step === 1 && (
                <div className="space-y-6">
                    {/* Client Card */}
                    <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><FileText className="w-5 h-5" /></div>
                            <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Client Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { label: "Client Name *", name: "clientName", type: "text", placeholder: "e.g. John Doe", required: true },
                                { label: "Email (Optional)", name: "clientEmail", type: "email", placeholder: "e.g. john@example.com" },
                                { label: "Phone (Optional)", name: "clientNumber", type: "text", placeholder: "e.g. +91 98765 43210" },
                                { label: "GST Number (Optional)", name: "clientGst", type: "text", placeholder: "e.g. 29ABCDE1234F1Z5" },
                            ].map((f) => (
                                <div key={f.name} className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--foreground)]">{f.label}</label>
                                    <input type={f.type} name={f.name} value={formData[f.name as keyof FormData]} onChange={handleChange}
                                        required={f.required}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder={f.placeholder} />
                                </div>
                            ))}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Project / Reference Title *</label>
                                <input required type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. Sharma Residence Renovation" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Issue Date *</label>
                                <input required type="date" name="issueDate" value={formData.issueDate} onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Due Date *</label>
                                <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert" />
                            </div>
                        </div>
                    </Card>

                    {/* Services Card */}
                    <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Building2 className="w-5 h-5" /></div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Select Services *</h2>
                                    <p className="text-xs text-[var(--muted)] mt-0.5">Tap a service to add it, or add a custom entry below.</p>
                                </div>
                            </div>
                            {selectedServices.length > 0 && (
                                <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                                    {selectedServices.length} selected
                                </span>
                            )}
                        </div>

                        {servicesLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--muted-bg)]" />)}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {categories.map((cat) => {
                                    const catServices = availableServices.filter((s) => s.category === cat);
                                    if (!catServices.length) return null;
                                    return (
                                        <div key={cat}>
                                            <p className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border mb-3 ${CATEGORY_COLORS[cat]}`}>
                                                {CATEGORY_LABELS[cat]}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {catServices.map((service) => {
                                                    const sel = selectedServices.find((s) => s.serviceId === service.id);
                                                    const isSelected = !!sel;
                                                    return (
                                                        <div key={service.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-500 bg-blue-500/5 shadow-sm shadow-blue-500/10" : "border-[var(--border)] bg-[var(--background)] hover:border-blue-500/40 hover:bg-[var(--muted-bg)]/50"}`}>
                                                            <button type="button" onClick={() => toggleService(service)} className="w-full flex items-start gap-3 p-4 text-left">
                                                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-500 bg-blue-500" : "border-[var(--border)]"}`}>
                                                                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`font-semibold text-sm leading-tight ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-[var(--foreground)]"}`}>{service.name}</p>
                                                                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed line-clamp-2">{service.description}</p>
                                                                    <p className="text-[10px] font-bold text-[var(--muted)] mt-1.5 uppercase tracking-wide">₹{service.priceRange.min.toLocaleString()} – ₹{service.priceRange.max.toLocaleString()}</p>
                                                                </div>
                                                            </button>
                                                            {isSelected && (
                                                                <div className="border-t border-blue-500/20 px-4 py-3 bg-blue-500/5 flex items-center gap-3">
                                                                    <IndianRupee className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70 mb-1 block">Amount</label>
                                                                        <input type="number" ref={(el) => { amountRefs.current[service.id] = el; }} value={sel?.amount ?? ""}
                                                                            onChange={(e) => updateServiceAmount(service.id, e.target.value)}
                                                                            className="w-full bg-white dark:bg-[var(--background)] border border-blue-500/30 rounded-lg px-3 py-2 text-[var(--foreground)] font-semibold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                                                            placeholder="Enter amount…" min="0" />
                                                                    </div>
                                                                    <button type="button" onClick={() => toggleService(service)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[var(--muted)] transition-colors" title="Remove">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* ── "Other" custom services ───────────────── */}
                                <div>
                                    <p className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border mb-3 bg-purple-500/10 text-purple-500 border-purple-500/20">
                                        Other
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedServices.filter((s) => s.isCustom).map((s) => (
                                            <div key={s.serviceId} className="rounded-xl border border-purple-500/40 bg-purple-500/5 overflow-hidden">
                                                <div className="p-4 space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500/70 mb-1 block">Service Name</label>
                                                        <input
                                                            ref={(el) => { amountRefs.current[`name-${s.serviceId}`] = el; }}
                                                            type="text"
                                                            value={s.name}
                                                            onChange={(e) => updateServiceName(s.serviceId, e.target.value)}
                                                            placeholder="e.g. Custom Wallpaper, Site Survey…"
                                                            className="w-full bg-white dark:bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:border-purple-500 transition-colors font-medium"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <IndianRupee className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500/70 mb-1 block">Amount</label>
                                                            <input
                                                                type="number"
                                                                value={s.amount}
                                                                onChange={(e) => updateServiceAmount(s.serviceId, e.target.value)}
                                                                className="w-full bg-white dark:bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2 text-[var(--foreground)] font-semibold text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                                                placeholder="Enter amount…" min="0"
                                                            />
                                                        </div>
                                                        <button type="button" onClick={() => setSelectedServices((prev) => prev.filter((x) => x.serviceId !== s.serviceId))}
                                                            className="mt-4 flex-shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[var(--muted)] transition-colors" title="Remove">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Add Other button */}
                                        <button type="button" onClick={addOtherService}
                                            className="rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10 text-purple-500 flex items-center justify-center gap-2 py-5 transition-all font-semibold text-sm">
                                            <Plus className="w-4 h-4" />
                                            Add Custom Service
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Totals (services only) */}
                        {selectedServices.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-[var(--muted)] whitespace-nowrap">GST %</label>
                                    <input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange}
                                        className="w-20 bg-[var(--background)] border border-[var(--border)] rounded-lg text-center py-2 text-[var(--foreground)] focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-2 min-w-[220px]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--muted)]">Services subtotal</span>
                                        <span className="font-medium text-[var(--foreground)]">₹{serviceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <p className="text-xs text-[var(--muted)] opacity-60">+ Misc items added in next step</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard/invoices" className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors">Cancel</Link>
                        <button type="button" disabled={!canStep1} onClick={() => setStep(2)}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-[var(--accent)] hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                            {selectedServices.length > 0 ? "Next: Misc Items" : "Skip to Misc Items"} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Miscellaneous items ──────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Miscellaneous Items</h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    {selectedServices.length === 0
                                        ? "No services selected — add at least one item below to create the invoice."
                                        : "Add extra charges like paint, hardware, travel, or any ad-hoc expense."}
                                </p>
                            </div>
                        </div>
                        {!canStep2 && (
                            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
                                <span className="text-lg">⚠️</span>
                                Add at least one item with a name and amount to continue.
                            </div>
                        )}

                        <div className="mt-8 space-y-3">
                            {/* Column headers */}
                            <div className="grid grid-cols-[1fr,160px,44px] gap-3 px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Item Name</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] text-right">Amount (₹)</span>
                                <span />
                            </div>

                            {miscItems.map((m, idx) => (
                                <div key={m.id} className="grid grid-cols-[1fr,160px,44px] gap-3 items-center">
                                    <input
                                        type="text"
                                        value={m.name}
                                        onChange={(e) => updateMisc(m.id, "name", e.target.value)}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        placeholder={idx === 0 ? "e.g. Paint, Hardware, Travel…" : "Item name…"}
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">₹</span>
                                        <input
                                            type="number"
                                            value={m.amount}
                                            onChange={(e) => updateMisc(m.id, "amount", e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-7 pr-3 py-2.5 text-[var(--foreground)] text-right focus:outline-none focus:border-blue-500 transition-colors text-sm font-semibold"
                                            placeholder="0.00"
                                            min="0"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeMisc(m.id)}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-[var(--muted)] transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <button type="button" onClick={addMiscItem}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-blue-500/40 hover:bg-blue-500/5 text-[var(--muted)] hover:text-blue-500 transition-all text-sm font-semibold mt-2">
                                <Plus className="w-4 h-4" />
                                Add Another Item
                            </button>
                        </div>

                        {/* Running totals */}
                        <div className="mt-8 pt-6 border-t border-[var(--border)] max-w-xs ml-auto space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted)]">Services</span>
                                <span className="font-medium text-[var(--foreground)]">₹{serviceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {miscTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--muted)]">Miscellaneous</span>
                                    <span className="font-medium text-[var(--foreground)]">₹{miscTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted)]">GST ({formData.gstPercent}%)</span>
                                <span className="font-medium text-[var(--foreground)]">₹{gstAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-[var(--border)] pt-3">
                                <span className="text-[var(--foreground)]">Total</span>
                                <span className="text-blue-400">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Skip hint */}
                    <p className="text-center text-xs text-[var(--muted)]">No misc items? Leave them blank and continue.</p>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors">Back</button>
                        <button type="button" onClick={() => setStep(3)} disabled={!canStep2}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-[var(--accent)] hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                            Preview Invoice <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Preview + Save ───────────────────────────────────── */}
            {step === 3 && (
                <form onSubmit={handleSave}>
                    {/* Paid-on-the-spot toggle — prominent above preview */}
                    <div className={`mb-6 flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${markedPaid ? "border-emerald-500/50 bg-emerald-500/5" : "border-[var(--border)] bg-[var(--card)]/80"}`}>
                        <div>
                            <p className="font-bold text-[var(--foreground)]">Paying on the spot?</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                                {markedPaid ? "Invoice will be saved as Paid and a PAID seal will appear on the bill." : "Toggle to mark this invoice as paid immediately."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMarkedPaid((v) => !v)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${markedPaid ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "border-[var(--border)] text-[var(--foreground)] hover:border-emerald-500/50 hover:bg-emerald-500/5"}`}
                        >
                            {markedPaid ? <><ToggleRight className="w-5 h-5" /> Paid</> : <><ToggleLeft className="w-5 h-5" /> Mark as Paid</>}
                        </button>
                    </div>

                    {/* Bill Preview */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)]/30 overflow-hidden mb-6">
                        <div className="w-full h-10 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Invoice Preview</span>
                            {markedPaid && <span className="ml-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">PAID seal will appear</span>}
                        </div>
                        <div className="p-4 sm:p-8 bg-neutral-100 dark:bg-neutral-800/40">
                            <Card className="p-8 sm:p-10 border border-[var(--border)] relative overflow-hidden rounded-xl bg-white dark:bg-[var(--card)]">
                                {/* Status stripe */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${markedPaid ? "bg-emerald-500" : "bg-blue-500"}`} />

                                <div className="w-full">
                                    {/* Invoice Header */}
                                    <div className="flex flex-row justify-between items-start gap-8 mb-12">
                                        <div className="flex flex-col gap-2">
                                            <div className="font-heading font-bold tracking-tight text-[var(--foreground)] text-3xl">
                                                Classic<span className="text-blue-600 dark:text-blue-500">Ads</span>
                                            </div>
                                            <div className="text-sm text-[var(--muted)] space-y-0.5 mt-2">
                                                <p>123 Luxury Avenue, Suite 100</p>
                                                <p>Mumbai, MH 400001</p>
                                                <p className="font-medium text-[var(--foreground)] mt-1">GSTIN: 27AABCU9603R1ZM</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <h1 className="text-4xl font-heading font-black tracking-tight text-blue-600 dark:text-blue-500 mb-2">INVOICE</h1>
                                            {[
                                                { label: "No.", value: invoiceNumber },
                                                { label: "Issued", value: new Date(formData.issueDate).toLocaleDateString() },
                                                { label: "Due", value: formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : "—" },
                                                { label: "Status", value: markedPaid ? "PAID" : "DRAFT" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-end gap-4 text-sm w-48">
                                                    <span className="text-[var(--muted)] text-left flex-1">{label}</span>
                                                    <span className={`font-bold text-right ${label === "Status" && markedPaid ? "text-emerald-500" : "text-[var(--foreground)]"}`}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Billing info */}
                                    <div className="grid grid-cols-2 gap-8 mb-10">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-2">Billed To</h3>
                                            <p className="font-bold text-[var(--foreground)] text-lg">{formData.clientName || "—"}</p>
                                            <div className="text-sm text-[var(--muted)] space-y-1">
                                                {formData.clientEmail && <p>{formData.clientEmail}</p>}
                                                {formData.clientNumber && <p>{formData.clientNumber}</p>}
                                                {formData.clientGst && <p className="text-[var(--foreground)]"><span className="text-[var(--muted)] text-xs uppercase tracking-wider mr-2">GSTIN</span>{formData.clientGst}</p>}
                                            </div>
                                        </div>
                                        <div className="border-l border-[var(--border)] pl-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Building2 className="w-4 h-4 text-amber-500" />
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Project Reference</h3>
                                            </div>
                                            <p className="font-semibold text-[var(--foreground)] bg-[var(--muted-bg)] inline-block px-3 py-1.5 rounded-md text-sm border border-[var(--border)]">
                                                {formData.projectTitle || "—"}
                                            </p>
                                            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                                                Services rendered for interior design, consultation, and execution as per the finalized quotation.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Line items */}
                                    <div className="mb-10">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-[var(--border)] text-[var(--foreground)] font-bold text-xs uppercase tracking-wider">
                                                    <th className="py-3 px-2">Description</th>
                                                    <th className="py-3 px-2 text-center w-20">Qty</th>
                                                    <th className="py-3 px-2 text-right w-28">Rate</th>
                                                    <th className="py-3 px-2 text-right w-32">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {allLineItems.map((s) => (
                                                    <tr key={s.serviceId}>
                                                        <td className="py-3 px-2 font-medium text-[var(--foreground)]">
                                                            {s.name || <em className="text-[var(--muted)] font-normal">Unnamed</em>}
                                                            <p className="text-xs font-normal text-[var(--muted)] mt-0.5 line-clamp-1">{s.description}</p>
                                                        </td>
                                                        <td className="py-3 px-2 text-center text-[var(--muted)]">1</td>
                                                        <td className="py-3 px-2 text-right text-[var(--muted)]">{(parseFloat(s.amount) || 0).toLocaleString()}</td>
                                                        <td className="py-3 px-2 text-right font-medium text-[var(--foreground)]">{(parseFloat(s.amount) || 0).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {miscItems.filter((m) => m.name.trim()).length > 0 && (
                                                    <>
                                                        <tr><td colSpan={4} className="py-2 px-2"><span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] opacity-60">Miscellaneous</span></td></tr>
                                                        {miscItems.filter((m) => m.name.trim()).map((m) => (
                                                            <tr key={m.id} className="bg-[var(--muted-bg)]/30">
                                                                <td className="py-3 px-2 font-medium text-[var(--foreground)]">
                                                                    {m.name}
                                                                    <p className="text-xs font-normal text-[var(--muted)] mt-0.5">Miscellaneous charge</p>
                                                                </td>
                                                                <td className="py-3 px-2 text-center text-[var(--muted)]">1</td>
                                                                <td className="py-3 px-2 text-right text-[var(--muted)]">{(parseFloat(m.amount) || 0).toLocaleString()}</td>
                                                                <td className="py-3 px-2 text-right font-medium text-[var(--foreground)]">{(parseFloat(m.amount) || 0).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-10 border-t border-[var(--border)] pt-8 flex-wrap">
                                        <div className="min-w-[200px]">
                                            <h4 className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest mb-4">Payment Options</h4>
                                            <div className="bg-[var(--muted-bg)]/50 p-4 rounded-xl border border-[var(--border)] flex flex-col items-center gap-3 w-fit">
                                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                                    <QRCodeSVG value={total < 100000 ? `upi://pay?pa=9886262303@ybl&pn=Classic%20Ads&am=${Math.round(total)}&cu=INR` : `upi://pay?pa=9886262303@ybl&pn=Classic%20Ads`} size={100} level="L" includeMargin={false} />
                                                </div>
                                                <p className="text-xs font-bold text-[var(--foreground)]">Scan to Pay via UPI</p>
                                                {total >= 100000 && <p className="text-xs text-[var(--muted)]">Enter amount manually</p>}
                                            </div>
                                        </div>

                                        <div className="min-w-[240px] relative">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm py-1">
                                                    <span className="text-[var(--muted)]">Subtotal</span>
                                                    <span className="font-medium text-[var(--foreground)]">INR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-sm py-1">
                                                    <span className="text-[var(--muted)]">GST ({formData.gstPercent}%)</span>
                                                    <span className="font-medium text-[var(--foreground)]">INR {gstAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-[var(--muted-bg)] p-4 rounded-xl border border-[var(--border)] mt-4">
                                                    <span className="text-[var(--foreground)] font-bold">Total Due</span>
                                                    <span className="text-xl font-heading font-black text-blue-500">INR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>

                                            {/* PAID stamp */}
                                            {markedPaid && (
                                                <div className="mt-8 flex justify-end">
                                                    <div className="relative flex items-center justify-center" style={{ transform: 'rotate(-12deg)', width: '110px', height: '110px' }}>
                                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 opacity-90" />
                                                        <div className="absolute inset-[8px] rounded-full border-2 border-emerald-500 opacity-60" />
                                                        <div className="absolute inset-0 rounded-full bg-emerald-500/10" />
                                                        <div className="relative flex flex-col items-center justify-center gap-1 z-10">
                                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-base tracking-[0.2em] uppercase leading-none">PAID</span>
                                                            <span className="text-emerald-600/70 dark:text-emerald-400/70 text-[9px] font-bold tracking-widest uppercase">IN FULL</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 text-center">
                                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold opacity-60">
                                            This is a computer-generated document. No signature is required.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 sm:gap-4 flex-wrap">
                        <button type="button" onClick={() => setStep(2)} className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors text-sm sm:text-base">Back</button>
                        <button type="submit" disabled={loading}
                            onClick={() => { /* Real app would pass "draft" here */ }}
                            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors disabled:opacity-50 text-sm sm:text-base">
                            {loading ? "Saving..." : "Save as Draft"}
                        </button>
                        <button type="submit" disabled={loading}
                            className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-sm sm:text-base ${markedPaid ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"}`}>
                            {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save {markedPaid ? "as Paid" : "& Send"}</>}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
