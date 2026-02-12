import { normalizeRegionDisplay } from "@/libs/regions";
export const SIGNUP_QUESTION_VERSION = "2026-02-v1";

export const LEAD_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
};

const OTHER_MEMBER_INTEREST = "Other / Make a Suggestion -";
const OTHER_MEMBER_MOTIVATION = "Other:";
const OTHER_HOST_TOOL = "Other";

const asText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const asArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const asLocation = (location) => ({
  city: asText(location?.city),
  coords: asText(location?.coords),
});

export const emptyMemberResponses = () => ({
  locationCity: "",
  locationCoords: "",
  interests: [],
  interestsOther: "",
  interestThemes: [],
  motivations: [],
  motivationsOther: "",
  experiencesPerMonth: "",
  pricingSelection: "",
});

export const emptyHostResponses = () => ({
  locationCity: "",
  locationCoords: "",
  experience: "",
  sessionsPerMonth: "",
  bookingsPerSession: "",
  rateAmount: "",
  rateMin: "",
  rateMax: "",
  tools: [],
  toolsOther: "",
  features: [],
  featuresOther: "",
});

const normalizeLegacyMemberResponses = (raw = {}) => {
  const location = asLocation(raw.location);
  const pricingSelections = asArray(raw.pricingSelections);

  return {
    locationCity: normalizeRegionDisplay(asText(raw.locationCity) || location.city),
    locationCoords: asText(raw.locationCoords) || location.coords,
    interests: asArray(raw.interests),
    interestsOther: asText(raw.interestsOther),
    interestThemes: asArray(raw.interestThemes),
    motivations: asArray(raw.motivations),
    motivationsOther: asText(raw.motivationsOther),
    experiencesPerMonth: asText(raw.experiencesPerMonth),
    pricingSelection: asText(raw.pricingSelection) || pricingSelections[0] || "",
  };
};

const normalizeLegacyHostResponses = (raw = {}) => {
  const location = asLocation(raw.location);

  return {
    locationCity: normalizeRegionDisplay(asText(raw.locationCity) || location.city),
    locationCoords: asText(raw.locationCoords) || location.coords,
    experience: asText(raw.experience),
    sessionsPerMonth: asText(raw.sessionsPerMonth),
    bookingsPerSession: asText(raw.bookingsPerSession),
    rateAmount: asText(raw.rateAmount) || asText(raw.rate),
    rateMin: asText(raw.rateMin) || asText(raw.rateRange?.min),
    rateMax: asText(raw.rateMax) || asText(raw.rateRange?.max),
    tools: asArray(raw.tools),
    toolsOther: asText(raw.toolsOther),
    features: asArray(raw.features),
    featuresOther: asText(raw.featuresOther),
  };
};

export const normalizeLeadResponses = (role, rawResponses = {}) => {
  const raw = rawResponses || {};

  if (role === "member") {
    const memberSource = raw.member || raw;
    const member = raw.member
      ? {
          ...emptyMemberResponses(),
          ...normalizeLegacyMemberResponses(memberSource),
        }
      : normalizeLegacyMemberResponses(memberSource);

    return {
      member,
      host: null,
    };
  }

  const hostSource = raw.host || raw;
  const host = raw.host
    ? {
        ...emptyHostResponses(),
        ...normalizeLegacyHostResponses(hostSource),
      }
    : normalizeLegacyHostResponses(hostSource);

  return {
    member: null,
    host,
  };
};

export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(asText(email));

const hasLocation = (locationCity, locationCoords) =>
  Boolean(asText(locationCity) || asText(locationCoords));

export const validateSubmittedLead = (role, responses) => {
  if (role === "member") {
    const member = responses?.member || emptyMemberResponses();

    if (!hasLocation(member.locationCity, member.locationCoords)) {
      return "Location is required";
    }

    if (!member.interests.length) {
      return "At least one interest is required";
    }

    if (
      member.interests.includes(OTHER_MEMBER_INTEREST) &&
      !asText(member.interestsOther)
    ) {
      return "Please fill the member interests 'Other' field";
    }

    if (!member.motivations.length) {
      return "At least one motivation is required";
    }

    if (
      member.motivations.includes(OTHER_MEMBER_MOTIVATION) &&
      !asText(member.motivationsOther)
    ) {
      return "Please fill the member motivations 'Other' field";
    }

    if (!asText(member.experiencesPerMonth)) {
      return "Experiences per month is required";
    }

    if (!asText(member.pricingSelection)) {
      return "Pricing selection is required";
    }

    return "";
  }

  const host = responses?.host || emptyHostResponses();

  if (!hasLocation(host.locationCity, host.locationCoords)) {
    return "Location is required";
  }

  if (!asText(host.experience)) {
    return "Experience is required";
  }

  if (!asText(host.sessionsPerMonth) || !asText(host.bookingsPerSession)) {
    return "Sessions and bookings are required";
  }

  const hasRate = Boolean(asText(host.rateAmount));
  const hasRange = Boolean(asText(host.rateMin) && asText(host.rateMax));
  if (!hasRate && !hasRange) {
    return "Rate is required";
  }

  if (!host.tools.length) {
    return "At least one facilitator tool is required";
  }

  if (host.tools.includes(OTHER_HOST_TOOL) && !asText(host.toolsOther)) {
    return "Please fill the facilitator tools 'Other' field";
  }

  if (!host.features.length && !asText(host.featuresOther)) {
    return "At least one facilitator feature is required";
  }

  return "";
};

export const extractLocationForCountry = (role, responses) => {
  if (role === "member") {
    return {
      city: asText(responses?.member?.locationCity),
      coords: asText(responses?.member?.locationCoords),
    };
  }

  return {
    city: asText(responses?.host?.locationCity),
    coords: asText(responses?.host?.locationCoords),
  };
};

export const getSessionId = (value) => asText(value);
