"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";

const WaitlistModal = ({
  title,
  isOpen,
  onClose,
  steps,
  onComplete,
  backgroundImage,
  introCopy,
}) => {
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
              <Dialog.Panel className="relative h-[calc(100vh-2rem)] w-full max-w-md transform overflow-hidden rounded-[36px] text-left text-white shadow-xl transition-all">
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
                <div className="relative flex h-full flex-col px-8 py-10 md:px-10 md:py-12">
                  <div className="flex items-start justify-between gap-4">
                    <Dialog.Title as="h2" className="text-lg font-semibold text-white">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-sm text-white/80 transition hover:border-white hover:text-white"
                    >
                      x
                    </button>
                  </div>

                  <div className="mt-3 text-sm text-white/80">
                    {activeStep + 1}/{totalSteps}
                  </div>

                  <div className="flex flex-1 flex-col justify-center space-y-4 overflow-hidden">
                    {introCopy && activeStep === 0 && (
                      <p className="text-sm text-white/80">
                        {introCopy}
                      </p>
                    )}
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white/90 backdrop-blur-sm">
                      <div className="text-2xl font-semibold text-white">
                        {steps[activeStep].title}
                      </div>
                      <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
                        {steps[activeStep].content}
                      </div>
                    </div>
                    <div className="mt-2">
                      <button
                        className="btn btn-primary btn-block"
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
