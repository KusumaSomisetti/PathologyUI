"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";

type RejectCaseModalProps = {
    open: boolean;
    onClose: () => void;
    patientData: { id: number | string; reason?: string; showActions?: boolean };
    submitReject: (id: number | string, body: any) => Promise<{ ok: boolean; message?: string }>;
    onSaved: (message?: string) => void;
};

const RejectCaseModal = ({ open, onClose, patientData, submitReject, onSaved }: RejectCaseModalProps) => {
    const [reason, setReason] = useState(patientData?.reason ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const showActions = patientData?.showActions ?? true;

    useEffect(() => {
        setReason(patientData?.reason ?? "");
        setError(null);
        setBusy(false);
    }, [patientData, open]);

    if (!open) return null;

    const onSave = async () => {
        if (busy) return;
        setBusy(true);

        // ✅ Use FormData with bracketed key
        const fd = new FormData();
        fd.append("patient_test[reject_reason]", reason);

        const res = await submitReject(patientData.id, fd);
        setBusy(false);

        if (res.ok) {
            onSaved(res.message || "Case rejected");
            onClose();
        } else {
            console.error(res.message || "Reject failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[2100]">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={showActions ? onClose : undefined} />

            {/* centered panel */}
            <div className="relative z-[2101] h-full w-full flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-[520px] max-w-[95vw] max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-auto">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h4 className="font-semibold">Reject Case</h4>
                        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                    </div>

                    <div className="p-4 space-y-3">
                        {error && <div className="text-red-600 text-sm">{error}</div>}

                        <div className="form-group space-y-2">
                            <label className="block text-sm font-medium">Reason</label>
                            {showActions ? (
                                <textarea
                                    rows={5}
                                    className="w-full rounded border px-3 py-2 outline-none"
                                    style={{ resize: "none" }}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            ) : (
                                <textarea
                                    rows={5}
                                    className="w-full rounded border px-3 py-2 bg-gray-50 text-gray-700"
                                    style={{ resize: "none" }}
                                    readOnly
                                    value={reason}
                                />
                            )}
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            {!showActions && (
                                <Button variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                            )}
                            {showActions && (
                                <>
                                    <Button variant="flat" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" isDisabled={busy} onPress={onSave}>
                                        {busy ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default RejectCaseModal;
