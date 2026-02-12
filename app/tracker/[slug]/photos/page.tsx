import { createServiceClient } from "@/lib/supabase/server";
import PhotoGrid from "@/components/PhotoGrid";
import { notFound } from "next/navigation";

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("flickr_user_id, flickr_photoset_id")
    .eq("slug", slug)
    .single();

  if (!user) notFound();

  return (
    <PhotoGrid
      flickrUserId={user.flickr_user_id}
      flickrPhotosetId={user.flickr_photoset_id}
    />
  );
}
