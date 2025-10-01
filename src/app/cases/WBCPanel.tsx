import React, { forwardRef } from "react";
import WBC_STATIC from "./cases.config";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { useState, useMemo } from "react";
import { SearchPlusIcon, SearchMinusIcon, BarsIcon, FilterIcon } from 'react-line-awesome';
import SignSlide from "../Components/SignSlide";

function getFileName(file: any): string {
    if (typeof file === "string") return file;
    return file?.name || file?.url || "";
}

// One tile (image + hover popup)
function WBCTile({ imgBase, file, index, feats }: any) {
    const cytoplasm = feats?.cytoplasm || "0\u00B5m";
    const nucleus = feats?.nucleus || "0\u00B5m";
    const ncRatio = feats?.nc_ratio || "0\u00B5m";

    const [placeH, setPlaceH] = useState<"center" | "left" | "right">("center");
    const [flipY, setFlipY] = useState(false);

    const onHoverPosition = (e: React.MouseEvent<HTMLDivElement>) => {
        const POP_W = 260;
        const POP_H = 280;
        const GAP = 8;
        const M = 8;

        const tileRect = e.currentTarget.getBoundingClientRect();

        const scroller =
            (e.currentTarget.closest("[data-scroll-container]") as HTMLElement) || null;
        const bounds = scroller
            ? scroller.getBoundingClientRect()
            : { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight };

        const leftBound = bounds.left + M;
        const rightBound = bounds.right - M;
        const bottomBound = bounds.bottom - M;

        // Horizontal: try centered relative to tile; snap to left/right if it would overflow container
        const centerLeft = tileRect.left + tileRect.width / 2 - POP_W / 2;
        if (centerLeft < leftBound) setPlaceH("left");
        else if (centerLeft + POP_W > rightBound) setPlaceH("right");
        else setPlaceH("center");

        // Vertical: below by default; flip above if no room within container
        const needFlip = tileRect.bottom + GAP + POP_H > bottomBound;
        setFlipY(needFlip);
    };

    const horiz =
        placeH === "left"
            ? "left-0"
            : placeH === "right"
                ? "right-0"
                : "left-1/2 -translate-x-1/2";
    const vert = flipY ? "bottom-full mb-2" : "top-full mt-2";

    return (
        <div
            className="group relative overflow-visible"
            onMouseEnter={onHoverPosition}
            onMouseMove={onHoverPosition}
        >
            <div className="absolute left-0 top-0 z-20">
                <span className="inline-flex h-6 w-5 items-center justify-center bg-cyan-50 text-[11px] font-bold text-black-800 shadow-lg ring-1 ring-black/10 select-none">
                    {index + 1}
                </span>
            </div>
            <img
                src={`${imgBase}/${file}`}
                alt={file}
                loading="lazy"
                className="w-full aspect-square object-cover"
            />

            <div
                className={`absolute ${vert} ${horiz} hidden group-hover:block z-[9999] pointer-events-none`}  // ⬅
            >
                <div className="w-65 max-w-[calc(100vw-16px)] pointer-events-auto">                              {/* ⬅ */}
                    <Card shadow="lg" className="ring-1 !overflow-visible">                                         {/* ⬅ */}
                        <CardBody className="p-3 !overflow-visible">
                            <img
                                src={`${imgBase}/${file}`}
                                alt={`${file}-preview`}
                                className="w-80 h-60 object-contain rounded-md"
                            />
                            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                                <dt>Cytoplasm</dt><dd className="text-right">{cytoplasm}</dd>
                                <dt>Nucleus</dt><dd className="text-right">{nucleus}</dd>
                                <dt>NC Ratio</dt><dd className="text-right">{ncRatio}</dd>
                            </dl>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function WBCGroup({ className, files, imgBase, featuresMap, cols, onInc, onDec, onReset, }: any) {
    return (
        <section id={`wbc-${className}`} className="space-y-2">
            <Card className="border border-gray-300 !overflow-visible">
                <CardHeader className="pb-1.5 pt-1 bg-gray-100">
                    <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="font-semibold capitalize">
                            {className.replace(/_/g, " ")} ({files.length})
                        </h3>
                        <Button size="sm" variant="flat" radius="sm" onPress={onInc}>
                            <SearchMinusIcon size="2x" style={{ transform: 'scaleX(-1)', color: 'blue' }} />
                        </Button>
                        <Button size="sm" variant="flat" radius="sm" onPress={onDec}>

                            <SearchPlusIcon size="2x" style={{ transform: 'scaleX(-1)', color: 'blue' }} />
                        </Button>
                        <Button size="sm" variant="flat" radius="sm">
                            <BarsIcon size="2x" style={{ color: 'blue' }} /><span className="text-black-600 font-bold">By Cytoplasm</span>
                        </Button>
                        <Button size="sm" variant="flat" radius="sm">
                            <BarsIcon size="2x" style={{ color: 'blue' }} /><span className="text-black-600 font-bold">By Nucleus</span>
                        </Button>
                        <Button size="sm" variant="flat" radius="sm">
                            <BarsIcon size="2x" style={{ color: 'blue' }} /><span className="text-black-600 font-bold">By N/C Ratio</span>
                        </Button>
                        <Button size="sm" variant="flat" radius="sm" onPress={onReset}>
                            <span className="text-black-600 font-bold">Reset</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="!overflow-visible relative gap-2 pt-1">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {files.map((f: any, idx: number) => {
                            const file = (typeof f === "string" ? f : f?.name || f?.url || "");
                            const feats =
                                featuresMap[file] ||
                                featuresMap[`${className}/${file}`] ||
                                {};

                            const key = `${className}::${file}::${idx}`;

                            return (
                                <WBCTile
                                    key={key}
                                    imgBase={imgBase}
                                    file={file}
                                    index={idx}
                                    feats={feats}
                                />
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </section>
    );
}

const WBCPanel = forwardRef<HTMLDivElement, { report: any }>(({ report }, ref) => {
    if (!report) return <p className="p-4">Select a patient to see report details.</p>;

    const details = report.report || {};
    const groups = details?.cells?.wbc || {};
    const featuresMap = details?.wbc_features || {};
    const r = (details?.cells?.reference_url || "").replace(/\/+$/, "");
    const imgBase = `${r}/display`;

    const orderKeys = useMemo(() => WBC_STATIC.map((row) => row.belongs_to), []);
    const orderIndex = useMemo(() => new Map(orderKeys.map((k, i) => [k, i])), [orderKeys]);
    const visibleSet = useMemo(
        () => new Set(WBC_STATIC.filter((row) => row.show !== false).map((row) => row.belongs_to)),
        []
    );

    const sortedGroups = useMemo(
        () =>
            Object.entries(groups)
                .filter(([k]) => visibleSet.has(k))
                .sort(
                    ([a], [b]) => (orderIndex.get(a) ?? 1e9) - (orderIndex.get(b) ?? 1e9)
                ),
        [groups, orderIndex, visibleSet]
    );

    const DEFAULT_COLS = 11;
    const STEP = 2;
    const MIN_COLS = 1;
    const MAX_COLS = 25;

    const [colsByGroup, setColsByGroup] = useState<Record<string, number>>({});

    const getCols = (key: string) => colsByGroup[key] ?? DEFAULT_COLS;

    const incCols = (key: string) =>
        setColsByGroup((m) => {
            const next = Math.min(getCols(key) + STEP, MAX_COLS);
            return { ...m, [key]: next };
        });

    const decCols = (key: string) =>
        setColsByGroup((m) => {
            const next = Math.max(getCols(key) - STEP, MIN_COLS);
            return { ...m, [key]: next };
        });

    const resetCols = (key: string) =>
        setColsByGroup((m) => ({ ...m, [key]: DEFAULT_COLS }));

    return (
        <div className="absolute inset-x-0 bottom-0 top-12">
            <div ref={ref} data-scroll-container className="h-full overflow-y-auto p-2">
                <div className="space-y-2">
                    {sortedGroups.map(([className, files]) => (
                        <WBCGroup
                            key={className}
                            className={className}
                            files={files}
                            imgBase={imgBase}
                            featuresMap={featuresMap}
                            cols={getCols(className)}
                            onInc={() => incCols(className)}
                            onDec={() => decCols(className)}
                            onReset={() => resetCols(className)}
                        />
                    ))}
                </div>
            </div>


        </div>
    );
});

export default WBCPanel;
