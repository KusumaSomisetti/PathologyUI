"use client";

import { useState, useMemo, useEffect, useRef, use } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader } from "@heroui/card";
import { format } from "date-fns";
import { Spinner } from "@heroui/react";

import RejectCaseModal from "./reject/RejectCaseModal";
import { rejectCase } from "./reject/casesClientReject";

type Patient = {
  id: number;
  patient_name: string;
  patient_id: string;
  diagnostic_name: string;
  site_name: string;
  completed_at: string;
  age: number;
  gender: string;
  date: string;
  reject_reason?: string;
  reference_no: string;
  scan_complete: boolean;
  ack_device: boolean;
  ack_time_at: Date;
  status: string;
  urn_no: string;
  test_name: string;
};

interface LeftPanelProps {
  cases: Patient[];
  selectedCase: Patient | null;
  setSelectedCase: (patient: Patient | null) => void;
  tab: "scanned" | "reported" | "rejected";
  setTab: (tab: "scanned" | "reported" | "rejected") => void;
  tabCounts: { scanned: number; reported: number; rejected: number };
  refreshAll: () => Promise<void> | void;
}

async function fetchRejectReason(testId: number | string): Promise<string> {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return "";
    const token = JSON.parse(userStr).auth_token as string;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/patients/tests/${testId}/report_details.json`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return (
      data?.report?.reject_reason ??
      data?.report?.reason ??
      data?.patient_test?.reject_reason ??
      data?.reject_reason ??
      ""
    );
  } catch {
    return "";
  }
}

export default function LeftPanel({
  cases,
  selectedCase,
  setSelectedCase,
  tab,
  setTab,
  tabCounts,
  refreshAll,
}: LeftPanelProps) {
  const [q, setQ] = useState("");

  const filtered = cases.filter((p) => {
    const haystack = `${p.patient_name} ${p.patient_id} ${p.diagnostic_name} ${p.site_name}`.toLowerCase();
    return haystack.includes(q.trim().toLowerCase());
  });

  type TabKey = "scanned" | "reported" | "rejected";
  const order: TabKey[] = useMemo(() => ["scanned", "reported", "rejected"], []);
  const VISIBLE = 2;
  const [start, setStart] = useState(0);
  const canPrev = start > 0;
  const canNext = start + VISIBLE < order.length;
  const showKeys = useMemo(
    () => new Set(order.slice(start, start + VISIBLE)),
    [order, start]
  );
  const goPrev = () => {
    if (canPrev) setStart((s) => s - 1);
  };
  const goNext = () => {
    if (canNext) setStart((s) => s + 1);
  };

  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ctxPatient, setCtxPatient] = useState<Patient | null>(null);
  const ctxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctxOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!ctxRef.current) return setCtxOpen(false);
      if (!ctxRef.current.contains(e.target as Node)) setCtxOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtxOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ctxOpen]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectData, setRejectData] = useState<{
    id: number | string;
    reason?: string;
    showActions?: boolean;
  } | null>(null);

  const openRejectFor = (p: Patient) => {
    setRejectData({ id: p.id, reason: "", showActions: true });
    setRejectOpen(true);
  };
  const openViewReasonFor = async (p: Patient) => {
    setRejectOpen(true);
    const reason = await fetchRejectReason(p.id);
    setRejectData({ id: p.id, reason, showActions: false });
  };

  useEffect(() => {
    if (tab === "rejected" && selectedCase) {
      openViewReasonFor(selectedCase);
    }
  }, [tab, selectedCase]);

  function pickNeighborAfterRemoval(
    currentList: Patient[],
    removedId: number
  ): Patient | null {
    const idx = currentList.findIndex((x) => x.id === removedId);
    if (idx === -1) return selectedCase ?? null;
    return currentList[idx + 1] ?? currentList[idx - 1] ?? null;
  }

  const handleRejectedSaved = async (message?: string) => {
    const rejectedId = Number(rejectData?.id);

    if (selectedCase && selectedCase.id === rejectedId) {
      const fallback = pickNeighborAfterRemoval(filtered, rejectedId);
      setSelectedCase(fallback);
    }

    await Promise.resolve(refreshAll?.());

    setRejectOpen(false);
    setRejectData(null);
    setCtxOpen(false);
    if (message) console.log(message);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);


 useEffect(()=>{
  const open=()=>setDrawerOpen(true);
  window.addEventListener("open-sidebar",open);
  return ()=> window.removeEventListener("open-sidebar",open);
 },[]);

  const Backdrop = drawerOpen ? (
    <div
      onMouseDown={() => setDrawerOpen(false)}
      className="xl:hidden fixed inset-0 z-[1999] bg-black/40"
    />
  ) : null;

  const MobileDrawer = (
    <aside
      id="mobile-sidebar"
      className={`xl:hidden fixed z-[2000] inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl border-r transform transition-transform duration-200 ${drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="font-semibold">Cases</div>
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Close sidebar"
          className="rounded-md px-2 py-1 border hover:bg-gray-50"
        >
          ✕
        </button>
      </div>

      <div className="h-full overflow-y-auto">
        {renderPanel()}
      </div>
    </aside>
  );

  const DesktopSidebar = (
    <aside className="hidden xl:flex xl:flex-col xl:h-[calc(100dvh)] xl:w-80 border-r bg-white">
      {renderPanel()}
    </aside>
  );

  function renderPanel() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-2">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={goPrev}
            isDisabled={!canPrev}
            aria-label="Scroll tabs left"
          >
            &lt;
          </Button>

          <Tabs
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key as TabKey)}
            className="flex-1 min-w-0"
            classNames={{ tabList: "w-full" }}
            variant="underlined"
            radius="sm"
          >
            <Tab
              key="scanned"
              className={showKeys.has("scanned") ? "" : "hidden"}
              title={`Assigned (${tabCounts.scanned})`}
            />
            <Tab
              key="reported"
              className={showKeys.has("reported") ? "" : "hidden"}
              title={`Reported (${tabCounts.reported})`}
            />
            <Tab
              key="rejected"
              className={showKeys.has("rejected") ? "" : "hidden"}
              title={`Rejected (${tabCounts.rejected})`}
            />
          </Tabs>

          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={goNext}
            isDisabled={!canNext}
            aria-label="Scroll tabs right"
          >
            &gt;
          </Button>
        </div>

        <div className="p-2">
          <Input placeholder="Search Patient" value={q} onValueChange={setQ} />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((p) => {
            const selected = selectedCase?.id === p.id;
            return (
              <Card
                key={p.id}
                isPressable
                onPress={() => setSelectedCase(p)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (tab === "rejected") return;
                  const x = Math.min(e.clientX, window.innerWidth - 160);
                  const y = Math.min(e.clientY, window.innerHeight - 80);
                  setCtxPos({ x, y });
                  setCtxPatient(p);
                  setCtxOpen(true);
                }}
                className={`mb-2 w-full ${selected ? "bg-[#07214A] text-white" : ""}`}
              >
                <CardHeader className="w-full p-3">
                  <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 w-full items-start">
                    <div className="text-left min-w-0">
                      <p className="font-bold text-[15px] leading-snug break-words">
                        {p.patient_name}
                      </p>
                      <p className="text-sm">
                        {p.age}/{p.gender}
                      </p>
                      <p className="text-sm text-rose-600 font-semibold">
                        {p.patient_id}
                      </p>
                    </div>

                    <div className="text-right text-xs place-self-end">
                      {selected && <Spinner color="danger" size="md" />}
                      <p className="leading-tight">
                        {format(new Date(p.completed_at), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="leading-tight">{p.diagnostic_name}</p>
                      <p className="leading-tight uppercase">{p.site_name}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {ctxOpen && (
          <div
            ref={ctxRef}
            className="fixed z-[2100] min-w-[160px] rounded-md border bg-white shadow-lg py-1"
            style={{ left: ctxPos.x, top: ctxPos.y }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {(tab === "scanned" || tab === "reported") && (
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  setCtxOpen(false);
                  if (ctxPatient) openRejectFor(ctxPatient);
                }}
              >
                Reject
              </button>
            )}
          </div>
        )}

        <RejectCaseModal
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          patientData={rejectData ?? { id: 0, reason: "", showActions: true }}
          submitReject={async (id, body) => rejectCase(id, body)}
          onSaved={handleRejectedSaved}
        />
      </div>
    );
  }

  return (
    <>
      {Backdrop}
      {MobileDrawer}

      {DesktopSidebar}
    </>
  );
}
