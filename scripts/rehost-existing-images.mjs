/**
 * One-off backfill: copies externally hosted recipe images into Vercel Blob
 * and repoints the database at the copies.
 *
 * Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN in .env.local.
 *   node scripts/rehost-existing-images.mjs --dry-run
 *   node scripts/rehost-existing-images.mjs
 */
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import fs from "fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL);

const EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX = 10 * 1024 * 1024;

const rows = await sql`select id, title, image_url from recipes
  where image_url is not null and image_url <> ''
    and image_url not like '%.public.blob.vercel-storage.com%'
  order by title`;

console.log(`${rows.length} externally hosted image(s)${dryRun ? " (dry run)" : ""}\n`);

let ok = 0;
const failures = [];

for (const row of rows) {
  const src = row.image_url.trim().startsWith("//")
    ? `https:${row.image_url.trim()}`
    : row.image_url.trim();
  process.stdout.write(`- ${row.title}\n    ${new URL(src).hostname} ... `);

  try {
    const res = await fetch(src, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeManager/1.0)" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const ext = EXT[type];
    if (!ext) throw new Error(`unsupported content-type "${type || "none"}"`);

    const bytes = await res.arrayBuffer();
    if (!bytes.byteLength) throw new Error("empty response");
    if (bytes.byteLength > MAX) throw new Error(`too large (${bytes.byteLength} bytes)`);

    if (dryRun) {
      console.log(`would copy ${(bytes.byteLength / 1024).toFixed(0)} KB (${type})`);
      ok++;
      continue;
    }

    const blob = await put(`recipes/imported.${ext}`, bytes, {
      access: "public",
      contentType: type,
      addRandomSuffix: true,
    });
    await sql`update recipes set image_url = ${blob.url} where id = ${row.id}`;
    console.log(`copied ${(bytes.byteLength / 1024).toFixed(0)} KB`);
    ok++;
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failures.push({ title: row.title, url: src, error: err.message });
  }
}

console.log(`\n${ok}/${rows.length} succeeded`);
if (failures.length) {
  console.log("\nLeft pointing at their original URL:");
  for (const f of failures) console.log(`  - ${f.title}: ${f.error}`);
}
