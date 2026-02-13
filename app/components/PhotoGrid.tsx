"use client";

import { useEffect, useState } from "react";

interface FlickrItem {
  title: string;
  link: string;
  media: { m: string };
}

interface PhotoGridProps {
  flickrUserId: string | null;
  flickrPhotosetId?: string | null;
}

export default function PhotoGrid({ flickrUserId }: PhotoGridProps) {
  const [photos, setPhotos] = useState<FlickrItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!flickrUserId) return;

    const url =
      `https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&id=${flickrUserId}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setPhotos((data.items || []).slice(0, 30)))
      .catch(() => setError(true));
  }, [flickrUserId]);

  if (!flickrUserId) {
    return (
      <div className="card">
        <div className="muted">No photos configured for this tracker.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="muted">Could not load photos.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 10,
      }}
    >
      {photos.map((item, i) => (
        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer">
          <img
            src={item.media.m.replace("_m.", "_z.")}
            alt={item.title}
            style={{ width: "100%", height: "auto", borderRadius: 14, border: "1px solid var(--line)" }}
          />
        </a>
      ))}
    </div>
  );
}
