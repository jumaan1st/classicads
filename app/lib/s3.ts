import { S3Client } from '@aws-sdk/client-s3';

// Ensure the environment variables exist
if (!process.env.R2_ACCOUNT_ID) throw new Error("Missing R2_ACCOUNT_ID");
if (!process.env.R2_ACCESS_KEY_ID) throw new Error("Missing R2_ACCESS_KEY_ID");
if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error("Missing R2_SECRET_ACCESS_KEY");

// Cloudflare R2 specific initialization
export const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'portfolio';
export const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
