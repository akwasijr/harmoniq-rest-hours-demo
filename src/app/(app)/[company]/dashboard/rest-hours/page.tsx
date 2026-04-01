"use client";

import * as React from "react";
import {
  Clock,
  Check,
  X,
  AlertTriangle,
  Search,
  Download,
  Users,
  FileCheck,
  Send,
  Bell,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyParam } from "@/hooks/use-company-param";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyData } from "@/hooks/use-company-data";
import { useToast } from "@/components/ui/toast";
import { formatHours, formatHoursCompact, runFullCompliance } from "@/lib/maritime-rest-hours";
import type { RestHoursRecord, RestHoursDayEntry } from "@/types";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Country code → flag emoji (e.g. "NL" → "🇳🇱")
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return code;
  return String.fromCodePoint(
    ...Array.from(upper).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

type FilterStatus = "all" | "submitted" | "approved" | "rejected" | "draft" | "forwarded_to_hr";

// ── Shared small components ──

function StatusDot({ status }: { status: RestHoursRecord["status"] }) {
  const color: Record<string, string> = {
    draft: "bg-neutral-400",
    submitted: "bg-blue-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    forwarded_to_hr: "bg-purple-500",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", color[status])}
      aria-label={`Record status: ${status.replace(/_/g, " ")}`}
    />
  );
}

function StatusBadge({ status }: { status: RestHoursRecord["status"] }) {
  const styles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    approved: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    forwarded_to_hr: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  };
  const labels: Record<string, string> = {
    draft: "draft",
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    forwarded_to_hr: "sent to HR",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[status])}>
      {labels[status] ?? status}
    </span>
  );
}

function ComplianceDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", ok ? "bg-green-500" : "bg-red-500")}
      aria-label={ok ? "Compliant" : "Non-compliant"}
    />
  );
}

const CREW_LIST_GRID_TEMPLATE =
  "2rem minmax(9rem, 11rem) minmax(7rem, 1fr) minmax(5.5rem, 6.5rem)";
const CREW_ROW_GRID_TEMPLATE =
  "minmax(9rem, 11rem) minmax(7rem, 1fr) minmax(5.5rem, 6.5rem)";

// ── Visual bar for a single record (rest hours per day as a mini chart) ──

function RestHoursBar({
  record,
  selectedDay,
  onDayClick,
}: {
  record: RestHoursRecord;
  selectedDay?: number | null;
  onDayClick?: (day: number) => void;
}) {
  const maxDays = new Date(record.year, record.month, 0).getDate();
  const entries = record.entries;
  return (
    <div className="flex items-end gap-px" style={{ height: 32 }}>
      {Array.from({ length: maxDays }, (_, i) => {
        const entry = entries[i];
        const hours = entry?.total_rest_hours ?? 0;
        const pct = Math.min(hours / 14, 1); // 14h as visual max
        const isViolation = hours > 0 && hours < 10;
        const isEmpty = hours === 0;
        const isSelected = selectedDay === i + 1;
        const barClassName = cn(
          "flex-1 min-w-[2px] rounded-t-sm border-0 bg-transparent p-0 transition-all",
          onDayClick && "cursor-pointer hover:opacity-100",
          isSelected && "ring-1 ring-primary ring-offset-1",
        );
        const barStyle = {
          height: isEmpty ? 2 : `${Math.max(pct * 100, 8)}%`,
          backgroundColor: isEmpty
            ? "var(--color-muted, #e5e7eb)"
            : isViolation
              ? "var(--color-destructive, #ef4444)"
              : "var(--color-primary, #1e3a5f)",
          opacity: isSelected ? 1 : isEmpty ? 0.3 : isViolation ? 0.85 : 0.7,
        };
        const title = entry ? `Day ${i + 1}: ${formatHours(hours)} rest` : `Day ${i + 1}: no data`;

        if (!onDayClick) {
          return <span key={i} className={barClassName} style={barStyle} title={title} aria-hidden="true" />;
        }

        return (
          <button
            type="button"
            key={i}
            aria-label={`View day ${i + 1}`}
            aria-pressed={isSelected}
            className={barClassName}
            style={barStyle}
            title={title}
            onClick={() => onDayClick(i + 1)}
          />
        );
      })}
    </div>
  );
}

