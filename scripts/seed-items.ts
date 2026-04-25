import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import * as schema from "../db/schema";
import { eq, isNull } from "drizzle-orm";

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

async function seedItems() {
  console.log("Seeding missing invoice items...");

  // Get all invoices
  const allInvoices = await db.select().from(schema.invoices);
  console.log(`Found ${allInvoices.length} invoices. checking for items...`);

  // We will insert 2 items per invoice
  const possibleServices = ["SEO Optimization", "Web Development", "UI/UX Design", "Social Media Management", "Consulting"];

  const itemsToInsert = [];
  for (const inv of allInvoices) {
    const subtotal = Number(inv.subtotal);
    // Split subtotal roughly into 2 items
    const part1 = (subtotal * 0.6).toFixed(2);
    const part2 = (subtotal - Number(part1)).toFixed(2);

    itemsToInsert.push({
      invoiceId: inv.id,
      description: possibleServices[Math.floor(Math.random() * possibleServices.length)],
      quantity: 1,
      unitPrice: part1,
      amount: part1,
      type: "service",
    });

    itemsToInsert.push({
      invoiceId: inv.id,
      description: possibleServices[Math.floor(Math.random() * possibleServices.length)],
      quantity: 1,
      unitPrice: part2,
      amount: part2,
      type: "service",
    });
  }

  // Clear existing items just in case to prevent duplicates from multiple runs
  await db.delete(schema.invoiceItems);

  console.log(`Inserting ${itemsToInsert.length} invoice items...`);
  
  const batchSize = 100;
  for (let i = 0; i < itemsToInsert.length; i += batchSize) {
    const batch = itemsToInsert.slice(i, i + batchSize);
    await db.insert(schema.invoiceItems).values(batch);
  }

  console.log("Items seeded fully.");
}

seedItems()
  .catch((e) => console.error(e))
  .finally(() => client.end());
