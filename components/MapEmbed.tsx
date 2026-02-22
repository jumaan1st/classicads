export default function MapEmbed() {
    return (
        <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--muted-bg)] relative">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.94788649067!2d76.6527369!3d12.3192946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7071ff9656f7%3A0xce67eed7c0247923!2sClassic%20Advertisers!5e0!3m2!1sen!2sin!4v1771762602040!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full border-0 select-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Classic Advertisers Headquarters Location"
            ></iframe>

            {/* Optional overlay for dark theme blending if needed, pointer-events-none lets clicks pass through */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/10 dark:ring-black/20" />
        </div>
    );
}
