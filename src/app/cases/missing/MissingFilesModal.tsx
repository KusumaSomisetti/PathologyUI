// MissingFilesModal.tsx
"use client";
import { useState } from "react";
import type { MissingFlags, MissingPayload } from "./casesClient";
import { submitMissingFiles } from "./casesClient";

type FlagKey =
    | "wbc" | "rbc" | "plt" | "wbc_distribution"
    | "field_view" | "fov" | "rbc_csv" | "plt_csv";

type Flags = Record<FlagKey, boolean>;

export function MissingFilesModal({
    open,
    onClose,
    patientContext, // { id, urn_no, diagnostic_name, test_name, destination? }
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    patientContext: {
        id: number | string;
        urn_no?: string;
        diagnostic_name?: string;
        test_name?: string;
        destination?: string;
    };
    onSaved?: (msg: string) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [flags, setFlags] = useState<Flags>({
        wbc: false,
        rbc: false,
        plt: false,
        wbc_distribution: false,
        field_view: false,
        fov: false,
        rbc_csv: false,
        plt_csv: false,
    });

    // alias map like Angular: flip both main + alias
    const aliasMap: Partial<Record<FlagKey, FlagKey>> = {
        field_view: "fov",
        rbc: "rbc_csv",
        plt: "plt_csv",
    };

    const toggle = (key: FlagKey) =>
        setFlags(prev => {
            const next: Flags = { ...prev, [key]: !prev[key] };
            const alias = aliasMap[key];
            if (alias) next[alias] = next[key];
            return next;
        });

    const canSave = Object.values(flags).some(Boolean);

    const onSave = async () => {
        setError(null);
        if (!canSave) {
            setError("Select at least one item.");
            return;
        }

        setBusy(true);
        try {
            const destination =
                patientContext.destination ||
                [patientContext.diagnostic_name, patientContext.test_name]
                    .filter(Boolean)
                    .join("/");

            const payload: MissingPayload = {
                urn_no: String(patientContext.urn_no || ""),
                destination,
                wbc: flags.wbc,
                rbc: flags.rbc,
                plt: flags.plt,
                wbc_distribution: flags.wbc_distribution,
                field_view: flags.field_view,
                fov: flags.fov,
                rbc_csv: flags.rbc_csv,
                plt_csv: flags.plt_csv,
            };

            const out = await submitMissingFiles(patientContext.id, payload);
            if (!out.ok) {
                setError(out.message);
                return;
            }
            onSaved?.(out.message);
            onClose();
        } finally {
            setBusy(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center" onClick={onClose}>
            <div className="w-[420px] rounded-md bg-white shadow-lg p-4" onClick={e => e.stopPropagation()}>
                <div className="text-lg font-semibold mb-2">Request for missing files</div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={flags.wbc} onChange={() => toggle("wbc")} />
                        <span>WBC</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={flags.field_view} onChange={() => toggle("field_view")} />
                        <span>RBC View</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={flags.rbc} onChange={() => toggle("rbc")} />
                        <span>RBC</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={flags.plt} onChange={() => toggle("plt")} />
                        <span>Platelets</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={flags.wbc_distribution} onChange={() => toggle("wbc_distribution")} />
                        <span>WBC Distribution</span>
                    </label>
                </div>

                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-3 py-2 border rounded" onClick={onClose} disabled={busy}>Cancel</button>
                    <button
                        className="px-3 py-2 rounded bg-[#0F2557] text-white disabled:opacity-60"
                        onClick={onSave}
                        disabled={busy || !canSave}
                    >
                        {busy ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MissingFilesModal;
