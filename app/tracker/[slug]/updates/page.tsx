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
				requestAnimationFrame(() => {
					const hash = window.location.hash.slice(1);
					if (hash) {
						document
							.getElementById(hash)
							?.scrollIntoView({ behavior: "smooth", block: "start" });
					}
				});
			})
			.catch(() => setUpdates([]));
	}, [slug]);

	if (updates === null) {
		return (
			<div className="max-w-[760px] mx-auto px-4 py-4">
				<div className="mb-3.5 bg-card border border-line rounded-2xl px-4 py-3.5 text-[22px] font-[850] tracking-[0.2px]">
					Trail Updates
				</div>
				<div className="bg-card border border-line rounded-2xl p-[18px]">
					<div className="text-muted">Loading...</div>
				</div>
			</div>
		);
	}

	if (updates.length === 0) {
		return (
			<div className="max-w-[760px] mx-auto px-4 py-4">
				<div className="mb-3.5 bg-card border border-line rounded-2xl px-4 py-3.5 text-[22px] font-[850] tracking-[0.2px]">
					Trail Updates
				</div>
				<div className="bg-card border border-line rounded-2xl p-[18px]">
					<div className="text-muted">
						No trail updates yet. Check back soon!
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-[760px] mx-auto px-4 py-4">
			<div className="mb-3.5 bg-card border border-line rounded-2xl px-4 py-3.5 text-[22px] font-[850] tracking-[0.2px]">
				Trail Updates
			</div>
			<div className="grid gap-3.5">
				{updates.map((u) => (
					<div
						key={u.id}
						id={u.id}
						className="bg-card-light border border-line rounded-2xl px-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] overflow-hidden min-w-0"
					>
						<div className="text-lg font-black text-[rgba(232,238,245,0.95)] mb-1.5">
							{fmtDate(u.created_at)}
						</div>
						<div className="font-bold text-lg mt-1">{u.title}</div>
						<div className="text-[rgba(232,238,245,0.88)] leading-relaxed mt-2.5 whitespace-pre-wrap break-words">
							{u.body}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
