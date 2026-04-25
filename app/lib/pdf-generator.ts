import jsPDF from "jspdf";
import QRCode from "qrcode";

/** Convert a remote image URL to a base64 data URL via server-side proxy (bypasses CORS). */
async function imageUrlToBase64(url: string): Promise<string | null> {
    try {
        // Route through our server-side proxy to avoid CORS on R2/CDN
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) return null;
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

/**
 * Production-grade vector PDF invoice generator.
 * 
 * KEY DESIGN RULES:
 * 1. Never re-derive totals — render only what the UI already computed.
 * 2. Never split a row across pages — always keep rows whole.
 * 3. Repeat table headers on every new page.
 * 4. All body text >= 9pt. Item names 10pt. Total 14pt.
 * 5. Alternating row fills for visual separation.
 */
export async function generateInvoicePDF(invoice: any, profile: any): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();   // 210
    const ph = doc.internal.pageSize.getHeight();   // 297
    const ml = 15;                                   // margin left
    const mr = 15;                                   // margin right
    const cw = pw - ml - mr;                         // content width (180)
    const bottomSafe = ph - 15;                      // absolute bottom limit

    // ── Color tokens ──
    const dark:  [number, number, number] = [20, 20, 20];
    const muted: [number, number, number] = [120, 120, 120];
    const accent:[number, number, number] = [24, 95, 165];   // #185FA5
    const green: [number, number, number] = [16, 185, 129];  // emerald-500
    const stripBg: [number, number, number] = [248, 248, 248];
    const lineBg:  [number, number, number] = [220, 220, 220];
    const altRow:  [number, number, number] = [250, 250, 252];

    doc.setFont("helvetica");

    // ── Verify URL ──
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify/${invoice.id}`;

    // ================================================================
    //  SECTION 1 — HEADER
    // ================================================================
    let y = 24;

    // Company name (left)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(profile?.shopName || "ClassAds", ml, y);

    // "INVOICE" title (right)
    doc.setFontSize(18);
    doc.setTextColor(...accent);
    doc.text("INVOICE", pw - mr, y, { align: "right" });

    // PAID pill below INVOICE
    if (invoice.status === "paid") {
        const pillW = 18, pillH = 5;
        const pillX = pw - mr - pillW;
        doc.setFillColor(...green);
        doc.roundedRect(pillX, y + 3, pillW, pillH, 2.5, 2.5, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("PAID", pillX + pillW / 2, y + 6.5, { align: "center" });
    }

    // Verify QR (right, next to INVOICE)
    try {
        const qrData = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 80 });
        const qrS = 16;
        const qrX = pw - mr - 55;
        doc.addImage(qrData, "PNG", qrX, y - 6, qrS, qrS);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...muted);
        doc.text("SCAN TO VERIFY", qrX + qrS / 2, y + 12, { align: "center" });
    } catch (_) { /* QR gen failed silently */ }

    // Address lines (below company name)
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    const addrLines = doc.splitTextToSize(profile?.address || "123 Luxury Avenue, Suite 100", 80);
    doc.text(addrLines, ml, y);
    y += addrLines.length * 4;

    // GSTIN chip
    if (profile?.gstNumber) {
        y += 2;
        doc.setFillColor(...stripBg);
        doc.setDrawColor(...lineBg);
        const gstText = `GSTIN: ${profile.gstNumber}`;
        const gstW = doc.getTextWidth(gstText) + 6;
        doc.roundedRect(ml, y - 3, gstW, 5.5, 1, 1, "FD");
        doc.setFontSize(8);
        doc.setFont("courier", "normal");
        doc.setTextColor(...muted);
        doc.text(gstText, ml + 3, y + 0.5);
        y += 6;
    }

    y += 4;

    // ================================================================
    //  SECTION 2 — GREY META STRIP (edge-to-edge)
    // ================================================================
    const stripH = 16;
    doc.setFillColor(...stripBg);
    doc.rect(ml, y, cw, stripH, "F");
    doc.setDrawColor(...lineBg);
    doc.line(ml, y, pw - mr, y);
    doc.line(ml, y + stripH, pw - mr, y + stripH);

    const colW = cw / 4;
    for (let i = 1; i <= 3; i++) doc.line(ml + colW * i, y, ml + colW * i, y + stripH);

    const metaCols: { label: string; value: string; color?: [number, number, number] }[] = [
        { label: "INVOICE NO.", value: invoice.invoiceNumber },
        { label: "ISSUED ON",   value: new Date(invoice.issueDate).toLocaleDateString() },
        { label: "DUE DATE",    value: new Date(invoice.dueDate).toLocaleDateString() },
        { label: "STATUS",      value: invoice.status.toUpperCase(),
          color: invoice.status === "paid" ? green : invoice.status === "overdue" ? [239, 68, 68] : accent },
    ];
    for (let i = 0; i < 4; i++) {
        const cx = ml + colW * i + 4;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...muted);
        doc.text(metaCols[i].label, cx, y + 6);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const c = metaCols[i].color || dark;
        doc.setTextColor(c[0], c[1], c[2]);
        doc.text(metaCols[i].value, cx, y + 12);
    }

    y += stripH + 8;

    // ================================================================
    //  SECTION 3 — BILLED TO / PROJECT REFERENCE (side-by-side)
    // ================================================================
    const halfW = cw / 2;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...muted);
    doc.text("BILLED TO", ml, y);
    doc.text("PROJECT REFERENCE", ml + halfW, y);

    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(invoice.clientName, ml, y);
    doc.text(invoice.projectTitle || "—", ml + halfW, y);

    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    let leftY = y, rightY = y;
    if (invoice.clientEmail)  { doc.text(invoice.clientEmail, ml, leftY);  leftY += 4; }
    if (invoice.clientNumber) { doc.text(invoice.clientNumber, ml, leftY); leftY += 4; }
    if (invoice.clientGst)    {
        doc.setFont("courier", "bold");
        doc.setFontSize(8);
        doc.text(`GSTIN: ${invoice.clientGst}`, ml, leftY + 1);
        leftY += 5;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    const projDesc = doc.splitTextToSize(
        "Services rendered as per the finalized scope of work and quotation.",
        halfW - 5
    );
    doc.text(projDesc, ml + halfW, rightY);
    rightY += projDesc.length * 4;

    y = Math.max(leftY, rightY) + 8;

    // ================================================================
    //  SECTION 4 — LINE ITEMS TABLE (manual draw, full page-break control)
    // ================================================================
    //
    //  Column layout  (total = cw = 180mm)
    //  Description: 90mm | Qty: 20mm | Rate: 35mm | Amount: 35mm
    //
    const cols = [
        { label: "DESCRIPTION", w: 90, align: "left"   as const },
        { label: "QTY",         w: 20, align: "center" as const },
        { label: "RATE (INR)",  w: 35, align: "right"  as const },
        { label: "AMOUNT (INR)",w: 35, align: "right"  as const },
    ];

    function colX(colIdx: number): number {
        let x = ml;
        for (let i = 0; i < colIdx; i++) x += cols[i].w;
        return x;
    }

    function drawTableHeader(atY: number): number {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...muted);
        for (let c = 0; c < cols.length; c++) {
            const x = colX(c);
            if (cols[c].align === "right")       doc.text(cols[c].label, x + cols[c].w - 2, atY, { align: "right" });
            else if (cols[c].align === "center") doc.text(cols[c].label, x + cols[c].w / 2, atY, { align: "center" });
            else                                 doc.text(cols[c].label, x + 2, atY);
        }
        const lineY = atY + 2;
        doc.setDrawColor(...lineBg);
        doc.setLineWidth(0.4);
        doc.line(ml, lineY, pw - mr, lineY);
        return lineY + 2;
    }

    // Layout constants
    const rowPadTop = 4;
    const rowPadBot = 3;
    const descLineH = 3.8;  // line height for 9pt wrapped description
    const subLineH  = 3.2;  // line height for 7pt sub-text
    const descMaxW  = cols[0].w - 6; // max text width inside description column

    /** Measure a row's height dynamically based on how many lines the description wraps to. */
    function measureRowHeight(descText: string): number {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const wrappedLines = doc.splitTextToSize(descText, descMaxW);
        const descBlockH = wrappedLines.length * descLineH;
        return rowPadTop + descBlockH + 2 + subLineH + rowPadBot;
    }

    // Draw initial header
    y = drawTableHeader(y);

    const items: any[] = invoice.items || [];

    for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const descText = item.description || "Service item";
        const rowH = measureRowHeight(descText);

        // ── Page break guard: if this row won't fit, start a new page ──
        if (y + rowH > ph - 50) {
            doc.addPage();
            y = 20;
            y = drawTableHeader(y);
        }

        // Alternating row background
        if (idx % 2 === 1) {
            doc.setFillColor(...altRow);
            doc.rect(ml, y - 1, cw, rowH + 1, "F");
        }

        const rowTopY = y + rowPadTop;

        // Col 0 — Description (full text, multi-line wrap)
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        const wrappedDesc = doc.splitTextToSize(descText, descMaxW);
        doc.text(wrappedDesc, colX(0) + 2, rowTopY);
        const descEndY = rowTopY + wrappedDesc.length * descLineH;

        // Sub-line below description
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        doc.text("Professional service as per scope of work", colX(0) + 2, descEndY + 1.5);

        // Col 1 — Qty (vertically centered)
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        doc.text(String(item.quantity), colX(1) + cols[1].w / 2, rowTopY, { align: "center" });

        // Col 2 — Rate
        doc.text(
            Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            colX(2) + cols[2].w - 2, rowTopY, { align: "right" }
        );

        // Col 3 — Amount
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text(
            Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            colX(3) + cols[3].w - 2, rowTopY, { align: "right" }
        );

        // Bottom divider line
        const divY = y + rowH;
        doc.setDrawColor(235, 235, 235);
        doc.setLineWidth(0.2);
        doc.line(ml, divY, pw - mr, divY);

        y += rowH;
    }

    y += 6;

    // ================================================================
    //  SECTION 5 — TOTALS + PAYMENT QR
    // ================================================================
    // Page break guard for footer content (needs ~55mm)
    if (y > ph - 60) {
        doc.addPage();
        y = 20;
    }

    // ── UPI QR (left side) ──
    const qrSize = 28;
    try {
        const upiStr = invoice.total < 100000
            ? `upi://pay?pa=${profile?.upiId || "9886262303@ybl"}&pn=${encodeURIComponent(profile?.shopName || "ClassAds")}&am=${invoice.total}&cu=INR`
            : `upi://pay?pa=${profile?.upiId || "9886262303@ybl"}&pn=${encodeURIComponent(profile?.shopName || "ClassAds")}`;
        const qrImg = await QRCode.toDataURL(upiStr, { margin: 0, width: 120 });
        doc.addImage(qrImg, "PNG", ml, y, qrSize, qrSize);
    } catch (_) { /* UPI QR failed silently */ }

    // Label under payment QR
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...muted);
    doc.text("SCAN TO PAY VIA UPI", ml + qrSize / 2, y + qrSize + 4, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(
        invoice.total < 100000 ? "GPay · PhonePe · Paytm" : "Enter amount in your UPI app",
        ml + qrSize / 2, y + qrSize + 8, { align: "center" }
    );

    // ── Totals (right side) ──
    const tLabelX = pw - mr - 70;
    const tValueX = pw - mr;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);

    doc.text("Subtotal", tLabelX, y + 5);
    doc.text(Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 }), tValueX, y + 5, { align: "right" });

    doc.text(`CGST (${invoice.cgstPercent}%)`, tLabelX, y + 11);
    doc.text(Number(invoice.cgstAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }), tValueX, y + 11, { align: "right" });

    doc.text(`SGST (${invoice.sgstPercent}%)`, tLabelX, y + 17);
    doc.text(Number(invoice.sgstAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }), tValueX, y + 17, { align: "right" });

    // Divider
    const totDivY = y + 22;
    doc.setDrawColor(...lineBg);
    doc.setLineWidth(0.3);
    doc.line(tLabelX, totDivY, tValueX, totDivY);

    // Total Due
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text("Total Due", tLabelX, totDivY + 7);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(
        `${invoice.currency} ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        tValueX, totDivY + 7, { align: "right" }
    );

    y = Math.max(y + qrSize + 12, totDivY + 14);

    // ================================================================
    //  SECTION 6 — BOTTOM FOOTER BAR
    // ================================================================
    y += 6;

    // Page break guard if needed
    if (y > ph - 40) {
        doc.addPage();
        y = 20;
    }

    // Thin divider
    doc.setDrawColor(...lineBg);
    doc.setLineWidth(0.3);
    doc.line(ml, y, pw - mr, y);

    // Signature block (right-aligned, above auth text)
    const sigBlockX = pw - mr - 55; // right 55mm block
    let sigBottomY = y + 4;

    if (profile?.signatureImage) {
        try {
            const sigBase64 = await imageUrlToBase64(profile.signatureImage);
            if (sigBase64) {
                doc.addImage(sigBase64, "PNG", sigBlockX + 10, sigBottomY, 35, 15);
                sigBottomY += 17;
            }
        } catch (_) { /* signature render failed */ }
    }

    // Auth line under signature
    doc.setDrawColor(...lineBg);
    doc.line(sigBlockX, sigBottomY, pw - mr, sigBottomY);

    // Auth text below line
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(profile?.shopName || "ClassAds", pw - mr, sigBottomY + 4, { align: "right" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text("Authorised Signatory", pw - mr, sigBottomY + 8, { align: "right" });

    // Left: security text (vertically centered with the signature block)
    const secTextY = sigBottomY + 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text("This is a secure electronic document.", ml + 3, secTextY);
    doc.text("Authenticity electronically verified.", ml + 3, secTextY + 4);

    return doc;
}
