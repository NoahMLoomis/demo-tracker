import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
	title: "FAQ - PCT Tracker",
};

const faqs: { question: string; answer: ReactNode }[] = [
	{
		question: "How does it work?",
		answer:
			"Connect your Strava account and set your hike start date. PCT Tracker automatically syncs your hiking activities from Strava, filters for ones near the Pacific Crest Trail, and displays your progress on a live map. Your public tracker page shows the full PCT with your completed and remaining sections highlighted, along with stats.",
	},
	{
		question:
			"How can i setup my garmin/coros watch to upload to strava automatically?",
		answer: (
			<>
				For garmin, follow{" "}
				<a
					href="https://support.strava.com/hc/en-us/articles/216918057-Garmin-and-Strava"
					target="_blank"
					rel="noopener noreferrer"
				>
					this guide
				</a>
				, for coros,{" "}
				<a
					href="https://support.strava.com/hc/en-us/articles/360007816051-COROS-and-Strava"
					target="_blank"
					rel="noopener noreferrer"
				>
					this one
				</a>
				,
			</>
		),
	},
	{
		question: "What is being stored?",
		answer:
			"Your Strava athlete ID, display name, and OAuth tokens (to sync your activities). For each activity, the only location we store is the one of your most recent activity, to display your location on the map.",
	},
	{
		question: "How often are my activities synced?",
		answer:
			"Activities are synced automatically once per day. A sync also runs whenever you save your settings with a changed start or end date.",
	},
	{
		question: "Why aren't all my Strava activities showing up?",
		answer:
			"Activities are filtered to only include ones that start within 15 km of the PCT. Non-hiking activities or hikes far from the trail are excluded. Additionally, only activities within your configured date range (start date to end date, or 6 months if no end date) are included. Check your date settings on the dashboard if activities are missing.",
	},
	{
		question: "Can other people see my tracker?",
		answer:
			"Yes, your public tracker page is accessible to anyone with the link. It shows your map progress, stats, and trail updates. It does not expose your Strava credentials, tokens, or any private account information.",
	},
	{
		question: 'When I click on "Gear" it brings me to a broken page',
		answer: (
			<>
				You likely copied your lighterpack code wrong. To find your code, open
				your list on{" "}
				<a
					href="https://lighterpack.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					lighterpack.com
				</a>
				, hover over Share at the top right, and copy the ID from the
				&quot;embed&quot; code. It should look something like this:
				&quot;e52c1r&quot;
			</>
		),
	},
	{
		question: "Is this free, and is it open source?",
		answer: (
			<>
				Yes, PCT Tracker is completely free to use. With no ads, because ads
				suck. It&apos;s also OSS, you can check out the source code on{" "}
				<a
					href="https://github.com/NoahMLoomis/pct-tracker"
					target="_blank"
					rel="noopener noreferrer"
				>
					Github
				</a>
				, if you see and issue or have a feature request, please do it there.
			</>
		),
	},
	{
		question: "Why create this?",
		answer: (
			<>
				I hiked the PCT in 2025 and wanted some way for people to follow me, not
				being instagram, or any other photo centric mode. I ended up creating a
				custom blog (
				<a
					href="https://noah-vs-the-sun.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					noah-vs-the-sun.com
				</a>
				) that detailed my trip, and it worked ... well enough. Creating updates
				on trail was a bit of a pain, and when I got back I thought it would be
				nice for future years to have an easier solution than creating their own
				blog, but a bit more personal that using instagram. This project was
				heavily heavily inspired by the reddit user Fickle_Bed8196&apos;s{" "}
				<a
					href="https://dacat84.github.io/demo-tracker"
					target="_blank"
					rel="noopener noreferrer"
				>
					PCT tracker
				</a>
				, which was in turn inspired by Karel Sabbe&apos;s PCT tracker when he
				attempted an FKT. The goal of this project is to make is as easy as
				possible for PCT hikers to give as many or as little updates as they
				want, and for friends and family following the hikers to see a clear
				roadmap of the trek, where they are, and how far they have to go.
			</>
		),
	},
	{
		question: "Can I make a donation?",
		answer: (
			<>
				Please consider a donation to the{" "}
				<a
					href="https://www.pcta.org/donate/"
					target="_blank"
					rel="noopener noreferrer"
				>
					PCTA
				</a>{" "}
				instead. But if you have already made a donation, and feel very strongly
				about it, you can donate{" "}
				<a
					href="https://buymeacoffee.com/nloomis"
					target="_blank"
					rel="noopener noreferrer"
				>
					here
				</a>
				.
			</>
		),
	},
];

export default function FAQPage() {
	return (
		<>
			<header className="sticky top-0 z-[1000] backdrop-blur-md bg-[rgba(11,14,17,0.75)] border-b border-line">
				<div className="max-w-[980px] mx-auto px-4 flex items-center justify-between gap-3 py-3.5 max-[540px]:flex-col max-[540px]:items-start">
					<div>
						<div className="font-[750] tracking-tight">PCT Tracker</div>
					</div>
					<nav className="flex gap-2 shrink-0">
						<Link
							href="/"
							className="no-underline text-muted px-2.5 py-2 rounded-full border border-line bg-[rgba(17,22,28,0.35)]"
						>
							Home
						</Link>
						<Link
							href="/api/auth/strava"
							className="no-underline text-muted px-2.5 py-2 rounded-full border border-line bg-[rgba(17,22,28,0.35)]"
						>
							Login
						</Link>
					</nav>
				</div>
			</header>

			<main className="max-w-[980px] mx-auto px-4 pt-10 pb-15">
				<div className="max-w-[700px] mx-auto">
					<h1 className="text-[28px] font-black mb-6">
						Frequently Asked Questions
					</h1>
					<div className="grid gap-2">
						{faqs.map((faq, i) => (
							<details
								key={i}
								className="group bg-card-light border border-line rounded-2xl overflow-hidden"
							>
								<summary className="px-[18px] py-4 font-bold text-[15px] cursor-pointer list-none flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden after:content-['+'] after:text-xl after:font-normal after:text-muted after:shrink-0 after:transition-transform after:duration-200 group-open:after:content-['\2212']">
									{faq.question}
								</summary>
								<div className="px-[18px] pb-4 text-[rgba(232,238,245,0.8)] leading-[1.7] text-sm">
									{faq.answer}
								</div>
							</details>
						))}
					</div>
				</div>
			</main>

			<footer className="border-t border-line text-muted text-xs py-[18px] pb-7 text-center">
				<div className="max-w-[980px] mx-auto px-4">
					PCT Tracker &middot;{" "}
					<a
						href="https://github.com/NoahMLoomis/pct-tracker"
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
