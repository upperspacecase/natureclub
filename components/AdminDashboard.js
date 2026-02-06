"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/libs/api";
import {
  SIGNUP_QUESTION_CATALOG,
  getLeadAnswerByQuestionId,
} from "@/libs/signupQuestionCatalog";
import { normalizeRegionDisplay, toRegionKey } from "@/libs/regions";

const ROLE_LABEL = {
  member: "participant",
  host: "facilitator",
};

const DASHBOARD_TABS = [
  { id: "users", label: "Users & Signups" },
  { id: "events", label: "Events & Tags" },
  { id: "launch", label: "Launch Readiness" },
];

const USER_VIEW_MODES = [
  { id: "table", label: "Table" },
  { id: "analytics", label: "Analytics" },
];

const QUESTION_FILTERS = SIGNUP_QUESTION_CATALOG.map((question) => ({
  id: question.id,
  label: question.label,
}));

const ANALYTICS_QUESTIONS = SIGNUP_QUESTION_CATALOG.map((question) => ({
  id: question.id,
  label: question.label,
  role: question.role,
}));

const TABLE_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "region", label: "Where are you based?" },
  { id: "roleLabel", label: "What would you like to join as?" },
  { id: "signedAt", label: "When did you sign up?" },
  ...SIGNUP_QUESTION_CATALOG.map((question) => ({
    id: question.id,
    label: question.label,
    isQuestion: true,
  })),
];

const DEFAULT_LAUNCH_REGIONS = ["Ericeira", "Lisbon"];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const formatNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US")
    : "-";

const formatPercent = (value) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num) => `${num}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeText = (value) =>
  `${value || ""}`
    .trim()
    .toLowerCase();

const titleCase = (value = "") =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const safeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const csvEscape = (value) => {
  const stringValue = `${value ?? ""}`;
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const valuesToString = (value) => {
  if (Array.isArray(value)) return value.join(" | ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (value === null || value === undefined || value === "") return "-";
  return `${value}`;
};

const buildCsv = (rows) => {
  const header = TABLE_COLUMNS.map((column) => column.label).join(",");
  const lines = rows.map((row) =>
    TABLE_COLUMNS.map((column) => csvEscape(valuesToString(row[column.id]))).join(",")
  );

  return [header, ...lines].join("\n");
};

const parseTagsInput = (value) =>
  `${value || ""}`
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const getLeadRegion = (lead) => {
  const member = lead.responses?.member || {};
  const host = lead.responses?.host || {};
  const memberCity = normalizeRegionDisplay(member.locationCity);
  const hostCity = normalizeRegionDisplay(host.locationCity);
  const country = `${lead.country || ""}`.trim();
  const explicitRegion = normalizeRegionDisplay(lead.region);

  return explicitRegion || memberCity || hostCity || country || "Unknown";
};

const getLeadName = (lead) => {
  const email = `${lead.email || ""}`;
  const [localPart] = email.split("@");
  if (!localPart) return "-";
  return titleCase(localPart.replace(/[._-]+/g, " "));
};

const toRoleLabel = (role) => ROLE_LABEL[role] || role || "-";

const mapLeadToRow = (lead) => ({
  id: lead._id,
  name: getLeadName(lead),
  email: lead.email,
  region: getLeadRegion(lead),
  regionKey: toRegionKey(lead.regionKey || getLeadRegion(lead)),
  role: lead.role,
  roleLabel: toRoleLabel(lead.role),
  signedAt: lead.createdAt,
  ...Object.fromEntries(
    SIGNUP_QUESTION_CATALOG.map((question) => [
      question.id,
      getLeadAnswerByQuestionId(lead, question.id),
    ])
  ),
});

const countValues = (values) => {
  const map = new Map();
  values.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const normalized = `${item}`.trim();
        if (!normalized) return;
        map.set(normalized, (map.get(normalized) || 0) + 1);
      });
      return;
    }

    const normalized = `${value || ""}`.trim();
    if (!normalized) return;
    map.set(normalized, (map.get(normalized) || 0) + 1);
  });

  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

const demandTermsForLead = (lead) => {
  const member = lead.responses?.member || {};
  const themeTerms = asArray(member.interestThemes);
  const fallbackTerms = asArray(member.interests);
  const sourceTerms = themeTerms.length ? themeTerms : fallbackTerms;

  const seen = new Set();
  return sourceTerms
    .map((term) => `${term}`.trim())
    .filter(Boolean)
    .filter((term) => {
      const key = normalizeText(term);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const termsFromEvent = (event) => {
  const tags = asArray(event.tags);
  const themes = asArray(event.themes);
  return [...new Set([...tags, ...themes].map((term) => `${term}`.trim()).filter(Boolean))];
};

const sectionClass =
  "rounded-2xl border border-white bg-black p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
      active
        ? "border-white !bg-white !text-black"
        : "border-white bg-black text-white hover:!bg-white hover:!text-black"
    }`}
  >
    {children}
  </button>
);