// ── Crew visual overview row ──

function CrewVisualRow({
  record,
  isSelected,
  isExportSelected,
  onToggleExportSelection,
  onClick,
}: {
  record: RestHoursRecord;
  isSelected: boolean;
  isExportSelected: boolean;
  onToggleExportSelection: (recordId: string, checked: boolean) => void;
  onClick: () => void;
}) {
  const violationCount = record.daily_compliance.filter(
    (d) => !d.min_rest_24h_ok || !d.min_continuous_ok
  ).length;
  const avgRest = record.entries.length > 0
    ? record.entries.reduce((s, e) => s + e.total_rest_hours, 0) / record.entries.length
    : 0;

  return (
    <div
      className={cn(
        "grid items-stretch gap-2 border-b border-border",
        isSelected && "bg-muted",
      )}
      style={{ gridTemplateColumns: "2rem minmax(0, 1fr)" }}
    >
      <div className="flex shrink-0 items-center pl-3">
        <input
          type="checkbox"
          checked={isExportSelected}
          onChange={(event) => onToggleExportSelection(record.id, event.target.checked)}
          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-ring"
          aria-label={`Select ${record.seafarer_name} for export`}
        />
      </div>
      <button
        type="button"
        onClick={onClick}
        className="grid min-w-0 items-center gap-3 bg-transparent py-2.5 pr-3 text-left transition-colors hover:bg-muted/50"
        style={{ gridTemplateColumns: CREW_ROW_GRID_TEMPLATE }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{record.seafarer_name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{record.position_rank}</p>
        </div>
        <div className="min-w-0 overflow-hidden">
          <RestHoursBar record={record} />
        </div>
        <div className="flex min-w-0 flex-col items-end gap-1 text-right">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatHoursCompact(avgRest)}/d
          </span>
          <div className="flex items-center justify-end gap-1.5">
            {violationCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {violationCount}
              </span>
            )}
            <StatusDot status={record.status} />
          </div>
        </div>
      </button>
    </div>
  );
}



// ── Detail panel: day entry row ──

