"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Send, Printer, Building2, User, FileText, CheckCircle2, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import Card from "@/components/Card";
import { useParams } from "next/navigation";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

type InvoiceDetailed = {
    id: string;
    invoiceNumber: string;
    projectTitle: string;
    clientName: string;
    clientEmail?: string;
    clientNumber?: string;
    clientGst?: string;
    issueDate: string;
    dueDate: string;
    status: string;
    serviceCharge: number;
    labourCharge: number;
    otherCharge: number;
    subtotal: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
    currency: string;
};

const statusColors: Record<string, string> = {
    draft: "bg-[var(--muted-bg)] text-[var(--muted)] border-[var(--border)]",
    sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    overdue: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ViewInvoicePage() {
    const params = useParams();
    const documentRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [invoice, setInvoice] = useState<InvoiceDetailed | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(1200);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const updateScale = () => {
            if (scrollContainerRef.current) {
                const containerWidth = scrollContainerRef.current.clientWidth;
                // Leave 32px padding total on mobile, 64px on larger screens
                const padding = window.innerWidth < 640 ? 32 : 64;
                const availableWidth = containerWidth - padding;
                // Calculate scale to exactly fit the available width. Cap it at 1 for desktop so it doesn't get huge.
                const newScale = Math.min(1, availableWidth / 800);
                setScale(Math.max(0.2, newScale)); // Minimum scale 0.2
            }
        };

        // Delay slightly for initial layout to settle
        const timer = setTimeout(updateScale, 50);
        window.addEventListener("resize", updateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", updateScale);
        };
    }, []);

    useEffect(() => {
        if (documentRef.current) {
            setContentHeight(documentRef.current.offsetHeight);
        }
    }, [invoice, scale, isFullScreen]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    useEffect(() => {
        const container = viewerRef.current;
        if (!container) return;

        let startDist = 0;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault(); // Stop native page pinch zoom immediately
                startDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault(); // Block native zooming while actively pinching
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const delta = dist - startDist;
                if (Math.abs(delta) > 5) {
                    setScale(s => Math.min(Math.max(0.3, s + delta * 0.005), 3));
                    startDist = dist;
                }
            }
        };

        container.addEventListener("touchstart", onTouchStart, { passive: false });
        container.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            container.removeEventListener("touchstart", onTouchStart);
            container.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const generatePDF = async (): Promise<jsPDF | null> => {
        if (!documentRef.current || !invoice) return null;

        const htmlEl = document.documentElement;
        const wasDark = htmlEl.classList.contains("dark");
        if (wasDark) {
            htmlEl.classList.remove("dark");
            htmlEl.classList.add("light");
            htmlEl.style.colorScheme = "light";
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 50));

            const dataUrl = await toJpeg(documentRef.current, {
                pixelRatio: 2,
                quality: 0.95,
                backgroundColor: "#ffffff",
                style: { transform: 'none' },
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error);
            return null;
        } finally {
            if (wasDark) {
                htmlEl.classList.add("dark");
                htmlEl.classList.remove("light");
                htmlEl.style.colorScheme = "dark";
            }
        }
    };

    const handlePrint = async () => {
        setIsDownloading(true);
        const pdf = await generatePDF();
        setIsDownloading(false);

        if (pdf) {
            const blob = pdf.output("blob");
            const blobUrl = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.contentWindow?.print();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(blobUrl);
            }, 1000 * 60 * 5); // Allow 5 minutes for print dialog before revoking
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        const pdf = await generatePDF();
        setIsDownloading(false);

        if (pdf) {
            pdf.save(`Invoice_${invoice?.invoiceNumber}.pdf`);
        }
    };

    useEffect(() => {
        fetch(`/api/invoices?id=${params.id}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data.error) {
                    const service = data.items?.[0]?.amount || 0;
                    const labour = data.items?.[1]?.amount || 0;
                    const other = data.items?.[2]?.amount || 0;

                    setInvoice({
                        ...data,
                        clientNumber: "+91 98765 00000",
                        clientGst: "29AAAAA0000A1Z5",
                        serviceCharge: service,
                        labourCharge: labour,
                        otherCharge: other,
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="h-10 w-48 animate-pulse rounded-lg bg-[var(--muted-bg)]" />
                <div className="h-[600px] animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--muted)]">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl font-heading mb-4">Invoice not found</p>
                <Link href="/dashboard/invoices" className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg">Return to Invoices</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    body * { visibility: hidden; }
                    #print-section, #print-section * { visibility: visible; }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        transform: none !important;
                        box-shadow: none !important;
                    }
                    /* Override height on containers so print is not cut off */
                    .custom-scrollbar {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    /* Force light theme colors on print */
                    .dark { color-scheme: light !important; }
                }
            `}} />

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="p-2 rounded-full hover:bg-[var(--muted-bg)] border border-transparent hover:border-[var(--border)] transition-all text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)] tracking-tight">
                                {invoice.invoiceNumber}
                            </h1>
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${statusColors[invoice.status] || statusColors.draft}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 print:hidden">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted-bg)] transition-colors text-xs text-sm font-semibold disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{isDownloading ? "Saving..." : "PDF"}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted-bg)] transition-colors text-xs text-sm font-semibold"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 text-xs text-sm font-bold">
                        <Send className="w-4 h-4" />
                        Send Email
                    </button>
                </div>
            </div>

            {/* Structured Invoice Document */}
            <div ref={viewerRef} className="w-full flex-col flex items-center bg-[var(--background)] sm:bg-[var(--muted-bg)]/20 mt-4 border-y border-[var(--border)] sm:border sm:rounded-xl overflow-hidden print:border-none print:mt-0 print:bg-transparent">

                {/* Custom PDF Viewer Controls */}
                <div className="w-full h-12 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 print:hidden shrink-0 shadow-sm z-10 relative">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Preview Document</span>
                    <div className="flex items-center gap-1.5 sm:gap-3 bg-[var(--muted-bg)] p-1 rounded-lg border border-[var(--border)]">
                        <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"><ZoomOut className="w-4 h-4" /></button>
                        <span className="text-xs font-mono w-12 text-center font-medium text-[var(--foreground)]">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"><ZoomIn className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-[var(--border)] mx-1" />
                        <button onClick={toggleFullScreen} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
                            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* PDF Viewer Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    className="w-full overflow-auto flex justify-center p-4 sm:p-8 custom-scrollbar bg-neutral-100 dark:bg-neutral-800/40 print:bg-transparent print:p-0"
                    style={{ height: isFullScreen ? 'calc(100vh - 48px)' : 'calc(100vh - 200px)', touchAction: 'pan-x pan-y' }}
                >
                    <div
                        style={{
                            width: `${800 * scale}px`,
                            height: `${contentHeight * scale}px`,
                            transition: 'width 0.2s ease-out, height 0.2s ease-out',
                            position: 'relative'
                        }}
                    >
                        <div
                            id="print-section"
                            ref={documentRef}
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                width: '800px',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                            }}
                            className="bg-white dark:bg-[var(--card)] shadow-2xl print:shadow-none rounded-xl print:rounded-none"
                        >
                            <Card className="p-8 sm:p-12 border border-[var(--border)] print:border-none relative overflow-hidden rounded-xl print:rounded-none bg-[var(--card)] print:bg-transparent">
                                {/* Document Border Status Color Indicator (Hidden in print to save ink unless 'background graphics' is ticked) */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${invoice.status === 'paid' ? 'bg-emerald-500' : invoice.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`} />

                                <div className="w-full">
                                    {/* Header Section */}
                                    <div className="flex flex-row justify-between items-start gap-8 mb-16">
                                        <div className="flex flex-col gap-2">
                                            {/* Minimal Text Logo matching Nav */}
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
                                            <div className="flex justify-end gap-4 text-sm w-48">
                                                <span className="text-[var(--muted)] text-left flex-1">No.</span>
                                                <span className="font-bold text-[var(--foreground)] text-right">{invoice.invoiceNumber}</span>
                                            </div>
                                            <div className="flex justify-end gap-4 text-sm w-48">
                                                <span className="text-[var(--muted)] text-left flex-1">Issued</span>
                                                <span className="font-medium text-[var(--foreground)] text-right">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-end gap-4 text-sm w-48">
                                                <span className="text-[var(--muted)] text-left flex-1">Due</span>
                                                <span className="font-medium text-[var(--foreground)] text-right">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Billing Info Grid — Clean & Minimal */}
                                    <div className="grid grid-cols-2 gap-8 mb-12">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-2">Billed To</h3>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)] text-lg mb-1">{invoice.clientName}</p>
                                                <div className="text-sm text-[var(--muted)] space-y-1">
                                                    {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                                                    {invoice.clientNumber && <p>{invoice.clientNumber}</p>}
                                                    {invoice.clientGst && <p className="mt-2 text-[var(--foreground)]"><span className="text-[var(--muted)] text-xs uppercase tracking-wider mr-2">GSTIN</span> {invoice.clientGst}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative border-l border-[var(--border)] pl-8">
                                            <div className="flex items-center gap-2 mb-2 text-[var(--foreground)]">
                                                <FileText className="w-4 h-4 text-amber-500" />
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Project Reference</h3>
                                            </div>
                                            <div className="pl-6">
                                                <p className="font-semibold text-[var(--foreground)] bg-[var(--muted-bg)] inline-block px-3 py-1.5 rounded-md text-sm border border-[var(--border)]">
                                                    {invoice.projectTitle}
                                                </p>
                                                <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                                                    Services rendered for interior design, consultation, and execution as per the finalized quotation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items Table */}
                                    <div className="mb-12">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-[var(--border)] text-[var(--foreground)] font-bold text-xs uppercase tracking-wider text-left">
                                                    <th className="py-3 px-2">Description</th>
                                                    <th className="py-3 px-2 text-center w-24">Qty</th>
                                                    <th className="py-3 px-2 text-right w-32">Rate ({invoice.currency})</th>
                                                    <th className="py-3 px-2 text-right w-40">Amount ({invoice.currency})</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {invoice.serviceCharge > 0 && (
                                                    <tr>
                                                        <td className="py-4 px-2 font-medium text-[var(--foreground)]">
                                                            Design & Service Charge
                                                            <p className="text-xs font-normal text-[var(--muted)] mt-1">Professional consultation and finalized 3D renders</p>
                                                        </td>
                                                        <td className="py-4 px-2 text-center text-[var(--muted)]">1</td>
                                                        <td className="py-4 px-2 text-right text-[var(--muted)]">{invoice.serviceCharge.toLocaleString()}</td>
                                                        <td className="py-4 px-2 text-right font-medium text-[var(--foreground)]">{invoice.serviceCharge.toLocaleString()}</td>
                                                    </tr>
                                                )}
                                                {invoice.labourCharge > 0 && (
                                                    <tr>
                                                        <td className="py-4 px-2 font-medium text-[var(--foreground)]">
                                                            Labour & Execution Charge
                                                            <p className="text-xs font-normal text-[var(--muted)] mt-1">On-site execution, management and assembly</p>
                                                        </td>
                                                        <td className="py-4 px-2 text-center text-[var(--muted)]">1</td>
                                                        <td className="py-4 px-2 text-right text-[var(--muted)]">{invoice.labourCharge.toLocaleString()}</td>
                                                        <td className="py-4 px-2 text-right font-medium text-[var(--foreground)]">{invoice.labourCharge.toLocaleString()}</td>
                                                    </tr>
                                                )}
                                                {invoice.otherCharge > 0 && (
                                                    <tr>
                                                        <td className="py-4 px-2 font-medium text-[var(--foreground)]">
                                                            Material & Logistics
                                                            <p className="text-xs font-normal text-[var(--muted)] mt-1">Transport, handling, and miscellaneous procuring</p>
                                                        </td>
                                                        <td className="py-4 px-2 text-center text-[var(--muted)]">1</td>
                                                        <td className="py-4 px-2 text-right text-[var(--muted)]">{invoice.otherCharge.toLocaleString()}</td>
                                                        <td className="py-4 px-2 text-right font-medium text-[var(--foreground)]">{invoice.otherCharge.toLocaleString()}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals & Payment (Bottom section) */}
                                    <div className="flex flex-row justify-between items-start gap-12 border-t border-[var(--border)] pt-8">

                                        {/* Payment Method (QR Code fallback logic) */}
                                        <div className="w-[300px]">
                                            <h4 className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest mb-4">Payment Options</h4>

                                            {invoice.total < 100000 ? (
                                                <div className="bg-[var(--muted-bg)]/50 p-4 rounded-xl border border-[var(--border)] flex flex-col items-center justify-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                                        <QRCodeSVG
                                                            value={`upi://pay?pa=9886262303@ybl&pn=Classic%20Ads&am=${invoice.total}&cu=INR`}
                                                            size={120}
                                                            level="L"
                                                            includeMargin={false}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-[var(--foreground)]">Scan to Pay via UPI</p>
                                                        <p className="text-xs text-[var(--muted)] mt-0.5">GPay, PhonePe, Paytm accepted</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-[var(--muted-bg)]/50 p-4 rounded-xl border border-[var(--border)] flex flex-col items-center justify-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                                        <QRCodeSVG
                                                            value={`upi://pay?pa=9886262303@ybl&pn=Classic%20Ads`}
                                                            size={120}
                                                            level="L"
                                                            includeMargin={false}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-[var(--foreground)]">Scan to Pay via UPI</p>
                                                        <p className="text-xs text-[var(--muted)] mt-0.5">Enter custom amount in app</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Calculations Container (Bottom Right) */}
                                        <div className="w-[300px]">
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm py-1">
                                                    <span className="text-[var(--muted)]">Subtotal</span>
                                                    <span className="font-medium text-[var(--foreground)]">{invoice.currency} {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-sm py-1">
                                                    <span className="text-[var(--muted)]">GST ({invoice.gstPercent}%)</span>
                                                    <span className="font-medium text-[var(--foreground)]">{invoice.currency} {invoice.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>

                                                <div className="flex justify-between items-center bg-[var(--muted-bg)] p-4 rounded-xl border border-[var(--border)] mt-4 shadow-inner">
                                                    <span className="text-[var(--foreground)] font-bold">Total Due</span>
                                                    <span className="text-xl font-heading font-black text-blue-500 tracking-tight">
                                                        {invoice.currency} {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            {invoice.status === 'paid' && (
                                                <div className="mt-8 flex items-center justify-end gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm border-2 border-emerald-500/20 bg-emerald-500/5 px-4 py-3 rounded-lg rotate-[-2deg] max-w-fit ml-auto shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    PAID IN FULL
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Warning */}
                                    <div className="mt-16 text-center">
                                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold opacity-60">
                                            This is a computer-generated document. No signature is required.
                                        </p>
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
