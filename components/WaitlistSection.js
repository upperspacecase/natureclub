import ButtonLead from "./ButtonLead";

const WaitlistSection = () => {
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
            <h3 className="text-xl font-serif">Participants</h3>
            <p className="mt-2 text-sm text-base-content/80">
              Be first to hear about upcoming sessions.
            </p>
            <div className="mt-4">
              <ButtonLead
                role="participant"
                buttonLabel="Join as participant"
                placeholder="you@example.com"
                extraStyle="max-w-none"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-base-content/10 bg-base-100/40 p-6">
            <h3 className="text-xl font-serif">Host interest</h3>
            <p className="mt-2 text-sm text-base-content/80">
              Let us know you want to host sessions.
            </p>
            <div className="mt-4">
              <ButtonLead
                role="host_interest"
                buttonLabel="Join as host"
                placeholder="you@example.com"
                extraStyle="max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
