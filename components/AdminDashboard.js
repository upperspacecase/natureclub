"use client";

import { useMemo, useState } from "react";
import apiClient from "@/libs/api";
import { THEMES } from "@/data/events";

const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "-";

const formatPercent = (value) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-";

const formatDuration = (durationMs) => {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return "-";
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

const formatAnswer = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (value === null || value === undefined || value === "") return "-";
  return `${value}`;
};

const sumValues = (items) => items.reduce((sum, item) => sum + item.value, 0);

const buildDonutData = (items, limit = 5) => {
  if (!items?.length) return [];
  const sliced = items.slice(0, limit);
  const remainder = items.slice(limit);
  const remainderCount = sumValues(remainder);
  if (remainderCount > 0) {
    return [...sliced, { label: "Other", value: remainderCount }];
  }
  return sliced;
};

const BarChart = ({ data, barClass, labelClass }) => {
  if (!data?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-black/5 text-xs text-black/50">
        No data yet
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const barWidth = 100 / data.length;
  const labelStep = data.length > 8 ? Math.ceil(data.length / 6) : 1;

  return (
    <svg viewBox="0 0 100 52" className="h-32 w-full">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 32;
        const x = index * barWidth + barWidth * 0.15;
        const width = barWidth * 0.7;
        const y = 36 - height;
        const showLabel = index % labelStep === 0 || index === data.length - 1;
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx="2"
              className={barClass}
            />
            {showLabel && (
              <text
                x={x + width / 2}
                y={48}
                textAnchor="middle"
                className={labelClass}
              >
                {item.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-black/5 text-xs text-black/50">
        No data yet
      </div>
    );
  }

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 60 60" className="h-32 w-32">
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="8"
      />
      {data.map((item, index) => {
        const value = item.value / total;
        const dash = value * circumference;
        const dashOffset = circumference - offset;
        offset += dash;
        return (
          <circle
            key={item.label}
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 30 30)"
          />
        );
      })}
    </svg>
  );
};

const StatCard = ({ label, value, helper }) => (
  <div className="rounded-3xl border border-black/10 bg-white p-5 text-black shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
    <p className="text-xs uppercase tracking-[0.2em] text-black/50">
      {label}
    </p>
    <p className="mt-3 text-3xl font-semibold text-black">
      {value}
    </p>
    {helper && <p className="mt-2 text-xs text-black/60">{helper}</p>}
  </div>
);

const AdminDashboard = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const defaultStart = useMemo(() => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29);
    return date.toISOString().slice(0, 10);
  }, []);

  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeStart, setRangeStart] = useState(defaultStart);
  const [rangeEnd, setRangeEnd] = useState(todayKey);
  const [granularity, setGranularity] = useState("day");
  const [leadOffset, setLeadOffset] = useState(0);
  const leadLimit = 50;
  const [signupTab, setSignupTab] = useState("member");
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState("");
  const [eventsLoading, setEventsLoading] = useState(false);
  const [savingEventId, setSavingEventId] = useState("");

  const conversionRate =
    metrics && metrics.visitsTotal
      ? metrics.signupsTotal / metrics.visitsTotal
      : null;

  const memberCountryChart = metrics
    ? buildDonutData(
        metrics.membersByCountry.map((item) => ({
          label: item.country,
          value: item.count,
        }))
      )
    : [];

  const hostCountryChart = metrics
    ? buildDonutData(
        metrics.hostsByCountry.map((item) => ({
          label: item.country,
          value: item.count,
        }))
      )
    : [];

  const likesMap = metrics
    ? metrics.likesByEvent.reduce((acc, item) => {
        acc[item.eventId] = item.count;
        return acc;
      }, {})
    : {};

  const memberColumns = [
    { key: "date", label: "Date" },
    { key: "email", label: "Email" },
    { key: "location", label: "Location" },
    { key: "interests", label: "Interests" },
    { key: "interestsOther", label: "Interests Other" },
    { key: "interestThemes", label: "Themes" },
    { key: "motivations", label: "Motivations" },
    { key: "motivationsOther", label: "Motivations Other" },
    { key: "pricingSelections", label: "Pricing" },
  ];

  const hostColumns = [
    { key: "date", label: "Date" },
    { key: "email", label: "Email" },
    { key: "location", label: "Location" },
    { key: "sessionsPerMonth", label: "Sessions / Month" },
    { key: "bookingsPerSession", label: "Bookings / Session" },
    { key: "rate", label: "Rate" },
    { key: "rateRange", label: "Rate Range" },
    { key: "tools", label: "Tools" },
    { key: "toolsOther", label: "Tools Other" },
    { key: "features", label: "Features" },
    { key: "featuresOther", label: "Features Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEventsError("");
    try {
      const data = await apiClient.post("/admin/metrics", {
        password,
        rangeStart: granularity === "all" ? null : rangeStart,
        rangeEnd: granularity === "all" ? null : rangeEnd,
        granularity,
        leadOffset,
        leadLimit,
      });
      setMetrics(data);
      await fetchEvents();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!password) return;
    setEventsLoading(true);
    try {
      const data = await apiClient.post("/admin/events", {
        password,
        action: "list",
      });
      setEvents(data.events || []);
    } catch (error) {
      console.error(error);
      setEventsError("Unable to load events.");
    } finally {
      setEventsLoading(false);
    }
  };

  const updateEventTags = (eventId, value) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.eventId === eventId
          ? {
              ...event,
              tags: value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }
          : event
      )
    );
  };

  const toggleEventTheme = (eventId, themeId) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.eventId !== eventId) return event;
        const themes = new Set(event.themes || []);
        if (themes.has(themeId)) {
          themes.delete(themeId);
        } else {
          themes.add(themeId);
        }
        return { ...event, themes: Array.from(themes) };
      })
    );
  };

  const saveEvent = async (event) => {
    if (!password) return;
    setSavingEventId(event.eventId);
    try {
      const data = await apiClient.post("/admin/events", {
        password,
        action: "update",
        eventId: event.eventId,
        tags: event.tags || [],
        themes: event.themes || [],
      });
      setEvents((prev) =>
        prev.map((item) => (item.eventId === event.eventId ? data.event : item))
      );
    } catch (error) {
      console.error(error);
      setEventsError("Unable to save event updates.");
    } finally {
      setSavingEventId("");
    }
  };

  const handlePageChange = async (nextOffset) => {
    if (!metrics) return;
    setIsLoading(true);
    try {
      const data = await apiClient.post("/admin/metrics", {
        password,
        rangeStart: granularity === "all" ? null : rangeStart,
        rangeEnd: granularity === "all" ? null : rangeEnd,
        granularity,
        leadOffset: nextOffset,
        leadLimit,
      });
      setLeadOffset(nextOffset);
      setMetrics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    if (!password) return;
    try {
      await apiClient.post("/admin/reset-metrics", { password });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-16 text-black md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-black/50">
              Admin panel
            </p>
            <h1 className="mt-3 text-4xl font-serif text-black">
              Nature Club Metrics
            </h1>
            <p className="mt-2 text-sm text-black/60">
              MVP performance and waitlist intelligence.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white px-5 py-4 text-black/80">
            <p className="text-xs uppercase tracking-[0.2em] text-black/60">
              Access
            </p>
            <p className="mt-2 text-sm">Password required</p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-[32px] border border-black/10 bg-white p-6 text-black/80 shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.2em] text-black/50">
                Admin password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-2 w-full rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black"
                required
              />
            </div>
            <button
              className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load dashboard"}
            </button>
              </div>

            <div className="grid gap-4 rounded-[32px] border border-black/10 bg-white p-6 text-black/80 shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="grid gap-3 md:grid-cols-4">
                <label className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Admin password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-2 w-full rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load dashboard"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-black/20 bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Reset all metrics
              </button>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/50">
                Range end
              </label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="mt-2 w-full rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black"
                disabled={granularity === "all"}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/50">
                Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="mt-2 w-full rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
              </form>
            </div>

          {metrics && (
            <section className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60">
                  Signup answers
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatNumber(metrics.leadsTotal)} total
                </p>
                <div className="mt-4 flex items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(leadOffset - leadLimit, 0))}
                    className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                    disabled={leadOffset === 0 || isLoading}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(leadOffset + leadLimit)}
                    className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                    disabled={leadOffset + leadLimit >= metrics.leadsTotal || isLoading}
                  >
                    Next
                  </button>
                </div>
              </div>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Users" value={formatNumber(metrics.usersTotal)} />
                <StatCard label="Visits" value={formatNumber(metrics.visitsTotal)} />
                <StatCard label="Visits today" value={formatNumber(metrics.visitsToday)} />
                <StatCard label="Time on page" value={formatDuration(metrics.avgTimeOnPageMs)} helper={
                  metrics.timeOnPageCount
                    ? `${formatNumber(metrics.timeOnPageCount)} sessions`
                    : "No sessions yet"
                } />
                <StatCard label="Conversion" value={formatPercent(conversionRate)} helper="Signups / visits" />
              </div>

          {metrics && (
            <section className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60">
                  Metrics
                </p>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="rounded-full border border-black/20 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-black disabled:opacity-40"
                  disabled={eventsLoading}
                >
                  {eventsLoading ? "Refreshing..." : "Refresh events"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-black/20 bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Reset all metrics
                </button>
              </div>
            </section>

          {metrics && (
            <section className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60">
                  Signup answers
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatNumber(metrics.leadsTotal)} total
                </p>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(leadOffset - leadLimit, 0))}
                  className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset === 0 || isLoading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(leadOffset + leadLimit)}
                  className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset + leadLimit >= metrics.leadsTotal || isLoading}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-black/20 bg-black/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSignupTab("member")}
                className={`rounded-full px-4 py-2 uppercase tracking-[0.2em] ${
                  signupTab === "member"
                    ? "bg-black text-white"
                    : "text-black/70"
                }`}
              >
                Members
              </button>
              <button
                type="button"
                onClick={() => setSignupTab("host")}
                className={`rounded-full px-4 py-2 uppercase tracking-[0.2em] ${
                  signupTab === "host"
                    ? "bg-black text-white"
                    : "text-black/70"
                }`}
              >
                Hosts
              </button>
            </div>
              <div className="grid gap-4 rounded-[32px] border border-black/10 bg-white p-6 text-black/80 shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60">
                  Metrics
                </p>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="rounded-full border border-black/20 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-black disabled:opacity-40"
                  disabled={eventsLoading}
                >
                  {eventsLoading ? "Refreshing..." : "Refresh events"}
                </button>
              </div>
            </div>
            </div>
            </div>

        {metrics && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  Signups trend
                </p>
                <p className="mt-4 text-4xl font-semibold">
                  {formatNumber(metrics.signupsTotal)}
                </p>
                <p className="mt-2 text-sm text-black/70">
                  Conversion: {formatPercent(conversionRate)}
                </p>
                <div className="mt-6 h-28 rounded-2xl bg-black/5 p-3">
                  <BarChart
                    data={metrics.signupsSeries}
                    barClass="fill-black"
                    labelClass="fill-black text-[6px]"
                  />
                </div>
              </div>

              <div className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  Visits trend
                </p>
                <p className="mt-4 text-3xl font-semibold">
                  {formatNumber(metrics.visitsTotal)}
                </p>
                <p className="mt-2 text-sm text-black/70">
                  Today: {formatNumber(metrics.visitsToday)}
                </p>
                <div className="mt-6 h-28 rounded-2xl bg-black/5 p-3">
                  <BarChart
                    data={metrics.visitsSeries}
                    barClass="fill-black"
                    labelClass="fill-black text-[6px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Users" value={formatNumber(metrics.usersTotal)} />
              <StatCard label="Visits" value={formatNumber(metrics.visitsTotal)} />
              <StatCard label="Visits today" value={formatNumber(metrics.visitsToday)} />
              <StatCard
                label="Time on page"
                value={formatDuration(metrics.avgTimeOnPageMs)}
                helper={
                  metrics.timeOnPageCount
                    ? `${formatNumber(metrics.timeOnPageCount)} sessions`
                    : "No sessions yet"
                }
              />
              <StatCard
                label="Conversion"
                value={formatPercent(conversionRate)}
                helper="Signups / visits"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  Demand metrics
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <div className="h-28 rounded-2xl bg-black/5 p-3">
                      <BarChart
                        data={[
                          {
                            label: "Members",
                            value: metrics.signupsMember,
                          },
                          {
                            label: "Clicks",
                            value: metrics.memberClicksTotal,
                          },
                        ]}
                        barClass="fill-black"
                        labelClass="fill-black text-[6px]"
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-black/70">Member signups</span>
                        <span className="text-black">
                          {formatNumber(metrics.signupsMember)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-black/70">Member clicks</span>
                        <span className="text-black">
                          {formatNumber(metrics.memberClicksTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                      Members by country
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <DonutChart
                        data={memberCountryChart}
                        colors={[
                          "#000000",
                          "#444444",
                          "#666666",
                          "#999999",
                          "#CCCCCC",
                        ]}
                      />
                      <div className="space-y-1 text-xs text-black/70">
                        {memberCountryChart.length ? (
                          memberCountryChart.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between gap-4"
                            >
                              <span>{item.label}</span>
                              <span className="text-black">
                                {formatNumber(item.value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-black/50">
                            No country data yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  Supply metrics
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <div className="h-28 rounded-2xl bg-black/5 p-3">
                      <BarChart
                        data={[
                          {
                            label: "Hosts",
                            value: metrics.signupsHost,
                          },
                          {
                            label: "Clicks",
                            value: metrics.hostClicksTotal,
                          },
                        ]}
                        barClass="fill-black"
                        labelClass="fill-black text-[6px]"
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-black/70">Host signups</span>
                        <span className="text-black">
                          {formatNumber(metrics.signupsHost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-black/70">Host clicks</span>
                        <span className="text-black">
                          {formatNumber(metrics.hostClicksTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                      Hosts by country
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <DonutChart
                        data={hostCountryChart}
                        colors={[
                          "#000000",
                          "#444444",
                          "#666666",
                          "#999999",
                          "#CCCCCC",
                        ]}
                      />
                      <div className="space-y-1 text-xs text-black/70">
                        {hostCountryChart.length ? (
                          hostCountryChart.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between gap-4"
                            >
                              <span>{item.label}</span>
                              <span
                                className={
                                  item.value >= 10
                                    ? "text-black"
                                    : "text-black"
                                }
                              >
                                {formatNumber(item.value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-black/50">
                            No country data yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {metrics && (
          <section className="rounded-[32px] border border-black/10 bg-white p-6 text-black shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                  Signup answers
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatNumber(metrics.leadsTotal)} total
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-black/70">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(leadOffset - leadLimit, 0))}
                  className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset === 0 || isLoading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(leadOffset + leadLimit)}
                  className="rounded-full border border-black/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset + leadLimit >= metrics.leadsTotal || isLoading}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-black/20 bg-black/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSignupTab("member")}
                className={`rounded-full px-4 py-2 uppercase tracking-[0.2em] ${
                  signupTab === "member"
                    ? "bg-black text-white"
                    : "text-black/70"
                }`}
              >
                Members
              </button>
              <button
                type="button"
                onClick={() => setSignupTab("host")}
                className={`rounded-full px-4 py-2 uppercase tracking-[0.2em] ${
                  signupTab === "host"
                    ? "bg-black text-white"
                    : "text-black/70"
                }`}
              >
                Hosts
              </button>
            </div>

            <div className="mt-6 overflow-auto rounded-2xl border border-black/10">
              <table className="min-w-full text-left text-sm text-black/80">
                <thead className="bg-black/5 text-xs uppercase tracking-[0.2em] text-black/50">
                  <tr>
                    {(signupTab === "member" ? memberColumns : hostColumns).map(
                      (column) => (
                        <th key={column.key} className="px-4 py-3">
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {metrics.leads.filter((lead) => lead.role === signupTab)
                    .length ? (
                    metrics.leads
                      .filter((lead) => lead.role === signupTab)
                      .map((lead) => {
                      const responses = lead.responses || {};
                      const location = responses.location || {};
                      const locationValue =
                        location.city || location.coords || "-";
                      const rowValues = {
                        date: new Date(lead.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }),
                        email: lead.email,
                        location: locationValue,
                        interests: formatAnswer(responses.interests),
                        interestsOther: formatAnswer(responses.interestsOther),
                        interestThemes: formatAnswer(responses.interestThemes),
                        motivations: formatAnswer(responses.motivations),
                        motivationsOther: formatAnswer(responses.motivationsOther),
                        pricingSelections: formatAnswer(responses.pricingSelections),
                        sessionsPerMonth: formatAnswer(responses.sessionsPerMonth),
                        bookingsPerSession: formatAnswer(responses.bookingsPerSession),
                        rate: formatAnswer(responses.rate),
                        rateRange: formatAnswer(responses.rateRange),
                        tools: formatAnswer(responses.tools),
                        toolsOther: formatAnswer(responses.toolsOther),
                        features: formatAnswer(responses.features),
                        featuresOther: formatAnswer(responses.featuresOther),
                      };
                        return (
                          <tr key={lead._id} className="border-t border-black/10">
                            {(signupTab === "member"
                              ? memberColumns
                              : hostColumns
                            ).map((column) => (
                              <td key={column.key} className="px-4 py-3 text-xs">
                                {rowValues[column.key]}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-3 text-xs text-black/50"
                        colSpan={
                          signupTab === "member"
                            ? memberColumns.length
                            : hostColumns.length
                        }
                      >
                        No submissions for this role.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {metrics && (
          <section className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-white shadow-[0_30px_70px_rgba(16,10,32,0.35)]">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Events
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Likes, tags, and themes
                </p>
              </div>
              <button
                type="button"
                onClick={fetchEvents}
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 disabled:opacity-40"
                disabled={eventsLoading}
              >
                {eventsLoading ? "Refreshing..." : "Refresh events"}
              </button>
            </div>

            {eventsError && (
              <p className="mt-4 text-sm text-rose-200">{eventsError}</p>
            )}

            <div className="mt-6 overflow-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm text-white/80">
                <thead className="bg-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Likes</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Themes</th>
                    <th className="px-4 py-3">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length ? (
                    events.map((event) => (
                      <tr key={event.eventId} className="border-t border-white/10">
                        <td className="px-4 py-3 text-sm text-white">
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-xs text-white/50">{event.eventId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70">
                          {formatNumber(likesMap[event.eventId] || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={(event.tags || []).join(", ")}
                            onChange={(e) =>
                              updateEventTags(event.eventId, e.target.value)
                            }
                            className="w-64 rounded-full border border-white/20 bg-white/90 px-3 py-2 text-xs text-black"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {THEMES.map((theme) => {
                              const isActive = (event.themes || []).includes(
                                theme.id
                              );
                              return (
                                <button
                                  key={`${event.eventId}-${theme.id}`}
                                  type="button"
                                  onClick={() =>
                                    toggleEventTheme(event.eventId, theme.id)
                                  }
                                  className={`rounded-full border px-3 py-1 text-xs transition ${
                                    isActive
                                      ? "border-white bg-white text-[#2E2A3D]"
                                      : "border-white/20 text-white/70 hover:border-white"
                                  }`}
                                >
                                  {theme.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => saveEvent(event)}
                            className="rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-40"
                            disabled={savingEventId === event.eventId}
                          >
                            {savingEventId === event.eventId ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-3 text-sm text-white/60" colSpan={5}>
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Likes by theme
              </p>
              <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-left text-sm text-white/80">
                  <thead className="bg-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
                    <tr>
                      <th className="px-4 py-3">Theme</th>
                      <th className="px-4 py-3">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.likesByTheme.length ? (
                      metrics.likesByTheme.map((theme) => (
                        <tr key={theme.themeId} className="border-t border-white/10">
                          <td className="px-4 py-3 text-sm text-white">
                            {theme.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/70">
                            {formatNumber(theme.count)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-sm text-white/60" colSpan={2}>
                          No likes yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
