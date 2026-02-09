const CONTACT_EMAIL = "hi@nature-club.co";
const INSTAGRAM_HANDLE = "@nature.clb";

const brandColors = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  background: "#fafafa",
  white: "#ffffff",
};

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: ${brandColors.background};
    color: ${brandColors.primary};
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: ${brandColors.white};
  }
  .content {
    padding: 40px 32px;
  }
  p {
    font-size: 16px;
    line-height: 1.65;
    color: ${brandColors.primary};
    margin: 0 0 16px;
  }
  .signoff {
    margin-top: 28px;
  }
  .footer-link {
    color: ${brandColors.secondary};
    text-decoration: none;
  }
`;

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
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

export const getMemberWelcomeEmail = ({ responses } = {}) => {
  const subject = "Welcome to Nature Club 🌿";
  const highlight = withQuotes(getMemberHighlight(responses));
  const safeHighlight = escapeHtml(highlight);

  const text = `Hey,

Thrilled you're joining us as a Founding Member of Nature Club! We saw you mentioned ${highlight} - love that energy.

You're in the founding crew helping us grow like the first sprouts of spring: slowly but surely. We'll ping you soon when we're ready to launch our first experiences near you.

Until then, follow ${INSTAGRAM_HANDLE} for field notes.

See you outside,
The Nature Club Team
${CONTACT_EMAIL}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hey,</p>
      <p>Thrilled you're joining us as a Founding Member of Nature Club! We saw you mentioned ${safeHighlight} - love that energy.</p>
      <p>You're in the founding crew helping us grow like the first sprouts of spring: slowly but surely. We'll ping you soon when we're ready to launch our first experiences near you.</p>
      <p>Until then, follow <a class="footer-link" href="https://instagram.com/nature.clb">${INSTAGRAM_HANDLE}</a> for field notes.</p>
      <p class="signoff">See you outside,<br>The Nature Club Team<br><a class="footer-link" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
};

export const getHostWelcomeEmail = ({ responses } = {}) => {
  const subject = "Welcome to Nature Club 🌿";
  const highlight = withQuotes(getHostHighlight(responses));
  const safeHighlight = escapeHtml(highlight);

  const text = `Hey,

As a Founding Host of Nature Club, you're key to our roots. We'd love to find out more about ${highlight}.

We'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.

Until then, feel free to follow ${INSTAGRAM_HANDLE} for field notes.

Cheers,
The Nature Club Team
${CONTACT_EMAIL}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hey,</p>
      <p>As a Founding Host of Nature Club, you're key to our roots. We'd love to find out more about ${safeHighlight}.</p>
      <p>We'll reach out shortly to ask a few more questions to better understand your offering once we're set to launch in your area, with your experiences prioritized.</p>
      <p>Until then, feel free to follow <a class="footer-link" href="https://instagram.com/nature.clb">${INSTAGRAM_HANDLE}</a> for field notes.</p>
      <p class="signoff">Cheers,<br>The Nature Club Team<br><a class="footer-link" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
};
