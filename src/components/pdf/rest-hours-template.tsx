"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { RestHoursRecord } from "@/types";

/* ── Styles ── */

const s = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 9,
    color: "#555",
  },
  headerRight: {
    textAlign: "right",
  },
  headerLabel: {
    fontSize: 7,
    color: "#888",
    marginBottom: 1,
  },
  headerValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    marginBottom: 8,
  },
  infoCell: {
    width: "33.33%",
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d4d4d4",
  },
  infoCellWide: {
    width: "66.66%",
    padding: 5,
    borderBottomWidth: 1,
    borderColor: "#d4d4d4",
  },
  infoLabel: {
    fontSize: 6.5,
    color: "#888",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 8.5,
    color: "#1a1a1a",
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    marginBottom: 8,
  },
  thRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#d4d4d4",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  thCell: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#e5e5e5",
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 14,
  },
  tRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#e5e5e5",
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 14,
    backgroundColor: "#fafafa",
  },
  tRowViolation: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#e5e5e5",
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 14,
    backgroundColor: "#fef2f2",
  },
  tCell: {
    fontSize: 7.5,
    color: "#1a1a1a",
    textAlign: "center",
  },
  tCellLeft: {
    fontSize: 7.5,
    color: "#1a1a1a",
    textAlign: "left",
  },

  // Column widths
  colDay: { width: 28 },
  colPeriods: { flex: 1 },
  colTotal: { width: 38 },
  colWork: { width: 38 },
  colCompliance: { width: 48 },

  // Compliance section
  complianceBox: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 6,
    marginBottom: 8,
  },
  complianceSectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  complianceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  complianceLabel: {
    fontSize: 7.5,
    color: "#555",
  },
  complianceOk: {
    fontSize: 7.5,
    color: "#16a34a",
    fontWeight: "bold",
  },
  complianceFail: {
    fontSize: 7.5,
    color: "#dc2626",
    fontWeight: "bold",
  },

  // Signatures
  signatureSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#d4d4d4",
    paddingTop: 10,
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  signatureGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "46%",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 8,
  },
  signatureRole: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 8,
    color: "#333",
    marginBottom: 2,
  },
  signatureDate: {
    fontSize: 7,
    color: "#888",
    marginBottom: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderColor: "#1a1a1a",
    height: 28,
    marginBottom: 3,
  },
  signatureStamp: {
    minHeight: 28,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  signatureStampLabel: {
    fontSize: 6,
    color: "#64748b",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  signatureStampName: {
    fontSize: 10.5,
    color: "#0f172a",
    fontStyle: "italic",
  },
  signatureCaption: {
    fontSize: 6.5,
    color: "#888",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
    color: "#999",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
    paddingTop: 6,
  },

  // Violation note
  violationNote: {
    borderWidth: 1,
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
    padding: 6,
    marginBottom: 8,
  },
  violationTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 3,
  },
  violationText: {
    fontSize: 7.5,
    color: "#7f1d1d",
  },
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ── Document component ── */

interface RestHoursPdfProps {
  record: RestHoursRecord;
  companyName: string;
  masterName?: string;
  voyageName?: string;
}

export function RestHoursPdfDocument({ record, companyName, masterName, voyageName }: RestHoursPdfProps) {
  const totalRest = record.entries.reduce((s, e) => s + e.total_rest_hours, 0);
  const totalWork = record.entries.reduce((s, e) => s + e.total_work_hours, 0);
  const daysLogged = record.entries.filter((e) => e.rest_periods.length > 0).length;
  const violationDays = record.daily_compliance.filter(
    (d) => !d.min_rest_24h_ok || !d.min_continuous_ok,
  ).length;
  const weeklyViolations = record.weekly_compliance.filter((w) => !w.min_77h_ok).length;
  const captainSignatureName = masterName || record.reviewed_by || "—";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.docTitle}>Record of hours of rest</Text>
            <Text style={s.docSubtitle}>
              MLC 2006 / STCW Convention — {MONTHS[record.month - 1]} {record.year}
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Company</Text>
            <Text style={s.headerValue}>{companyName}</Text>
          </View>
        </View>

        {/* Info grid */}
        <View style={s.infoGrid}>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Seafarer name</Text>
            <Text style={s.infoValue}>{record.seafarer_name}</Text>
          </View>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Position / rank</Text>
            <Text style={s.infoValue}>{record.position_rank}</Text>
          </View>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Watchkeeping duty</Text>
            <Text style={s.infoValue}>{record.is_watchkeeper ? "Yes — Watchkeeper" : "No — Non-watchkeeper"}</Text>
          </View>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Ship name</Text>
            <Text style={s.infoValue}>{record.vessel_name}</Text>
          </View>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>IMO number</Text>
            <Text style={s.infoValue}>{record.imo_number}</Text>
          </View>
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Flag state</Text>
            <Text style={s.infoValue}>{record.flag_state}</Text>
          </View>
          {voyageName && (
            <View style={s.infoCellWide}>
              <Text style={s.infoLabel}>Voyage</Text>
              <Text style={s.infoValue}>{voyageName}</Text>
            </View>
          )}
          <View style={s.infoCell}>
            <Text style={s.infoLabel}>Period</Text>
            <Text style={s.infoValue}>{MONTHS[record.month - 1]} {record.year}</Text>
          </View>
        </View>

        {/* Day entries table */}
        <View style={s.table}>
          <View style={s.thRow}>
            <Text style={[s.thCell, s.colDay]}>Day</Text>
            <Text style={[s.thCell, s.colPeriods]}>Rest periods</Text>
            <Text style={[s.thCell, s.colTotal]}>Rest (h)</Text>
            <Text style={[s.thCell, s.colWork]}>Work (h)</Text>
            <Text style={[s.thCell, s.colCompliance]}>Compliance</Text>
          </View>

          {record.entries.map((entry, i) => {
            const dateObj = new Date(entry.date);
            const dayName = DAYS[dateObj.getDay()];
            const dayNum = dateObj.getDate();
            const comp = record.daily_compliance[i];
            const hasViolation = comp && (!comp.min_rest_24h_ok || !comp.min_continuous_ok);
            const periods = entry.rest_periods.map((p) => `${p.from}–${p.to}`).join(", ");
            const rowStyle = hasViolation
              ? s.tRowViolation
              : i % 2 === 0 ? s.tRow : s.tRowAlt;

            return (
              <View key={entry.date} style={rowStyle}>
                <Text style={[s.tCell, s.colDay]}>
                  {dayName} {dayNum}
                </Text>
                <Text style={[s.tCellLeft, s.colPeriods]}>
                  {periods || "—"}
                </Text>
                <Text style={[s.tCell, s.colTotal]}>
                  {entry.total_rest_hours > 0 ? entry.total_rest_hours.toFixed(1) : "—"}
                </Text>
                <Text style={[s.tCell, s.colWork]}>
                  {entry.total_work_hours > 0 ? entry.total_work_hours.toFixed(1) : "—"}
                </Text>
                <Text style={[s.tCell, s.colCompliance, hasViolation ? { color: "#dc2626" } : { color: "#16a34a" }]}>
                  {entry.rest_periods.length === 0 ? "—" : hasViolation ? "Violation" : "OK"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Compliance summary */}
        <View style={s.complianceBox}>
          <Text style={s.complianceSectionTitle}>Compliance summary</Text>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Days logged</Text>
            <Text style={s.infoValue}>{daysLogged} / {record.entries.length}</Text>
          </View>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Total rest hours</Text>
            <Text style={s.infoValue}>{totalRest.toFixed(1)}h</Text>
          </View>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Total work hours</Text>
            <Text style={s.infoValue}>{totalWork.toFixed(1)}h</Text>
          </View>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Min 10h rest in any 24h period</Text>
            <Text style={violationDays > 0 ? s.complianceFail : s.complianceOk}>
              {violationDays > 0 ? `${violationDays} day(s) non-compliant` : "Compliant"}
            </Text>
          </View>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Min 6h continuous rest period</Text>
            <Text style={
              record.daily_compliance.some((d) => !d.min_continuous_ok) ? s.complianceFail : s.complianceOk
            }>
              {record.daily_compliance.some((d) => !d.min_continuous_ok)
                ? `${record.daily_compliance.filter((d) => !d.min_continuous_ok).length} day(s) non-compliant`
                : "Compliant"}
            </Text>
          </View>
          <View style={s.complianceRow}>
            <Text style={s.complianceLabel}>Min 77h rest in any 7-day period</Text>
            <Text style={weeklyViolations > 0 ? s.complianceFail : s.complianceOk}>
              {weeklyViolations > 0 ? `${weeklyViolations} period(s) non-compliant` : "Compliant"}
            </Text>
          </View>
        </View>

        {/* Violation explanation */}
        {record.has_violations && record.violation_comment && (
          <View style={s.violationNote}>
            <Text style={s.violationTitle}>Seafarer explanation for non-compliance</Text>
            <Text style={s.violationText}>{record.violation_comment}</Text>
          </View>
        )}

        {/* Reviewer notes */}
        {record.reviewer_notes && (
          <View style={[s.complianceBox, { marginBottom: 4 }]}>
            <Text style={s.complianceSectionTitle}>Reviewer notes</Text>
            <Text style={{ fontSize: 7.5, color: "#333" }}>{record.reviewer_notes}</Text>
          </View>
        )}

        {/* Dual signatures */}
        <View style={s.signatureSection}>
          <Text style={s.signatureTitle}>Signatures</Text>
          <View style={s.signatureGrid}>
            {/* Seafarer */}
            <View style={s.signatureBlock}>
              <Text style={s.signatureRole}>Seafarer</Text>
              <Text style={s.signatureName}>{record.seafarer_name}</Text>
              <Text style={s.signatureDate}>
                {record.seafarer_signed_at
                  ? `Signed: ${formatDateTime(record.seafarer_signed_at)}`
                  : "Not yet signed"}
              </Text>
              {record.seafarer_signed_at ? (
                <View style={s.signatureStamp}>
                  <Text style={s.signatureStampLabel}>Digitally signed</Text>
                  <Text style={s.signatureStampName}>{record.seafarer_name}</Text>
                </View>
              ) : (
                <View style={s.signatureLine} />
              )}
              <Text style={s.signatureCaption}>Signature</Text>
            </View>

            {/* Master */}
            <View style={s.signatureBlock}>
              <Text style={s.signatureRole}>Master / Captain</Text>
              <Text style={s.signatureName}>{captainSignatureName}</Text>
              <Text style={s.signatureDate}>
                {record.master_signed_at
                  ? `Signed: ${formatDateTime(record.master_signed_at)}`
                  : "Not yet signed"}
              </Text>
              {record.master_signed_at ? (
                <View style={s.signatureStamp}>
                  <Text style={s.signatureStampLabel}>Digitally signed</Text>
                  <Text style={s.signatureStampName}>{captainSignatureName}</Text>
                </View>
              ) : (
                <View style={s.signatureLine} />
              )}
              <Text style={s.signatureCaption}>Signature</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>{companyName} — {record.vessel_name}</Text>
          <Text>Record of hours of rest — {MONTHS[record.month - 1]} {record.year} — {record.seafarer_name}</Text>
          <Text>Generated {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}
