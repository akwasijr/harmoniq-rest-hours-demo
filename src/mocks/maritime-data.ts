import type { Company, User, Vessel, Voyage, VoyageCrewAssignment, RestHoursRecord, RestHoursDayEntry } from "@/types";
import { runFullCompliance } from "@/lib/maritime-rest-hours";

// ============================================
// MARITIME MOCK COMPANY
// ============================================

export const maritimeCompany: Company = {
  id: "comp_maritime",
  name: "North Sea Shipping",
  slug: "north-sea-shipping",
  app_name: "North Sea Crew",
  country: "NL",
  language: "en",
  industry: "maritime",
  status: "active",
  logo_url: null,
  hero_image_url: null,
  primary_color: "#1e3a5f",
  secondary_color: "#4a6f8a",
  font_family: "Geist Sans",
  ui_style: "rounded",
  tier: "professional",
  seat_limit: 30,
  currency: "EUR",
  created_at: "2024-03-01T10:00:00Z",
  updated_at: "2025-01-15T09:00:00Z",
  trial_ends_at: null,
};

// ============================================
// VESSEL & VOYAGE
// ============================================

export const mockVessels: Vessel[] = [
  {
    id: "vessel_north_star",
    company_id: "comp_maritime",
    name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    vessel_type: "bulk_carrier",
    gross_tonnage: 28500,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
  },
];

export const mockVoyages: Voyage[] = [
  {
    id: "voyage_2025_03",
    vessel_id: "vessel_north_star",
    company_id: "comp_maritime",
    name: "Voyage 2025-Q1 Rotterdam\u2013Bergen",
    departure_port: "Rotterdam",
    destination_port: "Bergen",
    embarkation_date: "2025-01-15",
    expected_end_date: "2025-04-30",
    actual_end_date: null,
    status: "active",
    master_id: "user_captain",
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
  },
];

// ============================================
// MARITIME MOCK USERS
// ============================================

// Generate extra crew users to match the bulk records
function generateExtraCrewUsers(): User[] {
  const crew = [
    { id: "user_chief_officer", first: "Petter", last: "Nielsen", email: "p.nielsen@northsea.test", rank: "Chief Officer", dept: "Deck", role: "manager" as const },
    { id: "user_ab1", first: "Kofi", last: "Okonkwo", email: "k.okonkwo@northsea.test", rank: "Able Seaman", dept: "Deck", role: "employee" as const },
    { id: "user_engineer", first: "Stefan", last: "Petrovic", email: "s.petrovic@northsea.test", rank: "Second Engineer", dept: "Engine", role: "employee" as const },
    { id: "user_cook", first: "Ana", last: "Santos", email: "a.santos@northsea.test", rank: "Ship's Cook", dept: "Galley", role: "employee" as const },
    { id: "user_bosun", first: "Dmitri", last: "Volkov", email: "d.volkov@northsea.test", rank: "Bosun", dept: "Deck", role: "employee" as const },
    { id: "user_ab2", first: "James", last: "Mensah", email: "j.mensah@northsea.test", rank: "Able Seaman", dept: "Deck", role: "employee" as const },
    { id: "user_os1", first: "Ravi", last: "Patel", email: "r.patel@northsea.test", rank: "Ordinary Seaman", dept: "Deck", role: "employee" as const },
    { id: "user_os2", first: "Lukas", last: "Weber", email: "l.weber@northsea.test", rank: "Ordinary Seaman", dept: "Deck", role: "employee" as const },
    { id: "user_chief_eng", first: "Tomasz", last: "Kowalski", email: "t.kowalski@northsea.test", rank: "Chief Engineer", dept: "Engine", role: "manager" as const },
    { id: "user_3rd_eng", first: "Chen", last: "Wei", email: "c.wei@northsea.test", rank: "Third Engineer", dept: "Engine", role: "employee" as const },
    { id: "user_oiler1", first: "Marco", last: "Silva", email: "m.silva@northsea.test", rank: "Oiler", dept: "Engine", role: "employee" as const },
    { id: "user_oiler2", first: "Ahmed", last: "Hassan", email: "a.hassan@northsea.test", rank: "Oiler", dept: "Engine", role: "employee" as const },
    { id: "user_electrician", first: "Yuki", last: "Tanaka", email: "y.tanaka@northsea.test", rank: "Electrician", dept: "Engine", role: "employee" as const },
    { id: "user_fitter", first: "Oleksandr", last: "Bondar", email: "o.bondar@northsea.test", rank: "Fitter", dept: "Engine", role: "employee" as const },
    { id: "user_steward", first: "Maria", last: "Reyes", email: "m.reyes@northsea.test", rank: "Chief Steward", dept: "Galley", role: "employee" as const },
    { id: "user_messman", first: "Kwame", last: "Asante", email: "k.asante@northsea.test", rank: "Messman", dept: "Galley", role: "employee" as const },
    { id: "user_cadet1", first: "Emma", last: "Lindqvist", email: "e.lindqvist@northsea.test", rank: "Deck Cadet", dept: "Deck", role: "employee" as const },
    { id: "user_cadet2", first: "Farid", last: "Al-Rashid", email: "f.alrashid@northsea.test", rank: "Engine Cadet", dept: "Engine", role: "employee" as const },
    { id: "user_radio", first: "Nikolai", last: "Petrov", email: "n.petrov@northsea.test", rank: "Radio Officer", dept: "Deck", role: "employee" as const },
    { id: "user_pumpman", first: "Diego", last: "Torres", email: "d.torres@northsea.test", rank: "Pumpman", dept: "Engine", role: "employee" as const },
  ];

  return crew.map((c, i) => ({
    id: c.id,
    company_id: "comp_maritime",
    email: c.email,
    first_name: c.first,
    middle_name: null,
    last_name: c.last,
    full_name: `${c.first} ${c.last}`,
    role: c.role,
    user_type: "internal" as const,
    account_type: c.role === "manager" ? "safety_officer" as const : "standard" as const,
    gender: "male" as const,
    department: c.dept,
    job_title: c.rank,
    employee_id: `NSS-${String(i + 2).padStart(3, "0")}`,
    status: "active" as const,
    location_id: null,
    language: "en" as const,
    theme: "system" as const,
    two_factor_enabled: false,
    last_login_at: "2025-03-20T08:00:00Z",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2025-03-20T08:00:00Z",
    avatar_url: null,
    notification_prefs: { push: true, email: false, incidents: true, tasks: true, news: false },
    team_ids: [],
  }));
}

