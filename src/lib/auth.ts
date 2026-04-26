const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toHex(signature);
}

export async function generateSessionToken(): Promise<string> {
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = toHex(nonceBytes.buffer);
  const hmac = await hmacSign(process.env.AUTH_SECRET!, nonce);
  return `${nonce}.${hmac}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const nonce = token.slice(0, dotIndex);
  const hmac = token.slice(dotIndex + 1);
  if (!nonce || !hmac) return false;

  const expected = await hmacSign(process.env.AUTH_SECRET!, nonce);

  if (expected.length !== hmac.length) return false;

  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ hmac.charCodeAt(i);
  }
  return result === 0;
}
