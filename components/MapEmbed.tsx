interface MapEmbedProps {
    mapEmbedUrl?: string | null;
    title?: string;
    className?: string;
}

export default function MapEmbed({
    mapEmbedUrl,
    title = "Business Location",
    className = "",
}: MapEmbedProps) {

    const fallbackEmbedUrl =
        "https://maps.google.com/maps?q=12.3192946,76.6527369&output=embed";

    const iframeSource = mapEmbedUrl && mapEmbedUrl.trim().length > 0
        ? mapEmbedUrl
        : fallbackEmbedUrl;

    return (
        <div
            className={`w-full h-full min-h-[300px] md:min-h-[400px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--muted-bg)] relative ${className}`}
        >
            <iframe
                src={iframeSource}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                title={title}
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
}