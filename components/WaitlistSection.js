"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/libs/api";
import WaitlistModal from "./WaitlistModal";

const WaitlistSection = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [hostLocation, setHostLocation] = useState({ city: "", coords: "" });
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
  const [memberPricingSelections, setMemberPricingSelections] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [modalBackgroundImage, setModalBackgroundImage] = useState("");

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

  const memberInterestOptions = useMemo(
    () => [
      "Movement (fitness, primal movement, mobility, qi gong, dance, surfing, paddling)",
      "Wellness (yoga, breathwork, meditation, sound bath)",
      "Arts (crafts, music, writing, visual arts)",
      "Wildlife (birdwatching, citizen science, tracking, ecology walks)",
      "Social (tea ceremony, outdoor dining)",
      "Cultivation (gardening, farming, permaculture, composting)",
      "Restoration (volunteering, conservation, clean-ups, tree planting)",
      "Cultural (harvest festivals, music festivals, solstice events, seasonal rites)",
      "Skills (foraging, natural building, sailing, navigation, firecraft)",
      "Adventure (hiking, camping, expeditions)",
      "Other -",
    ],
    []
  );

  const memberMotivationOptions = useMemo(
    () => [
      "Transparent reviews from real members",
      "Values/values alignment (sustainability, community-focused, etc.)",
      "Bundled membership (book multiple activities across facilitators)",
      "Better price/value",
      "Time savings in booking process",
      "Community connection with other members",
      "Visible local impact/regeneration component",
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

  const submitHostLead = async () => {
    try {
      await apiClient.post("/lead", {
        role: "host",
        email: hostEmail,
        source: "modal",
        responses: {
          location: hostLocation,
          sessionsPerMonth: hostSessionsPerMonth,
          bookingsPerSession: hostBookingsPerSession,
          rate: hostRate,
          rateRange: hostRateIsRange
            ? { min: hostRateMin, max: hostRateMax }
            : null,
          tools: hostTools,
          toolsOther: hostToolsOther,
          features: hostFeatures,
          featuresOther: hostFeaturesOther,
        },
      });
      toast.success("Thanks! We’ll be in touch.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      return false;
    }
  };

  const submitMemberLead = async () => {
    try {
      await apiClient.post("/lead", {
        role: "member",
        email: memberEmail,
        source: "modal",
        responses: {
          location: memberLocation,
          interests: memberInterests,
          interestsOther: memberInterestsOther,
          motivations: memberMotivations,
          motivationsOther: memberMotivationsOther,
          pricingSelections: memberPricingSelections,
        },
      });
      toast.success("Thanks! We’ll be in touch.");
      return true;
    } catch (error) {
      console.error(error);
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleUseLocation(setHostLocation)}
              >
                Use my location
              </button>
              <input
                type="text"
                placeholder="City or town"
                className="input input-bordered w-full"
                value={hostLocation.city}
                onChange={(e) =>
                  setHostLocation((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            {hostLocation.coords && (
              <p className="text-xs text-base-content/70">
                Location shared: {hostLocation.coords}
              </p>
            )}
          </div>
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
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                placeholder="No. of sessions"
                className="input input-bordered mx-2 w-20 px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={hostSessionsPerMonth}
                onChange={(e) => setHostSessionsPerMonth(e.target.value)}
              />
              with about{" "}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                placeholder="Avg. no. of bookings"
                className="input input-bordered mx-2 w-24 px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={hostBookingsPerSession}
                onChange={(e) => setHostBookingsPerSession(e.target.value)}
              />{" "}
              bookings per session.
            </p>
          </div>
        ),
      },
      {
        key: "host-price",
        title: "What are your rates?",
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
        title:
          "Which tools do you currently use for finding clients and organizing sessions?",
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
                    className={`w-full rounded-full border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-base-content bg-base-content/15 text-base-content"
                        : "border-base-content/20 text-base-content/80 hover:border-base-content"
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
        title: "What features would be most valuable to you in a booking platform?",
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
                    className={`w-full rounded-full border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-base-content bg-base-content/15 text-base-content"
                        : "border-base-content/20 text-base-content/80 hover:border-base-content"
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
      hostSessionsPerMonth,
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleUseLocation(setMemberLocation)}
              >
                Use my location
              </button>
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
            </div>
            {memberLocation.coords && (
              <p className="text-xs text-base-content/70">
                Location shared: {memberLocation.coords}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "member-interests",
        title:
          "What types of events, experiences and classes are you interested in?",
        isComplete: () =>
          memberInterests.length > 0 &&
          (!memberInterests.includes("Other -") || memberInterestsOther.trim()),
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
                    className={`w-full rounded-full border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-base-content bg-base-content/15 text-base-content"
                        : "border-base-content/20 text-base-content/80 hover:border-base-content"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              {memberInterests.includes("Other -") && (
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
        title: "What would make you MORE likely to join Nature Club?",
        isComplete: () =>
          memberMotivations.length > 0 ||
          memberMotivationsOther.trim().length > 0,
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberMotivationOptions.map((option) => {
                const isSelected = memberMotivations.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      toggleSelection(option, memberMotivations, setMemberMotivations)
                    }
                    className={`w-full rounded-full border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-base-content bg-base-content/15 text-base-content"
                        : "border-base-content/20 text-base-content/80 hover:border-base-content"
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
                value={memberMotivationsOther}
                onChange={(e) => setMemberMotivationsOther(e.target.value)}
              />
            </div>
          </div>
        ),
      },
      {
        key: "member-price",
        title:
          "What would you be willing to pay for a monthly membership to Nature Club?",
        isComplete: () => memberPricingSelections.length > 0,
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberPricingOptions.map((option) => {
                const isSelected = memberPricingSelections.includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-3 rounded-full border px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? "border-base-content bg-base-content/15 text-base-content"
                        : "border-base-content/20 text-base-content/80 hover:border-base-content"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={isSelected}
                      onChange={() =>
                        toggleSelection(
                          option,
                          memberPricingSelections,
                          setMemberPricingSelections
                        )
                      }
                    />
                    <span>{option}</span>
                  </label>
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
      memberInterestOptions,
      memberMotivationOptions,
      memberPricingOptions,
      memberPricingSelections,
    ]
  );

  const openMemberFlow = () => {
    setIsJoinModalOpen(false);
    setIsMemberModalOpen(true);
  };

  const openHostFlow = () => {
    setIsJoinModalOpen(false);
    setIsHostModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-white/25 bg-white/20 px-6 py-5 text-center text-base-content/90 shadow-xl backdrop-blur-sm">
        <p className="text-base font-medium md:text-lg">
          Studies show{" "}
          <a
            className="link underline"
            href="https://www.ecehh.org/news/2hr-nature-dose/"
            target="_blank"
            rel="noreferrer"
          >
            at least 2 hours in Nature a week
          </a>{" "}
          reduces stress, boosts mood & improves immune function.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start">
        <button className="btn btn-primary" onClick={() => setIsJoinModalOpen(true)}>
          Join now
        </button>
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
                  <div className="flex items-start justify-between gap-4">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-base-content">
                      Join now
                    </Dialog.Title>
                    <button
                      className="btn btn-square btn-ghost btn-sm"
                      onClick={() => setIsJoinModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-base-content/90 backdrop-blur-sm">
                      <div className="text-2xl font-semibold text-base-content">
                        Choose your role
                      </div>
                      <div className="mt-6 flex flex-col gap-4">
                        <button className="btn btn-outline" onClick={openHostFlow}>
                          Become a Host
                        </button>
                        <button className="btn btn-primary" onClick={openMemberFlow}>
                          Become a Member
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
        introCopy={
          "We are in currently in beta testing and would like to offer you a founding host membership as we get launched in your area. Please fill out answer a few questions below to secure your founding membership."
        }
      />
      <WaitlistModal
        title="Become a member"
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        steps={memberSteps}
        onComplete={submitMemberLead}
        backgroundImage={modalBackgroundImage}
        introCopy={
          "We are in currently in beta testing and would like to offer you free founding membership as we get launched in your area. Please fill out answer a few questions below to secure your founding membership."
        }
      />
    </div>
  );
};

export default WaitlistSection;
