import { NextRequest, NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/auth";

const encoder = new TextEncoder();

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

async function passwordMatches(input: string): Promise<boolean> {
  const inputHash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(input)
  );
  const expectedHash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(process.env.SITE_PASSWORD!)
  );

  const a = new Uint8Array(inputHash);
  const b = new Uint8Array(expectedHash);
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!(await passwordMatches(password))) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("recipe-auth", await generateSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
