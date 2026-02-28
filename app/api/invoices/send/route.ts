import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, customers, invoiceItems, businessProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { invoiceId, pdfData, fileName } = await req.json();
        if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

        // 1. Fetch Invoice, Customer, and Items
        const [invoice] = await db
            .select({
                id: invoices.id,
                invoiceNumber: invoices.invoiceNumber,
                projectTitle: invoices.projectTitle,
                issueDate: invoices.issueDate,
                dueDate: invoices.dueDate,
                subtotal: invoices.subtotal,
                gstAmount: invoices.gstAmount,
                total: invoices.total,
                status: invoices.status,
                clientName: customers.name,
                clientEmail: customers.email,
            })
            .from(invoices)
            .innerJoin(customers, eq(invoices.customerId, customers.id))
            .where(eq(invoices.id, invoiceId))
            .limit(1);

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        if (!invoice.clientEmail) return NextResponse.json({ error: "Customer has no email address" }, { status: 400 });

        const currency = "₹";

        // 2. Fetch Business Profile for Details
        const [profile] = await db.select().from(businessProfile).limit(1);

        const accentBlue = "#2563eb";
        const bgLight = "#ffffff";
        const cardBg = "#ffffff";
        const textDark = "#1f2937";
        const textMuted = "#6b7280";
        const borderCol = "#e5e7eb";

        const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: ${cardBg}; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { padding: 32px; text-align: center; border-bottom: 1px solid ${borderCol}; background-color: ${bgLight}; }
          .logo { font-size: 24px; font-weight: 800; color: ${textDark}; letter-spacing: -0.025em; }
          .logo-accent { color: ${accentBlue}; }
          .content { padding: 40px; }
          .invoice-label { color: ${accentBlue}; font-weight: 700; text-transform: uppercase; font-size: 12px; margin-bottom: 8px; letter-spacing: 0.05em; }
          .invoice-title { color: ${textDark}; font-size: 28px; font-weight: 800; margin: 0 0 24px 0; }
          .summary-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
          .footer { padding: 32px; background-color: #f9fafb; text-align: center; font-size: 12px; color: ${textMuted}; border-top: 1px solid ${borderCol}; }
          .total-row { font-size: 18px; font-weight: 700; color: ${textDark}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Classic<span class="logo-accent">Ads</span></div>
          </div>
          <div class="content">
            <div class="invoice-label">Invoice Notification</div>
            <h1 class="invoice-title">Invoice #${invoice.invoiceNumber}</h1>
            
            <p style="color: ${textDark}; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Dear <strong>${invoice.clientName}</strong>,
            </p>
            <p style="color: ${textMuted}; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
              Please find the invoice attached for your project: <strong>${invoice.projectTitle || 'General Services'}</strong>. 
            </p>

            <div class="summary-box">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: ${textMuted}; font-size: 14px; padding-bottom: 8px;">Due Date</td>
                  <td style="color: ${textDark}; font-size: 14px; padding-bottom: 8px; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
                <tr class="total-row">
                  <td style="padding-top: 12px; border-top: 1px solid ${borderCol};">Total Amount</td>
                  <td style="padding-top: 12px; border-top: 1px solid ${borderCol}; text-align: right;">${currency} ${Number(invoice.total).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <p style="color: ${textMuted}; font-size: 14px; line-height: 1.5;">
              For your records, we have attached the full invoice as a PDF to this email. 
            </p>
          </div>
          <div class="footer">
            <p style="margin-bottom: 8px; color: ${textDark}; font-weight: 600;">${profile?.shopName || 'Classic Ads'}</p>
            <p>${profile?.address || ''}</p>
            <p>${profile?.phone || ''} | ${profile?.email || ''}</p>
            <p style="margin-top: 20px; opacity: 0.7;">&copy; ${new Date().getFullYear()} ${profile?.shopName || 'Classic Ads'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        // 3. Prepare Attachments
        const attachments = [];
        if (pdfData) {
            attachments.push({
                filename: fileName || `Invoice-${invoice.invoiceNumber}.pdf`,
                content: pdfData.split("base64,")[1],
                encoding: "base64",
            });
        }

        // 4. Send Email
        await transporter.sendMail({
            from: `"${profile?.shopName || "Classic Ads"}" <${process.env.EMAIL_USER}>`,
            to: invoice.clientEmail,
            subject: `Invoice ${invoice.invoiceNumber} from ${profile?.shopName || "Classic Ads"}`,
            html: htmlBody,
            attachments,
        });

        // 5. Update Status
        await db
            .update(invoices)
            .set({ status: "sent", updatedAt: new Date() })
            .where(eq(invoices.id, invoiceId));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Email send error:", err);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
