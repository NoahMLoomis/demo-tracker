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
    question: "When I click on \"Gear\" it brings me to a broken page",
    answer: (
      <>
        You likely copied your lighterpack code wrong. To find your code, open your list on{" "}
        <a href="https://lighterpack.com" target="_blank" rel="noopener noreferrer">lighterpack.com</a>,
        hover over Share at the top right, and copy the ID from the &quot;embed&quot; code.
        It should look something like this: &quot;e52c1r&quot;
      </>
    ),
  },
  {
    question: "Is this free?",
    answer:
      "Yes, PCT Tracker is completely free to use. With no ads, because ads suck.",
  },
  {
    question: "Why create this?",
    answer: (
      <>
        I hiked the PCT in 2025 and wanted some way for people to follow me, not being instagram,
        or any other photo centric mode. I ended up creating a custom blog (
        <a href="https://noah-vs-the-sun.com" target="_blank" rel="noopener noreferrer">noah-vs-the-sun.com</a>)
        that detailed my trip, and it worked ... well enough. Creating updates on trail was a bit
        of a pain, and when I got back I thought it would be nice for future years to have an easier
        solution than creating their own blog, but a bit more personal that using instagram. This
        project was heavily heavily inspired by the reddit user Fickle_Bed8196&apos;s{" "}
        <a href="https://dacat84.github.io/demo-tracker" target="_blank" rel="noopener noreferrer">PCT tracker</a>,
        which was in turn inspired by Karel Sabbe&apos;s PCT tracker when he attempted an FKT. The goal
        of this project is to make is as easy as possible for PCT hikers to give as many or as little
        updates as they want, and for friends and family following the hikers to see a clear roadmap
        of the trek, where they are, and how far they have to go.
      </>
    ),
  },
  {
    question: "Can I make a donation?",
    answer: (
      <>
        Please consider a donation to the{" "}
        <a href="https://www.pcta.org/donate/" target="_blank" rel="noopener noreferrer">PCTA</a> instead.
        But if you have already made a donation, and feel very strongly about it, you can donate{" "}
        <a href="https://buymeacoffee.com/nloomis" target="_blank" rel="noopener noreferrer">here</a>.
      </>
    ),
  },
];

export default function FAQPage() {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <div className="brand">
            <div className="brand-title">PCT Tracker</div>
            <div className="brand-sub">Pacific Crest Trail</div>
          </div>
          <nav className="tabs">
            <Link href="/" className="tab">Home</Link>
            <Link href="/login" className="tab">Login</Link>
          </nav>
        </div>
      </header>

      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>
            Frequently Asked Questions
          </h1>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{faq.question}</summary>
                <div className="faq-answer">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          PCT Tracker &middot; <a href="https://github.com/NoahMLoomis/pct-tracker" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}
