"use client";

import { useMemo, useState } from "react";
import WaitlistModal from "./WaitlistModal";

const WaitlistSection = () => {
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [hostLocation, setHostLocation] = useState({ city: "", coords: "" });
  const [hostSessionsPerMonth, setHostSessionsPerMonth] = useState("");
  const [hostBookingsPerSession, setHostBookingsPerSession] = useState("");
  const [hostRate, setHostRate] = useState("");
  const [hostMessaging, setHostMessaging] = useState("");
  const [hostFeatures, setHostFeatures] = useState([]);
  const [hostFeaturesOther, setHostFeaturesOther] = useState("");
  const [hostEmail, setHostEmail] = useState("");

  const [memberLocation, setMemberLocation] = useState({ city: "", coords: "" });
  const [memberInterests, setMemberInterests] = useState([]);
  const [memberInterestsOther, setMemberInterestsOther] = useState("");
  const [memberMotivations, setMemberMotivations] = useState([]);
  const [memberMotivationsOther, setMemberMotivationsOther] = useState("");
  const [memberPrice, setMemberPrice] = useState(120);
  const [memberPayPerBooking, setMemberPayPerBooking] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const hostFeatureOptions = [
    "Calendar sync (Google, Outlook)",
    "Automated reminders/confirmations",
    "Payment processing",
    "Member CRM (email, history, preferences)",
    "Analytics (attendance trends, revenue tracking)",
    "Reviews/ratings",
    "Group booking capability",
    "Waitlist management",
    "Messaging with members",
  ];

  const memberInterestOptions = [
    "Yoga",
    "Fitness Class",
    "Meditation / Sound Bath",
    "Hiking",
    "Tea Ceremony",
    "Breath Work",
    "Dining Experience",
    "Foraging",
    "Wilderness Skills",
    "Outdoor Concert",
  ];

  const memberMotivationOptions = [
    "Transparent reviews from real members",
    "Values/values alignment (sustainability, community-focused, etc.)",
    "Bundled membership (book multiple activities across facilitators)",
    "Better price/value",
    "Time savings in booking process",
    "Community connection with other members",
    "Visible local impact/regeneration component",
  ];

  const toggleSelection = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

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

  const hostSteps = useMemo(
    () => [
      {
        key: "host-location",
        title: "Location",
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
        title:
          "Bookings/Sessions — how many sessions per month and average bookings?",
        isComplete: () =>
          Boolean(hostSessionsPerMonth) && Boolean(hostBookingsPerSession),
        content: (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min="0"
              placeholder="Sessions per month"
              className="input input-bordered w-full"
              value={hostSessionsPerMonth}
              onChange={(e) => setHostSessionsPerMonth(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Avg. bookings per session"
              className="input input-bordered w-full"
              value={hostBookingsPerSession}
              onChange={(e) => setHostBookingsPerSession(e.target.value)}
            />
          </div>
        ),
      },
      {
        key: "host-price",
        title: "Price — what are your rates?",
        isComplete: () => Boolean(hostRate),
        content: (
          <input
            type="text"
            placeholder="$ / session or package"
            className="input input-bordered w-full"
            value={hostRate}
            onChange={(e) => setHostRate(e.target.value)}
          />
        ),
      },
      {
        key: "host-messaging",
        title: "What do you currently use? (Messaging)",
        isComplete: () => Boolean(hostMessaging),
        content: (
          <input
            type="text"
            placeholder="WhatsApp, email, SMS, etc."
            className="input input-bordered w-full"
            value={hostMessaging}
            onChange={(e) => setHostMessaging(e.target.value)}
          />
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
              {hostFeatureOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={hostFeatures.includes(option)}
                    onChange={() =>
                      toggleSelection(option, hostFeatures, setHostFeatures)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
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
      hostMessaging,
      hostRate,
      hostSessionsPerMonth,
    ]
  );

  const memberSteps = useMemo(
    () => [
      {
        key: "member-location",
        title: "Location",
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
          memberInterests.length > 0 || memberInterestsOther.trim().length > 0,
        content: (
          <div className="space-y-3">
            <div className="grid gap-2">
              {memberInterestOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={memberInterests.includes(option)}
                    onChange={() =>
                      toggleSelection(option, memberInterests, setMemberInterests)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="Other..."
                className="input input-bordered w-full"
                value={memberInterestsOther}
                onChange={(e) => setMemberInterestsOther(e.target.value)}
              />
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
              {memberMotivationOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={memberMotivations.includes(option)}
                    onChange={() =>
                      toggleSelection(option, memberMotivations, setMemberMotivations)
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
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
        isComplete: () => Boolean(memberPrice || memberPayPerBooking),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                className="range range-primary"
                value={memberPrice}
                onChange={(e) => setMemberPrice(Number(e.target.value))}
              />
              <p className="text-sm text-base-content/70">
                ${memberPrice}
                {memberPrice >= 500 ? "+" : ""} / month
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={memberPayPerBooking}
                onChange={(e) => setMemberPayPerBooking(e.target.checked)}
              />
              <span>Prefer pay-per-booking (no membership)</span>
            </label>
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
      memberPayPerBooking,
      memberPrice,
    ]
  );

  return (
    <section className="bg-base-200 px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-serif">Join the waitlist</h2>
          <p className="text-sm text-base-content/80">
            Choose how you want to be involved.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-base-content/10 bg-base-100/40 p-6">
            <h3 className="text-xl font-serif">Members</h3>
            <p className="mt-2 text-sm text-base-content/80">
              Be first to hear about upcoming sessions.
            </p>
            <div className="mt-4">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setIsMemberModalOpen(true)}
              >
                Join as member
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-base-content/10 bg-base-100/40 p-6">
            <h3 className="text-xl font-serif">Host interest</h3>
            <p className="mt-2 text-sm text-base-content/80">
              Let us know you want to host sessions.
            </p>
            <div className="mt-4">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setIsHostModalOpen(true)}
              >
                Join as host
              </button>
            </div>
          </div>
        </div>
      </div>
      <WaitlistModal
        title="Hosts"
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        steps={hostSteps}
      />
      <WaitlistModal
        title="Members"
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        steps={memberSteps}
      />
    </section>
  );
};

export default WaitlistSection;
