"use client";

import { useState, useMemo, useRef } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, } from "@heroui/table";
import WBC_STATIC from "./cases.config";
import WsiViewer from "../Components/WsiViewer";
import { Button } from "@heroui/button";
import WBCPanel from "./WBCPanel";
import { WbcInfo, WBC_INDEX_POSITION } from "./cases.config";
import WbcInfoTable from "./WbcInfoTable";
import MissingFilesModal from "./missing/MissingFilesModal";
import RbcInfoTable from "./RbcInfoTable";
import RBCPanel from "./RBCPanel";

const spaceClass = (s: WbcInfo["space"]) =>
  s === "space-1" ? "pl-3" : s === "space-2" ? "pl-6" : s === "space-3" ? "pl-9" : "";

export default function ReportPanel({ report, selectedCase, }: {
  report: any;
  selectedCase: any;
}) {
  if (!report) return <p className="p-4">Select a patient to see report details.</p>;
  const [missingOpen, setMissingOpen] = useState(false);

  const details = report.report || {};

  const patientContext = {
    id: selectedCase?.id,
    urn_no: selectedCase?.urn_no ?? selectedCase?.patient_id ?? "",
    diagnostic_name: selectedCase?.diagnostic_name ?? report?.report?.diagnostic_name,
    test_name: selectedCase?.test_name ?? report?.report?.test_name,
    // destination optional; it will be built if omitted
  };
  const [advancedRBCView, setAdvancedRBCView] = useState(false);
  const [enableSegmentation, setEnableSegmentation] = useState(false);
  const [enableIndicators, setEnableIndicators] = useState(false);

  const [tab, setTab] = useState<string>("wbc");

  const ref = (details?.cells?.reference_url || "").replace(/\/+$/, "");
  const imgBase = `${ref}/display`;
  const wbcParams = Object.keys(details.wbc_info || {});
  const sample = Object.entries(details.wbc_features || {}).slice(0, 3);
  type ImgLike = string | { name?: string; url?: string };
  type WbcGroups = Record<string, ImgLike[]>;

  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const LeftSubPanel = () => {
    if (tab === "wbc" || tab === "wsi") {
      const wbcCells = (details?.cells?.wbc || {}) as Record<string, any[]>;
      return (
        <WbcInfoTable
          wbcCells={wbcCells}
          onRowClick={(belongs_to, canClick) => {
            if (!canClick) return;
            const el = document.getElementById(`wbc-${belongs_to}`);
            const container = imagesContainerRef.current;
            if (el && container) {
              const elBox = el.getBoundingClientRect();
              const cBox = container.getBoundingClientRect();
              const top = elBox.top - cBox.top + container.scrollTop;
              container.scrollTo({ top, behavior: "smooth" });
            }
          }}
        />
      );
    }

    if (tab === "rbc") {
      return (
        <RbcInfoTable
          rbcInfo={details.rbc_info}
          advancedRBCView={advancedRBCView}
          total_rbc_used_for_calculation={details.total_rbc_used_for_calculation}
          onToggleAdvancedRBCView={setAdvancedRBCView}
          onMarkAllZero={() => {/* same as Angular checkbox handler */ }}
          onGradeChange={(key, g) => {/* PATCH param grade */ }}
          classifyRbcCells={(key) => {/* same as Angular row click */ }}
          onAdjustNormocytes={() => {/* open threshold dialog */ }}
        />
      );
    }

    if (tab === "platelets") {
      return (
        <Table aria-label="Platelet Info Table" className="w-90">
          <TableHeader>
            <TableColumn>Type</TableColumn>
            <TableColumn>Details</TableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(details.platelet_info || {}).map(
              ([type, values]: [string, any]) => (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell>
                    {Array.isArray(values) ? values.join(", ") : String(values)}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      );
    }

    return <p className="text-sm">Graphs</p>;
  };
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-1/5.2 h-full min-h-0 overflow-hidden p-0">
        <LeftSubPanel />
      </div>

      <div className="w-[80.77%] h-full min-h-0 flex flex-col relative">
        <div className="absolute top-0 right-2 h-12 z-50 flex items-center pointer-events-auto">
          <div className="flex gap-1">
            <Button size="sm" radius="sm" className="h-9 px-3 text-medium font-semibold bg-red-500 text-white relative z-[60] pointer-events-auto">
              Save
            </Button>

            {/* IMPORTANT: use onPress, higher z-index, pointer events */}
            <Button
              radius="sm"
              className="h-9 px-3 text-s font-semibold bg-red-500 text-white relative z-[60] pointer-events-auto"
              onPress={() => {
                console.log('opening missing modal');
                setMissingOpen(true);
              }}
            >
              Request for missing files
            </Button>
          </div>
        </div>

        <MissingFilesModal
          open={missingOpen}
          onClose={() => setMissingOpen(false)}
          patientContext={patientContext}
          onSaved={(msg) => alert(msg || "Saved")}
        />
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key))}
          variant="underlined"
          className="report-tabs flex-1 min-h-0 flex flex-col"
          classNames={{
            base: "flex flex-col gap-0",
            tabList:
              "sticky top-0 z-20 h-12 bg-background/90  supports-[backdrop-filter]:bg-background/20 justify-start gap-2 px-2 pr-[400px]",
            tab: "flex-none w-auto px-3 py-2",
            panel: "flex-1 min-h-0 p-0",
          }}
        >

          <Tab key="wbc" title="WBC">
            <WBCPanel ref={imagesContainerRef} report={report} />
          </Tab>


          <Tab key="rbc" title="RBC View">
            <RBCPanel
              report={report}
              advancedRBCView={advancedRBCView}
              onToggleAdvancedRBCView={setAdvancedRBCView}
              enableSegmentation={enableSegmentation}
              onToggleSegmentation={setEnableSegmentation}
              enableIndicators={enableIndicators}
              onToggleIndicators={setEnableIndicators}
              toolActionsFor={(cls) => [
                // mirror <app-toolbar-action> usage; wire your handlers
                { label: "Select All", onPress: () => {/* ... */ } },
                { label: "Export CSV", onPress: () => {/* ... */ } },
              ]}
              onRbcScrollDown={(cls) => {
                // fetch more for rbc[cls], then bump rbc[cls].endIndex in parent state / report
              }}
              showRbcImagePopup={(cell, ev) => {
                // position and show popup like Angular #rbcPreviewImage
              }}
              hideRbcImagePopup={() => {/* hide popup */ }}
              onApplyThresholding={() => {/* same Adjust (Normocytes) action */ }}
            />
          </Tab>

          <Tab key="platelets" title="Platelets">
            <div className="absolute inset-0 overflow-y-auto space-y-6 p-2 border">
              {Object.entries(details.platelet_info || {}).map(
                ([type, values]: [string, any]) => (
                  <div key={type} id={`plt-${type}`} className="space-y-2">
                    <h3 className="text-md font-semibold">{type}</h3>
                    <pre className="text-xs">
                      {JSON.stringify(values, null, 2)}
                    </pre>
                  </div>
                )
              )}
            </div>
          </Tab>

          <Tab key="wsi" title="WSI">
            <div className="absolute inset-x-0 bottom-0 top-10">
              <div className="h-full overflow-y-auto p-2">
                <WsiViewer />
              </div>
            </div>
          </Tab>

          <Tab key="images" title="Distributions">
            <div className="absolute inset-0 overflow-y-auto space-y-4 p-2 border rounded">
              {details.graphs?.rbc && (
                <img src={details.graphs.rbc} alt="RBC Graph" />
              )}
              {details.graphs?.pallor && (
                <img src={details.graphs.pallor} alt="Pallor Graph" />
              )}
              {details.graphs?.platelet && (
                <img src={details.graphs.platelet} alt="Platelet Graph" />
              )}
            </div>
          </Tab>
        </Tabs>



      </div>
    </div >
  );
}
