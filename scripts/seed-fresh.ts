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

async function seedFresh() {
  console.log("=== Wiping Old Data ===");
  // Wipe in reverse dependency order
  await db.delete(schema.invoiceItems);
  console.log("- Deleted invoiceItems");
  await db.delete(schema.invoices);
  console.log("- Deleted invoices");
  await db.delete(schema.customers);
  console.log("- Deleted customers");
  
  // Wiping services won't wipe project_services unless cascaded properly, let's wipe project_services just in case
  await db.delete(schema.projectServices);
  await db.delete(schema.serviceGallery);
  await db.delete(schema.services);
  console.log("- Deleted services");

  console.log("\n=== Inserting Fresh Data ===");

  // 1. SERVICES
  const servicesToInsert = [
    {
      id: crypto.randomUUID(),
      name: "Complete Interior Redesign",
      slug: "complete-interior-redesign",
      category: "interior",
      description: "Full end-to-end interior design and execution for your space.",
      minPrice: 500000,
      maxPrice: 3000000,
      minTimelineWeeks: 4,
      maxTimelineWeeks: 12,
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
      featured: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Exterior Facade Revamp",
      slug: "exterior-facade-revamp",
      category: "exterior",
      description: "Modernizing your building's exterior with premium materials.",
      minPrice: 800000,
      maxPrice: 5000000,
      minTimelineWeeks: 6,
      maxTimelineWeeks: 16,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      featured: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Architectural Consultation",
      slug: "architectural-consultation",
      category: "consultation",
      description: "Expert advice on structural integrity and space planning.",
      minPrice: 20000,
      maxPrice: 100000,
      minTimelineWeeks: 1,
      maxTimelineWeeks: 3,
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
      featured: false,
    },
    {
      id: crypto.randomUUID(),
      name: "Smart Home Integration",
      slug: "smart-home-integration",
      category: "interior",
      description: "Automate your lighting, climate, and security systems.",
      minPrice: 150000,
      maxPrice: 1000000,
      minTimelineWeeks: 2,
      maxTimelineWeeks: 6,
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
      featured: true,
    }
  ];

  const insertedServices = await db.insert(schema.services).values(servicesToInsert).returning();
  console.log(`+ Inserted ${insertedServices.length} services`);

  // 2. CUSTOMERS
  const customersToInsert = [
    { id: crypto.randomUUID(), name: "John Doe", email: "john.doe@example.com", phone: "9876543210" },
    { id: crypto.randomUUID(), name: "Jane Smith", email: "jane.smith@example.com", phone: "9876543211" },
    { id: crypto.randomUUID(), name: "Acme Corp", email: "contact@acmecorp.com", phone: "9876543212" },
    { id: crypto.randomUUID(), name: "Globex Inc", email: "hello@globex.com", phone: "9876543213" },
    { id: crypto.randomUUID(), name: "Initech LLC", email: "billing@initech.com", phone: "9876543214" }
  ];

  const insertedCustomers = await db.insert(schema.customers).values(customersToInsert).returning();
  console.log(`+ Inserted ${insertedCustomers.length} customers`);

  // 3. INVOICES For 5 years
  const now = new Date();
  const invoicesToInsert = [];
  const invoiceItemsToInsert = [];

  let count = 1000;
  // 60 months
  for (let yearOffset = 5; yearOffset >= 0; yearOffset--) {
    const currentYear = now.getFullYear() - yearOffset;
    const maxMonth = yearOffset === 0 ? now.getMonth() : 11;
    
    for (let month = 0; month <= maxMonth; month++) {
      // 3-5 invoices per month
      const numInvoices = Math.floor(Math.random() * 3) + 3; 

      for (let i = 0; i < numInvoices; i++) {
        count++;
        const day = Math.floor(Math.random() * 28) + 1;
        const issueDate = new Date(currentYear, month, day);
        const dueDate = new Date(currentYear, month, day + 14);

        const customer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];

        const invoiceId = crypto.randomUUID();
        
        // 1-3 items per invoice
        const numItems = Math.floor(Math.random() * 3) + 1;
        let invoiceSubtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const service = insertedServices[Math.floor(Math.random() * insertedServices.length)];
          // Price between min and max
          const unitPrice = service.minPrice + Math.random() * (service.maxPrice - service.minPrice);
          const quantity = Math.floor(Math.random() * 2) + 1;
          const amount = unitPrice * quantity;

          invoiceSubtotal += amount;

          invoiceItemsToInsert.push({
            invoiceId: invoiceId,
            serviceId: service.id,
            description: `${service.name} execution`,
            quantity: quantity,
            unitPrice: unitPrice.toFixed(2),
            amount: amount.toFixed(2),
            type: "service",
            createdAt: issueDate
          });
        }

        const cgstPercent = 9.0;
        const sgstPercent = 9.0;
        const cgstAmountStr = (invoiceSubtotal * 0.09).toFixed(2);
        const sgstAmountStr = (invoiceSubtotal * 0.09).toFixed(2);
        const totalStr = (invoiceSubtotal + Number(cgstAmountStr) + Number(sgstAmountStr)).toFixed(2);

        invoicesToInsert.push({
          id: invoiceId,
          invoiceNumber: `INV-${currentYear}-${count}`,
          customerId: customer.id,
          status: Math.random() > 0.1 ? "paid" : "overdue",
          issueDate,
          dueDate,
          createdAt: issueDate,
          updatedAt: issueDate,
          subtotal: invoiceSubtotal.toFixed(2),
          cgstPercent: cgstPercent.toString(),
          sgstPercent: sgstPercent.toString(),
          cgstAmount: cgstAmountStr,
          sgstAmount: sgstAmountStr,
          total: totalStr,
          notes: "Generated testing data",
          projectTitle: `${customer.name} - ${issueDate.toLocaleString('default', { month: 'short' })} Project`,
        });
      }
    }
  }

  // Insert invoices in batches
  console.log(`+ Inserting ${invoicesToInsert.length} invoices...`);
  const invBatchSize = 100;
  for (let i = 0; i < invoicesToInsert.length; i += invBatchSize) {
    await db.insert(schema.invoices).values(invoicesToInsert.slice(i, i + invBatchSize));
  }

  // Insert invoice items in batches
  console.log(`+ Inserting ${invoiceItemsToInsert.length} invoice items...`);
  const itemBatchSize = 250;
  for (let i = 0; i < invoiceItemsToInsert.length; i += itemBatchSize) {
    await db.insert(schema.invoiceItems).values(invoiceItemsToInsert.slice(i, i + itemBatchSize));
  }

  console.log("\n=== Seeding Finished Successfully ===");
}

seedFresh()
  .catch((e) => {
    console.error("Seeding failed", e);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