function DayRow({ entry, compliance, isSelected, onClick, dayId }: {
  entry: RestHoursDayEntry;
  compliance?: { min_rest_24h_ok: boolean; min_continuous_ok: boolean };
  isSelected?: boolean;
  onClick?: () => void;
  dayId?: string;
}) {
  const date = new Date(entry.date + "T00:00:00");
  const dayName = WEEKDAYS[date.getDay()];
  const dayNum = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const hasViolation = compliance && (!compliance.min_rest_24h_ok || !compliance.min_continuous_ok);

  return (
    <button
      type="button"
      id={dayId}
      aria-label={onClick ? `View ${new Date(entry.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}` : undefined}
      aria-pressed={onClick ? isSelected : undefined}
      className={cn(
        "grid w-full grid-cols-[2.5rem_1fr_4rem_1rem] items-center gap-2 border-0 border-b border-border bg-transparent px-3 py-1.5 text-left text-sm",
        isWeekend && "bg-muted/30",
        hasViolation && "bg-red-50/50 dark:bg-red-950/20",
        isSelected && "bg-primary/10 ring-1 ring-inset ring-primary/30",
        onClick && "cursor-pointer hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div className="text-center">
        <span className="text-[11px] text-muted-foreground">{dayName}</span>
        <span className="block text-xs font-medium">{dayNum}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 text-xs">
        {entry.rest_periods.length > 0 ? (
          entry.rest_periods.map((p, i) => (
            <span key={i}>{p.from}–{p.to}</span>
          ))
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="text-right">
        <span className={cn("text-xs font-medium", hasViolation && "text-red-600 dark:text-red-400")}>
          {formatHours(entry.total_rest_hours)}
        </span>
      </div>
      <div className="flex justify-center">
        {compliance && <ComplianceDot ok={compliance.min_rest_24h_ok && compliance.min_continuous_ok} />}
      </div>
    </button>
  );
}

// ── Detail panel ──

function RecordDetail({
  record,
  users,
  onApprove,
  onReject,
  onForwardToHR,
  onSendReminder,
  reminderSent,
  onClose,
}: {
  record: RestHoursRecord;
  users: Array<{ id: string; full_name: string }>;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
  onForwardToHR: (id: string) => void;
  onSendReminder: (userId: string, name: string) => void;
  reminderSent: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = React.useState(record.reviewer_notes || "");
  const [reviewError, setReviewError] = React.useState("");
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const compliance = React.useMemo(() => runFullCompliance(record.entries), [record.entries]);
  const totalRest = record.entries.reduce((s, e) => s + e.total_rest_hours, 0);
  const totalWork = record.entries.reduce((s, e) => s + e.total_work_hours, 0);
  const daysWithEntries = record.entries.filter((e) => e.rest_periods.length > 0).length;
  const violationCount = compliance.daily.filter((d) => !d.min_rest_24h_ok || !d.min_continuous_ok).length;
  const canReview = record.status === "submitted";
  const canForwardToHR = record.status === "approved";
  const showCompliantState =
    !compliance.hasViolations &&
    (record.status === "approved" || record.status === "forwarded_to_hr");

  // Reset notes when record changes
  React.useEffect(() => {
    setNotes(record.reviewer_notes || "");
    setReviewError("");
    setSelectedDay(null);
  }, [record.id, record.reviewer_notes]);

  const trimmedNotes = notes.trim();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-5 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{record.seafarer_name}</h2>
            <StatusBadge status={record.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            IMO {record.imo_number} · {record.is_watchkeeper ? "Watchkeeper" : "Non-watchkeeper"}
            {record.seafarer_signed_at && ` · Signed ${new Date(record.seafarer_signed_at).toLocaleDateString()}`}
            {record.submitted_at && ` · Submitted ${new Date(record.submitted_at).toLocaleDateString()}`}
            {record.is_late_entry && (
              <span className="ml-2 text-amber-600">
                Late entry
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0">
          <button onClick={onClose} className="rounded p-1 hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 border-b border-border px-5 py-3 xl:grid-cols-4">
        <div>
          <p className="text-[11px] text-muted-foreground">Days logged</p>
          <p className="text-base font-semibold">{daysWithEntries}<span className="text-xs font-normal text-muted-foreground">/{record.entries.length}</span></p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Total rest</p>
          <p className="text-base font-semibold">{formatHours(totalRest)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Total work</p>
          <p className="text-base font-semibold">{formatHours(totalWork)}</p>
        </div>
        <div className={cn(violationCount > 0 && "text-red-600 dark:text-red-400")}>
          <p className="text-[11px] text-muted-foreground">Violations</p>
          <p className="text-base font-semibold">{violationCount}</p>
        </div>
      </div>

      {/* Visual bar for this record */}
      <div className="border-b border-border px-5 py-3">
        <p className="mb-1.5 text-[11px] text-muted-foreground">Daily rest hours</p>
        <RestHoursBar
          record={record}
          selectedDay={selectedDay}
          onDayClick={(day) => {
            setSelectedDay(selectedDay === day ? null : day);
            const el = document.getElementById(`day-entry-${day}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }}
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>1</span>
          <span>{record.entries.length}</span>
        </div>
      </div>

      {/* Day entries + compliance side-by-side */}
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        {/* Day entries — 2/3 */}
        <div className="flex min-w-0 flex-col xl:flex-[2] xl:border-r xl:border-border">
          <div className="grid grid-cols-[2.5rem_1fr_4rem_1rem] gap-2 border-b border-border px-3 py-1 text-[10px] font-medium text-muted-foreground">
            <span className="text-center">Day</span>
            <span>Rest periods</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          <div className="flex-1 overflow-y-auto">
            {record.entries.map((entry, i) => (
              <DayRow
                key={entry.date}
                entry={entry}
                compliance={compliance.daily[i]}
                dayId={`day-entry-${i + 1}`}
                isSelected={selectedDay === i + 1}
                onClick={() => setSelectedDay(selectedDay === i + 1 ? null : i + 1)}
              />
            ))}
          </div>
        </div>

        {/* Compliance + actions — 1/3 */}
        <div className="flex min-w-0 flex-col gap-3 overflow-y-auto border-t border-border p-3 text-[11px] xl:flex-1 xl:border-t-0">
          {/* Compliance issues (if any) */}
          {compliance.hasViolations && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">Compliance issues</p>
              <ul className="space-y-1.5 font-medium text-red-600 dark:text-red-400">
                {compliance.daily.some((d) => !d.min_rest_24h_ok) && (
                  <li className="flex gap-1.5 items-start">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Below 10h daily rest on {compliance.daily.filter((d) => !d.min_rest_24h_ok).length} day(s)</span>
                  </li>
                )}
                {compliance.daily.some((d) => !d.min_continuous_ok) && (
                  <li className="flex gap-1.5 items-start">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>No 6h continuous rest on {compliance.daily.filter((d) => !d.min_continuous_ok).length} day(s)</span>
                  </li>
                )}
                {compliance.weekly.some((w) => !w.min_77h_ok) && (
                  <li className="flex gap-1.5 items-start">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Below 77h weekly rest in {compliance.weekly.filter((w) => !w.min_77h_ok).length} period(s)</span>
                  </li>
                )}
              </ul>
              {record.violation_comment && (
                <div className="border-t border-red-300 pt-2 dark:border-red-700">
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400">Seafarer&apos;s explanation</p>
                  <p className="mt-0.5 text-muted-foreground">{record.violation_comment}</p>
                </div>
              )}
            </div>
          )}

          {/* No violations message */}
          {showCompliantState && (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs">All compliant</span>
            </div>
          )}

          {/* Review actions for submitted records */}
          {canReview && (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (reviewError) setReviewError("");
                }}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Reason for rejection or approval notes..."
              />
              {reviewError && (
                <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
                  {reviewError}
                </p>
              )}
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (!trimmedNotes) {
                      setReviewError("A rejection reason is required.");
                      return;
                    }
                    onReject(record.id, trimmedNotes);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                  Reject
                </button>
                <button
                  onClick={() => onApprove(record.id, trimmedNotes)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check className="h-3 w-3" />
                  Sign and approve
                </button>
              </div>
            </div>
          )}

          {/* Forward to HR for approved records */}
          {canForwardToHR && (
            <button
              onClick={() => onForwardToHR(record.id)}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send className="h-3 w-3" />
              Forward to HR
            </button>
          )}

          {/* Send reminder for draft records */}
          {record.status === "draft" && (
            <button
              onClick={() => onSendReminder(record.seafarer_id, record.seafarer_name)}
              disabled={reminderSent}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-2 py-1.5 text-xs font-medium text-orange-900 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-700 dark:bg-orange-950/70 dark:text-orange-200 dark:hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {reminderSent ? <Check className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
              {reminderSent ? "Reminder sent" : "Send reminder"}
            </button>
          )}

          {/* Reviewed info */}
          {(record.status === "approved" || record.status === "rejected" || record.status === "forwarded_to_hr") && record.reviewed_by && (
            <div className={cn(
              "rounded-md p-2 text-[11px]",
              record.status === "rejected" ? "bg-red-50 dark:bg-red-950" : "bg-green-50 dark:bg-green-950"
            )}>
              <p className={cn(
                "font-medium",
                record.status === "rejected" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
              )}>
                {record.status === "forwarded_to_hr" ? "Forwarded to HR" : record.status === "approved" ? "Approved" : "Rejected"} by {users.find((u) => u.id === record.reviewed_by)?.full_name ?? "—"}
              </p>
              {record.reviewed_at && (
                <p
                  className={cn(
                    "mt-0.5",
                    record.status === "rejected"
                      ? "text-red-900 dark:text-red-100"
                      : "text-green-900 dark:text-green-100",
                  )}
                >
                  {new Date(record.reviewed_at).toLocaleDateString()}
                </p>
              )}
              {record.reviewer_notes && (
                <p
                  className={cn(
                    "mt-1",
                    record.status === "rejected"
                      ? "text-red-950 dark:text-white"
                      : "text-green-950 dark:text-white",
                  )}
                >
                  {record.reviewer_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Export dropdown ──

function ExportButton({
  selectedRecord,
  selectedRecords,
  allRecords,
  companyName,
  masterName,
  voyageName,
}: {
  selectedRecord: RestHoursRecord | null;
  selectedRecords: RestHoursRecord[];
  allRecords: RestHoursRecord[];
  companyName: string;
  masterName?: string;
  voyageName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const exportRecord = async (record: RestHoursRecord) => {
    const { pdf } = await import("@react-pdf/renderer");
    const { RestHoursPdfDocument } = await import("@/components/pdf/rest-hours-template");
    const doc = React.createElement(RestHoursPdfDocument, { record, companyName, masterName, voyageName });
    const blob = await pdf(doc as React.ReactElement<import("@react-pdf/renderer").DocumentProps>).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rest-hours-${record.seafarer_name.replace(/\s+/g, "-").toLowerCase()}-${record.year}-${String(record.month).padStart(2, "0")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportChecked = async () => {
    if (selectedRecords.length === 0) return;
    setGenerating(true);
    setOpen(false);
    try {
      for (const record of selectedRecords) {
        await exportRecord(record);
        await new Promise((res) => setTimeout(res, 300));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExportOpenRecord = async () => {
    if (!selectedRecord) return;
    setGenerating(true);
    setOpen(false);
    try {
      await exportRecord(selectedRecord);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportAll = async () => {
    setGenerating(true);
    setOpen(false);
    try {
      for (const r of allRecords) {
        await exportRecord(r);
        // small delay between downloads
        await new Promise((res) => setTimeout(res, 300));
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={generating}
        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {generating ? (
          <Clock className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {generating ? "Generating..." : "Export"}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-border bg-background py-1 shadow-md">
          <button
            onClick={handleExportChecked}
            disabled={selectedRecords.length === 0}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export checked ({selectedRecords.length})
          </button>
          <button
            onClick={handleExportOpenRecord}
            disabled={!selectedRecord}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export open record
          </button>
          <button
            onClick={handleExportAll}
            disabled={allRecords.length === 0}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export all ({allRecords.length})
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ──

export default function RestHoursReviewPage() {
  const company = useCompanyParam();
  const { user, currentCompany } = useAuth();
  const { toast } = useToast();
  const { restHoursRecords, stores, users, vessels, voyages } = useCompanyData();

  const [selectedRecord, setSelectedRecord] = React.useState<RestHoursRecord | null>(null);
  const [selectedExportIds, setSelectedExportIds] = React.useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVesselId, setSelectedVesselId] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<number>(0);
  const [selectedYear, setSelectedYear] = React.useState<number>(0);

  // Auto-detect latest month/year from actual records on first load
  React.useEffect(() => {
    if (selectedMonth === 0 && restHoursRecords.length > 0) {
      const sorted = [...restHoursRecords].sort((a, b) => b.year - a.year || b.month - a.month);
      setSelectedMonth(sorted[0].month);
      setSelectedYear(sorted[0].year);
    } else if (selectedMonth === 0) {
      setSelectedMonth(new Date().getMonth() + 1);
      setSelectedYear(new Date().getFullYear());
    }
  }, [restHoursRecords, selectedMonth]);

  // Active voyage where this user is master
  const activeVoyage = React.useMemo(
    () => voyages.find((v) => v.master_id === user?.id && v.status === "active"),
    [voyages, user?.id],
  );

  const vessel = React.useMemo(
    () => activeVoyage ? vessels.find((v) => v.id === activeVoyage.vessel_id) : undefined,
    [vessels, activeVoyage],
  );

  // Initialize vessel selector to active vessel or first vessel
  React.useEffect(() => {
    if (!selectedVesselId) {
      if (vessel) setSelectedVesselId(vessel.id);
      else if (vessels.length > 0) setSelectedVesselId(vessels[0].id);
    }
  }, [vessel, vessels, selectedVesselId]);

  // Records scoped to selected vessel and month/year
  const voyageRecords = React.useMemo(() => {
    let records = restHoursRecords;
    const selectedVessel = vessels.find((v) => v.id === selectedVesselId);
    if (selectedVessel) {
      records = records.filter((r) => r.vessel_name === selectedVessel.name);
    } else if (activeVoyage) {
      records = records.filter((r) => r.voyage_id === activeVoyage.id);
    }
    records = records.filter((r) => r.month === selectedMonth && r.year === selectedYear);
    return records;
  }, [restHoursRecords, activeVoyage, vessels, selectedVesselId, selectedMonth, selectedYear]);

  // Stats
  const stats = React.useMemo(() => {
    const total = voyageRecords.length;
    const pending = voyageRecords.filter((r) => r.status === "submitted").length;
    const approved = voyageRecords.filter((r) => r.status === "approved").length;
    const withViolations = voyageRecords.filter((r) => r.has_violations).length;
    const uniqueCrew = new Set(voyageRecords.map((r) => r.seafarer_id)).size;
    const avgRest = total > 0
      ? voyageRecords.reduce((sum, r) => {
          const entryCount = r.entries.filter((e) => e.rest_periods.length > 0).length;
          const totalRest = r.entries.reduce((s, e) => s + e.total_rest_hours, 0);
          return sum + (entryCount > 0 ? totalRest / entryCount : 0);
        }, 0) / total
      : 0;
    return { total, pending, approved, withViolations, uniqueCrew, avgRest };
  }, [voyageRecords]);

  // Filter records
  const filteredRecords = React.useMemo(() => {
    let records = [...voyageRecords].sort((a, b) => {
      // Submitted first, then by date
      const statusOrder: Record<string, number> = { submitted: 0, rejected: 1, draft: 2, approved: 3, forwarded_to_hr: 4 };
      const sa = statusOrder[a.status] ?? 4;
      const sb = statusOrder[b.status] ?? 4;
      if (sa !== sb) return sa - sb;
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    if (filterStatus !== "all") {
      records = records.filter((r) => r.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r) =>
        r.seafarer_name.toLowerCase().includes(q) ||
        r.position_rank.toLowerCase().includes(q) ||
        r.vessel_name.toLowerCase().includes(q)
      );
    }
    return records;
  }, [voyageRecords, filterStatus, searchQuery]);

  React.useEffect(() => {
    setSelectedExportIds(new Set());
  }, [selectedMonth, selectedYear, selectedVesselId]);

  const toggleExportSelection = React.useCallback((recordId: string, checked: boolean) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(recordId);
      } else {
        next.delete(recordId);
      }
      return next;
    });
  }, []);

  const setVisibleSelection = React.useCallback((checked: boolean) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev);
      filteredRecords.forEach((record) => {
        if (checked) {
          next.add(record.id);
        } else {
          next.delete(record.id);
        }
      });
      return next;
    });
  }, [filteredRecords]);

  const selectedExportRecords = React.useMemo(
    () => voyageRecords.filter((record) => selectedExportIds.has(record.id)),
    [voyageRecords, selectedExportIds],
  );
  const selectedVisibleCount = React.useMemo(
    () => filteredRecords.filter((record) => selectedExportIds.has(record.id)).length,
    [filteredRecords, selectedExportIds],
  );
  const allVisibleSelected = filteredRecords.length > 0 && selectedVisibleCount === filteredRecords.length;

  const handleApprove = (id: string, notes: string) => {
    const record = restHoursRecords.find((r) => r.id === id);
    const signedAt = new Date().toISOString();
    stores.restHoursRecords.update(id, {
      status: "approved",
      reviewed_by: user?.id ?? null,
      reviewed_at: signedAt,
      master_signed_at: signedAt,
      reviewer_notes: notes,
      updated_at: signedAt,
    });
    const updated = restHoursRecords.find((r) => r.id === id);
    if (updated) setSelectedRecord({ ...updated, status: "approved", reviewed_by: user?.id ?? null, reviewed_at: signedAt, master_signed_at: signedAt, reviewer_notes: notes });
    else setSelectedRecord(null);
    toast(
      `${record?.seafarer_name ?? "Record"} approved and countersigned`,
      "success",
    );
  };

  const handleReject = (id: string, notes: string) => {
    const record = restHoursRecords.find((r) => r.id === id);
    const now = new Date().toISOString();
    stores.restHoursRecords.update(id, {
      status: "rejected",
      reviewed_by: user?.id ?? null,
      reviewed_at: now,
      reviewer_notes: notes,
      updated_at: now,
    });
    const updated = restHoursRecords.find((r) => r.id === id);
    if (updated) setSelectedRecord({ ...updated, status: "rejected", reviewed_by: user?.id ?? null, reviewed_at: now, reviewer_notes: notes });
    else setSelectedRecord(null);
    toast(`${record?.seafarer_name ?? "Record"} sent back to crew`, "info");
  };

  const handleForwardToHR = (id: string) => {
    const record = restHoursRecords.find((r) => r.id === id);
    const now = new Date().toISOString();
    stores.restHoursRecords.update(id, {
      status: "forwarded_to_hr",
      forwarded_to_hr_at: now,
      updated_at: now,
    });
    const updated = restHoursRecords.find((r) => r.id === id);
    if (updated) setSelectedRecord({ ...updated, status: "forwarded_to_hr", forwarded_to_hr_at: now });
    else setSelectedRecord(null);
    toast(`${record?.seafarer_name ?? "Record"} forwarded to HR`, "success");
  };

  const [reminderSent, setReminderSent] = React.useState<Set<string>>(new Set());
  const handleSendReminder = (userId: string, name: string) => {
    // In production this would trigger a push notification / email
    setReminderSent((prev) => new Set(prev).add(userId));
    toast(`Reminder sent to ${name}`, "success");
    // Auto-clear after 3 seconds
    setTimeout(() => setReminderSent((prev) => { const next = new Set(prev); next.delete(userId); return next; }), 3000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* ── Page header + KPIs ── */}
      <div className="shrink-0 border-b border-border px-6 pt-3 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>{v.name} {countryFlag(v.flag_state)} {v.flag_state}</option>
              ))}
            </select>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(() => {
                const seen = new Set<string>();
                const opts: { month: number; year: number }[] = [];
                for (const r of restHoursRecords) {
                  const key = `${r.year}-${r.month}`;
                  if (!seen.has(key)) { seen.add(key); opts.push({ month: r.month, year: r.year }); }
                }
                opts.sort((a, b) => b.year - a.year || b.month - a.month);
                if (opts.length === 0) {
                  opts.push({ month: selectedMonth || new Date().getMonth() + 1, year: selectedYear || new Date().getFullYear() });
                }
                return opts;
              })().map(({ month, year }) => (
                <option key={`${year}-${month}`} value={`${year}-${month}`}>
                  {MONTHS_FULL[month - 1]} {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI row — compact */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() => setFilterStatus(stats.pending > 0 ? "submitted" : "all")}
            className={cn(
              "rounded-lg border bg-card px-3 py-2.5 text-left transition-all hover:border-primary",
              filterStatus === "submitted" && "border-primary bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/70">Pending review</p>
              <Clock className="h-3.5 w-3.5 text-foreground/50" />
            </div>
            <p className="text-xl font-semibold">{stats.pending}</p>
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={cn(
              "rounded-lg border bg-card px-3 py-2.5 text-left transition-all hover:border-primary",
              filterStatus === "approved" && "border-primary bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/70">Approved</p>
              <FileCheck className="h-3.5 w-3.5 text-foreground/50" />
            </div>
            <p className="text-xl font-semibold">{stats.approved} <span className="text-xs font-normal text-foreground/60">/ {stats.total}</span></p>
          </button>
          <div
            className={cn(
              "rounded-lg border bg-card px-3 py-2.5 text-left",
              stats.withViolations > 0 && "border-red-300 dark:border-red-700",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/70">Violations</p>
              <AlertTriangle className="h-3.5 w-3.5 text-foreground/50" />
            </div>
            <p className="text-xl font-semibold">{stats.withViolations}</p>
          </div>
          <div className="rounded-lg border bg-card px-3 py-2.5 text-left">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/70">Avg daily rest</p>
              <Users className="h-3.5 w-3.5 text-foreground/50" />
            </div>
            <p className="text-xl font-semibold">{formatHours(stats.avgRest)} <span className="text-xs font-normal text-foreground/60">{stats.uniqueCrew} crew</span></p>
          </div>
        </div>
      </div>

      {/* ── Content: left panel + detail ── */}
      <div className="flex flex-1 overflow-hidden pt-1.5">
        {/* Left panel — narrower */}
        <div className={cn(
          "shrink-0 flex flex-col border-r border-border",
          selectedRecord ? "hidden lg:flex lg:w-[30rem] xl:w-[34rem]" : "w-full lg:w-[30rem] xl:w-[34rem]",
        )}>
          {/* Sticky: search + column headers */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crew..."
                  className="h-7 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <ExportButton
                selectedRecord={selectedRecord}
                selectedRecords={selectedExportRecords}
                allRecords={filteredRecords}
                companyName={currentCompany?.name ?? company}
                masterName={user?.full_name}
                voyageName={activeVoyage?.name}
              />
            </div>
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleSelection(!allVisibleSelected)}
                  className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <CheckSquare className="h-3 w-3" aria-hidden="true" />
                  {allVisibleSelected ? "Clear" : "Select all"}
                </button>
              </div>
              <span>
                {selectedExportRecords.length} checked
                {selectedVisibleCount !== selectedExportRecords.length
                  ? ` · ${selectedVisibleCount} visible`
                  : ""}
              </span>
            </div>
            <div
              className="grid items-center gap-3 border-b border-border bg-muted/30 px-3 py-1.5 text-[10px] leading-tight text-muted-foreground"
              style={{ gridTemplateColumns: CREW_LIST_GRID_TEMPLATE }}
            >
              <span className="text-center">Pick</span>
              <span>Crew member</span>
              <span>Daily rest (bars = hours, red = violation)</span>
              <span className="text-right">Avg / status</span>
            </div>
          </div>

          {/* Scrollable crew list */}
          <div className="flex-1 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Clock className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {filterStatus !== "all" ? "No records match this filter" : "No rest hour records yet"}
              </p>
            </div>
          ) : (
            <>
              {filteredRecords.map((r) => (
                <CrewVisualRow
                  key={r.id}
                  record={r}
                  isSelected={selectedRecord?.id === r.id}
                  isExportSelected={selectedExportIds.has(r.id)}
                  onToggleExportSelection={toggleExportSelection}
                  onClick={() => setSelectedRecord(r)}
                />
              ))}
            </>
          )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedRecord ? (
          <div className="flex-1 overflow-y-auto">
            <RecordDetail
              record={selectedRecord}
              users={users}
              onApprove={handleApprove}
              onReject={handleReject}
              onForwardToHR={handleForwardToHR}
              onSendReminder={handleSendReminder}
              reminderSent={reminderSent.has(selectedRecord.seafarer_id)}
              onClose={() => setSelectedRecord(null)}
            />
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="text-center px-8">
              <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Select a record to review details</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.pending > 0
                  ? `${stats.pending} record${stats.pending > 1 ? "s" : ""} awaiting your review`
                  : "All records have been reviewed"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