export const maritimeUsers: User[] = [
  {
    id: "user_captain",
    company_id: "comp_maritime",
    email: "j.vanderberg@northsea.test",
    first_name: "Jan",
    middle_name: null,
    last_name: "van der Berg",
    full_name: "Jan van der Berg",
    role: "manager",
    user_type: "internal",
    account_type: "admin",
    gender: "male",
    department: "Deck",
    job_title: "Master",
    employee_id: "NSS-001",
    status: "active",
    location_id: null,
    language: "en",
    theme: "system",
    two_factor_enabled: true,
    last_login_at: "2025-03-20T08:00:00Z",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2025-03-20T08:00:00Z",
    avatar_url: null,
    notification_prefs: { push: true, email: true, incidents: true, tasks: true, news: true },
    team_ids: ["team_bridge"],
  },
  ...generateExtraCrewUsers(),
];

// ============================================
// VOYAGE CREW ASSIGNMENTS
// ============================================

const crewRoster: Array<{ userId: string; role: string; dept: string; watchkeeper: boolean }> = [
  { userId: "user_captain", role: "Master", dept: "Deck", watchkeeper: true },
  { userId: "user_chief_officer", role: "Chief Officer", dept: "Deck", watchkeeper: true },
  { userId: "user_ab1", role: "Able Seaman", dept: "Deck", watchkeeper: true },
  { userId: "user_engineer", role: "Second Engineer", dept: "Engine", watchkeeper: true },
  { userId: "user_cook", role: "Ship's Cook", dept: "Galley", watchkeeper: false },
  { userId: "user_bosun", role: "Bosun", dept: "Deck", watchkeeper: true },
  { userId: "user_ab2", role: "Able Seaman", dept: "Deck", watchkeeper: true },
  { userId: "user_os1", role: "Ordinary Seaman", dept: "Deck", watchkeeper: false },
  { userId: "user_os2", role: "Ordinary Seaman", dept: "Deck", watchkeeper: false },
  { userId: "user_chief_eng", role: "Chief Engineer", dept: "Engine", watchkeeper: true },
  { userId: "user_3rd_eng", role: "Third Engineer", dept: "Engine", watchkeeper: true },
  { userId: "user_oiler1", role: "Oiler", dept: "Engine", watchkeeper: false },
  { userId: "user_oiler2", role: "Oiler", dept: "Engine", watchkeeper: false },
  { userId: "user_electrician", role: "Electrician", dept: "Engine", watchkeeper: false },
  { userId: "user_fitter", role: "Fitter", dept: "Engine", watchkeeper: false },
  { userId: "user_steward", role: "Chief Steward", dept: "Galley", watchkeeper: false },
  { userId: "user_messman", role: "Messman", dept: "Galley", watchkeeper: false },
  { userId: "user_cadet1", role: "Deck Cadet", dept: "Deck", watchkeeper: false },
  { userId: "user_cadet2", role: "Engine Cadet", dept: "Engine", watchkeeper: false },
  { userId: "user_radio", role: "Radio Officer", dept: "Deck", watchkeeper: true },
  { userId: "user_pumpman", role: "Pumpman", dept: "Engine", watchkeeper: false },
];

