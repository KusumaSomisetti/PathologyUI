'use client';

import { useMemo } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import WBC_STATIC, { WbcInfo, WBC_INDEX_POSITION } from './cases.config';

type Props = {
    wbcCells: Record<string, any[]>;
    onRowClick?: (belongs_to: string, canClick: boolean) => void;
};

const spaceClass = (s: WbcInfo['space']) =>
    s === 'space-1' ? 'pl-3' : s === 'space-2' ? 'pl-6' : s === 'space-3' ? 'pl-9' : '';

export default function WbcInfoTable({ wbcCells, onRowClick }: Props) {
    const { groups, definedCells, wbcClassified } = useMemo(() => {
        const byId = new Map<number, WbcInfo>(WBC_STATIC.map(r => [r.id, r]));
        const kids: Record<number, number[]> = {};
        for (const r of WBC_STATIC) {
            if (r.parent >= 0) (kids[r.parent] ??= []).push(r.id);
        }

        const groups: Record<string, string[]> = {};
        for (const [pidStr, childIds] of Object.entries(kids)) {
            const pid = Number(pidStr);
            const parent = byId.get(pid);
            if (!parent) continue;
            groups[parent.belongs_to] = childIds
                .map(id => byId.get(id)?.belongs_to)
                .filter(Boolean) as string[];
        }

        const leaves = WBC_STATIC.filter(r => !(kids[r.id]?.length));
        const definedCells = leaves.map(l => l.belongs_to);
        const wbcClassified = leaves
            .filter(l => l.show !== false)
            .filter(l => l.canClick === true)
            .map(l => l.belongs_to);

        return { groups, definedCells, wbcClassified };
    }, []);

    const backendCount = useMemo(() => {
        const out: Record<string, number> = {};
        for (const k in wbcCells) out[k] = Array.isArray(wbcCells[k]) ? wbcCells[k].length : 0;
        return out;
    }, [wbcCells]);

    const total = useMemo(
        () => wbcClassified.reduce((sum, key) => sum + (backendCount[key] ?? 0), 0),
        [wbcClassified, backendCount]
    );

    const rows = useMemo<WbcInfo[]>(() => {

        const rows = WBC_STATIC.map(r => ({ ...r, count: 0, percentage: 0 }));

        for (const key of definedCells) {
            const i = WBC_INDEX_POSITION[key];
            if (i === undefined || !rows[i]) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn("[WbcInfoTable] Unknown definedCell:", key);
                }
                continue;
            }
            const count = backendCount[key] ?? 0;
            rows[i].count = count;
            rows[i].percentage = total > 0 ? (count / total) * 100 : 0;
        }

        for (const groupName in groups) {
            const gi = WBC_INDEX_POSITION[groupName];
            if (gi === undefined || !rows[gi]) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn("[WbcInfoTable] Unknown group:", groupName);
                }
                continue;
            }
            let sum = 0;
            for (const child of groups[groupName]) {
                const ci = WBC_INDEX_POSITION[child];
                if (ci === undefined || !rows[ci]) {
                    if (process.env.NODE_ENV !== "production") {
                        console.warn("[WbcInfoTable] Unknown child:", child, "in group", groupName);
                    }
                    continue;
                }
                sum += rows[ci].count;
            }
            rows[gi].count = sum;
            rows[gi].percentage = total > 0 ? (sum / total) * 100 : 0;
        }

        const totalRow = rows.find(r => r.belongs_to === 'total_classified_cells');
        if (totalRow) {
            totalRow.count = total;
            totalRow.percentage = total > 0 ? 100 : 0;
        }
        return rows;
    }, [definedCells, groups, backendCount, total]);


    return (

        <Table
  aria-label="WBC Info Table"
  isHeaderSticky
  shadow="none"
  radius="none"
  className="h-full min-w-[320px]"  // <- guarantees all 3 columns fit
  classNames={{
    base: 'h-full',
    // keep vertical scrolling; avoid horizontal scroll by ensuring min width above
    wrapper: 'h-full overflow-y-auto p-0 !rounded-none !shadow-none',
    thead: 'bg-white sticky top-0 z-10',
    th: 'h-10 whitespace-nowrap font-semibold text-md py-1',
    td: 'py-2 leading-relaxed',
    tr: 'border-b border-gray-200 last:border-b-0',
  }}
>
  <TableHeader>
    {/* Param column can flex, but give it a sane minimum */}
    <TableColumn className="min-w-[180px] pr-2 text-black-600">WBC Parameter</TableColumn>

    {/* Fix narrow, readable widths for numeric columns */}
    <TableColumn className="w-14 text-center text-black-600">Count</TableColumn>
    <TableColumn className="w-14 text-center text-black-600">%</TableColumn>
  </TableHeader>

            <TableBody>
                {rows.map((r) => {
                    const isChild = r.space === 'space-2' || r.space === 'space-3';

                    return (
                        <TableRow
                            key={r.id}
                            onClick={() => onRowClick?.(r.belongs_to, r.canClick)}
                            className={r.canClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
                        >
                            <TableCell
                                className={`${spaceClass(r.space)} ${r.bold === 'bold' ? 'text-[#07214A] font-bold' : ''
                                    } pr-2 ${!r.show ? 'opacity-50' : ''}`}
                            >
                                <span className="block truncate whitespace-nowrap" title={r.parameter}>
                                    {isChild && <span className="mr-0 text-gray-500">↳</span>}
                                    {r.parameter}
                                </span>
                            </TableCell>

                            <TableCell className={`text-center tabular-nums ${!r.show ? 'opacity-50' : ''}${r.bold === 'bold' ? 'text-[#07214A] font-semibold' : ''
                                }`}>
                                {r.count}
                            </TableCell>

                            <TableCell className={`text-center tabular-nums ${r.bold === 'bold' ? 'text-[#07214A] font-semibold' : ''
                                }`}>
                                {r.show
                                    ? r.percentage === 0 || r.percentage === 100
                                        ? r.percentage
                                        : r.percentage.toFixed(2)
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>

        </Table>
    );
}
