/* eslint-disable no-console */
const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

const SIGNUP_QUESTION_VERSION = "2026-02-v1";

const asText = (value) => (typeof value === "string" ? value.trim() : "");
const asArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

const mapMember = (responses = {}) => {
  const member = responses.member || {};
  const location = responses.location || {};
  const pricingSelections = asArray(responses.pricingSelections);

  return {
    locationCity: asText(member.locationCity) || asText(location.city),
    locationCoords: asText(member.locationCoords) || asText(location.coords),
    interests: member.interests ? asArray(member.interests) : asArray(responses.interests),
    interestsOther:
      asText(member.interestsOther) || asText(responses.interestsOther),
    interestThemes:
      member.interestThemes
        ? asArray(member.interestThemes)
        : asArray(responses.interestThemes),
    motivations: member.motivations
      ? asArray(member.motivations)
      : asArray(responses.motivations),
    motivationsOther:
      asText(member.motivationsOther) || asText(responses.motivationsOther),
    experiencesPerMonth:
      asText(member.experiencesPerMonth) || asText(responses.experiencesPerMonth),
    pricingSelection:
      asText(member.pricingSelection) || pricingSelections[0] || "",
  };
};

const mapHost = (responses = {}) => {
  const host = responses.host || {};
  const location = responses.location || {};
  const rateRange = responses.rateRange || {};

  return {
    locationCity: asText(host.locationCity) || asText(location.city),
    locationCoords: asText(host.locationCoords) || asText(location.coords),
    experience: asText(host.experience) || asText(responses.experience),
    sessionsPerMonth:
      asText(host.sessionsPerMonth) || asText(responses.sessionsPerMonth),
    bookingsPerSession:
      asText(host.bookingsPerSession) || asText(responses.bookingsPerSession),
    rateAmount: asText(host.rateAmount) || asText(responses.rate),
    rateMin: asText(host.rateMin) || asText(rateRange.min),
    rateMax: asText(host.rateMax) || asText(rateRange.max),
    tools: host.tools ? asArray(host.tools) : asArray(responses.tools),
    toolsOther: asText(host.toolsOther) || asText(responses.toolsOther),
    features: host.features ? asArray(host.features) : asArray(responses.features),
    featuresOther:
      asText(host.featuresOther) || asText(responses.featuresOther),
  };
};

const buildNormalizedResponses = (role, responses = {}) => {
  if (role === "member") {
    return {
      member: mapMember(responses),
      host: null,
    };
  }

  return {
    member: null,
    host: mapHost(responses),
  };
};

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const dbNameFromUri = (() => {
      const match = uri.match(/\/([^/?]+)(\?|$)/);
      if (!match || !match[1] || match[1].includes("mongodb+srv:")) return "test";
      return match[1];
    })();

    const db = client.db(dbNameFromUri || "test");
    const leads = db.collection("leads");

    const cursor = leads.find({ role: { $in: ["member", "host"] } });
    const ops = [];
    let scanned = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      scanned += 1;

      const nextResponses = buildNormalizedResponses(doc.role, doc.responses || {});
      const isDraft = doc.status === "draft";

      const update = {
        responses: nextResponses,
        questionVersion: doc.questionVersion || SIGNUP_QUESTION_VERSION,
        status: doc.status || "submitted",
        submittedAt: isDraft ? null : doc.submittedAt || doc.createdAt || new Date(),
      };

      if (isDraft && !doc.draftId) {
        update.draftId = randomUUID();
      }

      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: update },
        },
      });

      if (ops.length >= 500) {
        await leads.bulkWrite(ops, { ordered: false });
        ops.length = 0;
      }
    }

    if (ops.length) {
      await leads.bulkWrite(ops, { ordered: false });
    }

    console.log(`Backfill complete. Scanned ${scanned} lead records in database '${db.databaseName}'.`);
  } finally {
    await client.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
