import Link from "next/link";

export const metadata = {
  title: "Connect with Strava - PCT Tracker",
};

export default function LoginPage() {
  return (
    <main className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
        Connect with Strava
      </h1>
      <p className="muted" style={{ marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
        Link your Strava account to automatically sync your PCT activities and
        get your own public tracker page.
      </p>
      <Link href="/api/auth/strava" className="button" style={{ fontSize: 16, padding: "14px 28px" }}>
        Connect with Strava
      </Link>
    </main>
  );
}
