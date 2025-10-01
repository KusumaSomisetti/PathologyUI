"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "../Components/Topbar";
import LeftPanel from "./LeftPanel";
import ReportPanel from "./ReportPanel";
import SignSlide from "../Components/SignSlide";

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

type TabKey = "scanned" | "reported" | "rejected";

export default function CasesPage() {
  const [tab, setTab] = useState<TabKey>("scanned");

  const [scannedCases, setScannedCases] = useState<Patient[]>([]);
  const [reportedCases, setReportedCases] = useState<Patient[]>([]);
  const [rejectedCases, setRejectedCases] = useState<Patient[]>([]);

  const [selectedCase, setSelectedCase] = useState<Patient | null>(null);
  const [report, setReport] = useState<any>(null);

  const tabCounts = useMemo(
    () => ({
      scanned: scannedCases.length,
      reported: reportedCases.length,
      rejected: rejectedCases.length,
    }),
    [scannedCases.length, reportedCases.length, rejectedCases.length]
  );

  const casesForTab = useMemo(() => {
    if (tab === "scanned") return scannedCases;
    if (tab === "reported") return reportedCases;
    return rejectedCases;
  }, [tab, scannedCases, reportedCases, rejectedCases]);

  async function getAuthToken(): Promise<string | null> {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr).auth_token as string;
    } catch {
      return null;
    }
  }

  async function fetchCasesByScope(scope: TabKey): Promise<Patient[]> {
    const token = await getAuthToken();
    if (!token) return [];
    let all: Patient[] = [];
    let pageNumber = 0;

    while (true) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/tests.json?scope=${scope}&pageNumber=${pageNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Failed to fetch cases for ${scope}`);
      const data = await res.json();

      const list: Patient[] = data.patients ?? [];
      if (list.length === 0) break;

      all = all.concat(list);

      const total = data.meta?.length ?? all.length;
      if (all.length >= total) break;

      pageNumber++;
    }

    return all;
  }

  async function refreshAll() {
    const [s, r, j] = await Promise.all([
      fetchCasesByScope("scanned"),
      fetchCasesByScope("reported"),
      fetchCasesByScope("rejected"),
    ]);
    setScannedCases(s);
    setReportedCases(r);
    setRejectedCases(j);

    setSelectedCase((prev) => {
      if (!prev) return casesPickFirst(tab, s, r, j);
      const existsInTab = findInTab(prev.id, tab, s, r, j);
      return existsInTab ?? casesPickFirst(tab, s, r, j);
    });
  }

  function findInTab(
    id: number,
    t: TabKey,
    s: Patient[],
    r: Patient[],
    j: Patient[]
  ): Patient | null {
    const arr = t === "scanned" ? s : t === "reported" ? r : j;
    return arr.find((p) => p.id === id) ?? null;
  }

  function casesPickFirst(
    t: TabKey,
    s: Patient[],
    r: Patient[],
    j: Patient[]
  ): Patient | null {
    if (t === "scanned") return s[0] ?? null;
    if (t === "reported") return r[0] ?? null;
    return j[0] ?? null;
  }

  useEffect(() => {
    refreshAll().catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const arr = tab === "scanned" ? scannedCases : tab === "reported" ? reportedCases : rejectedCases;

    if (arr.length === 0) {
      setSelectedCase(null);
      return;
    }

    if (!selectedCase || !arr.some((p) => p.id === selectedCase.id)) {
      setSelectedCase(arr[0]);
    }
  }, [tab, scannedCases, reportedCases, rejectedCases, selectedCase]);

  useEffect(() => {
    async function fetchReport() {
      if (!selectedCase) {
        setReport(null);
        return;
      }
      const token = await getAuthToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients/tests/${selectedCase.id}/report_details.json`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          console.warn("Failed to fetch report");
          setReport(null);
          return;
        }
        const data = await res.json();
        console.log("[report_details.json]", data);

        setReport(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setReport(null);
      }
    }

    fetchReport();
  }, [selectedCase?.id]);

  async function submitReportToBackend(testId: number | string, body: FormData) {
    const userStr = localStorage.getItem("currentUser");
    const token = userStr ? JSON.parse(userStr).auth_token as string : "";

    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const url = `${base}/patients/tests/${testId}/update_diff_count.json`;

    const fdPreview: string[] = [];
    for (const [k, v] of body.entries()) {
      fdPreview.push(`${k}=${v instanceof Blob ? `Blob(${v.type},${v.size})` : JSON.stringify(v)}`);
    }
    console.log("[SignSubmit] POST", url, "\n[FormData]\n" + fdPreview.join("\n"));

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    const contentType = res.headers.get("content-type") || "";
    let raw = "";
    try { raw = await res.text(); } catch { }

    // ---- DEBUG: log response regardless of status ----
    console.log("[SignSubmit] Status", res.status, "CT:", contentType, "\n[Raw]\n", raw);

    let payload: any = null;
    if (raw && contentType.includes("application/json")) {
      try { payload = JSON.parse(raw); } catch (e) { console.warn("JSON parse failed:", e); }
    }

    // DO NOT throw — return a friendly object
    if (!res.ok) {
      return {
        ok: false,
        message: payload?.error || payload?.message || raw || `Submit failed (HTTP ${res.status})`,
        debug: { status: res.status, raw, payload }
      };
    }

    return {
      ok: true,
      message: payload?.message || "Report submitted",
      debug: { status: res.status, raw, payload }
    };
  }


  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          cases={casesForTab}
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          tab={tab}
          setTab={setTab}
          tabCounts={tabCounts}
          refreshAll={refreshAll}
        />

        <div className="flex-1 overflow-auto p-0 bg-white">
          <ReportPanel report={report} selectedCase={selectedCase} />
          <SignSlide
            blinded
            selectedPatient={selectedCase ?? undefined}
            currentPatientReport={report ?? undefined}
            onSubmit={async (fd, _canSubmit) => {
              if (!selectedCase) return;
              const out = await submitReportToBackend(selectedCase.id, fd);

              if (!out.ok) {
                alert(out.message);
                console.error("[SignSubmit ERROR]", out.debug);
                return;
              }
              await refreshAll?.();
            }}
          />
        </div>
      </div>
    </div>
  );
} 
