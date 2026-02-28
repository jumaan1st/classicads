import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/db-session';
import { s3Client, BUCKET_NAME, PUBLIC_URL } from '@/app/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file stream to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract extension and generate safe name
        const extension = file.name.split('.').pop() || 'tmp';
        const uniqueFileName = `${randomUUID()}.${extension}`;
        const s3Key = `uploads/${uniqueFileName}`;

        // Upload to Cloudflare R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: file.type,
            // ACL is not strictly required if bucket defaults to public reads through standard R2 logic,
            // but we rely on the R2_PUBLIC_URL for distribution.
        });

        await s3Client.send(command);

        // Construct final public URL
        const fileUrl = `${PUBLIC_URL.replace(/\/$/, '')}/${s3Key}`;

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error: any) {
        console.error('File Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
