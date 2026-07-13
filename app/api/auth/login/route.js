import { createSessionToken, getSessionCookieHeader } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return Response.json({ message: "Admin credentials are not configured." }, { status: 500 });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return Response.json({ message: "Invalid username or password." }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = Response.json({ message: "Logged in." });
  response.headers.append("Set-Cookie", getSessionCookieHeader(token));

  return response;
}
