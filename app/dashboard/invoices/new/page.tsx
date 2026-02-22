"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Send, Download } from "lucide-react";
import Card from "@/components/Card";
import { useRouter } from "next/navigation";

export default function CreateInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientNumber: "",
        clientGst: "",
        projectTitle: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        serviceCharge: "",
        labourCharge: "",
        otherCharge: "",
        gstPercent: "18",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotal = () => {
        const service = parseFloat(formData.serviceCharge) || 0;
        const labour = parseFloat(formData.labourCharge) || 0;
        const other = parseFloat(formData.otherCharge) || 0;
        const subtotal = service + labour + other;
        const gstPct = parseFloat(formData.gstPercent) || 0;
        const gstAmt = subtotal * (gstPct / 100);
        return { subtotal, gstAmt, total: subtotal + gstAmt };
    };

    const { subtotal, gstAmt, total } = calculateTotal();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock save
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard/invoices");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="p-2 rounded-full hover:bg-[var(--muted-bg)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
                            Create Invoice
                        </h1>
                        <p className="text-[var(--muted)] text-sm">Generate a new detailed invoice for a client.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted-bg)] transition-colors text-sm font-semibold">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted-bg)] transition-colors text-sm font-semibold">
                        <Send className="w-4 h-4" />
                        Send Email
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
                    <h2 className="text-xl font-heading font-bold text-[var(--foreground)] mb-6">Client Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Client Name *</label>
                            <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Email Address (Optional)</label>
                            <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Phone Number (Optional)</label>
                            <input type="text" name="clientNumber" value={formData.clientNumber} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. +91 98765 43210" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">GST Number (Optional)</label>
                            <input type="text" name="clientGst" value={formData.clientGst} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 29ABCDE1234F1Z5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
                    <h2 className="text-xl font-heading font-bold text-[var(--foreground)] mb-6">Invoice Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Project/Service Title *</label>
                            <input required type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Living Room Renovation" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Issue Date *</label>
                            <input required type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Due Date *</label>
                            <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">Line Items Breakdown</h3>

                        <div className="grid grid-cols-[1fr,150px] gap-4 items-center">
                            <span className="text-sm font-medium text-[var(--muted)]">Service Charge (₹)</span>
                            <input type="number" name="serviceCharge" value={formData.serviceCharge} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-right focus:outline-none focus:border-blue-500" placeholder="0.00" />
                        </div>

                        <div className="grid grid-cols-[1fr,150px] gap-4 items-center">
                            <span className="text-sm font-medium text-[var(--muted)]">Labour Charge (₹)</span>
                            <input type="number" name="labourCharge" value={formData.labourCharge} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-right focus:outline-none focus:border-blue-500" placeholder="0.00" />
                        </div>

                        <div className="grid grid-cols-[1fr,150px] gap-4 items-center">
                            <span className="text-sm font-medium text-[var(--muted)]">Other Charges (₹)</span>
                            <input type="number" name="otherCharge" value={formData.otherCharge} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-right focus:outline-none focus:border-blue-500" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border)] max-w-xs ml-auto space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--muted)]">Subtotal</span>
                            <span className="text-[var(--foreground)] font-medium">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--muted)] flex items-center gap-2">
                                GST %
                                <input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange} className="w-16 bg-[var(--background)] border border-[var(--border)] rounded text-center py-1 text-[var(--foreground)]" />
                            </span>
                            <span className="text-[var(--foreground)] font-medium">₹{gstAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-[var(--border)] pt-3">
                            <span className="text-[var(--foreground)]">Total</span>
                            <span className="text-blue-400">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/dashboard/invoices" className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-[var(--accent)] hover:text-white transition-all duration-300 disabled:opacity-50">
                        {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Invoice</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
