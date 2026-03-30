import { getSiteUrl } from "@/libs/site-url";
import { brandColors } from "./styles";

export const CONTACT_EMAIL = "hi@nature-club.co";
export const INSTAGRAM_HANDLE = "@nature.clb";
export const SITE_URL = getSiteUrl();
export const SITE_HOSTNAME = new URL(`${SITE_URL}/`).hostname;
export const LOGO_URL = `${SITE_URL}/logo-light.png`;

export const baseStyles = `
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
  .cta-button {
    display: inline-block;
    margin: 8px 0 18px;
    padding: 12px 24px;
    border-radius: 10px;
    background: #ffffff;
    color: #1a1a1a;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.005em;
  }
  .category-pill {
    display: inline-block;
    margin: 0 0 16px;
    padding: 6px 16px;
    border-radius: 20px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    text-transform: capitalize;
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

export const emailShell = ({ headline = "Spend more time<br>in Nature.", bodyHtml }) => `<!DOCTYPE html>
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
        <h1 class="headline">${headline}</h1>
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
