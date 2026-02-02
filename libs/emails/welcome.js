import config from "@/config";

const brandColors = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  accent: "#22c55e",
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
  .header {
    background: ${brandColors.primary};
    padding: 48px 40px;
    text-align: center;
  }
  .header h1 {
    color: ${brandColors.white};
    font-size: 28px;
    font-weight: 400;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .content {
    padding: 48px 40px;
  }
  .intro {
    font-size: 20px;
    line-height: 1.6;
    margin-bottom: 32px;
    color: ${brandColors.primary};
  }
  .section {
    margin-bottom: 32px;
  }
  .section-title {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${brandColors.secondary};
    margin-bottom: 12px;
  }
  .section-content {
    font-size: 16px;
    line-height: 1.6;
    color: ${brandColors.primary};
  }
  .cta-button {
    display: inline-block;
    background: ${brandColors.primary};
    color: ${brandColors.white};
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 9999px;
    font-size: 16px;
    font-weight: 500;
    margin: 24px 0;
  }
  .divider {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 32px 0;
  }
  .footer {
    background: ${brandColors.background};
    padding: 32px 40px;
    text-align: center;
  }
  .footer p {
    font-size: 14px;
    color: ${brandColors.secondary};
    margin: 8px 0;
  }
  .social-links {
    margin-top: 16px;
  }
  .social-links a {
    color: ${brandColors.primary};
    text-decoration: none;
    margin: 0 12px;
  }
`;

export const getMemberWelcomeEmail = ({ email }) => {
  const subject = `Welcome to Nature Club — Your outdoor journey begins`;

  const text = `Welcome to Nature Club

Hi there,

Thank you for joining Nature Club. You're now part of a growing community of people who believe the best experiences happen outdoors.

What happens next:
• We're curating nature-based classes and experiences in your area
• You'll be the first to know when we launch in your region
• We'll share stories, inspiration, and early access to unique outdoor experiences

In the meantime, explore what we're building at ${config.domainName}

With appreciation,
The Nature Club Team

Questions? Reply to this email or reach out to us at ${config.resend.supportEmail}

—
Nature Club | Discover and book outdoor experiences
${config.domainName}`;

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
    <div class="header">
      <h1>Welcome to Nature Club</h1>
    </div>
    
    <div class="content">
      <p class="intro">Hi there,</p>
      
      <p class="intro">Thank you for joining Nature Club. You're now part of a growing community of people who believe the best experiences happen outdoors.</p>
      
      <div class="section">
        <p class="section-title">What happens next</p>
        <div class="section-content">
          <p>• We're curating nature-based classes and experiences in your area</p>
          <p>• You'll be the first to know when we launch in your region</p>
          <p>• We'll share stories, inspiration, and early access to unique outdoor experiences</p>
        </div>
      </div>
      
      <hr class="divider">
      
      <p class="section-content">In the meantime, explore what we're building.</p>
      
      <a href="https://${config.domainName}" class="cta-button">Visit Nature Club</a>
    </div>
    
    <div class="footer">
      <p>With appreciation,<br>The Nature Club Team</p>
      <hr class="divider" style="margin: 24px 0;">
      <p>Questions? Reply to this email or reach out to us at <a href="mailto:${config.resend.supportEmail}">${config.resend.supportEmail}</a></p>
      <div class="social-links">
        <a href="https://${config.domainName}">${config.domainName}</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
};

export const getHostWelcomeEmail = ({ email }) => {
  const subject = `Welcome to Nature Club — Let's share your outdoor experiences`;

  const text = `Welcome to Nature Club

Hi there,

Thank you for expressing interest in becoming a Nature Club Host. We're excited about the possibility of working together to bring more people into the outdoors.

What happens next:
• We'll review your application and be in touch within 48 hours
• If it's a fit, we'll schedule a brief call to learn more about your experiences
• We'll share resources to help you create memorable outdoor moments

Why host with us:
• Reach nature-seeking participants looking for authentic experiences
• Set your own schedule, pricing, and group sizes
• Join a community of passionate outdoor guides and instructors

We'd love to learn more about what you'd like to offer. If you have any questions before we connect, just reply to this email.

With appreciation,
The Nature Club Team

Questions? Reply to this email or reach out to us at ${config.resend.supportEmail}

—
Nature Club | Discover and book outdoor experiences
${config.domainName}`;

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
    <div class="header">
      <h1>Welcome to Nature Club</h1>
    </div>
    
    <div class="content">
      <p class="intro">Hi there,</p>
      
      <p class="intro">Thank you for expressing interest in becoming a Nature Club Host. We're excited about the possibility of working together to bring more people into the outdoors.</p>
      
      <div class="section">
        <p class="section-title">What happens next</p>
        <div class="section-content">
          <p>• We'll review your application and be in touch within 48 hours</p>
          <p>• If it's a fit, we'll schedule a brief call to learn more about your experiences</p>
          <p>• We'll share resources to help you create memorable outdoor moments</p>
        </div>
      </div>
      
      <div class="section">
        <p class="section-title">Why host with us</p>
        <div class="section-content">
          <p>• Reach nature-seeking participants looking for authentic experiences</p>
          <p>• Set your own schedule, pricing, and group sizes</p>
          <p>• Join a community of passionate outdoor guides and instructors</p>
        </div>
      </div>
      
      <hr class="divider">
      
      <p class="section-content">We'd love to learn more about what you'd like to offer. If you have any questions before we connect, just reply to this email.</p>
    </div>
    
    <div class="footer">
      <p>With appreciation,<br>The Nature Club Team</p>
      <hr class="divider" style="margin: 24px 0;">
      <p>Questions? Reply to this email or reach out to us at <a href="mailto:${config.resend.supportEmail}">${config.resend.supportEmail}</a></p>
      <div class="social-links">
        <a href="https://${config.domainName}">${config.domainName}</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
};
