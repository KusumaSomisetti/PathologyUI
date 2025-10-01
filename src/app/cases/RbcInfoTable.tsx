"use client";

import { useMemo, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";

type Grade = 0 | 1 | 2 | 3 | 4;
type RbcParamRow = {
    key: string;             // e.g., "Normocytes"
    title: string;           // display title
    count?: number;          // absolute count
    percentage?: number;     // %
    grade?: Grade | null;    // 0..4 or null
    details?: string;
};

export default function RbcInfoTable({
    rbcInfo,                                  // Angular: details.rbc_info
    advancedRBCView,                          // Angular: advancedRBCView
    total_rbc_used_for_calculation,           // Angular footer label
    onToggleAdvancedRBCView,                  // toggled from toolbar too
    onMarkAllZero,                            // "Mark all parameters as grade 0"
    onGradeChange,                            // change per-row grade
    classifyRbcCells,                         // row click action
    onAdjustNormocytes,                       // "adjust" icon next to Normocytes
}: {
    rbcInfo: Record<string, any> | undefined;
    advancedRBCView: boolean;
    total_rbc_used_for_calculation?: number;
    onToggleAdvancedRBCView?: (v: boolean) => void;
    onMarkAllZero?: () => void;
    onGradeChange?: (key: string, g: Grade) => void;
    classifyRbcCells?: (key: string) => void;
    onAdjustNormocytes?: () => void;
}) {
    const rows = useMemo<RbcParamRow[]>(() => {
        if (!rbcInfo) return [];
        return Object.entries(rbcInfo).map(([key, raw]) => {
            const obj = typeof raw === "object" && raw ? raw : {};
            return {
                key,
                title: obj.title ?? key,
                count: obj.count ?? obj.total ?? obj.n,
                percentage: obj.percentage ?? obj.percent ?? obj.pct,
                grade: (obj.grade ?? null) as Grade | null,
                details: Array.isArray(obj.details) ? obj.details.join(", ") : obj.details,
            };
        });
    }, [rbcInfo]);

    const [markAll, setMarkAll] = useState(false);

    return (
        <aside className={advancedRBCView ? "rbc-info h-full w-full" : "min-rbc-info h-full w-full"}>
            {/* Header controls (match Angular semantics) */}
            <div className="flex items-center justify-between gap-2 px-2 py-2">
                <Checkbox
                    size="sm"
                    isSelected={advancedRBCView}
                    onValueChange={(v) => onToggleAdvancedRBCView?.(v)}
                >
                    Advanced RBC (For pathologists review)
                </Checkbox>

                <div className="flex items-center gap-2">
                    <Checkbox
                        size="sm"
                        isSelected={markAll}
                        onValueChange={(v) => {
                            setMarkAll(v);
                            if (v) onMarkAllZero?.();
                        }}
                    >
                        Mark all parameters as grade 0
                    </Checkbox>
                    <Tooltip content="Set every parameter's grade to 0">
                        <span className="text-xs opacity-60">?</span>
                    </Tooltip>
                </div>
            </div>

            {/* Table (click row → classifyRbcCells) */}
            <div className="px-2 pb-2">
                <div className="min-h-0 max-h-[calc(100vh-220px)] overflow-auto rounded-md border">
                    <Table
                        aria-label="RBC Parameters"
                        removeWrapper
                        onRowAction={(key) => classifyRbcCells?.(String(key))}
                    >
                        <TableHeader>
                            <TableColumn key="param">Parameter</TableColumn>
                            <TableColumn key="count" className="text-right">Count</TableColumn>
                            <TableColumn key="pct" className="text-right">%</TableColumn>
                            <TableColumn key="grade" className="text-center">Grade</TableColumn>
                            <TableColumn key="actions" className="text-center">Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={rows}
                            emptyContent={<div className="p-4 text-sm opacity-70">No RBC data</div>}
                        >
                            {(row) => (
                                <TableRow key={row.key} className="cursor-pointer">
                                    <TableCell className="font-medium">{row.title}</TableCell>
                                    <TableCell className="text-right">{row.count ?? "-"}</TableCell>
                                    <TableCell className="text-right">
                                        {typeof row.percentage === "number" ? `${row.percentage.toFixed(1)}%` : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <GradePicker
                                            value={row.grade}
                                            onChange={(g) => onGradeChange?.(row.key, g)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.key.toLowerCase() === "normocytes" && (
                                            <Button
                                                size="sm"
                                                variant="light"
                                                onPress={(e) => {
                                                    //e.stopPropagation();
                                                    onAdjustNormocytes?.();
                                                }}
                                            >
                                                Adjust
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Sticky footer (Angular: "No.of RBCs used for calculation") */}
            <Divider />
            <div className="sticky bottom-0 flex items-center justify-between gap-2 bg-background px-2 py-2 text-xs">
                <span className="opacity-70">No.of RBCs used for calculation</span>
                <b>{typeof total_rbc_used_for_calculation === "number"
                    ? total_rbc_used_for_calculation
                    : "-"}</b>
            </div>
        </aside>
    );
}

function GradePicker({
    value,
    onChange,
}: {
    value: number | null | undefined;
    onChange?: (g: Grade) => void;
}) {
    return (
        <select
            className="rounded-md border bg-transparent px-2 py-1 text-sm"
            value={value ?? -1}
            onChange={(e) => onChange?.(Number(e.target.value) as Grade)}
        >
            <option value={-1}>—</option>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
        </select>
    );
}
