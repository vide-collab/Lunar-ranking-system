import Head from "next/head";
import CreatorScoring from "../components/CreatorScoring";

export default function Home() {
  return (
    <>
      <Head>
        <title>Lunar Ranking System</title>
        <meta name="description" content="Creator Tier Ranking System for X (Twitter) Influencer Campaigns" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreatorScoring />
    </>
  );
}
