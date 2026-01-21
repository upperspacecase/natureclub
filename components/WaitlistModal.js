"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";

const WaitlistModal = ({ title, isOpen, onClose, steps, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(0);
    }
  }, [isOpen]);

  const totalSteps = steps.length;
  const stepStatus = useMemo(
    () => steps.map((step) => step.isComplete?.()),
    [steps]
  );

  const handleContinue = async (index) => {
    if (index < totalSteps - 1) {
      setActiveStep(index + 1);
      return;
    }

    if (!onComplete) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const didSucceed = await onComplete();
      if (didSucceed !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-start justify-center p-2 md:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-3xl transform rounded-xl bg-base-100 p-6 text-left shadow-xl transition-all md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title as="h2" className="text-xl font-semibold">
                      {title}
                    </Dialog.Title>
                    <p className="text-sm text-base-content/70">
                      Step {Math.min(activeStep + 1, totalSteps)}/{totalSteps}
                    </p>
                  </div>
                  <button className="btn btn-square btn-ghost btn-sm" onClick={onClose}>
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

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-base font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-base-content/20 text-xs">
                      {activeStep + 1}
                    </span>
                    <span>{steps[activeStep].title}</span>
                  </div>
                  <div className="space-y-4 text-base-content/80">
                    {steps[activeStep].content}
                    <div className="flex justify-end">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleContinue(activeStep)}
                        disabled={!stepStatus[activeStep] || isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : activeStep === totalSteps - 1 ? (
                          "Submit"
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WaitlistModal;
