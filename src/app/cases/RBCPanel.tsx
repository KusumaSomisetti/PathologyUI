"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Tooltip } from "@heroui/tooltip";

type RbcCell = {
    id: string;
    image_name?: string;      // used for CSS class naming in Angular
    image_url: string;
    segmented_url?: string;   // for enableSegmentation=true
    is_manual?: boolean;      // parity with Angular hidden items
    features?: {
        color?: string;
        size_um?: number;
        shape?: string;
        inclusion?: string;
    };
};

type RbcBucket = {
    title: string;            // Angular: rbc[cls].title
    cells: RbcCell[];         // Angular: rbc[cls].cells
    endIndex?: number;        // Angular: rbc[cls].endIndex (infinite scroll slice)
};

export type RbcMap = Record<
    "normocytes" | "chromia" | "size" | "shape" | "inclusions" | "unclassified" | "trash",
    RbcBucket
>;

export default function RBCPanel({
    report,
    advancedRBCView,
    onToggleAdvancedRBCView,              // toggled here (toolbar) and reflected in the aside
    enableSegmentation,
    onToggleSegmentation,
    enableIndicators,
    onToggleIndicators,
    toolActionsFor,                       // Angular: <app-toolbar-action [actions]="toolActionsFor($event)">
    onRbcScrollDown,                      // (cls) => paginate
    showRbcImagePopup,
    hideRbcImagePopup,
    onApplyThresholding,                  // Adjust (Normocytes)
}: {
    report: any;
    advancedRBCView: boolean;
    onToggleAdvancedRBCView?: (v: boolean) => void;
    enableSegmentation?: boolean;
    onToggleSegmentation?: (v: boolean) => void;
    enableIndicators?: boolean;
    onToggleIndicators?: (v: boolean) => void;
    toolActionsFor?: (cls: string) => any[];
    onRbcScrollDown?: (cls: keyof RbcMap) => void;
    showRbcImagePopup?: (cell: RbcCell, ev: React.MouseEvent) => void;
    hideRbcImagePopup?: () => void;
    onApplyThresholding?: () => void;
}) {
    const details = report?.report ?? report ?? {};
    const refUrl = (details?.cells?.reference_url || "").replace(/\/+$/, "");
    const rbc: Partial<RbcMap> = useMemo(() => {
        // Keep the exact Angular shape/keys if they exist; otherwise map from your payload.
        const src = details.rbc ?? details.rbc_classes ?? {};
        const get = (k: string, fallbackTitle: string): RbcBucket => ({
            title: src[k]?.title ?? fallbackTitle,
            cells: Array.isArray(src[k]?.cells) ? src[k].cells : [],
            endIndex: src[k]?.endIndex ?? Math.min(50, (src[k]?.cells?.length ?? 0)),
        });
        return {
            normocytes: get("normocytes", "Normocytes"),
            chromia: get("chromia", "RBC Chromia"),
            size: get("size", "RBC Size"),
            shape: get("shape", "RBC Shape"),
            inclusions: get("inclusions", "RBC inclusions"),
            unclassified: get("unclassified", "Unclassified"),
            trash: get("trash", "Trash"),
        };
    }, [details]);

    // viewer host (exact id to match Angular hooks)
    const mosaicRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Attach your existing deep-zoom viewer here, same as Angular's #mosaicView.
        // Keep the id for parity so downstream code can target it if needed.
        // Example: initOpenSeadragon(mosaicRef.current, { tileSource: ... })
    }, [refUrl]);

    return (
        <div className="relative h-full w-full">
            {/* Toolbar — keep Angular control names */}
            <div className="sticky top-0 z-20 flex h-11 items-center gap-1 bg-background/90 px-2 supports-[backdrop-filter]:bg-background/50">
                <Button size="sm" variant="flat">Ruler</Button>
                <Button size="sm" variant="flat">Zoom In</Button>
                <Button size="sm" variant="flat">Zoom Out</Button>
                <Button size="sm" variant="flat">Home</Button>
                <Button size="sm" variant="flat">Fullscreen</Button>
                <Button size="sm" variant="flat">Rotate ⟲</Button>
                <Button size="sm" variant="flat">Rotate ⟳</Button>

                <div className="mx-3 h-6 w-px bg-foreground/20" />

                <Checkbox
                    size="sm"
                    isSelected={advancedRBCView}
                    onValueChange={(v) => onToggleAdvancedRBCView?.(v)}
                >
                    Advanced RBC (For pathologists review)
                </Checkbox>

                {advancedRBCView && (
                    <Tooltip content="Threshold settings for Normocytes">
                        <Button size="sm" variant="light" onPress={onApplyThresholding}>
                            Adjust (Normocytes)
                        </Button>
                    </Tooltip>
                )}

                <div className="ml-auto flex items-center gap-3">
                    <Checkbox
                        size="sm"
                        isSelected={!!enableSegmentation}
                        onValueChange={(v) => onToggleSegmentation?.(v)}
                    >
                        Segmentation overlay
                    </Checkbox>
                    <Checkbox
                        size="sm"
                        isSelected={!!enableIndicators}
                        onValueChange={(v) => onToggleIndicators?.(v)}
                    >
                        Feature indicators
                    </Checkbox>
                </div>
            </div>

            {/* Viewer host (same id as Angular to keep code portable) */}
            <div ref={mosaicRef} id="mosaicView" className="h-[calc(100%-44px)] w-full bg-black/80" />

            {/* Advanced class tabs (exact labels & behavior) */}
            {advancedRBCView && (
                <div className="absolute inset-x-0 bottom-0 h-[48%] rounded-t-2xl border bg-background shadow-2xl">
                    <Tabs
                        variant="underlined"
                        classNames={{ tabList: "px-2 pt-1 sticky top-0 z-10 bg-background", panel: "h-[calc(100%-42px)] overflow-y-auto" }}
                    >
                        {(
                            [
                                ["normocytes", rbc.normocytes],
                                ["chromia", rbc.chromia],
                                ["size", rbc.size],
                                ["shape", rbc.shape],
                                ["inclusions", rbc.inclusions],
                                ["unclassified", rbc.unclassified],
                                ["trash", rbc.trash],
                            ] as [keyof RbcMap, RbcBucket | undefined][]
                        ).map(([cls, bucket]) => {
                            if (!bucket) return null;
                            return (
                                <Tab key={cls} title={`${bucket.title} (${bucket.cells.length})`}>
                                    <RbcClassCard
                                        cls={cls}
                                        bucket={bucket}
                                        enableSegmentation={!!enableSegmentation}
                                        enableIndicators={!!enableIndicators}
                                        toolActions={toolActionsFor?.(cls) ?? []}
                                        onScrollEnd={() => onRbcScrollDown?.(cls)}
                                        showRbcImagePopup={showRbcImagePopup}
                                        hideRbcImagePopup={hideRbcImagePopup}
                                    />
                                </Tab>
                            );
                        })}
                    </Tabs>
                </div>
            )}
        </div>
    );
}

