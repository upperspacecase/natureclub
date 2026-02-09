import { Resend } from "resend";
import config from "@/config";

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const getFromAddress = () => {
  const configuredFrom = process.env.RESEND_FROM_EMAIL || config.resend.fromAdmin;
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_FROM_EMAIL) {
    return "Nature Club <onboarding@resend.dev>";
  }
  return configuredFrom;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends an email using the provided parameters.
 *
 * @async
 * @param {Object} params - The parameters for sending the email.
 * @param {string | string[]} params.to - The recipient's email address or an array of email addresses.
 * @param {string} params.subject - The subject of the email.
 * @param {string} params.text - The plain text content of the email.
 * @param {string} params.html - The HTML content of the email.
 * @param {string} [params.replyTo] - The email address to set as the "Reply-To" address.
 * @returns {Promise<Object>} A Promise that resolves with the email sending result data.
 */
export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  });

  if (error) {
    const errorMessage =
      typeof error?.message === "string" && error.message
        ? error.message
        : "Resend send failed";
    console.error("Error sending email:", errorMessage, error);
    throw new Error(errorMessage);
  }

  return data;
};

export const sendEmailWithRetry = async (
  params,
  { retries = 1, retryDelayMs = 500 } = {}
) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      return await sendEmail(params);
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await sleep(retryDelayMs);
    }
    attempt += 1;
  }

  throw lastError || new Error("Email send failed");
};
