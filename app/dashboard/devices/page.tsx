"use client";

import { useState, useEffect } from "react";
import { MonitorSmartphone, Trash2, ShieldCheck, Loader2, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MAX_DEVICES } from "@/app/lib/constants";

type Session = {
    id: string;
    deviceInfo: string;
    ipAddress: string;
    createdAt: string;
    lastActiveAt: string;
    isCurrentDevice: boolean;
};

export default function DevicesPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revoking, setRevoking] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`/api/auth/sessions?_t=${Date.now()}`, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to load device sessions");
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to log out this device?")) return;
        setRevoking(id);
        try {
            const res = await fetch(`/api/auth/sessions?id=${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to revoke session");
            await fetchSessions();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setRevoking(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <MonitorSmartphone className="w-6 h-6 text-blue-500" /> Devices & Sessions
                    </h1>
                    <p className="text-[var(--muted)] text-sm max-w-lg">
                        Manage the devices connected to your admin account. You can have up to <span className="text-blue-500 font-bold">{MAX_DEVICES}</span> devices logged in simultaneously. Logging into a new device beyond this limit will automatically sign out the oldest device.
                    </p>
                </div>
                <div className="hidden sm:block text-blue-500/20">
                    <ShieldCheck className="w-32 h-32 absolute -right-6 -bottom-6" />
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl flex-shrink-0 ${session.isCurrentDevice ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--muted-bg)] text-[var(--muted)]'}`}>
                                    <MonitorSmartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] text-lg flex items-center gap-2">
                                        {session.deviceInfo || "Unknown Device"}
                                        {session.isCurrentDevice && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                                This Device
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-sm text-[var(--muted)] flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs opacity-70">{session.ipAddress}</span>
                                        <span>•</span>
                                        <span>Last active: {formatDistanceToNow(new Date(session.lastActiveAt))} ago</span>
                                    </div>
                                    <div className="text-xs text-[var(--muted)] mt-1 opacity-70">
                                        Signed in: {new Date(session.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {!session.isCurrentDevice && (
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={revoking === session.id}
                                    className="w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
                                >
                                    {revoking === session.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" /> Revoke Access
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="p-8 text-center text-[var(--muted)] border border-[var(--border)] rounded-2xl border-dashed">
                            No active sessions found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
