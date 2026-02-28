"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, GripVertical, CheckCircle2 } from "lucide-react";

interface MultipleImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    label?: string;
    description?: string;
}

export function MultipleImageUpload({ value, onChange, label, description }: MultipleImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setError("");

        const newUrls: string[] = [];

        try {
            // Upload files sequentially to avoid rate limiting or large payload issues
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
                }

                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Failed to upload ${file.name}`);
                }

                newUrls.push(data.url);
            }

            onChange([...value, ...newUrls]);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    // Drag and Drop Handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-4">
            {(label || description) && (
                <div>
                    {label && <label className="text-sm font-bold text-[var(--foreground)]">{label}</label>}
                    {description && <p className="text-xs text-[var(--muted)] mt-1">{description}</p>}
                </div>
            )}

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging
                        ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)] hover:bg-[var(--card)]"
                    }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleUpload(e.target.files)}
                    accept="image/*"
                    multiple
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-[var(--muted-bg)] rounded-full text-[var(--muted)] group-hover:scale-110 transition-transform">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        ) : (
                            <UploadCloud className="w-8 h-8 group-hover:text-blue-500 transition-colors" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">
                            {isUploading ? "Uploading images..." : "Click or drag images here"}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-1">SVG, PNG, JPG, WEBP (max 5MB each)</p>
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">{error}</p>}

                    {!isUploading && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Browse Files
                        </button>
                    )}
                </div>
            </div>

            {/* Gallery Preview Area */}
            {value.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        <span>Gallery ({value.length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {value.map((url, index) => (
                            <div key={`${url}-${index}`} className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted-bg)] shadow-sm hover:shadow-md transition-all">
                                <Image
                                    src={url}
                                    alt={`Gallery Image ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full translate-y-4 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                        title="Remove Image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                                    {index === 0 ? "Cover" : `#${index + 1}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
