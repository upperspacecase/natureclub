import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import Event from "@/models/Event";
import EventLike from "@/models/EventLike";
import User from "@/models/User";
import Visit from "@/models/Visit";
import Click from "@/models/Click";
import VisitSession from "@/models/VisitSession";
import { THEMES } from "@/data/events";

export async function POST(req) {
  const body = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const granularityOptions = ["day", "week", "month", "all"];
  const requestedGranularity = granularityOptions.includes(body?.granularity)
    ? body.granularity
    : "day";

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin password not configured" },
      { status: 500 }
    );
  }

  if (!body?.password || body.password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongo();

  const parseDate = (value, endOfDay = false) => {
    if (!value || typeof value !== "string") return null;
    const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const startParam = parseDate(body?.rangeStart);
  const endParam = parseDate(body?.rangeEnd, true);
  const defaultStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29));
  const defaultEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

  const getBucketStart = (date, unit) => {
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    if (unit === "week") {
      const day = utc.getUTCDay();
      const diff = (day + 6) % 7;
      utc.setUTCDate(utc.getUTCDate() - diff);
      return utc;
    }
    if (unit === "month") {
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    }
    return utc;
  };

  const formatBucketKey = (date, unit) => {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${date.getUTCDate()}`.padStart(2, "0");
    if (unit === "month") return `${year}-${month}`;
    return `${year}-${month}-${day}`;
  };

  const buildBucketRange = (startDate, endDate, unit) => {
    if (!startDate || !endDate) return [];
    const buckets = [];
    let cursor = getBucketStart(startDate, unit);
    const endBucket = getBucketStart(endDate, unit);
    while (cursor <= endBucket) {
      buckets.push(new Date(cursor));
      if (unit === "month") {
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      } else if (unit === "week") {
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 7));
      } else {
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1));
      }
    }
    return buckets;
  };

  try {
    const [
      totalLeads,
      hostLeads,
      memberLeads,
      likesTotal,
      usersTotal,
      eventsTotal,
      visits,
      earliestVisit,
      earliestLead,
    ] = await Promise.all([
      Lead.countDocuments({ role: { $in: ["host", "member"] } }),
      Lead.countDocuments({ role: "host" }),
      Lead.countDocuments({ role: "member" }),
      EventLike.countDocuments(),
      User.countDocuments(),
      Event.countDocuments(),
      Visit.find({}).lean(),
      Visit.findOne({}).sort({ date: 1 }).lean(),
      Lead.findOne({ role: { $in: ["host", "member"] } })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const visitsTotal = visits.reduce((sum, visit) => sum + visit.count, 0);
    const visitsToday = visits.find((visit) => visit.date === todayKey)?.count || 0;

    const earliestVisitDate = earliestVisit
      ? new Date(`${earliestVisit.date}T00:00:00.000Z`)
      : null;
    const earliestLeadDate = earliestLead ? new Date(earliestLead.createdAt) : null;
    const earliestDataDate = [earliestVisitDate, earliestLeadDate]
      .filter(Boolean)
      .sort((a, b) => a - b)[0] || defaultStart;

    let rangeStart = startParam;
    let rangeEnd = endParam;
    if (requestedGranularity === "all") {
      rangeStart = earliestDataDate;
      rangeEnd = defaultEnd;
    }
    if (!rangeStart && rangeEnd) {
      rangeStart = new Date(rangeEnd);
      rangeStart.setUTCDate(rangeStart.getUTCDate() - 29);
      rangeStart = getBucketStart(rangeStart, "day");
    }
    if (!rangeEnd && rangeStart) {
      rangeEnd = defaultEnd;
    }
    if (!rangeStart && !rangeEnd) {
      rangeStart = defaultStart;
      rangeEnd = defaultEnd;
    }
    if (rangeEnd < rangeStart) {
      const swap = rangeStart;
      rangeStart = rangeEnd;
      rangeEnd = swap;
    }

    const granularity = requestedGranularity === "all" ? "month" : requestedGranularity;
    const bucketRange = buildBucketRange(rangeStart, rangeEnd, granularity);
    const bucketTemplate = bucketRange.reduce((acc, bucket) => {
      acc[formatBucketKey(bucket, granularity)] = 0;
      return acc;
    }, {});

    const visitRangeQuery = {
      date: {
        $gte: rangeStart.toISOString().slice(0, 10),
        $lte: rangeEnd.toISOString().slice(0, 10),
      },
    };
    const visitsInRange = await Visit.find(visitRangeQuery).lean();
    const visitsSeriesMap = { ...bucketTemplate };
    visitsInRange.forEach((visit) => {
      const visitDate = new Date(`${visit.date}T00:00:00.000Z`);
      const key = formatBucketKey(getBucketStart(visitDate, granularity), granularity);
      visitsSeriesMap[key] = (visitsSeriesMap[key] || 0) + visit.count;
    });

    const leadRangeQuery = {
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd,
      },
      role: { $in: ["host", "member"] },
    };
    const leadsInRange = await Lead.find(leadRangeQuery).select("createdAt").lean();
    const signupsSeriesMap = { ...bucketTemplate };
    leadsInRange.forEach((lead) => {
      const key = formatBucketKey(getBucketStart(new Date(lead.createdAt), granularity), granularity);
      signupsSeriesMap[key] = (signupsSeriesMap[key] || 0) + 1;
    });

    const leadLimit = Math.min(Number(body?.leadLimit) || 50, 500);
    const leadOffset = Math.max(Number(body?.leadOffset) || 0, 0);
    const leadListQuery = { ...leadRangeQuery };
    const [leads, leadsTotal] = await Promise.all([
      Lead.find(leadListQuery)
        .sort({ createdAt: -1 })
        .skip(leadOffset)
        .limit(leadLimit)
        .lean(),
      Lead.countDocuments(leadListQuery),
    ]);

    const formatSeries = (map) =>
      Object.entries(map)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([label, value]) => ({ label, value }));

    const clickRangeQuery = {
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd,
      },
    };
    const [memberClicksTotal, hostClicksTotal] = await Promise.all([
      Click.countDocuments({ ...clickRangeQuery, type: "member_click" }),
      Click.countDocuments({ ...clickRangeQuery, type: "host_click" }),
    ]);

    const sessionStats = await VisitSession.aggregate([
      {
        $match: {
          createdAt: {
            $gte: rangeStart,
            $lte: rangeEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDurationMs: { $avg: "$durationMs" },
          sessionCount: { $sum: 1 },
        },
      },
    ]);
    const avgTimeOnPageMs = sessionStats[0]?.avgDurationMs || 0;
    const timeOnPageCount = sessionStats[0]?.sessionCount || 0;

    const countryFilter = {
      country: { $exists: true, $ne: "" },
    };
    const [membersByCountry, hostsByCountry] = await Promise.all([
      Lead.aggregate([
        { $match: { ...leadRangeQuery, role: "member", ...countryFilter } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.aggregate([
        { $match: { ...leadRangeQuery, role: "host", ...countryFilter } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const membersByCountryList = membersByCountry.map((item) => ({
      country: item._id,
      count: item.count,
    }));
    const hostsByCountryList = hostsByCountry.map((item) => ({
      country: item._id,
      count: item.count,
    }));

    const likesByEventRaw = await EventLike.aggregate([
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const eventIds = likesByEventRaw.map((item) => item._id);
    const events = await Event.find({ eventId: { $in: eventIds } })
      .select("eventId title themes")
      .lean();
    const eventMap = events.reduce((acc, event) => {
      acc[event.eventId] = event;
      return acc;
    }, {});

    const likesByEvent = likesByEventRaw.map((item) => {
      const event = eventMap[item._id];
      return {
        eventId: item._id,
        title: event?.title || item._id,
        themes: event?.themes || [],
        count: item.count,
      };
    });

    const themeLabelMap = THEMES.reduce((acc, theme) => {
      acc[theme.id] = theme.label;
      return acc;
    }, {});

    const likesByThemeMap = {};
    likesByEvent.forEach((event) => {
      const themes = event.themes?.length ? event.themes : ["other"];
      themes.forEach((themeId) => {
        likesByThemeMap[themeId] = (likesByThemeMap[themeId] || 0) + event.count;
      });
    });
    const likesByTheme = Object.entries(likesByThemeMap)
      .map(([themeId, count]) => ({
        themeId,
        label: themeLabelMap[themeId] || themeId,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const signupsToday = await Lead.countDocuments({
      createdAt: {
        $gte: new Date(`${todayKey}T00:00:00.000Z`),
        $lte: new Date(`${todayKey}T23:59:59.999Z`),
      },
      role: { $in: ["host", "member"] },
    });

    return NextResponse.json({
      visitsTotal,
      visitsToday,
      avgTimeOnPageMs,
      timeOnPageCount,
      signupsTotal: totalLeads,
      signupsToday,
      signupsHost: hostLeads,
      signupsMember: memberLeads,
      eventsTotal,
      likesTotal,
      usersTotal,
      memberClicksTotal,
      hostClicksTotal,
      membersByCountry: membersByCountryList,
      hostsByCountry: hostsByCountryList,
      likesByEvent,
      likesByTheme,
      rangeStart: rangeStart.toISOString().slice(0, 10),
      rangeEnd: rangeEnd.toISOString().slice(0, 10),
      granularity,
      visitsSeries: formatSeries(visitsSeriesMap),
      signupsSeries: formatSeries(signupsSeriesMap),
      leads,
      leadsTotal,
      leadLimit,
      leadOffset,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
