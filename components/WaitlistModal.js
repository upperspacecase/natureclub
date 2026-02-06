"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";

const WaitlistModal = ({
  title,
  isOpen,
  onClose,
  steps,
  onComplete,
  onStepContinue,
  backgroundImage,
  introCopy,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [attemptedStep, setAttemptedStep] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(0);
      setAttemptedStep(null);
      setIsAdvancing(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const totalSteps = steps.length;
  const stepStatus = useMemo(
    () => steps.map((step) => step.isComplete?.()),
    [steps]
  );

  const handleContinue = async (index) => {
    if (!stepStatus[index]) {
      setAttemptedStep(index);
      return;
    }

    if (index < totalSteps - 1 && onStepContinue) {
      setIsAdvancing(true);
      try {
        const canAdvance = await onStepContinue(index);
        if (canAdvance === false) {
          return;
        }
      } finally {
        setIsAdvancing(false);
      }
    }

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
              <Dialog.Panel className="waitlist-modal relative h-[calc(100vh-2rem)] w-full max-w-md transform overflow-hidden rounded-[36px] text-left text-white shadow-xl transition-all">
                <Dialog.Title className="sr-only">{title}</Dialog.Title>
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : "none",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="relative flex h-full min-h-0 flex-col px-8 pb-10 pt-[30px] md:px-10 md:pb-12 md:pt-[30px]">
                  <div className="mt-0.5 mb-[30px]">
                    <div className="flex w-full gap-1 px-1 py-2.5">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <button
                          key={`step-${index}`}
                          type="button"
                          onClick={() => {
                            setActiveStep(index);
                            setAttemptedStep(null);
                          }}
                          aria-label={`Go to step ${index + 1}`}
                          className={`h-1.5 flex-1 rounded-[5px] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                            index <= activeStep
                              ? "bg-white"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-1 min-h-0 flex-col justify-start gap-4 md:justify-center">
                    {introCopy && activeStep === 0 && (
                      <p className="text-sm text-white/80">
                        {introCopy}
                      </p>
                    )}
                    <div className="flex min-h-0 flex-col rounded-3xl border border-white/15 bg-white/10 p-5 text-white/90 backdrop-blur-sm">
                      <div className="flex items-start gap-2 text-lg font-semibold text-white sm:text-xl">
                        <span>{steps[activeStep].title}</span>
                        {attemptedStep === activeStep && !stepStatus[activeStep] && (
                          <span className="text-red-400" aria-hidden="true">
                            *
                          </span>
                        )}
                      </div>
                      <div className="relative mt-4 flex-1 min-h-0">
                        <div className="h-full overflow-y-auto pr-1 pb-6">
                          {steps[activeStep].content}
                        </div>
                        {steps[activeStep].showScrollHint && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center">
                            <div className="absolute bottom-2 flex items-center text-white/70">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4 animate-scrollHint"
                                aria-hidden="true"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 shrink-0">
                      <button
                        className="btn btn-primary btn-block w-full"
                        onClick={() => handleContinue(activeStep)}
                        disabled={isSubmitting || isAdvancing}
                        aria-disabled={!stepStatus[activeStep]}
                      >
                        {isSubmitting || isAdvancing ? (
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
