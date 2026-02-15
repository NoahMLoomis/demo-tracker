"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { TrailUpdate } from "@/lib/types";

function fmtDate(ts: string) {
	try {
		return new Date(ts).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "\u2014";
	}
}

export default function UpdatesPage() {
	const { slug } = useParams<{ slug: string }>();
	const [updates, setUpdates] = useState<TrailUpdate[] | null>(null);

	useEffect(() => {
		fetch(`/api/updates/${slug}`)
			.then((r) => r.json())
			.then((data) => {
				setUpdates(data);
				// Scroll to the anchored update after data renders
				requestAnimationFrame(() => {
					const hash = window.location.hash.slice(1);
					if (hash) {
						document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
					}
				});
			})
			.catch(() => setUpdates([]));
	}, [slug]);

	if (updates === null) {
		return (
			<div className="updates">
				<div className="updates-title">Trail Updates</div>
				<div className="card">
					<div className="muted">Loading...</div>
				</div>
			</div>
		);
	}

	if (updates.length === 0) {
		return (
			<div className="updates">
				<div className="updates-title">Trail Updates</div>
				<div className="card">
					<div className="muted">No trail updates yet. Check back soon!</div>
				</div>
			</div>
		);
	}

	return (
		<div className="updates">
			<div className="updates-title">Trail Updates</div>
			<div style={{ display: "grid", gap: 14 }}>
				{updates.map((u) => (
					<div key={u.id} id={u.id} className="update-card card">
						<div className="update-date">{fmtDate(u.created_at)}</div>
						<div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>
							{u.title}
						</div>
						<div
							className="update-text"
							style={{ marginTop: 10, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
						>
							{u.body}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
