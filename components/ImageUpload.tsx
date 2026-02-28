"use client";

import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, label, className = "" }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to upload image');

            onChange(data.url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">{label}</label>}

            {value ? (
                <div className="relative rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden group h-32 md:h-40 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Uploaded preview" className="object-contain h-full w-full p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => onChange("")} // Clears the value
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove Image"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 h-32 md:h-40 cursor-pointer transition-all
                        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] hover:border-[var(--muted)] bg-[var(--background)]'}
                        ${error ? 'border-red-500 bg-red-500/5' : ''}
                    `}
                >
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleUpload(e.target.files[0]);
                            }
                        }}
                    />

                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-[var(--muted)]">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <div className={`p-3 rounded-full mb-2 ${isDragging ? 'bg-blue-500 text-white' : 'bg-[var(--muted-bg)] text-[var(--muted)]'}`}>
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-[var(--foreground)]">
                                Click to upload <span className="text-[var(--muted)] font-normal">or drag and drop</span>
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        </div>
    );
}
