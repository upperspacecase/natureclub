import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import { sendEmail } from "@/libs/resend";
import { getMemberWelcomeEmail, getHostWelcomeEmail } from "@/libs/emails/welcome";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
// Duplicate emails just return 200 OK
export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const allowedRoles = ["host", "member"];

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!body.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  try {
    const country = await resolveCountry(body?.responses);
    await Lead.create({
      email: body.email,
      role: body.role,
      source: body.source || "button",
      responses: body.responses || {},
      country,
    });

    // Send welcome email based on role
    try {
      const emailContent = body.role === "host" 
        ? getHostWelcomeEmail({ email: body.email })
        : getMemberWelcomeEmail({ email: body.email });
      
      await sendEmail({
        to: body.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      // Log error but don't fail the request if email fails
      console.error("Failed to send welcome email:", emailError.message);
    }

    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const parseCoords = (coords) => {
  if (!coords || typeof coords !== "string") return null;
  const parts = coords.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

const normalizeCountry = (country, countryCode) => {
  if (country && typeof country === "string") return country;
  if (countryCode && typeof countryCode === "string") {
    return countryCode.toUpperCase();
  }
  return "";
};

const fetchCountry = async (url) => {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) return "";
  const data = await response.json();
  return normalizeCountry(data?.address?.country, data?.address?.country_code);
};

const resolveCountry = async (responses) => {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) return "";

  const location = responses?.location;
  const coords = parseCoords(location?.coords);
  if (coords) {
    const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${coords.lat}&lon=${coords.lon}&format=json`;
    return fetchCountry(url);
  }

  const city = location?.city?.trim();
  if (!city) return "";
  const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
    city
  )}&format=json&limit=1`;
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) return "";
  const data = await response.json();
  return normalizeCountry(
    data?.[0]?.address?.country,
    data?.[0]?.address?.country_code
  );
};
