"use client";

import { useState, useEffect } from "react";
import { Store, User, Calendar, Image as ImageIcon, CreditCard, Building, Phone, Mail, MapPin, Navigation, Save, Loader2, CheckCircle2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface ProfileFormData {
    ownerName: string;
    shopName: string;
    startedBusinessAt: string;
    profileImage: string;
    upiId: string;
    gstNumber: string;
    phone: string;
    email: string;
    address: string;
    googleMapsLocation: string;
    signatureImage: string;
    mapEmbedUrl: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

    const [formData, setFormData] = useState<ProfileFormData>({
        ownerName: "",
        shopName: "",
        startedBusinessAt: "",
        profileImage: "",
        upiId: "",
        gstNumber: "",
        phone: "",
        email: "",
        address: "",
        googleMapsLocation: "",
        signatureImage: "",
        mapEmbedUrl: "",
    });

    // Unsaved changes warning (browser native dialog)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (initialData && JSON.stringify(formData) !== JSON.stringify(initialData)) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [formData, initialData]);

    // Auto-dismiss error messages (success already had 3s timeout)
    useEffect(() => {
        if (message.text && message.type === "error") {
            const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => {
                if (data.profile) {
                    let formattedDate = "";
                    if (data.profile.startedBusinessAt) {
                        formattedDate = new Date(data.profile.startedBusinessAt).toISOString().split('T')[0];
                    }

                    const loadedData: ProfileFormData = {
                        ownerName: data.profile.ownerName ?? "",
                        shopName: data.profile.shopName ?? "",
                        startedBusinessAt: formattedDate ?? "",
                        profileImage: data.profile.profileImage ?? "",
                        upiId: data.profile.upiId ?? "",
                        gstNumber: data.profile.gstNumber ?? "",
                        phone: data.profile.phone ?? "",
                        email: data.profile.email ?? "",
                        address: data.profile.address ?? "",
                        googleMapsLocation: data.profile.googleMapsLocation ?? "",
                        signatureImage: data.profile.signatureImage ?? "",
                        mapEmbedUrl: data.profile.mapEmbedUrl ?? "",
                    };

                    setFormData(loadedData);
                    setInitialData(loadedData);   // save snapshot for dirty check
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: "error", text: "Failed to load profile data." });
                setLoading(false);
            });
    }, []);

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
        if (!formData.shopName.trim()) newErrors.shopName = "Shop/Business name is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!formData.email.trim()) newErrors.email = "Email address is required";

        // Email format
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Phone (basic Indian format: optional +91, starts with 6-9, 10 digits)
        if (formData.phone && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Please enter a valid 10-digit Indian phone number";
        }

        // GST (Indian GSTIN format - only if provided)
        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber.toUpperCase())) {
            newErrors.gstNumber = "Please enter a valid 15-character GST number";
        }


        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field error on change
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setMessage({ type: "error", text: "Please correct the errors below before saving." });
            setSaving(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                mapEmbedUrl: formData.mapEmbedUrl.trim() || null
            };

            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save profile");

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setInitialData({ ...formData }); // reset dirty state
            setErrors({});

            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header section - unchanged */}
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <Store className="w-6 h-6 text-blue-500" /> Business Profile
                    </h1>
                    <p className="text-[var(--muted)] text-sm max-w-lg">
                        Manage your company details, contact information, and payment identifiers. These details will be used across the application and on your generated invoices.
                    </p>
                </div>
                <div className="hidden sm:block text-blue-500/20">
                    <Building className="w-32 h-32 absolute -right-6 -bottom-6" />
                </div>
            </div>

            {/* Status Message - now with aria-live and auto-dismiss for errors */}
            {message.text && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center gap-3 transition-all ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : null}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                {/* General Information */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[var(--muted)]" /> General Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="ownerName" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Owner Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="ownerName"
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--background)] border rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors ${errors.ownerName ? "border-red-500" : "border-[var(--border)]"}`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.ownerName && <p className="text-red-500 text-xs ml-1 mt-1">{errors.ownerName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="shopName" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Shop/Business Name</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="shopName"
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--background)] border rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors ${errors.shopName ? "border-red-500" : "border-[var(--border)]"}`}
                                    placeholder="Classic Ads"
                                />
                            </div>
                            {errors.shopName && <p className="text-red-500 text-xs ml-1 mt-1">{errors.shopName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="startedBusinessAt" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Business Started Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="startedBusinessAt"
                                    type="date"
                                    name="startedBusinessAt"
                                    value={formData.startedBusinessAt}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <ImageUpload
                                label="Profile Image / Logo"
                                value={formData.profileImage}
                                onChange={(url) => setFormData(p => ({ ...p, profileImage: url }))}
                            />
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <ImageUpload
                                label="Authorized Signature"
                                value={formData.signatureImage}
                                onChange={(url) => setFormData(p => ({ ...p, signatureImage: url }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information - all other sections identical except added ids, htmlFor, and conditional error styling */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[var(--muted)]" /> Contact Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--background)] border rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors ${errors.phone ? "border-red-500" : "border-[var(--border)]"}`}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs ml-1 mt-1">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--background)] border rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors ${errors.email ? "border-red-500" : "border-[var(--border)]"}`}
                                    placeholder="owner@classicads.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Physical Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-5 h-5 text-[var(--muted)]" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors resize-y custom-scrollbar"
                                    placeholder="123 Main Street, City, State, ZIP"
                                ></textarea>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label htmlFor="googleMapsLocation" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">Google Maps Link</label>
                            <div className="relative">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="googleMapsLocation"
                                    type="url"
                                    name="googleMapsLocation"
                                    value={formData.googleMapsLocation}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label
                                htmlFor="mapEmbedUrl"
                                className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1"
                            >
                                Google Maps Embed URL
                            </label>

                            <div className="relative">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="mapEmbedUrl"
                                    type="url"
                                    name="mapEmbedUrl"
                                    value={formData.mapEmbedUrl}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                />
                            </div>

                            <p className="text-xs text-[var(--muted)] ml-1">
                                Use Google Maps → Share → Embed a map → Copy HTML → Paste the src URL here.
                            </p>
                        </div>


                    </div>
                </div>

                {/* Billing & Tax */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[var(--muted)]" /> Billing & Tax Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="gstNumber" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">GST Number</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="gstNumber"
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--background)] border rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors uppercase ${errors.gstNumber ? "border-red-500" : "border-[var(--border)]"}`}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                            {errors.gstNumber && <p className="text-red-500 text-xs ml-1 mt-1">{errors.gstNumber}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="upiId" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">UPI ID</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    id="upiId"
                                    type="text"
                                    name="upiId"
                                    value={formData.upiId}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="classicads@okicici"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Save Button - unchanged */}
                <div className="fixed bottom-0 left-0 sm:left-64 right-0 p-4 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)] flex justify-end z-20">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}