export const mockCrewAssignments: VoyageCrewAssignment[] = crewRoster.map((c, i) => ({
  id: `crew_assign_${i}`,
  voyage_id: "voyage_2025_03",
  vessel_id: "vessel_north_star",
  company_id: "comp_maritime",
  user_id: c.userId,
  role_on_board: c.role,
  department: c.dept,
  is_watchkeeper: c.watchkeeper,
  board_date: "2025-01-15",
  sign_off_date: null,
  status: "active" as const,
  created_at: "2025-01-10T08:00:00Z",
}));

// ============================================
// HELPER: generate realistic rest entries
// ============================================

function makeEntry(
  date: string,
  restPeriods: Array<{ from: string; to: string }>,
  isAtSea = true,
  comments = "",
): RestHoursDayEntry {
  const totalRest = restPeriods.reduce((sum, p) => {
    const [fh, fm] = p.from.split(":").map(Number);
    const [th, tm] = p.to.split(":").map(Number);
    const fromMin = fh * 60 + fm;
    let toMin = th * 60 + tm;
    if (toMin <= fromMin) toMin += 24 * 60;
    return sum + (toMin - fromMin) / 60;
  }, 0);
  return {
    date,
    is_at_sea: isAtSea,
    rest_periods: restPeriods,
    work_periods: [],
    total_rest_hours: Math.round(totalRest * 100) / 100,
    total_work_hours: Math.round((24 - totalRest) * 100) / 100,
    comments,
  };
}

function generateFebruaryEntries(): RestHoursDayEntry[] {
  const entries: RestHoursDayEntry[] = [];
  const daysInFeb = 28;
  for (let d = 1; d <= daysInFeb; d++) {
    const date = `2026-02-${String(d).padStart(2, "0")}`;
    if (d % 7 === 0) {
      entries.push(makeEntry(date, [
        { from: "00:00", to: "08:00" },
        { from: "12:00", to: "16:00" },
      ]));
    } else {
      entries.push(makeEntry(date, [
        { from: "00:00", to: "06:30" },
        { from: "12:00", to: "16:00" },
      ]));
    }
  }
  return entries;
}

function generateJanuaryEntries(): RestHoursDayEntry[] {
  const entries: RestHoursDayEntry[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = `2026-01-${String(d).padStart(2, "0")}`;
    if (d === 14) {
      entries.push(makeEntry(
        date,
        [
          { from: "00:00", to: "04:00" },
          { from: "12:00", to: "16:00" },
        ],
        false,
        "Heavy weather watch and emergency deck checks",
      ));
    } else {
      entries.push(makeEntry(date, [
        { from: "00:00", to: "06:00" },
        { from: "12:00", to: "16:30" },
      ]));
    }
  }
  return entries;
}

