import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
// Duplicate emails just return 200 OK
export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const allowedRoles = ["participant", "host_interest"];

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!body.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  try {
    const lead = await Lead.findOne({ email: body.email, role: body.role });

    if (!lead) {
      await Lead.create({ email: body.email, role: body.role });
    }

    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