function RbcClassCard({
    cls,
    bucket,
    enableSegmentation,
    enableIndicators,
    toolActions,
    onScrollEnd,
    showRbcImagePopup,
    hideRbcImagePopup,
}: {
    cls: string;
    bucket: RbcBucket;
    enableSegmentation: boolean;
    enableIndicators: boolean;
    toolActions: any[];
    onScrollEnd?: () => void;
    showRbcImagePopup?: (cell: RbcCell, ev: React.MouseEvent) => void;
    hideRbcImagePopup?: () => void;
}) {
    // Angular parity: rbc[cls].endIndex slices visible cells, infinite scroll extends it
    const end = bucket.endIndex ?? bucket.cells.length;
    const visible = bucket.cells.slice(0, end);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sentinelRef.current || !onScrollEnd) return;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) onScrollEnd();
        });
        io.observe(sentinelRef.current);
        return () => io.disconnect();
    }, [onScrollEnd]);

    return (
        <div className="p-2">
            {/* Angular: <app-toolbar-action [actions]="toolActionsFor($event)" [cellType]="'rbc'"> */}
            {toolActions?.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {toolActions.map((a, i) => (
                        <Button key={i} size="sm" variant="flat" onPress={a.onPress}>{a.label}</Button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 overflow-y-auto">
                {visible.map((c) => {
                    const imgSrc = enableSegmentation && c.segmented_url ? c.segmented_url : c.image_url;
                    // Angular used CSS classes like `rbc rbc_<image_name>` or `drbc srbc_<image_name>`
                    const clsName = enableSegmentation
                        ? `drbc srbc_${c.image_name ?? c.id}`
                        : `rbc rbc_${c.image_name ?? c.id}`;

                    if (c.is_manual) return null; // Angular hides manual in grids

                    return (
                        <div
                            key={c.id}
                            className={`group relative overflow-hidden rounded-lg border ${clsName}`}
                            onMouseEnter={(ev) => showRbcImagePopup?.(c, ev)}
                            onMouseLeave={() => hideRbcImagePopup?.()}
                        >
                            <img src={imgSrc} alt={c.id} className="block h-28 w-full object-cover" />
                            {enableIndicators && c.features && (
                                <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 bg-black/60 p-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    {c.features.color && <span>Color:{c.features.color}</span>}
                                    {typeof c.features.size_um === "number" && <span>Size:{c.features.size_um}µm</span>}
                                    {c.features.shape && <span>Shape:{c.features.shape}</span>}
                                    {c.features.inclusion && <span>Incl:{c.features.inclusion}</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Infinite scroll sentinel: Angular (scrolled)="onRbcScrollDown(cls, $event)" */}
            <div ref={sentinelRef} className="h-10 w-full" />
        </div>
    );
}