function generateDecemberRejectedEntries(): RestHoursDayEntry[] {
  const entries: RestHoursDayEntry[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = `2025-12-${String(d).padStart(2, "0")}`;
    if (d === 28) {
      entries.push(makeEntry(
        date,
        [
          { from: "00:30", to: "04:30" },
          { from: "12:30", to: "16:30" },
        ],
        false,
        "Emergency mooring operations reduced continuous rest",
      ));
    } else {
      entries.push(makeEntry(date, [
        { from: "00:00", to: "06:00" },
        { from: "12:00", to: "16:30" },
      ]));
    }
  }
  return entries;
}

function generateCurrentMonthEntries(): RestHoursDayEntry[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const today = now.getDate();
  const entries: RestHoursDayEntry[] = [];

  // Generate days 1 through today
  // Fill everything EXCEPT the 3-day edit window (today + past 2 days)
  for (let d = 1; d <= today; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const daysAgo = today - d;

    if (daysAgo === 2) {
      // Oldest editable day — pre-filled with a violation (only 8h, no 6h block)
      entries.push(makeEntry(date, [
        { from: "00:00", to: "04:00" },
        { from: "12:00", to: "16:00" },
      ]));
    } else if (daysAgo <= 1) {
      // Within the 3-day edit window — leave empty so user needs to fill
      entries.push(makeEntry(date, []));
    } else if (d <= 3) {
      // In port early in month
      entries.push(makeEntry(date, [
        { from: "00:00", to: "07:00" },
        { from: "13:00", to: "17:00" },
      ], false));
    } else {
      // Normal days — filled
      entries.push(makeEntry(date, [
        { from: "00:00", to: "06:00" },
        { from: "12:00", to: "16:30" },
      ]));
    }
  }
  return entries;
}

// ============================================
// MOCK REST HOURS RECORDS
// ============================================

const febEntries = generateFebruaryEntries();
const febCompliance = runFullCompliance(febEntries);

const janEntries = generateJanuaryEntries();
const janCompliance = runFullCompliance(janEntries);

const decRejectedEntries = generateDecemberRejectedEntries();
const decRejectedCompliance = runFullCompliance(decRejectedEntries);

const currentMonthEntries = generateCurrentMonthEntries();
const currentMonthCompliance = runFullCompliance(currentMonthEntries);
const _now = new Date();
const _currentMonth = _now.getMonth() + 1;
const _currentYear = _now.getFullYear();

const captainReviewCrewProfiles = mockCrewAssignments
  .filter((assignment) => assignment.user_id !== "user_captain" && assignment.user_id !== "user_ab1")
  .slice(0, 12)
  .flatMap((assignment) => {
    const user = maritimeUsers.find((candidate) => candidate.id === assignment.user_id);
    if (!user) {
      return [];
    }
    return [{
      id: user.id,
      name: user.full_name,
      rank: assignment.role_on_board,
      watchkeeper: assignment.is_watchkeeper,
    }];
  });

const captainReviewStatuses: RestHoursRecord["status"][] = [
  "submitted",
  "approved",
  "submitted",
  "draft",
  "submitted",
  "approved",
  "rejected",
  "submitted",
  "forwarded_to_hr",
  "approved",
  "submitted",
  "draft",
];

const captainViolationComments = [
  "Bridge watch handover overran after heavy traffic separation scheme monitoring.",
  "Engine alarm response interrupted the longest rest block during the night watch.",
  "Cargo prep and arrival briefing split the second rest period below the usual target.",
  "Port-state inspection follow-up shortened continuous rest before the morning watch.",
];

