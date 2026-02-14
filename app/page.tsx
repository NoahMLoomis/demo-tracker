import Link from "next/link";

export default function LandingPage() {
	return (
		<>
			<header className="site-header">
				<div
					className="wrap"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
						padding: "14px var(--pad)",
					}}
				>
					<div className="brand">
						<div className="brand-title">PCT Tracker</div>
					</div>
					<nav className="tabs">
						<Link href="/faq" className="tab">
							FAQ
						</Link>
						<Link href="/api/auth/strava" className="tab">
							Login
						</Link>
					</nav>
				</div>
			</header>

			<main className="wrap" style={{ paddingTop: 60, paddingBottom: 60 }}>
				<div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
					<h1
						style={{
							fontSize: 36,
							fontWeight: 900,
							lineHeight: 1.15,
							marginBottom: 16,
						}}
					>
						Track your PCT hike
					</h1>
					<p
						className="muted"
						style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 36 }}
					>
						Connect your Strava account and get a live map of your Pacific Crest
						Trail progress. Share your public tracker with friends and family.
					</p>
					<Link
						href="/api/auth/strava"
						className="button"
						style={{ fontSize: 16, padding: "14px 28px" }}
					>
						Get Started with Strava
					</Link>
					<p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
						or{" "}
						<Link href="/tracker/jane-doe" style={{ color: "var(--accent)" }}>
							see an example
						</Link>
					</p>

					<div className="card" style={{ marginTop: 48, textAlign: "left" }}>
						<div className="card-title">How it works</div>
						<ol className="list" style={{ marginTop: 10, lineHeight: 1.8 }}>
							<li>Connect your Strava account</li>
							<li>Your PCT activities are synced automatically</li>
							<li>
								Get a public tracker page with a live map, stats, and insights
							</li>
							<li>Optionally add a Lighterpack gear list</li>
						</ol>
					</div>
				</div>
			</main>

			<footer className="site-footer">
				<div className="wrap">
					PCT Tracker &middot;{" "}
					<a
						href="https://github.com/nloomis/pct-tracker"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</div>
			</footer>
		</>
	);
}
