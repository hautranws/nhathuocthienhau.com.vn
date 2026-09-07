import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  decodeTwilioSession,
  getTwilioUserFromSession,
  TWILIO_SESSION_COOKIE,
} from "@/lib/twilio-auth";

export async function GET() {
  const rawSession = (await cookies()).get(TWILIO_SESSION_COOKIE)?.value;
  const session = decodeTwilioSession(rawSession);

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: getTwilioUserFromSession(session) });
}
