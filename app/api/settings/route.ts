import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createServiceClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.slug === "string" && body.slug.trim()) {
    const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    // Check uniqueness
    const { data: conflict } = await supabase
      .from("users")
      .select("id")
      .eq("slug", slug)
      .neq("id", session.userId)
      .single();

    if (conflict) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
    updates.slug = slug;
  }

  if (body.flickr_user_id !== undefined) updates.flickr_user_id = body.flickr_user_id;
  if (body.flickr_photoset_id !== undefined) updates.flickr_photoset_id = body.flickr_photoset_id;
  if (body.lighterpack_url !== undefined) updates.lighterpack_url = body.lighterpack_url;

  await supabase.from("users").update(updates).eq("id", session.userId);

  return NextResponse.json({ ok: true });
}
