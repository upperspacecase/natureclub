import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import Event from "@/models/Event";
import Visit from "@/models/Visit";
import Click from "@/models/Click";
import {
  LEAD_STATUS,
  normalizeLeadResponses,
  validateSubmittedLead,
} from "@/libs/signup";
import { normalizeRegionDisplay, toRegionKey } from "@/libs/regions";

const BYPASS_ADMIN_AUTH = false;
const SIGNUP_ROLES = ["member", "host"];

const submittedLeadFilter = {
  $or: [{ status: LEAD_STATUS.SUBMITTED }, { status: { $exists: false } }],
};

const asText = (value) => (typeof value === "string" ? value.trim() : "");

const getLeadRegion = (lead, normalizedResponses) => {
  const responses = normalizedResponses || lead.responses || {};
  const member = responses.member || {};
  const host = responses.host || {};
  const explicitRegion = normalizeRegionDisplay(lead.region);
  const memberCity = normalizeRegionDisplay(member.locationCity);
  const hostCity = normalizeRegionDisplay(host.locationCity);
  const country = asText(lead.country);

  return explicitRegion || memberCity || hostCity || country || "Unknown";
};

export async function POST(req) {
  const body = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!BYPASS_ADMIN_AUTH) {
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    if (!body?.password || body.password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  await connectMongo();

  try {
    const leadQuery = {
      ...submittedLeadFilter,
      role: { $in: SIGNUP_ROLES },
    };

    const [leads, events, visits, memberClicksTotal, hostClicksTotal] =
      await Promise.all([
        Lead.find(leadQuery)
          .select(
            "email role createdAt submittedAt status country source responses questionVersion region regionKey"
          )
          .sort({ createdAt: -1 })
          .lean(),
        Event.find({})
          .select(
            "eventId title tags themes region regionKey facilitatorName facilitatorEmail startsAt createdAt"
          )
          .sort({ createdAt: -1 })
          .lean(),
        Visit.find({}).lean(),
        Click.countDocuments({ type: "member_click" }),
        Click.countDocuments({ type: "host_click" }),
      ]);

    const enrichedLeads = leads
      .map((lead) => {
      const normalizedResponses = normalizeLeadResponses(lead.role, lead.responses);
      const region = getLeadRegion(lead, normalizedResponses);
      return {
        ...lead,
        responses: normalizedResponses,
        region,
        regionKey: toRegionKey(lead.regionKey || region),
      };
      })
      .filter((lead) => !validateSubmittedLead(lead.role, lead.responses));

    const enrichedEvents = events.map((event) => {
      const region = normalizeRegionDisplay(event.region) || "Unknown";
      return {
        ...event,
        region,
        regionKey: toRegionKey(event.regionKey || region),
      };
    });

    const visitsTotal = visits.reduce((sum, visit) => sum + (visit.count || 0), 0);

    const response = {
      generatedAt: new Date().toISOString(),
      leads: enrichedLeads,
      events: enrichedEvents,
      visits: {
        total: visitsTotal,
        daily: visits,
      },
      clicks: {
        total: memberClicksTotal + hostClicksTotal,
        participant: memberClicksTotal,
        facilitator: hostClicksTotal,
      },
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