function generateCaptainCurrentMonthEntries(
  crewIndex: number,
  isWatchkeeper: boolean,
  status: RestHoursRecord["status"],
): RestHoursDayEntry[] {
  const today = _now.getDate();
  const monthPrefix = `${_currentYear}-${String(_currentMonth).padStart(2, "0")}`;
  const shouldShowIssueExample =
    status === "draft"
    || status === "rejected"
    || status === "forwarded_to_hr"
    || crewIndex % 5 === 2;
  const violationDay = shouldShowIssueExample && today > 5 && crewIndex % 4 === 2
    ? Math.min(today - 2, 6 + crewIndex)
    : null;

  const issueWatchkeeperPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "00:00", to: "06:00" }, { from: "12:00", to: "16:30" }],
    [{ from: "00:30", to: "06:30" }, { from: "13:00", to: "17:00" }],
    [{ from: "22:00", to: "04:30" }, { from: "12:30", to: "17:00" }],
    [{ from: "01:00", to: "07:00" }, { from: "13:00", to: "17:30" }],
  ];
  const compliantWatchkeeperPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "00:00", to: "07:00" }, { from: "13:00", to: "18:00" }],
    [{ from: "00:30", to: "07:30" }, { from: "13:30", to: "18:00" }],
    [{ from: "22:00", to: "05:30" }, { from: "13:00", to: "17:30" }],
    [{ from: "01:00", to: "08:00" }, { from: "14:00", to: "18:30" }],
  ];
  const issueDayworkerPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "21:30", to: "05:30" }, { from: "11:30", to: "15:00" }],
    [{ from: "22:00", to: "06:00" }, { from: "12:30", to: "15:30" }],
    [{ from: "23:00", to: "06:30" }, { from: "13:00", to: "16:00" }],
    [{ from: "20:30", to: "04:30" }, { from: "12:00", to: "15:00" }],
  ];
  const compliantDayworkerPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "21:00", to: "05:00" }, { from: "11:30", to: "15:30" }],
    [{ from: "22:00", to: "06:00" }, { from: "12:30", to: "16:30" }],
    [{ from: "23:00", to: "06:30" }, { from: "13:00", to: "17:30" }],
    [{ from: "20:30", to: "04:30" }, { from: "12:00", to: "16:00" }],
  ];
  const issuePortPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "00:00", to: "07:00" }, { from: "13:00", to: "17:00" }],
    [{ from: "23:00", to: "06:30" }, { from: "12:30", to: "16:30" }],
  ];
  const compliantPortPatterns: Array<Array<{ from: string; to: string }>> = [
    [{ from: "00:00", to: "07:00" }, { from: "13:00", to: "18:00" }],
    [{ from: "23:00", to: "06:30" }, { from: "12:30", to: "17:30" }],
  ];

  return Array.from({ length: today }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const date = `${monthPrefix}-${String(day).padStart(2, "0")}`;
    const leaveOpenForCrew = status === "draft" && day >= Math.max(today - 1, 1);
    const isPortDay = day <= 2 || (!isWatchkeeper && day % 9 === 0);

    if (leaveOpenForCrew) {
      return makeEntry(date, []);
    }

    if (violationDay === day) {
      return makeEntry(
        date,
        [
          { from: "00:00", to: "04:00" },
          { from: "12:00", to: "16:00" },
        ],
        !isPortDay,
        captainViolationComments[crewIndex % captainViolationComments.length],
      );
    }

    const patternIndex = (crewIndex + dayIndex) % 4;
    const restPeriods = isPortDay
      ? (shouldShowIssueExample ? issuePortPatterns : compliantPortPatterns)[
        (crewIndex + dayIndex) % issuePortPatterns.length
      ]
      : (
        shouldShowIssueExample
          ? (isWatchkeeper ? issueWatchkeeperPatterns : issueDayworkerPatterns)
          : (isWatchkeeper ? compliantWatchkeeperPatterns : compliantDayworkerPatterns)
      )[patternIndex];

    return makeEntry(date, restPeriods, !isPortDay);
  });
}

