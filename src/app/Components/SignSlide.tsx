'use client';

import { useEffect, useRef, useState } from 'react';

type Patient = { patient_id?: string; patient_name?: string; age?: number; gender?: string };
type PatientReport = {
    report?: { has_history?: boolean; history?: { notes?: string; url?: string; attachment_name?: string }; comprehensive_report?: string };
};

const ICONS_URL = '/trumbowyg/icons.svg';

export default function SignSlide({
    blinded = true,
    selectedPatient,
    currentPatientReport,
    onSubmit,
    onSave,
}: {
    blinded?: boolean;
    selectedPatient?: Patient;
    currentPatientReport?: PatientReport;
    onSubmit: (fd: FormData, canSubmit: boolean) => Promise<void>;
    onSave?: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);

    const hostRef = useRef<HTMLDivElement | null>(null);
    const $ref = useRef<any>(null);
    const initializedRef = useRef(false);
    const getEditorHTML = (): string => {
        const host = hostRef.current;
        if (!host) return "";
        // Try common locations in order
        const el =
            host.querySelector(".trumbowyg-editor") ||                    // Trumbowyg inner
            host.querySelector('[contenteditable="true"]') ||              // generic contenteditable
            host;                                                          // the host itself (if you used contentEditable on it)
        return (el as HTMLElement)?.innerHTML ?? "";
    };
    // add selectedPatient?.patient_id to the deps and push html via API
    useEffect(() => {
        if (!open) return;
        const $ = $ref.current;
        const node = hostRef.current;
        if (!$ || !node) return;

        const $node = $(node);
        const html = currentPatientReport?.report?.comprehensive_report ?? '';
        try { $node.trumbowyg('html', html); } catch { }
    }, [open, selectedPatient?.patient_id, currentPatientReport?.report?.comprehensive_report]);

    // Load jQuery + Trumbowyg once and set svgPath
    useEffect(() => {
        let mounted = true;
        (async () => {
            const jQuery = (await import('jquery')).default as any;
            if (!mounted) return;
            (globalThis as any).jQuery = jQuery;
            (globalThis as any).$ = jQuery;
            await import('trumbowyg');
            jQuery.trumbowyg.svgPath = ICONS_URL;
            $ref.current = jQuery;
        })();
        return () => { mounted = false; };
    }, []);

    // Initialize once; on every open just set HTML via API
    useEffect(() => {
        if (!open) return;                       // only when visible
        const $ = $ref.current;
        const node = hostRef.current;
        if (!$ || !node) return;

        const $node = $(node);

        if (!initializedRef.current) {
            $node.trumbowyg({
                btns: [
                    ['undo', 'redo'],
                    ['formatting'],
                    ['strong', 'em', 'del'],
                    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                    ['unorderedList', 'orderedList'],
                    ['horizontalRule'],
                    ['removeformat'],
                    ['fullscreen'],
                ],
                autogrow: true,
                removeformatPasted: true,
            });
            initializedRef.current = true;
        }

        // Set content each time we open (no innerHTML by React/jQuery mix)
        const html = currentPatientReport?.report?.comprehensive_report ?? '';
        try { $node.trumbowyg('html', html); } catch { }
    }, [open, currentPatientReport?.report?.comprehensive_report]);

    // Clean up ONLY when the whole component unmounts
    useEffect(() => {
        return () => {
            const $ = $ref.current;
            const node = hostRef.current;
            if ($ && node && document.contains(node) && $(node).data('trumbowyg')) {
                try { $(node).trumbowyg('destroy'); } catch { }
            }
        };
    }, []);

    if (!blinded) return null;

    useEffect(() => {
        const html = currentPatientReport?.report?.comprehensive_report ?? "";
        // Put existing HTML (or leave empty)
        if (hostRef.current) {
            // If your content area is inside a specific child, adjust the selector accordingly
            const el =
                hostRef.current.querySelector(".trumbowyg-editor") ||
                hostRef.current.querySelector('[contenteditable="true"]') ||
                hostRef.current;
            (el as HTMLElement).innerHTML = html || "";
        }
    }, [currentPatientReport?.report?.comprehensive_report]);

    // 3) Update your submit handler to use the robust getter & a better blank check:
    const handleSubmit = async (canSubmit: boolean) => {

        const html = getEditorHTML();
        const cleanedHTML = (html || "").trim();
        const textOnly = cleanedHTML
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .trim();

        if (canSubmit && !textOnly) {
            alert("Comprehensive report should not be blank");
            return;
        }

        const fd = new FormData();

        // --- CSVs (Angular always sends rbc_csv; plt_csv only if plateletModel) ---
        const rbcCsv = new Blob(["belongs_to,count,percentage\n"], { type: "text/csv" });
        fd.append("patient_test[rbc_csv]", rbcCsv, "rbc.csv");

        // If you actually have a plateletModel, append a real CSV. If not, a minimal header is safe:
        const pltCsv = new Blob(["grid,count\n"], { type: "text/csv" });
        fd.append("patient_test[plt_csv]", pltCsv, "plt.csv");

        // --- JSON strings Angular sends (use "{}" or "[]" defaults if you don’t have real data yet) ---
        fd.append("patient_test[wbc_images]", "{}");
        fd.append("patient_test[tail_images]", "{}");
        fd.append("patient_test[wbc_info]", "{}");
        fd.append("patient_test[rbc_info]", "{}");
        fd.append("patient_test[platelet_info]", "{}");

        fd.append(
            "patient_test[threshold_settings]",
            JSON.stringify({
                color: [0.05, 0.09, 0.5, 0.7],
                shape: [1.0, 1.61, 2.0, 3.0],
                size: [3.8, 6, 8.4, 9.8],
                shapeSettings: false,
            })
        );

        fd.append("patient_test[platelet_mode]", "manual");
        fd.append("patient_test[manual_bounding_boxes]", "[]");
        fd.append("patient_test[plt_grid_size]", "4");
        // Only append if you actually have a value for it:
        // fd.append("patient_test[concentration_level]", someValue);

        // --- Only on final Submit (canSubmit === true) ---
        if (canSubmit) {
            // Send empty objects if you don’t yet have real grades:
            fd.append("patient_test[manual_grades]", JSON.stringify({}));
            fd.append("patient_test[ai_grades]", JSON.stringify({}));
            fd.append("patient_test[comprehensive_report]", cleanedHTML);
            fd.append("patient_test[comments]", "");
            fd.append("patient_test[signed]", "true");
        }

        await onSubmit(fd, canSubmit);

    };

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-0 rounded-[5px_5px_0_0] right-5 z-[1000] bg-[#07214A] px-4 py-2 text-white shadow-lg hover:opacity-90"
                >
                    <p>Sign Slide    ▴</p>
                </button>
            )}

            {/* keep modal mounted; just hide/show */}
            <div
                className={[
                    'fixed inset-0 z-[998] bg-black/30 transition-opacity',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                onClick={() => setOpen(false)}
                aria-hidden
            />

            <div
                className={[
                    'fixed z-[999] bottom-0 right-2',                    // <— was centered; now docked bottom-right
                    'w-[min(1000px,92vw)] max-h-[80vh] h-150',                 // keep a sensible size
                    'rounded-[5px_5px_0_0] shadow-2xl bg-white',
                    'transition-transform duration-150',
                    open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
                    'flex flex-col',                                     // header + scrollable body
                ].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between rounded-t-lg bg-[#0F2557] px-4 py-2 text-white">
                    <div className="font-semibold">Sign Slide</div>
                    <button onClick={() => setOpen(false)} className="rounded px-2 py-1 text-white/90 hover:text-white">▾</button>
                </div>
                <div className="font-bold px-2 py-1">{selectedPatient?.patient_id}</div>
                <div className="text-md text-gray-500 px-2">
                    {selectedPatient?.patient_name} {selectedPatient?.age}/{selectedPatient?.gender}
                </div>

                {currentPatientReport?.report?.has_history && (
                    <>
                        {currentPatientReport.report.history?.notes}
                        {currentPatientReport.report.history?.url && (
                            <a href={currentPatientReport.report.history.url} target="_blank" rel="noreferrer">
                                📎 {currentPatientReport.report.history.attachment_name ?? 'Attachment'}
                            </a>
                        )}
                    </>
                )}

                <div className="p-4">
                    <div className="ml-auto mb-3 flex justify-end">
                        <button
                            className="rounded bg-[#ef4444] px-3 py-2 text-white shadow hover:opacity-95"
                            onClick={() => handleSubmit(true)}
                        >
                            Submit Report
                        </button>
                    </div>

                    <div className="rounded border">
                        {/* IMPORTANT: stable node; React never rewrites inside */}
                        <div id="comprehensive_report" ref={hostRef} className="min-h-[300px] px-2 py-1" />
                    </div>

                </div>
            </div>
        </>
    );
}
