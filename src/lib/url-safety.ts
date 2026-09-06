/**
 * Shared SSRF guards. Any server-side fetch of a user-supplied URL must go
 * through validateUrl() first — both recipe parsing and image re-hosting
 * fetch arbitrary remote URLs on our behalf.
 */

export function isPrivateIP(hostname: string): boolean {
  const ipv4Match = hostname.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );
  if (ipv4Match) {
    const [a, b] = [Number(ipv4Match[1]), Number(ipv4Match[2])];
    if (a === 0 || a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }

  const normalized = hostname.replace(/^\[|\]$/g, "");
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;

  return false;
}

/**
 * Schema.org and Open Graph images are often protocol-relative ("//host/x.jpg").
 * Those are valid in a browser but not parseable as a standalone URL.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
}

export function validateUrl(input: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(normalizeUrl(input));
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  const hostname = parsed.hostname.toLowerCase();

  const blockedHostnames = [
    "localhost",
    "metadata.google.internal",
    "metadata.internal",
  ];
  if (blockedHostnames.includes(hostname)) {
    throw new Error("Internal URLs are not allowed");
  }

  if (isPrivateIP(hostname)) {
    throw new Error("Private or internal IP addresses are not allowed");
  }

  return parsed;
}
