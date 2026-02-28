'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Phone, ChevronRight } from 'lucide-react';

// ── Config ─────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '919886262303';
const PHONE_NUMBER = '+91 98862 62303';
const PHONE_TEL = 'tel:+919886262303';
const MAPS_URL = 'https://www.google.com/maps/place/Classic+Advertisers/@12.3192946,76.6527369,17z';
const MAPS_EMBED_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.94788649067!2d76.6527369!3d12.3192946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7071ff9656f7%3A0xce67eed7c0247923!2sClassic%20Advertisers!5e0!3m2!1sen!2sin!4v1771762602040!5m2!1sen!2sin';
const DEFAULT_WHATSAPP = '919886262303';
const DEFAULT_PHONE = '+91 98862 62303';
const DEFAULT_PHONE_TEL = 'tel:+919886262303';
const ADDRESS_LINE2 = 'Mysuru, Karnataka, India';
// ────────────────────────────────────────────────────────────────────────────

// WhatsApp SVG (brand color preserved)
function WhatsAppIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.882a.5.5 0 0 0 .61.61l6.02-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 0 1-5.134-1.452l-.368-.22-3.817.935.952-3.818-.24-.38A9.818 9.818 0 1 1 12 21.818z" />
        </svg>
    );
}

export default function FloatingContactWidget() {
    const [open, setOpen] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [profile, setProfile] = useState<{ shopName?: string | null; phone?: string | null } | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/profile/public')
            .then(r => r.json())
            .then(d => setProfile(d.profile ?? null))
            .catch(() => { });
    }, []);

    // Derive values from profile or fall back to defaults
    const shopName = profile?.shopName || 'Classic Advertisers';
    const rawPhone = profile?.phone ?? DEFAULT_PHONE;
    // Normalise phone: strip spaces/dashes/parens for the tel: link
    const phoneTel = rawPhone ? `tel:${rawPhone.replace(/[^\d+]/g, '')}` : DEFAULT_PHONE_TEL;
    // Format WhatsApp number (digits only, no +)
    const waNumber = rawPhone ? rawPhone.replace(/[^\d]/g, '') : DEFAULT_WHATSAPP;

    // Close on click outside
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setShowMap(false);
            }
        }
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if (e.key === 'Escape') { setOpen(false); setShowMap(false); }
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    function toggle() {
        setOpen(o => !o);
        if (open) setShowMap(false);
    }

    return (
        <div ref={ref} className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">

            {/* ── Expanded Panel ─────────────────────────────────────── */}
            <div
                className={`transition-all duration-300 origin-bottom-right pointer-events-auto ${open
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="w-[300px] sm:w-[320px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-1.5 flex-shrink-0">
                            <WhatsAppIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-none">{shopName}</p>
                            <p className="text-white/80 text-xs mt-0.5">Usually replies within minutes</p>
                        </div>
                        <button
                            onClick={() => { setOpen(false); setShowMap(false); }}
                            className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Chat bubble */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="bg-[var(--muted-bg)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--foreground)] leading-relaxed border border-[var(--border)]">
                            👋 Hi there! How can we help you today? Chat with us on WhatsApp or call us directly.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
                        {/* WhatsApp */}
                        <a
                            href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(shopName)}%21%20I%27d%20like%20to%20enquire%20about%20your%20design%20services.%20Could%20you%20please%20help%20me%3F`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-green-500/30"
                        >
                            <WhatsAppIcon size={18} />
                            Chat on WhatsApp
                            <ChevronRight className="h-4 w-4 ml-auto opacity-70" />
                        </a>

                        {/* Phone */}
                        <a
                            href={phoneTel}
                            className="flex items-center gap-3 bg-[var(--background)] hover:bg-[var(--muted-bg)] border border-[var(--border)] text-[var(--foreground)] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            {rawPhone}
                            <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        </a>

                        {/* Location toggle */}
                        <button
                            onClick={() => setShowMap(m => !m)}
                            className="flex items-center gap-3 bg-[var(--background)] hover:bg-[var(--muted-bg)] border border-[var(--border)] text-[var(--foreground)] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full text-left"
                        >
                            <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="flex-1">
                                <span className="block leading-none">{shopName}</span>
                                <span className="block text-[var(--muted)] font-normal text-xs mt-0.5">{ADDRESS_LINE2}</span>
                            </span>
                            <ChevronRight className={`h-4 w-4 opacity-50 transition-transform duration-200 ${showMap ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Inline mini map */}
                        {showMap && (
                            <div className="rounded-xl overflow-hidden border border-[var(--border)] h-[180px] relative animate-in fade-in slide-in-from-top-2 duration-200">
                                <iframe
                                    src={MAPS_EMBED_SRC}
                                    className="absolute inset-0 w-full h-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Classic Advertisers Location"
                                />
                                <a
                                    href={MAPS_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-2 right-2 bg-white text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1 hover:bg-gray-100 transition-colors"
                                >
                                    <MapPin className="h-3 w-3 text-red-500" /> Open in Maps
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FAB Trigger Button ─────────────────────────────────── */}
            <button
                style={{ pointerEvents: 'auto' }}
                onClick={toggle}
                aria-label={open ? 'Close contact widget' : 'Open contact widget'}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95
          ${open
                        ? 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]'
                        : 'bg-green-500 text-white shadow-green-400/40'
                    }`}
            >
                {/* Pulse ring when closed */}
                {!open && (
                    <>
                        <span
                            className="absolute inset-0 rounded-full bg-green-500 opacity-30"
                            style={{ animation: 'ping 0.8s ease-out 0.3s 1 forwards' }}
                        />
                        <span
                            className="absolute inset-0 rounded-full bg-green-400 opacity-20"
                            style={{ animation: 'ping 0.8s ease-out 0.7s 1 forwards' }}
                        />
                    </>
                )}
                <span className={`transition-all duration-300 ${open ? 'rotate-0 scale-100' : 'rotate-0 scale-100'}`}>
                    {open
                        ? <X className="h-6 w-6" />
                        : <WhatsAppIcon size={26} />
                    }
                </span>
            </button>
        </div>
    );
}
