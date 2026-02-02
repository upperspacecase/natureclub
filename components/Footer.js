"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);
  return (
    <footer
      className="mt-16 relative overflow-hidden text-base-content md:mt-24"
      style={{
        backgroundImage: "url(/pexels-andrejcook-396714.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base-100 to-transparent" />

      <div className="relative z-10 min-h-[200px] px-6 py-10 md:px-10">
        <div className="mx-auto flex min-h-[200px] max-w-6xl items-end justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.svg"
            alt="Logo"
            className="h-22 w-auto md:h-28"
          />
          <div className="flex flex-col items-end gap-2 text-xs uppercase tracking-[0.3em] text-base-content/70">
            <button type="button" onClick={() => setActiveModal("about")}>
              About
            </button>
            <button type="button" onClick={() => setActiveModal("vision")}>
              Vision
            </button>
            <button type="button" onClick={() => setActiveModal("contact")}>
              Contact
            </button>
          </div>
        </div>
      </div>

      <Transition appear show={Boolean(activeModal)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
            <div className="flex min-h-full items-end justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-3xl transform rounded-[36px] border border-white/25 bg-white/20 p-8 text-left text-base-content/90 shadow-xl backdrop-blur-sm transition-all md:p-12">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <Dialog.Title as="h2" className="text-xl font-semibold">
                      {activeModal === "about"
                        ? "About"
                        : activeModal === "vision"
                          ? "Vision"
                          : "Contact"}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={closeModal}
                      aria-label="Close"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-base-content/40 text-sm text-base-content/80 transition hover:border-base-content hover:text-base-content"
                    >
                      x
                    </button>
                  </div>

                  {activeModal === "about" && (
                    <div className="space-y-4 text-base-content/80">
                      <p>
                        Nature Club started to make the proven “Nature dose” effortless,
                        fostering deeper belonging to earth and each other — one local
                        experience at a time. Not to replace spontaneity, but to make
                        Nature a habit again—for individuals, families, and teams who
                        forgot how to get started.
                      </p>
                      <p>
                        We’re a community of guides, teachers, and Nature lovers making it
                        simple to get outside with people who know what they’re doing.
                        Every listing is hosted by someone local. Every review is from
                        someone who actually showed up. No middlemen, no mass tourism—just
                        real people sharing what they love. Join as a guest. Host as an
                        expert. Or both.
                      </p>
                    </div>
                  )}

                  {activeModal === "vision" && (
                    <div className="space-y-4 text-base-content/80">
                      <p>
                        Our vision is to support a million people spending two more hours
                        outside each week. That’s it. Small actions, repeated, create
                        change. When you book a foraging class, you learn a skill. When
                        you join a hike, you meet neighbors. When you volunteer, we
                        restore land.
                      </p>
                      <p>
                        We want anyone to be able to find an outdoor activity within 20
                        minutes of wherever they live—and for hosts to earn sustainable
                        income doing what they love, with each booking also supporting
                        local ecosystem restoration.
                      </p>
                    </div>
                  )}

                  {activeModal === "contact" && (
                    <div className="space-y-4 text-base-content/80">
                      <p>
                        Get in touch by emailing us at -{" "}
                        <a className="link link-hover" href="mailto:hi@life-time.co">
                          hi@life-time.co
                        </a>
                      </p>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </footer>
  );
};

export default Footer;