const StatBlock = ({ label, value, helper }) => (
  <div className="rounded-xl border border-white bg-black p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-white">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    {helper ? <p className="mt-1 text-xs text-white">{helper}</p> : null}
  </div>
);

const HorizontalBars = ({ rows, total }) => {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-white bg-black p-4 text-sm text-white">
        No responses yet.
      </div>
    );
  }

  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const width = (row.count / max) * 100;
        const pct = total > 0 ? row.count / total : 0;

        return (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs text-white">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0">{row.count} ({formatPercent(pct)})</span>
            </div>
            <div className="h-2 w-full rounded-full border border-white bg-black">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.max(width, 4)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [usersMode, setUsersMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [visitsTotal, setVisitsTotal] = useState(0);
  const [clicks, setClicks] = useState({ total: 0, participant: 0, facilitator: 0 });

  const [userRegion, setUserRegion] = useState("all");
  const [userRole, setUserRole] = useState("both");
  const [userDateStart, setUserDateStart] = useState("");
  const [userDateEnd, setUserDateEnd] = useState("");
  const [questionFilterKey, setQuestionFilterKey] = useState("all");
  const [questionFilterValue, setQuestionFilterValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "signedAt", dir: "desc" });

  const [eventRegion, setEventRegion] = useState("all");
  const [eventTag, setEventTag] = useState("all");
  const [eventFacilitator, setEventFacilitator] = useState("all");
  const [eventDateStart, setEventDateStart] = useState("");
  const [eventDateEnd, setEventDateEnd] = useState("");
  const [savingEventId, setSavingEventId] = useState("");

  const [participantThreshold, setParticipantThreshold] = useState(50);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.post("/admin/dashboard", {});
      setLeads(
        (data?.leads || []).map((lead) => {
          const region = getLeadRegion(lead);
          return {
            ...lead,
            region,
            regionKey: toRegionKey(lead.regionKey || region),
          };
        })
      );
      setEvents(
        (data?.events || []).map((event) => {
          const region = normalizeRegionDisplay(event.region) || "Unknown";
          return {
            ...event,
            region,
            regionKey: toRegionKey(event.regionKey || region),
          };
        })
      );
      setVisitsTotal(data?.visits?.total || 0);
      setClicks(data?.clicks || { total: 0, participant: 0, facilitator: 0 });
      setLastUpdated(data?.generatedAt || new Date().toISOString());
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const regions = useMemo(() => {
    const set = new Set(DEFAULT_LAUNCH_REGIONS);
    leads.forEach((lead) => set.add(lead.region || getLeadRegion(lead)));
    events.forEach((event) => {
      const region = normalizeRegionDisplay(event.region);
      if (region) set.add(region);
    });
    return [...set]
      .map((region) => normalizeRegionDisplay(region))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [leads, events]);

  const tags = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      termsFromEvent(event).forEach((term) => set.add(term));
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const facilitators = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      const label = `${event.facilitatorName || event.facilitatorEmail || ""}`.trim();
      if (label) set.add(label);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const userRows = useMemo(() => leads.map(mapLeadToRow), [leads]);

  const filteredUserRows = useMemo(() => {
    const start = userDateStart ? safeDate(`${userDateStart}T00:00:00`) : null;
    const end = userDateEnd ? safeDate(`${userDateEnd}T23:59:59`) : null;

    const questionNeedle = normalizeText(questionFilterValue);

    const filtered = userRows.filter((row) => {
      if (userRegion !== "all" && toRegionKey(row.regionKey || row.region) !== userRegion) {
        return false;
      }

      if (userRole === "participant" && row.role !== "member") return false;
      if (userRole === "facilitator" && row.role !== "host") return false;

      const signedAt = safeDate(row.signedAt);
      if (start && (!signedAt || signedAt < start)) return false;
      if (end && (!signedAt || signedAt > end)) return false;

      if (questionFilterKey !== "all" && questionNeedle) {
        const value = valuesToString(row[questionFilterKey]);
        if (!normalizeText(value).includes(questionNeedle)) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      const direction = sortConfig.dir === "asc" ? 1 : -1;

      if (sortConfig.key === "signedAt") {
        const aDate = safeDate(aValue)?.getTime() || 0;
        const bDate = safeDate(bValue)?.getTime() || 0;
        return (aDate - bDate) * direction;
      }

      const aText = normalizeText(valuesToString(aValue));
      const bText = normalizeText(valuesToString(bValue));
      if (aText === bText) return 0;
      return aText > bText ? direction : -direction;
    });

    return sorted;
  }, [
    questionFilterKey,
    questionFilterValue,
    sortConfig.dir,
    sortConfig.key,
    userDateEnd,
    userDateStart,
    userRegion,
    userRole,
    userRows,
  ]);

  const userSummary = useMemo(() => {
    const total = filteredUserRows.length;
    const weekAgo = new Date(Date.now() - 7 * ONE_DAY_MS);
    const weekCount = filteredUserRows.filter((row) => {
      const date = safeDate(row.signedAt);
      return date && date >= weekAgo;
    }).length;

    const participantCount = filteredUserRows.filter(
      (row) => row.role === "member"
    ).length;
    const facilitatorCount = filteredUserRows.filter(
      (row) => row.role === "host"
    ).length;
    const conversion = visitsTotal > 0 ? total / visitsTotal : 0;

    return {
      total,
      weekCount,
      participantCount,
      facilitatorCount,
      conversion,
    };
  }, [filteredUserRows, visitsTotal]);

  const analyticsCards = useMemo(
    () =>
      ANALYTICS_QUESTIONS.map((question) => {
        const scopedLeads = filteredUserRows.filter((row) => row.role === question.role);
        const values = scopedLeads.map((row) => row[question.id]);
        const counts = countValues(values);

        return {
          ...question,
          respondentCount: scopedLeads.length,
          totalResponses: counts.reduce((sum, item) => sum + item.count, 0),
          rows: counts.slice(0, 8),
        };
      }),
    [filteredUserRows]
  );

  const filteredEvents = useMemo(() => {
    const start = eventDateStart ? safeDate(`${eventDateStart}T00:00:00`) : null;
    const end = eventDateEnd ? safeDate(`${eventDateEnd}T23:59:59`) : null;

    return events.filter((event) => {
      const region = normalizeRegionDisplay(event.region) || "Unknown";
      if (eventRegion !== "all" && toRegionKey(event.regionKey || region) !== eventRegion) {
        return false;
      }

      const facilitatorLabel = `${event.facilitatorName || event.facilitatorEmail || ""}`.trim();
      if (eventFacilitator !== "all" && facilitatorLabel !== eventFacilitator) {
        return false;
      }

      if (eventTag !== "all") {
        const eventTerms = termsFromEvent(event).map(normalizeText);
        if (!eventTerms.includes(normalizeText(eventTag))) return false;
      }

      const startsAt = safeDate(event.startsAt);
      if (start && (!startsAt || startsAt < start)) return false;
      if (end && (!startsAt || startsAt > end)) return false;

      return true;
    });
  }, [eventDateEnd, eventDateStart, eventFacilitator, eventRegion, eventTag, events]);

  const demandSupplyRows = useMemo(() => {
    const scopedLeads = leads.filter((lead) => {
      if (lead.role !== "member") return false;
      if (eventRegion !== "all" && toRegionKey(lead.regionKey || lead.region) !== eventRegion) {
        return false;
      }
      return true;
    });

    const demandMap = new Map();
    scopedLeads.forEach((lead) => {
      demandTermsForLead(lead).forEach((term) => {
        const key = normalizeText(term);
        demandMap.set(key, {
          label: titleCase(term),
          count: (demandMap.get(key)?.count || 0) + 1,
        });
      });
    });

    const supplyEvents = filteredEvents.filter((event) =>
      eventRegion === "all"
        ? true
        : toRegionKey(event.regionKey || event.region) === eventRegion
    );

    const rows = [...demandMap.entries()]
      .map(([key, value]) => {
        const supplyCount = supplyEvents.filter((event) =>
          termsFromEvent(event).some((term) => normalizeText(term) === key)
        ).length;

        return {
          termKey: key,
          termLabel: value.label,
          demandCount: value.count,
          supplyCount,
          gap: value.count > 0 && supplyCount === 0,
        };
      })
      .sort((a, b) => b.demandCount - a.demandCount)
      .slice(0, 12);

    return rows;
  }, [eventRegion, filteredEvents, leads]);

  const launchCards = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * ONE_DAY_MS);

    return regions.map((region) => {
      const regionParticipants = leads.filter(
        (lead) =>
          lead.role === "member" &&
          toRegionKey(lead.regionKey || lead.region) === toRegionKey(region)
      );
      const regionFacilitators = leads.filter(
        (lead) =>
          lead.role === "host" &&
          toRegionKey(lead.regionKey || lead.region) === toRegionKey(region)
      );

      const regionEvents = events.filter(
        (event) =>
          toRegionKey(event.regionKey || event.region) === toRegionKey(region)
      );
      const facilitatorsTotal = regionFacilitators.length;

      const demandMap = new Map();
      regionParticipants.forEach((lead) => {
        demandTermsForLead(lead).forEach((term) => {
          const key = normalizeText(term);
          demandMap.set(key, {
            key,
            label: titleCase(term),
            count: (demandMap.get(key)?.count || 0) + 1,
          });
        });
      });

      const topDemand = [...demandMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const coverageCount = topDemand.filter((demand) =>
        regionEvents.some((event) =>
          termsFromEvent(event).some((term) => normalizeText(term) === demand.key)
        )
      ).length;

      const eventCoveragePct =
        topDemand.length > 0 ? coverageCount / topDemand.length : 0;

      const firstMonthEvents = regionEvents.filter((event) => {
        const startsAt = safeDate(event.startsAt);
        return startsAt && startsAt >= today && startsAt <= nextMonth;
      }).length;

      const facilitatorChecklist = facilitatorsTotal >= 10;
      const coverageChecklist = topDemand.length >= 3 && coverageCount >= 3;
      const participantChecklist = regionParticipants.length >= participantThreshold;
      const eventChecklist = firstMonthEvents >= 5;

      const checklistCount = [
        facilitatorChecklist,
        coverageChecklist,
        participantChecklist,
        eventChecklist,
      ].filter(Boolean).length;

      const status =
        checklistCount === 4
          ? "Ready to Launch"
          : checklistCount >= 2
            ? "Getting Close"
            : "Not Ready";

      const ratio =
        facilitatorsTotal > 0
          ? regionParticipants.length / facilitatorsTotal
          : regionParticipants.length;

      const thirtyDaysAgo = new Date(today.getTime() - 30 * ONE_DAY_MS);
      const facilitatorLast30 = regionFacilitators.filter((lead) => {
        const createdAt = safeDate(lead.createdAt);
        return createdAt && createdAt >= thirtyDaysAgo;
      }).length;
      const facilitatorRatePerDay = facilitatorLast30 / 30;
      const missingToTen = Math.max(10 - facilitatorsTotal, 0);

      let projection = "Insufficient trend data";
      if (missingToTen === 0) {
        projection = "Threshold already met";
      } else if (facilitatorRatePerDay > 0) {
        const daysToTarget = Math.ceil(missingToTen / facilitatorRatePerDay);
        const projectedDate = new Date(today.getTime() + daysToTarget * ONE_DAY_MS);
        projection = projectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      return {
        region,
        participants: regionParticipants.length,
        facilitatorSignups: regionFacilitators.length,
        facilitatorsTotal,
        ratio,
        eventCoveragePct,
        topDemand,
        firstMonthEvents,
        status,
        checklist: {
          facilitatorChecklist,
          coverageChecklist,
          participantChecklist,
          eventChecklist,
        },
        projection,
      };
    });
  }, [events, leads, participantThreshold, regions]);

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          dir: current.dir === "asc" ? "desc" : "asc",
        };
      }

      return { key, dir: "asc" };
    });
  };

  const exportCsv = () => {
    const csv = buildCsv(filteredUserRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "nature-club-signups.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateEvent = (eventId, patch) => {
    setEvents((current) =>
      current.map((event) =>
        event.eventId === eventId
          ? {
              ...event,
              ...patch,
            }
          : event
      )
    );
  };

  const saveEvent = async (event) => {
    setSavingEventId(event.eventId);
    try {
      const payload = {
        action: "update",
        eventId: event.eventId,
        tags: asArray(event.tags),
        themes: asArray(event.themes),
        region: `${event.region || ""}`.trim(),
        facilitatorName: `${event.facilitatorName || ""}`.trim(),
        facilitatorEmail: `${event.facilitatorEmail || ""}`.trim(),
        startsAt: event.startsAt ? new Date(event.startsAt).toISOString() : "",
      };

      const data = await apiClient.post("/admin/events", payload);
      if (data?.event) {
        updateEvent(event.eventId, data.event);
      }
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save event changes.");
    } finally {
      setSavingEventId("");
    }
  };

  const facilitatorColorClass = (count) => {
    if (count < 5) return "text-white bg-black";
    if (count < 10) return "!text-black !bg-white";
    if (count <= 20) return "!text-black !bg-white";
    return "!text-black !bg-white";
  };

  return (
    <div className="min-h-screen bg-black px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className={sectionClass}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white">
                Nature Club Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
                Region Launch Control Center
              </h1>
              <p className="mt-2 text-sm text-white">
                Source of truth: Mongo signup answers + event planning metadata.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-full border border-white !bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-black"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <p className="text-xs text-white">
                Updated: {formatDate(lastUpdated)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {DASHBOARD_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
        </header>

        {error ? (
          <div className="rounded-xl border border-white bg-black px-4 py-3 text-sm text-white">
            {error}
          </div>
        ) : null}

        {activeTab === "users" ? (
          <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className={`${sectionClass} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Filters
              </h2>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Region</label>
                <select
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                >
                  <option value="all">All regions</option>
                  {regions.map((region) => (
                    <option key={region} value={toRegionKey(region)}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Role</label>
                <select
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="both">Participant + Facilitator</option>
                  <option value="participant">Participant</option>
                  <option value="facilitator">Facilitator</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-white">
                    Signed from
                  </label>
                  <input
                    type="date"
                    value={userDateStart}
                    onChange={(e) => setUserDateStart(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-white">
                    Signed to
                  </label>
                  <input
                    type="date"
                    value={userDateEnd}
                    onChange={(e) => setUserDateEnd(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">
                  Question filter
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                  value={questionFilterKey}
                  onChange={(e) => setQuestionFilterKey(e.target.value)}
                >
                  <option value="all">Any question</option>
                  {QUESTION_FILTERS.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="e.g. yoga"
                  value={questionFilterValue}
                  onChange={(e) => setQuestionFilterValue(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Mode</label>
                <div className="mt-2 flex gap-2">
                  {USER_VIEW_MODES.map((mode) => (
                    <TabButton
                      key={mode.id}
                      active={usersMode === mode.id}
                      onClick={() => setUsersMode(mode.id)}
                    >
                      {mode.label}
                    </TabButton>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserRegion("all");
                  setUserRole("both");
                  setUserDateStart("");
                  setUserDateEnd("");
                  setQuestionFilterKey("all");
                  setQuestionFilterValue("");
                }}
                className="w-full rounded-lg border border-white !bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-black"
              >
                Clear Filters
              </button>
            </aside>

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <StatBlock
                  label="Total Signups"
                  value={formatNumber(userSummary.total)}
                  helper="After active filters"
                />
                <StatBlock
                  label="Signups This Week"
                  value={formatNumber(userSummary.weekCount)}
                  helper="Last 7 days"
                />
                <StatBlock
                  label="Participants"
                  value={formatNumber(userSummary.participantCount)}
                />
                <StatBlock
                  label="Facilitators"
                  value={formatNumber(userSummary.facilitatorCount)}
                />
                <StatBlock
                  label="Visit → Signup"
                  value={formatPercent(userSummary.conversion)}
                  helper={`Visits tracked: ${formatNumber(visitsTotal)}`}
                />
                <StatBlock
                  label="Clicks"
                  value={formatNumber(clicks.total)}
                  helper={`Participant: ${formatNumber(clicks.participant)} / Facilitator: ${formatNumber(clicks.facilitator)}`}
                />
              </div>

              {usersMode === "table" ? (
                <div className={sectionClass}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-white">
                      {formatNumber(filteredUserRows.length)} users in view
                    </p>
                    <button
                      type="button"
                      onClick={exportCsv}
                      className="rounded-full border border-white !bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-black"
                    >
                      Export CSV
                    </button>
                  </div>

                  <div className="overflow-auto rounded-xl border border-white">
                    <table className="min-w-full text-left text-xs text-white">
                      <thead className="!bg-white !text-black">
                        <tr>
                          {TABLE_COLUMNS.map((column) => (
                            <th
                              key={column.id}
                              className={`px-3 py-2 align-top ${
                                column.isQuestion ? "min-w-[220px]" : "min-w-[120px]"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSort(column.id)}
                                className="inline-flex items-start gap-2 text-left font-semibold leading-tight whitespace-normal"
                              >
                                {column.label}
                                {sortConfig.key === column.id ?
                                  (sortConfig.dir === "asc" ? "↑" : "↓") : null}
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUserRows.length ? (
                          filteredUserRows.map((row) => (
                            <tr key={row.id} className="border-t border-white align-top">
                              {TABLE_COLUMNS.map((column) => {
                                const rawValue = row[column.id];
                                const value =
                                  column.id === "signedAt"
                                    ? formatDate(rawValue)
                                    : valuesToString(rawValue);
                                return (
                                  <td
                                    key={column.id}
                                    className={`px-3 py-2 align-top ${
                                      column.isQuestion
                                        ? "max-w-[260px] whitespace-normal break-words"
                                        : "whitespace-nowrap"
                                    }`}
                                  >
                                    {value}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={TABLE_COLUMNS.length} className="px-3 py-4 text-center">
                              No signups match current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {analyticsCards.map((card) => (
                    <div key={card.id} className={sectionClass}>
                      <p className="text-xs uppercase tracking-[0.2em] text-white">
                        {card.label}
                      </p>
                      <p className="mt-2 text-sm text-white">
                        Respondents: {formatNumber(card.respondentCount)}
                      </p>
                      <div className="mt-3">
                        <HorizontalBars rows={card.rows} total={card.totalResponses} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "events" ? (
          <section className="space-y-5">
            <div className={`${sectionClass} grid gap-4 md:grid-cols-5`}>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Region</label>
                <select
                  value={eventRegion}
                  onChange={(e) => setEventRegion(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                >
                  <option value="all">All regions</option>
                  {regions.map((region) => (
                    <option key={region} value={toRegionKey(region)}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Tag / Theme</label>
                <select
                  value={eventTag}
                  onChange={(e) => setEventTag(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                >
                  <option value="all">All tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Facilitator</label>
                <select
                  value={eventFacilitator}
                  onChange={(e) => setEventFacilitator(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                >
                  <option value="all">All facilitators</option>
                  {facilitators.map((facilitator) => (
                    <option key={facilitator} value={facilitator}>
                      {facilitator}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Date from</label>
                <input
                  type="date"
                  value={eventDateStart}
                  onChange={(e) => setEventDateStart(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-white">Date to</label>
                <input
                  type="date"
                  value={eventDateEnd}
                  onChange={(e) => setEventDateEnd(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => {
                const eventRegionLabel = normalizeRegionDisplay(event.region) || "Unknown";
                const eventTags = termsFromEvent(event);
                return (
                  <article key={event.eventId} className={`${sectionClass} space-y-3`}>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white">
                        {eventRegionLabel}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{event.title}</h3>
                      <p className="mt-1 text-xs text-white">{event.eventId}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {eventTags.length ? (
                        eventTags.map((tag) => (
                          <span key={`${event.eventId}-${tag}`} className="rounded-full border border-white px-2 py-1 text-[11px] text-white">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white">No tags yet</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <input
                        type="text"
                        value={event.region || ""}
                        onChange={(e) => updateEvent(event.eventId, { region: e.target.value })}
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                        placeholder="Region"
                      />
                      <input
                        type="text"
                        value={event.facilitatorName || ""}
                        onChange={(e) =>
                          updateEvent(event.eventId, { facilitatorName: e.target.value })
                        }
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                        placeholder="Facilitator name"
                      />
                      <input
                        type="email"
                        value={event.facilitatorEmail || ""}
                        onChange={(e) =>
                          updateEvent(event.eventId, { facilitatorEmail: e.target.value })
                        }
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                        placeholder="Facilitator email"
                      />
                      <input
                        type="datetime-local"
                        value={formatDateTimeInput(event.startsAt)}
                        onChange={(e) => updateEvent(event.eventId, { startsAt: e.target.value })}
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={asArray(event.tags).join(", ")}
                        onChange={(e) =>
                          updateEvent(event.eventId, { tags: parseTagsInput(e.target.value) })
                        }
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                        placeholder="Tags (comma separated)"
                      />
                      <input
                        type="text"
                        value={asArray(event.themes).join(", ")}
                        onChange={(e) =>
                          updateEvent(event.eventId, { themes: parseTagsInput(e.target.value) })
                        }
                        className="w-full rounded-lg border border-white bg-black px-3 py-2 text-xs text-white"
                        placeholder="Themes (comma separated)"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-white">{formatDate(event.startsAt)}</p>
                      <button
                        type="button"
                        onClick={() => saveEvent(event)}
                        className="rounded-full border border-white !bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] !text-black"
                        disabled={savingEventId === event.eventId}
                      >
                        {savingEventId === event.eventId ? "Saving" : "Save"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={sectionClass}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Demand vs Supply Heatmap
              </h3>
              <p className="mt-1 text-xs text-white">
                What signups want vs what events currently offer in selected region.
              </p>

              <div className="mt-4 overflow-auto rounded-xl border border-white">
                <table className="min-w-full text-left text-xs text-white">
                  <thead className="!bg-white !text-black">
                    <tr>
                      <th className="px-3 py-2">Activity</th>
                      <th className="px-3 py-2">Demand (signups)</th>
                      <th className="px-3 py-2">Supply (events)</th>
                      <th className="px-3 py-2">Gap Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandSupplyRows.length ? (
                      demandSupplyRows.map((row) => (
                        <tr key={row.termKey} className="border-t border-white">
                          <td className="px-3 py-2">{row.termLabel}</td>
                          <td className="px-3 py-2">{formatNumber(row.demandCount)}</td>
                          <td className="px-3 py-2">{formatNumber(row.supplyCount)}</td>
                          <td className="px-3 py-2">
                            {row.gap ? "Gap: unmet demand" : "Covered"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center">
                          No demand/supply overlap data for current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "launch" ? (
          <section className="space-y-5">
            <div className={sectionClass}>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white">
                  Participant threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={participantThreshold}
                  onChange={(e) =>
                    setParticipantThreshold(Math.max(Number(e.target.value) || 0, 0))
                  }
                  className="w-24 rounded-lg border border-white bg-black px-3 py-2 text-sm text-white"
                />
                <span className="text-xs text-white">
                  Used for readiness checklist per region.
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {launchCards.map((card) => {
                const facilitatorColor = facilitatorColorClass(card.facilitatorsTotal);
                return (
                  <article key={card.region} className={`${sectionClass} space-y-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white">
                          Region
                        </p>
                        <h3 className="text-xl font-semibold text-white">{card.region}</h3>
                      </div>
                      <span
                        className={`rounded-full border border-white px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          card.status === "Ready to Launch"
                            ? "!bg-white !text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <div className={`rounded-xl border border-white px-4 py-3 ${facilitatorColor}`}>
                      <p className="text-xs uppercase tracking-[0.2em]">Facilitators</p>
                      <p className="mt-1 text-3xl font-semibold">
                        {formatNumber(card.facilitatorsTotal)}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm text-white sm:grid-cols-2">
                      <div className="rounded-lg border border-white p-3">
                        <p className="text-xs uppercase tracking-[0.2em]">Facilitator Signups</p>
                        <p className="mt-1">{formatNumber(card.facilitatorSignups)}</p>
                      </div>
                      <div className="rounded-lg border border-white p-3">
                        <p className="text-xs uppercase tracking-[0.2em]">Participants</p>
                        <p className="mt-1">{formatNumber(card.participants)}</p>
                      </div>
                      <div className="rounded-lg border border-white p-3">
                        <p className="text-xs uppercase tracking-[0.2em]">P:F Ratio</p>
                        <p className="mt-1">{card.ratio.toFixed(1)} : 1</p>
                      </div>
                      <div className="rounded-lg border border-white p-3">
                        <p className="text-xs uppercase tracking-[0.2em]">Event Coverage</p>
                        <p className="mt-1">{formatPercent(card.eventCoveragePct)}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white p-3 text-xs text-white">
                      <p className="mb-2 uppercase tracking-[0.2em]">Launch Criteria</p>
                      <ul className="space-y-1">
                        <li>{card.checklist.facilitatorChecklist ? "☑" : "☐"} 10-20 facilitators</li>
                        <li>{card.checklist.coverageChecklist ? "☑" : "☐"} Top 3 requested activities covered</li>
                        <li>{card.checklist.participantChecklist ? "☑" : "☐"} Participant threshold reached</li>
                        <li>{card.checklist.eventChecklist ? "☑" : "☐"} 5 events scheduled first month</li>
                      </ul>
                    </div>

                    {card.status === "Ready to Launch" ? (
                      <div className="rounded-lg border border-white !bg-white px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] !text-black">
                        Ready to Launch
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className={sectionClass}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Facilitator Projection Timeline
              </h3>
              <p className="mt-1 text-xs text-white">
                At current signup rate, projected date each region reaches 10 facilitators.
              </p>

              <div className="mt-4 overflow-auto rounded-xl border border-white">
                <table className="min-w-full text-left text-xs text-white">
                  <thead className="!bg-white !text-black">
                    <tr>
                      <th className="px-3 py-2">Region</th>
                      <th className="px-3 py-2">Current Facilitators</th>
                      <th className="px-3 py-2">Projected 10 Facilitators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {launchCards.map((card) => (
                      <tr key={`projection-${card.region}`} className="border-t border-white">
                        <td className="px-3 py-2">{card.region}</td>
                        <td className="px-3 py-2">{formatNumber(card.facilitatorsTotal)}</td>
                        <td className="px-3 py-2">{card.projection}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
