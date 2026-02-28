import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, customers, invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";

// You can use nodemailer, Resend, Resend/React Email, etc.
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use Resend / Postmark / etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { invoiceId } = await req.json();
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

    // Fetch invoice + customer + items
    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        projectTitle: invoices.projectTitle,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        total: invoices.total,
        status: invoices.status,
        clientName: customers.name,
        clientEmail: customers.email,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice?.clientEmail) {
      return NextResponse.json({ message: "No email found" }, { status: 200 });
    }

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));

    // Generate PDF as before (you can reuse generatePDF logic or html-to-pdf library)

    // For simplicity — send plain text email
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
      text: `Dear ${invoice.clientName},\n\nPlease find your invoice attached.\n\nTotal: ₹${Number(invoice.total).toLocaleString()}\nStatus: ${invoice.status}\n\nThank you for your business!`,
      // attachments: [{ filename: `invoice-${invoice.invoiceNumber}.pdf`, content: pdfBuffer }]
    });

    // Optional: update status to "sent"
    await db
      .update(invoices)
      .set({ status: "sent" })
      .where(eq(invoices.id, invoiceId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}