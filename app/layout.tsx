import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "PCT Tracker",
	description: "Track your Pacific Crest Trail hike with Strava data",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/fav.png" sizes="any" />
			</head>
			<body>{children}</body>
		</html>
	);
}
