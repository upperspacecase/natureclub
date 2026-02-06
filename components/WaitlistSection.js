"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import posthog from "posthog-js";
import apiClient from "@/libs/api";
import {
  MEMBER_INTEREST_OPTIONS,
  MEMBER_INTEREST_THEME_MAP,
} from "@/data/events";
import { SIGNUP_QUESTION_VERSION } from "@/libs/signup";
import { QUESTION_LABELS } from "@/libs/signupQuestionCatalog";
import WaitlistModal from "./WaitlistModal";

const SESSION_ID_KEY = "nc:signup-session-id";

const WaitlistSection = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [hostLocation, setHostLocation] = useState({ city: "", coords: "" });
  const [hostExperience, setHostExperience] = useState("");
  const [hostSessionsPerMonth, setHostSessionsPerMonth] = useState("");
  const [hostBookingsPerSession, setHostBookingsPerSession] = useState("");
  const [hostRate, setHostRate] = useState("");
  const [hostRateIsRange, setHostRateIsRange] = useState(false);
  const [hostRateMin, setHostRateMin] = useState("");
  const [hostRateMax, setHostRateMax] = useState("");
  const [hostTools, setHostTools] = useState([]);
  const [hostToolsOther, setHostToolsOther] = useState("");
  const [hostFeatures, setHostFeatures] = useState([]);
  const [hostFeaturesOther, setHostFeaturesOther] = useState("");
  const [hostEmail, setHostEmail] = useState("");

  const [memberLocation, setMemberLocation] = useState({ city: "", coords: "" });
  const [memberInterests, setMemberInterests] = useState([]);
  const [memberInterestsOther, setMemberInterestsOther] = useState("");
  const [memberMotivations, setMemberMotivations] = useState([]);
  const [memberMotivationsOther, setMemberMotivationsOther] = useState("");
  const [memberExperiencesPerMonth, setMemberExperiencesPerMonth] = useState("");
  const [memberPricingSelections, setMemberPricingSelections] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [modalBackgroundImage, setModalBackgroundImage] = useState("");
  const [signupSessionId, setSignupSessionId] = useState("");

  const hostFeatureOptions = useMemo(
    () => [
      "Calendar sync (Google, Outlook)",
      "Automated reminders/confirmations",
      "Payment processing",
      "Member CRM (email, history, preferences)",
      "Analytics (attendance trends, revenue tracking)",
      "Reviews/ratings",
      "Group booking capability",
      "Waitlist management",
      "Messaging with members",
    ],
    []
  );

  const memberInterestOptions = useMemo(() => MEMBER_INTEREST_OPTIONS, []);

  const mapInterestThemes = (interests) => {
    const themes = new Set();
    interests.forEach((interest) => {
      const mapped = MEMBER_INTEREST_THEME_MAP[interest] || [];
      mapped.forEach((theme) => themes.add(theme));
    });
    return Array.from(themes);
  };

  const memberMotivationOptions = useMemo(
    () => [
      "Curated nature events, experiences & classes in one place",
      "Trusted reviews from fellow members",
      "Easy booking & scheduling",
      "Member-only pricing",
      "Connection with like-minded people",
      "Giving back through hands on activities",
      "Finding hidden gems I wouldn't discover on my own",
      "Flexible cancellation & rescheduling",
      "Mobile-first, on-the-go access",
      "Learning skills I can use myself (wilderness cooking, navigation)",
      "Supporting local guides & small businesses",
      "Knowing my membership regenerates local environment",
      "Transparency on where money goes",
      "Regular nature immersion for my wellbeing",
      "Challenging myself with new outdoor skills",
      "Escaping screen time & city stress",
      "Other:",
    ],
    []
  );

  const memberPricingOptions = useMemo(
    () => [
      "$20/month - 1 booking",
      "$50/month - 3 bookings",
      "$100/month - 8 bookings",
      "$200/month - 20 bookings",
      "$500+/month - family bookings",
      "$80/per year + discounted price per booking",
      "Prefer pay full price per booking (no membership)",
    ],
    []
  );
  const memberExperienceOptions = useMemo(
    () => ["1-4", "5-8", "9-15", "16-30", "30+"],
    []
  );

  const hostToolOptions = useMemo(
    () => [
      "Personal Messaging (Whatsapp/Telegram)",
      "Group Messaging",
      "Word of Mouth",
      "Studio booking system",
      "Other",
    ],
    []
  );
  const hostSessionOptions = useMemo(
    () => [...Array.from({ length: 19 }, (_, index) => `${index + 1}`), "20+"],
    []
  );
  const hostBookingOptions = useMemo(
    () => [...Array.from({ length: 29 }, (_, index) => `${index + 1}`), "30+"],
    []
  );

  const toggleSelection = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const data = await apiClient.get("/events/random");
        setModalBackgroundImage(data?.image || "");
      } catch (error) {
        console.error(error);
      }
    };
    fetchBackground();
  }, []);

  useEffect(() => {
    const handleOpenJoin = () => setIsJoinModalOpen(true);
    window.addEventListener("nc:open-join", handleOpenJoin);
    return () => window.removeEventListener("nc:open-join", handleOpenJoin);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingSessionId = window.localStorage.getItem(SESSION_ID_KEY) || "";
    const nextSessionId =
      existingSessionId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

    setSignupSessionId(nextSessionId);
    window.localStorage.setItem(SESSION_ID_KEY, nextSessionId);
  }, []);

  const handleUseLocation = (setter) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(
          4
        )}, ${position.coords.longitude.toFixed(4)}`;
        setter((prev) => ({ ...prev, coords }));
      },
      () => {
        setter((prev) => ({ ...prev, coords: "" }));
      }
    );
  };

  const buildHostResponses = () => ({
    host: {
      locationCity: hostLocation.city.trim(),
      locationCoords: hostLocation.coords.trim(),
      experience: hostExperience.trim(),
      sessionsPerMonth: hostSessionsPerMonth,
      bookingsPerSession: hostBookingsPerSession,
      rateAmount: hostRateIsRange ? "" : hostRate.trim(),
      rateMin: hostRateIsRange ? hostRateMin.trim() : "",
      rateMax: hostRateIsRange ? hostRateMax.trim() : "",
      tools: hostTools,
      toolsOther: hostToolsOther.trim(),
      features: hostFeatures,
      featuresOther: hostFeaturesOther.trim(),
    },
  });

  const buildMemberResponses = () => ({
    member: {
      locationCity: memberLocation.city.trim(),
      locationCoords: memberLocation.coords.trim(),
      interests: memberInterests,
      interestsOther: memberInterestsOther.trim(),
      interestThemes: mapInterestThemes(memberInterests),
      motivations: memberMotivations,
      motivationsOther: memberMotivationsOther.trim(),
      experiencesPerMonth: memberExperiencesPerMonth,
      pricingSelection: memberPricingSelections[0] || "",
    },
  });

  const submitHostLead = async () => {
    try {
      const hostResponses = buildHostResponses();
      const data = await apiClient.post("/lead", {
        role: "host",
        email: hostEmail,
        source: "modal",
        responses: hostResponses,
        sessionId: signupSessionId || undefined,
        questionVersion: SIGNUP_QUESTION_VERSION,
      });

      // Track waitlist signup completion with PostHog
      posthog.capture("waitlist_signup_completed", {
        role: "host",
        location_city: hostResponses.host.locationCity,
        has_location_coords: Boolean(hostResponses.host.locationCoords),
        experience_type: hostResponses.host.experience,
        sessions_per_month: hostResponses.host.sessionsPerMonth,
        bookings_per_session: hostResponses.host.bookingsPerSession,
        tools_count: hostResponses.host.tools.length,
        features_count: hostResponses.host.features.length,
        source: "modal",
      });

      // Identify user by email for future event correlation
      posthog.identify(hostEmail, {
        email: hostEmail,
        role: "host",
        signup_source: "modal",
        location_city: hostResponses.host.locationCity,
      });

      if (data?.emailStatus === "failed") {
        toast.success("Signup saved. Welcome email failed, we will retry.");
      } else {
        toast.success("Welcome to Nature Club! We're excited to have you here.");
      }
      return true;
    } catch (error) {
      console.error(error);
      posthog.captureException(error);
      toast.error("Something went wrong. Please try again.");
      return false;
    }
  };

  const submitMemberLead = async () => {
    try {
      const memberResponses = buildMemberResponses();
      const data = await apiClient.post("/lead", {
        role: "member",
        email: memberEmail,
        source: "modal",
        responses: memberResponses,
        sessionId: signupSessionId || undefined,
        questionVersion: SIGNUP_QUESTION_VERSION,
      });

      // Track waitlist signup completion with PostHog
      posthog.capture("waitlist_signup_completed", {
        role: "member",
        location_city: memberResponses.member.locationCity,
        has_location_coords: Boolean(memberResponses.member.locationCoords),
        interests_count: memberResponses.member.interests.length,
        interest_themes: memberResponses.member.interestThemes,
        motivations_count: memberResponses.member.motivations.length,
        experiences_per_month: memberResponses.member.experiencesPerMonth,
        pricing_selection: memberResponses.member.pricingSelection,
        source: "modal",
      });

      // Identify user by email for future event correlation
      posthog.identify(memberEmail, {
        email: memberEmail,
        role: "member",
        signup_source: "modal",
        location_city: memberResponses.member.locationCity,
        interest_themes: memberResponses.member.interestThemes,
      });

      if (data?.emailStatus === "failed") {
        toast.success("Signup saved. Welcome email failed, we will retry.");
      } else {
        toast.success("Welcome to Nature Club! We're excited to have you here.");
      }
      return true;
    } catch (error) {
      console.error(error);
      posthog.captureException(error);
      toast.error("Something went wrong. Please try again.");
      return false;
    }
  };

  const hostSteps = useMemo(
    () => [
      {
        key: "host-location",
        title: "Where are you based?",
        isComplete: () => Boolean(hostLocation.city || hostLocation.coords),
        content: (
          <div className="space-y-3">
            {hostLocation.coords && (
              <p className="text-xs text-base-content/70">
                Location shared: {hostLocation.coords}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="City or town"
                className="input input-bordered w-full"
                value={hostLocation.city}
                onChange={(e) =>
                  setHostLocation((prev) => ({ ...prev, city: e.target.value }))
                }
              />
              <button
                type="button"
                className="btn btn-outline btn-sm text-[0.7rem]"
                onClick={() => handleUseLocation(setHostLocation)}
              >
                Use My Current Location
              </button>
            </div>
          </div>
        ),
      },
      {
        key: "host-experience",
        title: QUESTION_LABELS.host_experience,
        isComplete: () => hostExperience.trim().length > 0,
        content: (
          <input
            type="text"
            placeholder="Experience(s)"
            className="input input-bordered w-full"
            value={hostExperience}
            onChange={(e) => setHostExperience(e.target.value)}
          />
        ),
      },
      {
        key: "host-bookings",
        title: "Bookings",
        isComplete: () =>
          Boolean(hostSessionsPerMonth) && Boolean(hostBookingsPerSession),
        content: (
          <div className="space-y-3 text-sm text-base-content/80">
            <p>
              In a normal month I host{" "}
              <select
                className="select select-bordered mx-2 w-28 text-center"
                value={hostSessionsPerMonth}
                onChange={(e) => setHostSessionsPerMonth(e.target.value)}
              >
                <option value="" disabled>
                  sessions
                </option>
                {hostSessionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              with about{" "}
              <select
                className="select select-bordered mx-2 w-28 text-center"
                value={hostBookingsPerSession}
                onChange={(e) => setHostBookingsPerSession(e.target.value)}
              >
                <option value="" disabled>
                  people
                </option>
                {hostBookingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>{" "}
              people per session.
            </p>
          </div>
        ),
      },
      {
        key: "host-price",
        title: QUESTION_LABELS.host_rate,
        isComplete: () =>
          (hostRateIsRange
            ? Boolean(hostRateMin && hostRateMax)
            : Boolean(hostRate)),
        content: (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={hostRateIsRange}
                onChange={(e) => setHostRateIsRange(e.target.checked)}
              />
              <span>Use a range</span>
            </label>
            {hostRateIsRange ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Min price"
                  className="input input-bordered w-full"
                  value={hostRateMin}
                  onChange={(e) => setHostRateMin(e.target.value)}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Max price"
                  className="input input-bordered w-full"
                  value={hostRateMax}
                  onChange={(e) => setHostRateMax(e.target.value)}
                />
              </div>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                placeholder="$ / booking"
                className="input input-bordered w-full"
                value={hostRate}
                onChange={(e) => setHostRate(e.target.value)}
              />
            )}
          </div>
        ),
      },
      {
        key: "host-messaging",
        title: QUESTION_LABELS.host_tools,
        showScrollHint: true,
        isComplete: () =>
          hostTools.length > 0 &&
          (!hostTools.includes("Other") || hostToolsOther.trim().length > 0),
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {hostToolOptions.map((option) => {
                const isSelected = hostTools.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, hostTools, setHostTools)}
                    className={`w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              {hostTools.includes("Other") && (
                <input
                  type="text"
                  placeholder="Other..."
                  className="input input-bordered w-full"
                  value={hostToolsOther}
                  onChange={(e) => setHostToolsOther(e.target.value)}
                />
              )}
            </div>
          </div>
        ),
      },
      {
        key: "host-features",
        title: QUESTION_LABELS.host_features,
        showScrollHint: true,
        isComplete: () =>
          hostFeatures.length > 0 || hostFeaturesOther.trim().length > 0,
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {hostFeatureOptions.map((option) => {
                const isSelected = hostFeatures.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, hostFeatures, setHostFeatures)}
                    className={`w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              <input
                type="text"
                placeholder="Other..."
                className="input input-bordered w-full"
                value={hostFeaturesOther}
                onChange={(e) => setHostFeaturesOther(e.target.value)}
              />
            </div>
          </div>
        ),
      },
      {
        key: "host-email",
        title: "What is your email?",
        isComplete: () => /\S+@\S+\.\S+/.test(hostEmail),
        content: (
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={hostEmail}
            onChange={(e) => setHostEmail(e.target.value)}
          />
        ),
      },
    ],
    [
      hostBookingsPerSession,
      hostFeatures,
      hostFeaturesOther,
      hostLocation,
      hostEmail,
      hostRateIsRange,
      hostRateMin,
      hostRateMax,
      hostTools,
      hostToolsOther,
      hostRate,
      hostExperience,
      hostSessionsPerMonth,
      hostSessionOptions,
      hostBookingOptions,
      hostFeatureOptions,
      hostToolOptions,
    ]
  );

  const memberSteps = useMemo(
    () => [
      {
        key: "member-location",
        title: "Where are you based?",
        isComplete: () => Boolean(memberLocation.city || memberLocation.coords),
        content: (
          <div className="space-y-3">
            {memberLocation.coords && (
              <p className="text-xs text-base-content/70">
                Location shared: {memberLocation.coords}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="City or town"
                className="input input-bordered w-full"
                value={memberLocation.city}
                onChange={(e) =>
                  setMemberLocation((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                className="btn btn-outline btn-sm text-[0.7rem]"
                onClick={() => handleUseLocation(setMemberLocation)}
              >
                Use My Current Location
              </button>
            </div>
          </div>
        ),
      },
      {
        key: "member-interests",
        title: QUESTION_LABELS.member_interests,
        showScrollHint: true,
        isComplete: () =>
          memberInterests.length > 0 &&
          (!memberInterests.includes("Other / Make a Suggestion -") ||
            memberInterestsOther.trim()),
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberInterestOptions.map((option) => {
                const isSelected = memberInterests.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      toggleSelection(option, memberInterests, setMemberInterests)
                    }
                    className={`w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              {memberInterests.includes("Other / Make a Suggestion -") && (
                <input
                  type="text"
                  placeholder="Other..."
                  className="input input-bordered w-full"
                  value={memberInterestsOther}
                  onChange={(e) => setMemberInterestsOther(e.target.value)}
                />
              )}
            </div>
          </div>
        ),
      },
      {
        key: "member-motivation",
        title: QUESTION_LABELS.member_motivations,
        showScrollHint: true,
        isComplete: () =>
          memberMotivations.length > 0 &&
          (!memberMotivations.includes("Other:") ||
            memberMotivationsOther.trim().length > 0),
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberMotivationOptions.map((option) => {
                const isSelected = memberMotivations.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setMemberMotivations(
                          memberMotivations.filter((item) => item !== option)
                        );
                        return;
                      }
                      if (memberMotivations.length >= 5) {
                        toast.error("Select up to 5 options.");
                        return;
                      }
                      setMemberMotivations([...memberMotivations, option]);
                    }}
                    className={`w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              {memberMotivations.includes("Other:") && (
                <input
                  type="text"
                  placeholder="Other..."
                  className="input input-bordered w-full"
                  value={memberMotivationsOther}
                  onChange={(e) => setMemberMotivationsOther(e.target.value)}
                />
              )}
            </div>
          </div>
        ),
      },
      {
        key: "member-frequency",
        title: QUESTION_LABELS.member_experiences,
        isComplete: () => Boolean(memberExperiencesPerMonth),
        content: (
          <select
            className="select select-bordered w-full"
            value={memberExperiencesPerMonth}
            onChange={(e) => setMemberExperiencesPerMonth(e.target.value)}
          >
            <option value="" disabled>
              Select...
            </option>
            {memberExperienceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: "member-price",
        title: QUESTION_LABELS.member_pricing,
        showScrollHint: true,
        isComplete: () => memberPricingSelections.length > 0,
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberPricingOptions.map((option) => {
                const isSelected = memberPricingSelections.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setMemberPricingSelections(
                        isSelected ? [] : [option]
                      )
                    }
                    className={`w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ),
      },
      {
        key: "member-email",
        title: "What is your email?",
        isComplete: () => /\S+@\S+\.\S+/.test(memberEmail),
        content: (
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
        ),
      },
    ],
    [
      memberInterests,
      memberInterestsOther,
      memberLocation,
      memberEmail,
      memberMotivations,
      memberMotivationsOther,
      memberExperiencesPerMonth,
      memberInterestOptions,
      memberMotivationOptions,
      memberExperienceOptions,
      memberPricingOptions,
      memberPricingSelections,
    ]
  );

  const trackClick = async (type) => {
    try {
      await apiClient.post("/click", { type });
    } catch (error) {
      console.error(error);
    }
  };

  const openMemberFlow = () => {
    trackClick("member_click");
    posthog.capture("member_flow_started", {
      source: "join_modal",
    });
    setIsJoinModalOpen(false);
    setIsMemberModalOpen(true);
  };

  const openHostFlow = () => {
    trackClick("host_click");
    posthog.capture("host_flow_started", {
      source: "join_modal",
    });
    setIsJoinModalOpen(false);
    setIsHostModalOpen(true);
  };

  const handleJoinModalOpen = () => {
    posthog.capture("waitlist_modal_opened", {
      source: "join_now_button",
    });
    setIsJoinModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start">
        <button
          id="join-now-button"
          className="btn btn-primary"
          onClick={handleJoinModalOpen}
        >
          Join now
        </button>
      </div>
      <div className="text-center text-white/90">
        <div className="mx-auto h-px max-w-xl bg-white/20" />
        <p className="my-4 text-base md:text-lg">
          <a
            className="link underline"
            href="https://www.ecehh.org/news/2hr-nature-dose/"
            target="_blank"
            rel="noreferrer"
          >
            Studies show
          </a>{" "}
          2+ hours in Nature a week reduces stress, boosts mood & improves immune function.
        </p>
        <div className="mx-auto h-px max-w-xl bg-white/20" />
      </div>
      <Transition appear show={isJoinModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsJoinModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative h-[calc(100vh-2rem)] w-full max-w-md transform overflow-hidden rounded-[36px] text-left shadow-xl transition-all">
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: modalBackgroundImage
                          ? `url(${modalBackgroundImage})`
                          : "none",
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                  </div>
                  <div className="relative flex h-full flex-col px-8 py-10 text-white md:px-10 md:py-12">
                    <div className="flex items-start justify-end gap-4" />
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="text-base-content/90">
                        <p className="font-serif text-2xl text-base-content">
                          We’re excited to have you join Nature Club.
                        </p>
                        <p className="mt-4 text-sm text-base-content/80">
                          We are in currently in beta testing and would like to offer you free
                          founding membership as we get launched in your area.
                        </p>
                        <p className="mt-4 text-base text-base-content">
                          What would you like to join as?
                        </p>
                        <div className="mt-6 flex flex-col gap-4">
                          <button className="btn btn-primary" onClick={openMemberFlow}>
                            Become a Member
                          </button>
                          <button className="btn btn-outline" onClick={openHostFlow}>
                            Become a Host
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <WaitlistModal
        title="Become a host"
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        steps={hostSteps}
        onComplete={submitHostLead}
        backgroundImage={modalBackgroundImage}
      />
      <WaitlistModal
        title="Become a member"
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        steps={memberSteps}
        onComplete={submitMemberLead}
        backgroundImage={modalBackgroundImage}
      />
    </div>
  );
};

export default WaitlistSection;
