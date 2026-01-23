"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);
  return (
    <footer
      className="relative overflow-hidden text-base-content"
      style={{
        backgroundImage: "url(/pexels-andrejcook-396714.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base-100 to-transparent" />

      <div className="relative z-10 min-h-[240px] px-6 py-10 md:px-10">
        <div className="mx-auto flex min-h-[240px] max-w-6xl items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.svg"
            alt="Logo"
            className="absolute bottom-8 left-6 h-44 w-auto md:bottom-10 md:left-10 md:h-56"
          />
        </div>
        <div className="absolute bottom-8 right-6 z-10 flex flex-col items-end gap-2 text-xs uppercase tracking-[0.3em] text-base-content/70 md:right-10">
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
            <div className="flex min-h-full items-start justify-center p-4 md:items-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-2xl transform rounded-xl bg-base-100 p-6 text-left shadow-xl transition-all md:p-8">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <Dialog.Title as="h2" className="text-xl font-semibold">
                      {activeModal === "about"
                        ? "About"
                        : activeModal === "vision"
                          ? "Vision"
                          : "Contact"}
                    </Dialog.Title>
                    <button
                      className="btn btn-square btn-ghost btn-sm"
                      onClick={closeModal}
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

                  {activeModal === "about" && (
                    <div className="space-y-3 text-base-content/80">
                      <p>Just a couple of unique monkeys building the best tools we can.</p>
                      <p>With Love. Tay &amp; River</p>
                    </div>
                  )}

                  {activeModal === "vision" && (
                    <div className="space-y-3 text-base-content/80">
                      <p>
                        We imagine a world where technology gracefully serves life instead
                        of consuming it—where people have more time for genuine
                        connection, unexpected joy, and the pursuits that make them truly
                        feel alive.
                      </p>
                    </div>
                  )}

                  {activeModal === "contact" && (
                    <div className="space-y-3 text-base-content/80">
                      <p>
                        Reach out if you want to build with us —{" "}
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
