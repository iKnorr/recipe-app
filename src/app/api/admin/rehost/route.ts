/**
 * TEMPORARY one-off backfill endpoint.
 *
 * Copies externally hosted recipe images into Vercel Blob. This exists as a
 * route because Blob credentials are only issued to the Production and Preview
 * environments, so scripts/rehost-existing-images.mjs cannot authenticate from
 * a local machine.
 *
 * Protected by the usual auth middleware (a valid recipe-auth cookie is
 * required). Delete this file once the backfill has run.
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { rehostImage } from "@/lib/image-rehost";

export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Guards against the route firing on a stray prefetch.
  if (request.nextUrl.searchParams.get("confirm") !== "rehost") {
    return NextResponse.json(
      { error: "Add ?confirm=rehost to run the backfill" },
      { status: 400 }
    );
  }

  const rows = (await sql`select id, title, image_url from recipes
    where image_url is not null and image_url <> ''
      and image_url not like '%.public.blob.vercel-storage.com%'
    order by title`) as { id: string; title: string; image_url: string }[];

  const rehosted: string[] = [];
  const failed: string[] = [];

  for (const row of rows) {
    const url = await rehostImage(row.image_url);
    if (url) {
      await sql`update recipes set image_url = ${url} where id = ${row.id}`;
      rehosted.push(row.title);
    } else {
      failed.push(row.title);
    }
  }

  return NextResponse.json({
    considered: rows.length,
    rehosted: rehosted.length,
    failed: failed.length,
    details: { rehosted, failed },
  });
}
