"use client";

import { useState } from "react";
import apiClient from "@/libs/api";

const StatCard = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-200/60 p-4 text-base-content">
      <p className="text-xs uppercase tracking-wide text-base-content/60">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiClient.post("/admin/metrics", { password });
      setMetrics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-serif">Admin</h1>
          <p className="text-sm text-base-content/70">
            Metrics overview for the landing MVP.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="input input-bordered w-full max-w-sm text-base-content"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "View metrics"}
          </button>
        </form>

        {metrics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Site visits (total)" value={metrics.visitsTotal} />
            <StatCard label="Site visits (today)" value={metrics.visitsToday} />
            <StatCard label="Waitlist signups" value={metrics.signupsTotal} />
            <StatCard
              label="Signups (participants)"
              value={metrics.signupsParticipant}
            />
            <StatCard
              label="Signups (host interest)"
              value={metrics.signupsHostInterest}
            />
            <StatCard label="Events listed" value={metrics.eventsTotal} />
            <StatCard label="Likes" value={metrics.likesTotal} />
            <StatCard label="Users" value={metrics.usersTotal} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
