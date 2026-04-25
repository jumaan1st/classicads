import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy to bypass CORS restrictions.
 * Usage: /api/image-proxy?url=<encoded-url>
 * 
 * This fetches the remote image on the server (no CORS) and
 * returns it with proper CORS headers for client-side consumption.
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/png";

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("Image proxy error:", error);
        return NextResponse.json({ error: "Proxy fetch failed" }, { status: 500 });
    }
}