function generateCurrentMonthCaptainReviewRecords(): RestHoursRecord[] {
  const timestamp = (dayOffset: number, time: string) => {
    const day = Math.max(1, _now.getDate() - dayOffset);
    return `${_currentYear}-${String(_currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}Z`;
  };

  return captainReviewCrewProfiles.map((crew, idx) => {
    const status = captainReviewStatuses[idx % captainReviewStatuses.length];
    const entries = generateCaptainCurrentMonthEntries(idx, crew.watchkeeper, status);
    const compliance = runFullCompliance(entries);
    const submittedAt = status === "draft" ? null : timestamp(2, "08:00:00");
    const reviewedAt = status === "approved" || status === "rejected" || status === "forwarded_to_hr"
      ? timestamp(1, "10:15:00")
      : null;
    const isReviewed = reviewedAt !== null;
    const violationComment = entries.find((entry) => entry.comments)?.comments ?? "";

    return {
      id: `rh_current_review_${crew.id}`,
      company_id: "comp_maritime",
      vessel_id: "vessel_north_star",
      voyage_id: "voyage_2025_03",
      vessel_name: "MV North Star",
      imo_number: "9876543",
      flag_state: "NL",
      seafarer_id: crew.id,
      seafarer_name: crew.name,
      position_rank: crew.rank,
      is_watchkeeper: crew.watchkeeper,
      month: _currentMonth,
      year: _currentYear,
      entries,
      daily_compliance: compliance.daily,
      weekly_compliance: compliance.weekly,
      has_violations: compliance.hasViolations,
      status,
      seafarer_signed_at: status === "draft" ? null : timestamp(2, "07:45:00"),
      submitted_at: submittedAt,
      master_signed_at: status === "approved" || status === "forwarded_to_hr"
        ? timestamp(1, "10:15:00")
        : null,
      reviewed_by: isReviewed ? "user_captain" : null,
      reviewed_at: reviewedAt,
      reviewer_notes:
        status === "rejected"
          ? "Please explain the short-rest day before I can countersign."
          : status === "forwarded_to_hr"
            ? "Forwarded to shore HR because the reduced rest overlaps with an onboard safety concern."
            : "",
      violation_comment: compliance.hasViolations ? violationComment : "",
      forwarded_to_hr_at: status === "forwarded_to_hr" ? timestamp(1, "10:20:00") : null,
      is_late_entry: status !== "draft" && idx % 5 === 0,
      created_at: timestamp(25, "00:00:00"),
      updated_at:
        reviewedAt
        ?? submittedAt
        ?? timestamp(0, "07:00:00"),
    };
  });
}

