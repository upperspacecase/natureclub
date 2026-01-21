import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
// Duplicate emails just return 200 OK
export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const allowedRoles = ["participant", "host_interest", "host", "member"];

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!body.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  try {
    await Lead.updateOne(
      { email: body.email, role: body.role },
      {
        $set: {
          email: body.email,
          role: body.role,
          source: body.source || "button",
          responses: body.responses || {},
        },
      },
      { upsert: true }
    );

    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
