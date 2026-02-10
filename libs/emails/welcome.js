import { getSiteUrl } from "@/libs/site-url";

const CONTACT_EMAIL = "hi@nature-club.co";
const INSTAGRAM_HANDLE = "@nature.clb";
const SITE_URL = getSiteUrl();
const SITE_HOSTNAME = new URL(`${SITE_URL}/`).hostname;
const LOGO_URL = `${SITE_URL}/logo-light.png`;

const brandColors = {
  page: "#040404",
  panel: "#0b0b0b",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.78)",
};

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    background: ${brandColors.page};
    color: ${brandColors.text};
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .shell {
    padding: 24px 12px;
  }
  .container {
    max-width: 640px;
    margin: 0 auto;
    border: 1px solid ${brandColors.border};
    border-radius: 24px;
    overflow: hidden;
    background: ${brandColors.page};
  }
  .hero {
    padding: 28px 32px 24px;
    background: radial-gradient(circle at 15% 12%, rgba(255, 255, 255, 0.14), transparent 48%),
      linear-gradient(180deg, #111111 0%, #050505 100%);
  }
  .logo {
    display: block;
    height: 42px;
    width: auto;
  }
  .headline {
    margin: 22px 0 0;
    font-family: 'Times New Roman', Georgia, serif;
    font-style: italic;
    font-size: 38px;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: ${brandColors.text};
  }
  .content {
    padding: 32px;
    background: ${brandColors.panel};
  }
  p {
    margin: 0 0 16px;
    font-size: 16px;
    line-height: 1.68;
    color: ${brandColors.muted};
  }
  strong {
    color: ${brandColors.text};
  }
  .highlight {
    color: ${brandColors.text};
    font-weight: 600;
  }
  .social-pill {
    display: inline-block;
    margin: 8px 0 18px;
    padding: 11px 20px;
    border-radius: 10px;
    background: #ffffff;
    color: #1a1a1a;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.005em;
  }
  .signoff {
    margin-top: 12px;
  }
  .footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid ${brandColors.border};
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.6);
  }
  .footer a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
  }
`;

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const emailShell = ({ bodyHtml }) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="shell">
    <div class="container">
      <div class="hero">
        <img class="logo" src="${LOGO_URL}" alt="Nature Club" width="93" height="42" />
        <h1 class="headline">Spend more time<br>in Nature.</h1>
      </div>
      <div class="content">
        ${bodyHtml}
        <div class="footer">
          Nature Club<br>
          <a href="${SITE_URL}">${SITE_HOSTNAME}</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

export const getMemberWelcomeEmail = ({ responses } = {}) => {
  const subject = "Welcome to Nature Club 🌿";
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
  const subject = "Welcome to Nature Club 🌿";
  const highlight = withQuotes(getHostHighlight(responses));
  const safeHighlight = escapeHtml(highlight);

  const text = `Hey,\n\nAs a Founding Host of Nature Club, you're key to our roots. We'd love to find out more about ${highlight}.\n\nWe'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.\n\nUntil then, feel free to follow ${INSTAGRAM_HANDLE} for field notes.\n\nCheers,\nThe Nature Club Team\n${CONTACT_EMAIL}`;

  const html = emailShell({
    bodyHtml: `
      <p><strong>Hey,</strong></p>
      <p>As a Founding Host of Nature Club, you're key to our roots. We'd love to find out more about <span class="highlight">${safeHighlight}</span>.</p>
      <p>We'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.</p>
      <a class="social-pill" href="https://instagram.com/nature.clb">Follow ${INSTAGRAM_HANDLE}</a>
      <p class="signoff">Cheers,<br>The Nature Club Team<br>${CONTACT_EMAIL}</p>
    `,
  });

  return { subject, text, html };
};
