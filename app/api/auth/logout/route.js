import { getSessionCookieHeader } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = Response.json({ message: "Logged out." });
  response.headers.append("Set-Cookie", getSessionCookieHeader("", 0));

  return response;
}
