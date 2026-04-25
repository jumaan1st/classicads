"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Printer, FileText, CheckCircle2, ShieldCheck, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import Card from "@/components/Card";
import { useParams } from "next/navigation";
import { generateInvoicePDF } from "@/app/lib/pdf-generator";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyInvoicePage() {
    const params = useParams();
    const documentRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Note: 'any' type used purely for view bridging
    const [invoice, setInvoice] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(1200);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        fetch(`/api/verify?id=${params.id}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data.error && data.invoice) {
                    setInvoice({ ...data.invoice, clientNumber: data.invoice.clientNumber || "+91 98765 00000", clientGst: data.invoice.clientGst || "29AAAAA0000A1Z5" });
                    setProfile(data.profile);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        const recalculate = () => {
            if (!scrollContainerRef.current) return;
            const containerWidth = scrollContainerRef.current.clientWidth;
            const padding = window.innerWidth < 640 ? 32 : 64;
            const availableWidth = Math.max(containerWidth - padding, 100);
            const newScale = Math.min(1, availableWidth / 800);
            setScale(Math.max(0.2, newScale));
            if (documentRef.current) setContentHeight(documentRef.current.offsetHeight);
        };
        const containerObserver = new ResizeObserver(recalculate);
        if (scrollContainerRef.current) containerObserver.observe(scrollContainerRef.current);
        const docObserver = new ResizeObserver(recalculate);
        if (documentRef.current) docObserver.observe(documentRef.current);
        recalculate();
        return () => { containerObserver.disconnect(); docObserver.disconnect(); };
    }, [invoice, isFullScreen]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const handlePrint = async () => {
        if (!invoice || !profile) return;
        setIsDownloading(true);
        try {
            const pdf = await generateInvoicePDF(invoice, profile);
            const blobUrl = URL.createObjectURL(pdf.output("blob"));
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => { iframe.contentWindow?.print(); };
            setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(blobUrl); }, 1000 * 60 * 5);
        } catch (error) {
            console.error("Error creating print PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoice || !profile) return;
        setIsDownloading(true);
        try {
            const pdf = await generateInvoicePDF(invoice, profile);
            pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto p-6 mt-10">
                <div className="h-12 w-full animate-pulse rounded-lg bg-[var(--muted-bg)]" />
                <div className="h-[600px] animate-pulse rounded-2xl bg-[var(--muted-bg)] mt-4" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--muted)]">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl font-heading mb-2">Secure Invoice Not Found</p>
                <p className="text-sm">The requested document might have been deleted or doesn't exist.</p>
            </div>
        );
    }

    const isPaid = invoice.status === "paid";

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12 pt-8 px-4 sm:px-0">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin-top: 15mm; margin-bottom: 15mm; margin-left: 0 !important; margin-right: 0 !important; }
                    @page :first { margin-top: 0 !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    aside, header, nav, footer { display: none !important; }
                    html, body, *:has(#print-section) { margin: 0 !important; padding: 0 !important; border: none !important; width: 100vw !important; max-width: none !important; height: auto !important; max-height: none !important; overflow: visible !important; position: static !important; transform: none !important; box-shadow: none !important; background: transparent !important; box-sizing: border-box !important; }
                    #print-section { position: static !important; transform: none !important; width: 100vw !important; max-width: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; border: none !important; border-radius: 0 !important; box-sizing: border-box !important; }
                    .dark { color-scheme: light !important; }
                }
            `}} />

            {/* Public Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden px-4 md:px-0">
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <h2 className="text-sm font-bold tracking-tight leading-none mb-1">Official Document Interface</h2>
                        <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Read-Only verification mode</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted-bg)] transition-colors text-sm font-semibold disabled:opacity-50 shadow-sm"><Download className="w-4 h-4" /><span className="hidden sm:inline">{isDownloading ? "Saving..." : "Download"}</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted-bg)] transition-colors text-sm font-semibold shadow-sm"><Printer className="w-4 h-4" /><span className="hidden sm:inline">Print</span></button>
                </div>
            </div>

            {/* Document Viewer */}
            <div ref={viewerRef} className="w-full flex-col flex items-center bg-[var(--background)] sm:bg-[var(--muted-bg)]/20 border-y border-[var(--border)] sm:border sm:rounded-xl overflow-hidden print:border-none print:mt-0 print:bg-transparent shadow-sm">
                
                {/* Controls */}
                <div className="w-full h-12 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 print:hidden shrink-0 shadow-sm z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Document Rendering</span>
                    <div className="flex items-center gap-1.5 sm:gap-3 bg-[var(--muted-bg)] p-1 rounded-lg border border-[var(--border)]">
                        <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)]"><ZoomOut className="w-4 h-4" /></button>
                        <span className="text-xs font-mono w-12 text-center font-medium text-[var(--foreground)]">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)]"><ZoomIn className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-[var(--border)] mx-1" />
                        <button onClick={toggleFullScreen} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)]">{isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>
                    </div>
                </div>

                <div ref={scrollContainerRef} className="w-full overflow-auto flex justify-center py-4 sm:py-8 bg-neutral-100 dark:bg-neutral-800/40 print:bg-transparent print:p-0 print:m-0" style={{ height: isFullScreen ? 'calc(100vh - 48px)' : 'calc(100vh - 200px)' }}>
                    <div className="print-reset-wrapper" style={{ width: `${800 * scale}px`, height: `${contentHeight * scale}px`, flexShrink: 0, position: 'relative' }}>
                        <div id="print-section" ref={documentRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '800px', position: 'absolute', left: 0, top: 0 }} className="bg-white dark:bg-[var(--card)] shadow-2xl print:shadow-none rounded-xl print:rounded-none print:!w-full print:!h-auto print:!static print:transform-none">
                            <Card className="p-0 border border-[var(--border)] relative overflow-hidden rounded-xl bg-white dark:bg-[var(--card)] print:bg-transparent print:border-none print:shadow-none print:rounded-none">
                                <div className="w-full">
                                    {/* 1. Header section (24px 32px padding) */}
                                    <div className="flex flex-row justify-between items-start pt-[32px] px-[32px] pb-[24px]">
                                        {/* Left */}
                                        <div className="flex flex-col gap-[8px]">
                                            <div className="font-medium text-[22px] leading-none text-[var(--foreground)]">{profile?.shopName || "ClassAds"}</div>
                                            <div className="text-[12px] text-[var(--muted)] leading-[1.5]">
                                                <p>{profile?.address || "123 Luxury Avenue, Suite 100"}</p>
                                            </div>
                                            {profile?.gstNumber && (
                                                <div className="mt-[4px] inline-flex items-center px-2 py-1 bg-[var(--muted-bg)] border border-[var(--border)] rounded text-[11px] font-mono text-[var(--muted)] w-fit">
                                                    GSTIN: {profile.gstNumber}
                                                </div>
                                            )}
                                        </div>
                                        {/* Right */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify/${invoice.id}`} size={64} level="M" includeMargin={false} />
                                                <span className="text-[9px] text-[var(--muted)] mt-1.5 font-bold uppercase tracking-widest">Scan to Verify</span>
                                            </div>
                                            <div className="flex flex-col items-end pt-1">
                                                <h1 className="text-[20px] font-black tracking-tight text-[#185FA5] leading-none mb-2">INVOICE</h1>
                                                {isPaid && (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full text-[12px] font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        PAID
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Grey Meta Strip (edge-to-edge) */}
                                    <div className="px-[32px] py-[20px] bg-[var(--muted-bg)]/80 border-y border-[var(--border)] grid grid-cols-4">
                                        <div className="flex flex-col pr-4">
                                            <span className="text-[11px] font-semibold uppercase text-[var(--muted)]">Invoice No.</span>
                                            <span className="text-[13px] font-medium text-[var(--foreground)] mt-1">{invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex flex-col px-4 border-l border-[var(--border)]">
                                            <span className="text-[11px] font-semibold uppercase text-[var(--muted)]">Issued On</span>
                                            <span className="text-[13px] font-medium text-[var(--foreground)] mt-1">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col px-4 border-l border-[var(--border)]">
                                            <span className="text-[11px] font-semibold uppercase text-[var(--muted)]">Due Date</span>
                                            <span className="text-[13px] font-medium text-[var(--foreground)] mt-1">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col pl-4 border-l border-[var(--border)]">
                                            <span className="text-[11px] font-semibold uppercase text-[var(--muted)]">Status</span>
                                            <span className={`text-[13px] font-medium mt-1 ${isPaid ? 'text-emerald-500' : invoice.status === 'overdue' ? 'text-red-500' : 'text-blue-500'}`}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Billed To + Project Reference */}
                                    <div className="grid grid-cols-2 gap-[24px] px-[32px] py-[24px]">
                                        <div className="flex flex-col gap-[8px]">
                                            <h3 className="text-[11px] font-bold uppercase text-[var(--muted)]">Billed To</h3>
                                            <div>
                                                <div className="text-[13px] font-medium text-[var(--foreground)] mb-0.5">{invoice.clientName}</div>
                                                <div className="text-[12px] text-[var(--muted)] leading-relaxed">
                                                    {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                                                    {invoice.clientNumber && <p>{invoice.clientNumber}</p>}
                                                    {invoice.clientGst && <p className="mt-1 font-mono text-[11px]">GSTIN: {invoice.clientGst}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-[8px]">
                                            <h3 className="text-[11px] font-bold uppercase text-[var(--muted)]">Project Reference</h3>
                                            <div>
                                                <div className="text-[13px] font-medium text-[var(--foreground)] mb-0.5">{invoice.projectTitle}</div>
                                                <p className="text-[12px] text-[var(--muted)] leading-relaxed">Services rendered for interior design, consultation, and execution as per the finalized quotation.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Line Items Table */}
                                    <div className="px-[32px] pb-[24px]">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b-[0.5px] border-[var(--border)]">
                                                    <th className="py-3 px-2 text-[11px] font-bold uppercase text-[var(--muted)] font-sans">Description</th>
                                                    <th className="py-3 px-2 text-[11px] font-bold uppercase text-[var(--muted)] text-center font-sans">Qty</th>
                                                    <th className="py-3 px-2 text-[11px] font-bold uppercase text-[var(--muted)] text-right font-sans">Rate ({invoice.currency})</th>
                                                    <th className="py-3 px-2 text-[11px] font-bold uppercase text-[var(--muted)] text-right font-sans">Amount ({invoice.currency})</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-[0.5px] divide-[var(--border)]">
                                                {invoice.items.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 px-2">
                                                            <div className="text-[13px] font-medium text-[var(--foreground)]">{item.description}</div>
                                                            <div className="text-[12px] text-[var(--muted)] mt-[2px]">Professional service as per scope of work</div>
                                                        </td>
                                                        <td className="py-3 px-2 text-center text-[13px] text-[var(--muted)]">{item.quantity}</td>
                                                        <td className="py-3 px-2 text-right text-[13px] text-[var(--muted)]">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3 px-2 text-right text-[13px] font-medium text-[var(--foreground)]">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 5. Footer Layout: Flex Split */}
                                    <div className="flex justify-between items-end px-[32px] pb-[24px] print-break-inside-avoid">
                                        <div className="flex flex-col items-center justify-center p-3 mt-4 border border-[var(--border)] rounded-lg bg-[var(--muted-bg)]/30 w-fit">
                                            <QRCodeSVG value={invoice.total < 100000 ? `upi://pay?pa=${profile?.upiId || "9886262303@ybl"}&pn=${encodeURIComponent(profile?.shopName || "ClassAds")}&am=${invoice.total}&cu=INR` : `upi://pay?pa=${profile?.upiId || "9886262303@ybl"}&pn=${encodeURIComponent(profile?.shopName || "ClassAds")}`} size={90} level="L" includeMargin={false} />
                                            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-2">Secure Payment QR</span>
                                        </div>
                                        
                                        <div className="min-w-[240px] flex flex-col gap-2">
                                            <div className="flex justify-between text-[13px] text-[var(--muted)]"><span className="text-[13px] text-[var(--muted)]">Subtotal</span><span>{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between text-[13px] text-[var(--muted)]"><span className="text-[13px] text-[var(--muted)]">CGST ({invoice.cgstPercent}%)</span><span>{invoice.cgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between text-[13px] text-[var(--muted)]"><span className="text-[13px] text-[var(--muted)]">SGST ({invoice.sgstPercent}%)</span><span>{invoice.sgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between items-center border-t-[0.5px] border-[var(--border)] pt-2 mt-1">
                                                <span className="text-[13px] font-medium text-[var(--foreground)]">Total Due</span>
                                                <span className="text-[20px] font-medium text-[#185FA5]">{invoice.currency} {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 7. Bottom Bar */}
                                    <div className="flex justify-between items-end px-[32px] py-[16px] border-t-[0.5px] border-[var(--border)] bg-[#fafafa] dark:bg-[var(--muted-bg)]/20">
                                        <span className="text-[11px] text-[var(--muted)] self-end">This is a secure electronic document. Authenticity electronically verified.</span>
                                        <div className="flex flex-col items-end gap-1">
                                            {profile?.signatureImage && (
                                                <img src={profile.signatureImage} alt="Authorized Signature" className="h-14 w-auto object-contain" />
                                            )}
                                            <div className="border-t border-[var(--border)] pt-1 mt-1 min-w-[180px] text-right">
                                                <span className="text-[12px] font-medium text-[var(--foreground)]">{profile?.shopName || "ClassAds"}</span>
                                                <span className="text-[11px] text-[var(--muted)] block">Authorised Signatory</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
