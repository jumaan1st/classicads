import { pgTable, uuid, varchar, timestamp, text, integer, boolean,decimal } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 50 }).unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).default('admin').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 10 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    deviceInfo: text('device_info'), // e.g. "Mac on Chrome"
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
});

export const businessProfile = pgTable('business_profile', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerName: varchar('owner_name', { length: 255 }),
    shopName: varchar('shop_name', { length: 255 }),
    startedBusinessAt: timestamp('started_business_at'),
    profileImage: text('profile_image'),
    signatureImage: text('signature_image'),
    upiId: varchar('upi_id', { length: 255 }),
    gstNumber: varchar('gst_number', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    googleMapsLocation: text('google_maps_location'),
    mapEmbedUrl: text('map_embed_url'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// SERVICES
// -----------------------------------------------------------------------------

export const services = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    category: varchar('category', { length: 50 }).notNull(), // 'interior', 'exterior', 'consultation'
    description: text('description').notNull(),
    minPrice: integer('min_price').notNull(),
    maxPrice: integer('max_price').notNull(),
    minTimelineWeeks: integer('min_timeline_weeks').notNull(),
    maxTimelineWeeks: integer('max_timeline_weeks').notNull(),
    image: text('image').notNull(),
    materials: text('materials').array(), // Postgres array of texts
    featured: boolean('featured').default(false).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serviceGallery = pgTable('service_gallery', {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
    url: text('url').notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
});

// -----------------------------------------------------------------------------
// PROJECTS
// -----------------------------------------------------------------------------

export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    clientName: varchar('client_name', { length: 255 }).notNull(),
    clientEmail: varchar('client_email', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull(), // 'planning', 'active', 'on_hold', 'completed'
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    budget: integer('budget'),
    content: text('content'),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectServices = pgTable('project_services', {
    id: uuid('id').primaryKey().defaultRandom(), // Added synthetic key for easier Drizzle inserts than composite
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
});

// (Employees / Users assigned to projects)
export const projectAssignments = pgTable('project_assignments', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

export const projectMilestones = pgTable('project_milestones', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    dueDate: timestamp('due_date').notNull(),
    completed: boolean('completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
});

export const projectPhotos = pgTable('project_photos', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    url: text('url').notNull(),
    caption: text('caption'),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});
