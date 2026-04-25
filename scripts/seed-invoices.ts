import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import * as schema from "../db/schema";
import { v4 as uuidv4 } from "uuid";

// Load .env.local manually
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

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("Missing DB credentials in .env.local");
  process.exit(1);
}

const client = postgres({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  max: 1,
});

const db = drizzle(client, { schema });

async function seedInvoices() {
  console.log("Starting to seed historical invoice data...");

  // 1. Get or create a default customer
  let allCustomers = await db.select().from(schema.customers).limit(1);
  let customerId = allCustomers[0]?.id;

  if (!customerId) {
    console.log("No customers found, creating a default one...");
    const [newCustomer] = await db
      .insert(schema.customers)
      .values({
        name: "Acme Corp (Test)",
        email: "contact@acmetest.com",
        phone: "123-456-7890",
      })
      .returning();
    customerId = newCustomer.id;
  }

  // 2. Generate 5 years of invoices (approx 2 per month)
  const now = new Date();
  const invoicesToInsert = [];

  // Generate for exactly 5 years ago from current month up to now
  // 60 months
  let count = 1000;
  for (let yearOffset = 5; yearOffset >= 0; yearOffset--) {
    const currentYear = now.getFullYear() - yearOffset;
    // For the current year, only go up to current month if yearOffset === 0
    const maxMonth = yearOffset === 0 ? now.getMonth() : 11;
    
    for (let month = 0; month <= maxMonth; month++) {
      // 2 invoices per month
      for (let i = 0; i < 2; i++) {
        count++;
        // random day of month in range 1-28
        const day = Math.floor(Math.random() * 28) + 1;
        const issueDate = new Date(currentYear, month, day);
        const dueDate = new Date(currentYear, month, day + 14); // 14 days due

        const subtotalStr = (Math.random() * 50000 + 10000).toFixed(2);
        const subtotal = Number(subtotalStr);
        const cgstPercent = 9.0;
        const sgstPercent = 9.0;
        const cgstAmountStr = (subtotal * 0.09).toFixed(2);
        const sgstAmountStr = (subtotal * 0.09).toFixed(2);
        const totalStr = (subtotal + Number(cgstAmountStr) + Number(sgstAmountStr)).toFixed(2);

        invoicesToInsert.push({
          invoiceNumber: `INV-${currentYear}-${count}`,
          customerId: customerId,
          status: Math.random() > 0.1 ? "paid" : "overdue", // Mostly paid, some overdue
          issueDate,
          dueDate,
          createdAt: issueDate,
          updatedAt: issueDate,
          subtotal: subtotalStr,
          cgstPercent: cgstPercent.toString(),
          sgstPercent: sgstPercent.toString(),
          cgstAmount: cgstAmountStr,
          sgstAmount: sgstAmountStr,
          total: totalStr,
          notes: "Generated testing data",
          projectTitle: "Monthly Maintenance Package " + count,
        });
      }
    }
  }

  console.log(`Inserting ${invoicesToInsert.length} historical invoices...`);
  
  // We insert in batches of 20 to avoid size limits over simple queries
  const batchSize = 20;
  for (let i = 0; i < invoicesToInsert.length; i += batchSize) {
    const batch = invoicesToInsert.slice(i, i + batchSize);
    await db.insert(schema.invoices).values(batch).onConflictDoNothing({ target: schema.invoices.invoiceNumber });
  }

  console.log("Invoice seeding completed successfully.");
}

seedInvoices()
  .catch((e) => {
    console.error("Seeding failed", e);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
