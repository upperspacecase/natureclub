import twilio from "twilio";

let _client = null;

function getTwilioClient() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
    }
    if (!_client) {
        _client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return _client;
}

// ---------------------------------------------------------------------------
// OTP via Twilio Verify
// ---------------------------------------------------------------------------

/**
 * Send an OTP code to a phone number via Twilio Verify.
 * @param {string} phone - E.164 phone number (e.g. "+1234567890")
 */
export async function sendOtp(phone) {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
        throw new Error("TWILIO_VERIFY_SERVICE_SID must be set");
    }

    const client = getTwilioClient();
    const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({
            to: phone,
            channel: "sms",
        });

    return verification.status; // "pending"
}

/**
 * Verify an OTP code for a phone number.
 * @param {string} phone - E.164 phone number
 * @param {string} code  - The 6-digit code the user entered
 * @returns {boolean} Whether the code is valid
 */
export async function verifyOtp(phone, code) {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
        throw new Error("TWILIO_VERIFY_SERVICE_SID must be set");
    }

    const client = getTwilioClient();

    try {
        const check = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
                to: phone,
                code,
            });

        return check.status === "approved";
    } catch (error) {
        // Twilio returns 404 if the verification expired or doesn't exist
        if (error.status === 404) {
            return false;
        }
        throw error;
    }
}

// ---------------------------------------------------------------------------
// SMS messaging
// ---------------------------------------------------------------------------

/**
 * Send a plain SMS message.
 * @param {string} to   - E.164 phone number
 * @param {string} body - Message text (max ~1600 chars for SMS)
 */
export async function sendSms(to, body) {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
        throw new Error("TWILIO_PHONE_NUMBER must be set");
    }

    const client = getTwilioClient();
    const message = await client.messages.create({
        to,
        from,
        body,
    });

    return message.sid;
}
