import { Banner } from "@/components/Banner";
import { Featured, Hero, LoopSection, OtherWorks, Ranking, VoteSection } from "@/components/HomeSections";
import { RevealOnScroll } from "@/components/Motion";
import { StarChart } from "@/components/star-chart/StarChart";

export default function HomePage() {
  return (
    <>
      <StarChart />
      <RevealOnScroll />
      <Banner />
      <main className="mx-auto max-w-[90rem]">
        <Hero />
        <Ranking />
        <Featured />
        <OtherWorks />
        <VoteSection />
        <LoopSection />
      </main>
    </>
  );
}
