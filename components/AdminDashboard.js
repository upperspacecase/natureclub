"use client";

import { useMemo, useState } from "react";
import apiClient from "@/libs/api";

const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "-";

const formatPercent = (value) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-";

const formatResponsePreview = (responses) => {
  if (!responses || typeof responses !== "object") return "-";
  const entries = Object.entries(responses)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
      if (typeof value === "object") return `${key}: ${JSON.stringify(value)}`;
      return `${key}: ${value}`;
    });
  return entries.length ? entries.join(" · ") : "-";
};

const LineChart = ({ data, accentClass, fillClass }) => {
  if (!data?.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-white/40 text-xs text-base-content/50">
        No data yet
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 100;
    const y = 40 - (item.value / maxValue) * 32 - 4;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L100,40 L0,40 Z`;

  return (
    <svg viewBox="0 0 100 40" className="h-32 w-full">
      <path d={areaPath} className={fillClass} />
      <path d={linePath} className={accentClass} fill="none" strokeWidth="2" />
    </svg>
  );
};

const StatCard = ({ label, value, helper }) => (
  <div className="rounded-3xl border border-white/10 bg-white/70 p-5 text-base-content shadow-[0_24px_60px_rgba(22,16,44,0.18)] backdrop-blur">
    <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">
      {label}
    </p>
    <p className="mt-3 text-3xl font-semibold text-base-content">
      {value}
    </p>
    {helper && <p className="mt-2 text-xs text-base-content/60">{helper}</p>}
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
  const [leadRole, setLeadRole] = useState("all");
  const [leadOffset, setLeadOffset] = useState(0);
  const leadLimit = 50;

  const conversionRate =
    metrics && metrics.visitsTotal
      ? metrics.signupsTotal / metrics.visitsTotal
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiClient.post("/admin/metrics", {
        password,
        rangeStart: granularity === "all" ? null : rangeStart,
        rangeEnd: granularity === "all" ? null : rangeEnd,
        granularity,
        leadRole: leadRole === "all" ? null : leadRole,
        leadOffset,
        leadLimit,
      });
      setMetrics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
        leadRole: leadRole === "all" ? null : leadRole,
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

  return (
    <div className="min-h-screen bg-[#2E2A3D] px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Admin panel
            </p>
            <h1 className="mt-3 text-4xl font-serif text-white">
              Nature Club Metrics
            </h1>
            <p className="mt-2 text-sm text-white/60">
              MVP performance and waitlist intelligence.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-white/80">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Access
            </p>
            <p className="mt-2 text-sm">Password required</p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-[32px] border border-white/10 bg-white/10 p-6 text-white/80 shadow-[0_24px_60px_rgba(16,10,32,0.35)] backdrop-blur"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                Admin password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-2 w-full rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-black"
                required
              />
            </div>
            <button
              className="rounded-full bg-[#6B47FF] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#6B47FF]/30"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load dashboard"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                Range start
              </label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-black"
                disabled={granularity === "all"}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                Range end
              </label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-black"
                disabled={granularity === "all"}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-black"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                Lead role
              </label>
              <select
                value={leadRole}
                onChange={(e) => {
                  setLeadRole(e.target.value);
                  setLeadOffset(0);
                }}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-black"
              >
                <option value="all">All roles</option>
                <option value="participant">Participant</option>
                <option value="host">Host</option>
                <option value="host_interest">Host interest</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
        </form>

        {metrics && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[32px] bg-gradient-to-br from-[#5B3BFF] via-[#5A35E0] to-[#8B6BFF] p-6 text-white shadow-[0_30px_70px_rgba(41,24,120,0.45)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Total waitlist
                </p>
                <p className="mt-4 text-4xl font-semibold">
                  {formatNumber(metrics.signupsTotal)}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Conversion: {formatPercent(conversionRate)}
                </p>
                <div className="mt-6 h-28 rounded-2xl bg-white/10 p-3">
                  <LineChart
                    data={metrics.signupsSeries}
                    accentClass="stroke-white"
                    fillClass="fill-white/20"
                  />
                </div>
              </div>

              <div className="rounded-[32px] bg-[#ECE6FF] p-6 text-[#2E2A3D] shadow-[0_30px_70px_rgba(22,16,44,0.15)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#5D4C8F]">
                  Visits trend
                </p>
                <p className="mt-4 text-3xl font-semibold">
                  {formatNumber(metrics.visitsTotal)}
                </p>
                <p className="mt-2 text-sm text-[#5D4C8F]">
                  Today: {formatNumber(metrics.visitsToday)}
                </p>
                <div className="mt-6 h-28 rounded-2xl bg-white/70 p-3">
                  <LineChart
                    data={metrics.visitsSeries}
                    accentClass="stroke-[#5B3BFF]"
                    fillClass="fill-[#C7B7FF]"
                  />
                </div>
              </div>

              <StatCard
                label="Signups today"
                value={formatNumber(metrics.signupsToday)}
                helper="New leads today"
              />
              <StatCard
                label="Likes"
                value={formatNumber(metrics.likesTotal)}
                helper={`Per event: ${formatNumber(
                  metrics.eventsTotal ? metrics.likesTotal / metrics.eventsTotal : 0
                )}`}
              />
              <StatCard
                label="Host interest"
                value={formatNumber(metrics.signupsHostInterest)}
                helper="High-intent hosts"
              />
              <StatCard
                label="Participants"
                value={formatNumber(metrics.signupsParticipant)}
                helper="Member-side demand"
              />
            </div>

            <div className="grid gap-6">
              <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-white shadow-[0_30px_70px_rgba(16,10,32,0.35)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Supply
                </p>
                <p className="mt-4 text-3xl font-semibold">
                  {formatNumber(metrics.eventsTotal)} events
                </p>
                <p className="mt-2 text-sm text-white/70">
                  {formatNumber(metrics.usersTotal)} users in system
                </p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-white shadow-[0_30px_70px_rgba(16,10,32,0.35)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Role split
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Hosts</span>
                    <span className="text-white">
                      {formatNumber(metrics.signupsHost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Host interest</span>
                    <span className="text-white">
                      {formatNumber(metrics.signupsHostInterest)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Members</span>
                    <span className="text-white">
                      {formatNumber(metrics.signupsMember)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Participants</span>
                    <span className="text-white">
                      {formatNumber(metrics.signupsParticipant)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics && (
          <section className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-white shadow-[0_30px_70px_rgba(16,10,32,0.35)]">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Waitlist submissions
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatNumber(metrics.leadsTotal)} total
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(leadOffset - leadLimit, 0))}
                  className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset === 0 || isLoading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(leadOffset + leadLimit)}
                  className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
                  disabled={leadOffset + leadLimit >= metrics.leadsTotal || isLoading}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="mt-6 overflow-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm text-white/80">
                <thead className="bg-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.leads.map((lead) => (
                    <tr key={lead._id} className="border-t border-white/10">
                      <td className="px-4 py-3 text-xs text-white/60">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {lead.email}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-white/70">
                        {lead.role}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">
                        {lead.source || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">
                        {formatResponsePreview(lead.responses)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
