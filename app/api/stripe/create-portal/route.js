import { NextResponse } from "next/server";
import { createCustomerPortal } from "@/libs/stripe";

export async function POST(req) {
  return NextResponse.json(
    { error: "Customer portal disabled while auth is off." },
    { status: 403 }
  );
}