export const mockRestHoursRecords: RestHoursRecord[] = [
  {
    id: "rh_1",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_ab1",
    seafarer_name: "Kofi Okonkwo",
    position_rank: "Able Seaman",
    is_watchkeeper: true,
    month: 2,
    year: 2026,
    entries: febEntries,
    daily_compliance: febCompliance.daily,
    weekly_compliance: febCompliance.weekly,
    has_violations: febCompliance.hasViolations,
    status: "approved",
    seafarer_signed_at: "2026-03-01T09:55:00Z",
    submitted_at: "2026-03-01T10:00:00Z",
    master_signed_at: "2026-03-02T09:30:00Z",
    reviewed_by: "user_captain",
    reviewed_at: "2026-03-02T09:30:00Z",
    reviewer_notes: "",
    violation_comment: "",
    forwarded_to_hr_at: null,
    is_late_entry: false,
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-03-02T09:30:00Z",
  },
  {
    id: "rh_2",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_ab1",
    seafarer_name: "Kofi Okonkwo",
    position_rank: "Able Seaman",
    is_watchkeeper: true,
    month: _currentMonth,
    year: _currentYear,
    entries: currentMonthEntries,
    daily_compliance: currentMonthCompliance.daily,
    weekly_compliance: currentMonthCompliance.weekly,
    has_violations: currentMonthCompliance.hasViolations,
    status: "draft",
    seafarer_signed_at: null,
    submitted_at: null,
    master_signed_at: null,
    reviewed_by: null,
    reviewed_at: null,
    reviewer_notes: "",
    violation_comment: "",
    forwarded_to_hr_at: null,
    is_late_entry: false,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-21T07:00:00Z",
  },
  ...generateCurrentMonthCaptainReviewRecords(),
  {
    id: "rh_kofi_jan",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_ab1",
    seafarer_name: "Kofi Okonkwo",
    position_rank: "Able Seaman",
    is_watchkeeper: true,
    month: 1,
    year: 2026,
    entries: janEntries,
    daily_compliance: janCompliance.daily,
    weekly_compliance: janCompliance.weekly,
    has_violations: janCompliance.hasViolations,
    status: "submitted",
    seafarer_signed_at: "2026-02-01T08:00:00Z",
    submitted_at: "2026-02-01T08:00:00Z",
    master_signed_at: null,
    reviewed_by: null,
    reviewed_at: null,
    reviewer_notes: "",
    violation_comment:
      "Heavy weather watch and emergency deck checks on 14 January split the rest periods below the minimum requirement.",
    forwarded_to_hr_at: null,
    is_late_entry: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-02-03T10:30:00Z",
  },
  {
    id: "rh_kofi_dec_rejected",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_ab1",
    seafarer_name: "Kofi Okonkwo",
    position_rank: "Able Seaman",
    is_watchkeeper: true,
    month: 12,
    year: 2025,
    entries: decRejectedEntries,
    daily_compliance: decRejectedCompliance.daily,
    weekly_compliance: decRejectedCompliance.weekly,
    has_violations: decRejectedCompliance.hasViolations,
    status: "rejected",
    seafarer_signed_at: "2026-01-04T08:00:00Z",
    submitted_at: "2026-01-04T08:00:00Z",
    master_signed_at: null,
    reviewed_by: "user_captain",
    reviewed_at: "2026-01-04T14:15:00Z",
    reviewer_notes:
      "Please clarify the low-rest day on 28 December before resubmitting.",
    violation_comment:
      "Emergency mooring operations and weather watch split my rest into two short periods on 28 December.",
    forwarded_to_hr_at: null,
    is_late_entry: true,
    created_at: "2025-12-01T00:00:00Z",
    updated_at: "2026-01-04T14:15:00Z",
  },
  {
    id: "rh_3",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_engineer",
    seafarer_name: "Stefan Petrovic",
    position_rank: "Second Engineer",
    is_watchkeeper: true,
    month: 2,
    year: 2025,
    entries: febEntries.map((e) => ({
      ...e,
      rest_periods: [
        { from: "00:00", to: "06:00" },
        { from: "12:00", to: "17:00" },
      ],
      total_rest_hours: 11,
      total_work_hours: 13,
    })),
    daily_compliance: febEntries.map((e) => ({
      date: e.date,
      min_rest_24h_ok: true,
      min_continuous_ok: true,
      total_rest_hours: 11,
    })),
    weekly_compliance: [],
    has_violations: false,
    status: "approved",
    seafarer_signed_at: "2025-03-01T07:50:00Z",
    submitted_at: "2025-03-01T08:00:00Z",
    master_signed_at: "2025-03-01T14:00:00Z",
    reviewed_by: "user_captain",
    reviewed_at: "2025-03-01T14:00:00Z",
    reviewer_notes: "",
    violation_comment: "",
    forwarded_to_hr_at: null,
    is_late_entry: false,
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-03-01T14:00:00Z",
  },
  {
    id: "rh_4",
    company_id: "comp_maritime",
    vessel_id: "vessel_north_star",
    voyage_id: "voyage_2025_03",
    vessel_name: "MV North Star",
    imo_number: "9876543",
    flag_state: "NL",
    seafarer_id: "user_cook",
    seafarer_name: "Ana Santos",
    position_rank: "Ship's Cook",
    is_watchkeeper: false,
    month: 3,
    year: 2025,
    entries: currentMonthEntries.slice(0, 15).map((e) => ({
      ...e,
      rest_periods: [
        { from: "21:00", to: "05:00" },
        { from: "10:00", to: "13:00" },
      ],
      total_rest_hours: 11,
      total_work_hours: 13,
    })),
    daily_compliance: currentMonthEntries.slice(0, 15).map((e) => ({
      date: e.date,
      min_rest_24h_ok: true,
      min_continuous_ok: true,
      total_rest_hours: 11,
    })),
    weekly_compliance: [],
    has_violations: false,
    status: "draft",
    seafarer_signed_at: null,
    submitted_at: null,
    master_signed_at: null,
    reviewed_by: null,
    reviewed_at: null,
    reviewer_notes: "",
    violation_comment: "",
    forwarded_to_hr_at: null,
    is_late_entry: false,
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-15T18:00:00Z",
  },
  // ── Additional crew records for realistic scale ──
  ...generateBulkCrewRecords(),
];

