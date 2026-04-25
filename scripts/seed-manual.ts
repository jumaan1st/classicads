import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import * as schema from "../db/schema";
import crypto from "crypto";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const client = postgres({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  max: 1,
});

const db = drizzle(client, { schema });

async function createInvoice(
  invoiceNumber: string,
  customerId: string,
  projectTitle: string,
  serviceId: string,
  numItems: number,
  longDescriptions: boolean
) {
  const invoiceId = crypto.randomUUID();
  let subtotal = 0;
  const items = [];

  for (let i = 0; i < numItems; i++) {
    const unitPrice = 15000 + Math.random() * 85000;
    const quantity = Math.floor(Math.random() * 3) + 1;
    const amount = unitPrice * quantity;
    subtotal += amount;

    const baseDesc = `Service Implementation Task #${i + 1}`;
    const extraDesc = longDescriptions 
        ? " - This task involves a comprehensive end-to-end delivery of all scoped requirements specified in the client agreement. This includes materials, labor overhead, GST analysis, testing phases, and quality assurance deployment on site ensuring 100% compliance with standard architectural guidelines."
        : "";

    items.push({
      invoiceId,
      serviceId,
      description: baseDesc + extraDesc,
      quantity,
      unitPrice: unitPrice.toFixed(2),
      amount: amount.toFixed(2),
      type: "service",
    });
  }

  const cgstAmount = subtotal * 0.09;
  const sgstAmount = subtotal * 0.09;
  const total = subtotal + cgstAmount + sgstAmount;

  const now = new Date();

  await db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber,
    customerId,
    projectTitle,
    status: Math.random() > 0.5 ? "paid" : "sent",
    issueDate: now,
    dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    subtotal: subtotal.toFixed(2),
    cgstPercent: "9.00",
    sgstPercent: "9.00",
    cgstAmount: cgstAmount.toFixed(2),
    sgstAmount: sgstAmount.toFixed(2),
    total: total.toFixed(2),
    notes: "Edge-case testing invoice.",
  });

  if (items.length > 0) {
    // insert items
    await db.insert(schema.invoiceItems).values(items);
  }

  console.log(`Created ${invoiceNumber} with ${numItems} items.`);
}

async function seedManual() {
  const customers = await db.select().from(schema.customers).limit(1);
  if (customers.length === 0) throw new Error("No customers available");
  
  const services = await db.select().from(schema.services).limit(1);
  if (services.length === 0) throw new Error("No services available");

  const cId = customers[0].id;
  const sId = services[0].id;

  // 1. Massive Data
  await createInvoice("INV-TEST-MASSIVE", cId, "Huge Testing Project Validation", sId, 25, true);

  // 2. Average Data
  await createInvoice("INV-TEST-AVG", cId, "Standard Project Scope", sId, 5, false);

  // 3. Minimal Data
  await createInvoice("INV-TEST-MINIMAL", cId, "Tiny Adjustment Fee", sId, 1, false);

  console.log("\nAll 3 test invoices created successfully!");
}

seedManual()
  .catch((e) => console.error(e))
  .finally(() => client.end());
