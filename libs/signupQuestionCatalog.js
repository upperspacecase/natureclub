export const SIGNUP_QUESTION_CATALOG = [
  {
    id: "member_interests",
    role: "member",
    label: "What types of experiences are you most interested in?",
  },
  {
    id: "member_motivations",
    role: "member",
    label: "What would make Nature Club a must-have for you? (Select up to 5)",
  },
  {
    id: "member_experiences",
    role: "member",
    label: "How many Nature Club experiences would you ideally like attend each month?",
  },
  {
    id: "member_pricing",
    role: "member",
    label: "What would you be willing to pay for a monthly membership to Nature Club?",
  },
  {
    id: "host_experience",
    role: "host",
    label: "What experience do you host?",
  },
  {
    id: "host_sessions",
    role: "host",
    label: "In a normal month, how many sessions do you host?",
  },
  {
    id: "host_bookings",
    role: "host",
    label: "How many people per session?",
  },
  {
    id: "host_rate",
    role: "host",
    label: "What are your rates?",
  },
  {
    id: "host_tools",
    role: "host",
    label: "Which tools do you currently use for finding clients and organizing sessions?",
  },
  {
    id: "host_features",
    role: "host",
    label: "What features would be most valuable to you in a booking platform?",
  },
];

const rateValue = (host = {}) => {
  const range =
    host.rateMin || host.rateMax ? `${host.rateMin || "-"} - ${host.rateMax || "-"}` : "";
  return host.rateAmount || range || "";
};

export const getLeadAnswerByQuestionId = (lead, questionId) => {
  const member = lead.responses?.member || {};
  const host = lead.responses?.host || {};

  switch (questionId) {
    case "member_interests":
      return member.interests || [];
    case "member_motivations":
      return member.motivations || [];
    case "member_experiences":
      return member.experiencesPerMonth || "";
    case "member_pricing":
      return member.pricingSelection || "";
    case "host_experience":
      return host.experience || "";
    case "host_sessions":
      return host.sessionsPerMonth || "";
    case "host_bookings":
      return host.bookingsPerSession || "";
    case "host_rate":
      return rateValue(host);
    case "host_tools":
      return host.tools || [];
    case "host_features":
      return host.features || [];
    default:
      return "";
  }
};

export const QUESTION_LABELS = {
  host_experience: "What experience do you host?",
  host_sessions: "In a normal month, how many sessions do you host?",
  host_bookings: "How many people per session?",
  host_rate: "What are your rates?",
  host_tools:
    "Which tools do you currently use for finding clients and organizing sessions?",
  host_features: "What features would be most valuable to you in a booking platform?",
  member_interests: "What types of experiences are you most interested in?",
  member_motivations: "What would make Nature Club a must-have for you? (Select up to 5)",
  member_experiences:
    "How many Nature Club experiences would you ideally like attend each month?",
  member_pricing: "What would you be willing to pay for a monthly membership to Nature Club?",
};

