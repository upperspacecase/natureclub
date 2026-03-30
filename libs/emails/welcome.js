import { escapeHtml } from "./styles";
import { emailShell, CONTACT_EMAIL, INSTAGRAM_HANDLE } from "./shell";

const withQuotes = (value) => `"${String(value || "").trim()}"`;

const getMemberHighlight = (responses) => {
  const member = responses?.member || {};
  return (
    member.interestsOther ||
    member.interests?.[0] ||
    member.motivationsOther ||
    member.motivations?.[0] ||
    "your outdoor interests"
  );
};

const getHostHighlight = (responses) => {
  const host = responses?.host || {};
  return (
    host.experience ||
    host.featuresOther ||
    host.features?.[0] ||
    "your outdoor experiences"
  );
};

export const getMemberWelcomeEmail = ({ responses } = {}) => {
  const subject = "Welcome to Nature Club";
  const highlight = withQuotes(getMemberHighlight(responses));
  const safeHighlight = escapeHtml(highlight);

  const text = `Hey,\n\nThrilled you're joining us as a Founding Member of Nature Club! We saw you mentioned ${highlight} - love that energy.\n\nYou're in the founding crew helping us grow like the first sprouts of spring: slowly but surely. We'll ping you soon when we're ready to launch our first experiences near you.\n\nUntil then, follow ${INSTAGRAM_HANDLE} for field notes.\n\nSee you outside,\nThe Nature Club Team\n${CONTACT_EMAIL}`;

  const html = emailShell({
    bodyHtml: `
      <p><strong>Hey,</strong></p>
      <p>Thrilled you're joining us as a Founding Member of Nature Club! We saw you mentioned <span class="highlight">${safeHighlight}</span> - love that energy.</p>
      <p>You're in the founding crew helping us grow like the first sprouts of spring: slowly but surely. We'll ping you soon when we're ready to launch our first experiences near you.</p>
      <a class="social-pill" href="https://instagram.com/nature.clb">Follow ${INSTAGRAM_HANDLE}</a>
      <p class="signoff">See you outside,<br>The Nature Club Team<br>${CONTACT_EMAIL}</p>
    `,
  });

  return { subject, text, html };
};

export const getHostWelcomeEmail = ({ responses } = {}) => {
  const subject = "Welcome to Nature Club";
  const highlight = withQuotes(getHostHighlight(responses));
  const safeHighlight = escapeHtml(highlight);

  const text = `Hey,\n\nAs a Founding Facilitator of Nature Club, you're key to our roots. We'd love to find out more about ${highlight}.\n\nWe'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.\n\nUntil then, feel free to follow ${INSTAGRAM_HANDLE} for field notes.\n\nCheers,\nThe Nature Club Team\n${CONTACT_EMAIL}`;

  const html = emailShell({
    bodyHtml: `
      <p><strong>Hey,</strong></p>
      <p>As a Founding Facilitator of Nature Club, you're key to our roots. We'd love to find out more about <span class="highlight">${safeHighlight}</span>.</p>
      <p>We'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.</p>
      <a class="social-pill" href="https://instagram.com/nature.clb">Follow ${INSTAGRAM_HANDLE}</a>
      <p class="signoff">Cheers,<br>The Nature Club Team<br>${CONTACT_EMAIL}</p>
    `,
  });

  return { subject, text, html };
};
