import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "PCT Tracker",
	description: "Track your Pacific Crest Trail hike with live Strava data",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