// Generate additional crew with varied data for realistic 20+ person vessel
function generateBulkCrewRecords(): RestHoursRecord[] {
  const extraCrew = [
    { id: "user_bosun", name: "Dmitri Volkov", rank: "Bosun", dept: "Deck", watchkeeper: true },
    { id: "user_ab2", name: "James Mensah", rank: "Able Seaman", dept: "Deck", watchkeeper: true },
    { id: "user_os1", name: "Ravi Patel", rank: "Ordinary Seaman", dept: "Deck", watchkeeper: false },
    { id: "user_os2", name: "Lukas Weber", rank: "Ordinary Seaman", dept: "Deck", watchkeeper: false },
    { id: "user_chief_eng", name: "Tomasz Kowalski", rank: "Chief Engineer", dept: "Engine", watchkeeper: true },
    { id: "user_3rd_eng", name: "Chen Wei", rank: "Third Engineer", dept: "Engine", watchkeeper: true },
    { id: "user_oiler1", name: "Marco Silva", rank: "Oiler", dept: "Engine", watchkeeper: false },
    { id: "user_oiler2", name: "Ahmed Hassan", rank: "Oiler", dept: "Engine", watchkeeper: false },
    { id: "user_electrician", name: "Yuki Tanaka", rank: "Electrician", dept: "Engine", watchkeeper: false },
    { id: "user_fitter", name: "Oleksandr Bondar", rank: "Fitter", dept: "Engine", watchkeeper: false },
    { id: "user_steward", name: "Maria Reyes", rank: "Chief Steward", dept: "Galley", watchkeeper: false },
    { id: "user_messman", name: "Kwame Asante", rank: "Messman", dept: "Galley", watchkeeper: false },
    { id: "user_cadet1", name: "Emma Lindqvist", rank: "Deck Cadet", dept: "Deck", watchkeeper: false },
    { id: "user_cadet2", name: "Farid Al-Rashid", rank: "Engine Cadet", dept: "Engine", watchkeeper: false },
    { id: "user_radio", name: "Nikolai Petrov", rank: "Radio Officer", dept: "Deck", watchkeeper: true },
    { id: "user_pumpman", name: "Diego Torres", rank: "Pumpman", dept: "Engine", watchkeeper: false },
  ];

  const statuses: Array<RestHoursRecord["status"]> = ["submitted", "submitted", "approved", "submitted", "approved", "submitted", "approved", "draft", "submitted", "approved", "submitted", "approved", "submitted", "draft", "submitted", "approved"];

  const records: RestHoursRecord[] = [];
  extraCrew.forEach((crew, idx) => {
    const status = statuses[idx % statuses.length];
    // Slight variation in rest patterns
    const baseRest = 10 + (idx % 3); // 10, 11, or 12h
    const hasViolation = idx === 3 || idx === 9; // a couple have issues

    const entries: RestHoursDayEntry[] = [];
    const daysLogged = status === "draft" ? 15 : 20;
    for (let d = 1; d <= daysLogged; d++) {
      const date = `2025-03-${String(d).padStart(2, "0")}`;
      const restH1 = hasViolation && d === 10 ? 4 : Math.min(baseRest - 4, 8);
      const restH2 = hasViolation && d === 10 ? 1 : baseRest - restH1;
      entries.push(makeEntry(date, [
        { from: "00:00", to: `${String(restH1).padStart(2, "0")}:00` },
        { from: "12:00", to: `${String(12 + restH2).padStart(2, "0")}:00` },
      ]));
    }

    const comp = runFullCompliance(entries);

    records.push({
      id: `rh_extra_${idx}`,
      company_id: "comp_maritime",
      vessel_id: "vessel_north_star",
      voyage_id: "voyage_2025_03",
      vessel_name: "MV North Star",
      imo_number: "9876543",
      flag_state: "NL",
      seafarer_id: crew.id,
      seafarer_name: crew.name,
      position_rank: crew.rank,
      is_watchkeeper: crew.watchkeeper,
      month: 3,
      year: 2025,
      entries,
      daily_compliance: comp.daily,
      weekly_compliance: comp.weekly,
      has_violations: comp.hasViolations,
      status,
      seafarer_signed_at: status !== "draft" ? "2025-03-21T07:50:00Z" : null,
      submitted_at: status !== "draft" ? "2025-03-21T08:00:00Z" : null,
      master_signed_at: status === "approved" ? "2025-03-22T10:00:00Z" : null,
      reviewed_by: status === "approved" ? "user_captain" : null,
      reviewed_at: status === "approved" ? "2025-03-22T10:00:00Z" : null,
      reviewer_notes: "",
      violation_comment: "",
      forwarded_to_hr_at: null,
      is_late_entry: false,
      created_at: "2025-03-01T00:00:00Z",
      updated_at: "2025-03-21T08:00:00Z",
    });
  });

  return records;
}
