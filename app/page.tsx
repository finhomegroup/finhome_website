import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeScrollSnap } from "@/components/home-scroll-snap";
import { Hero } from "@/components/sections/hero";
import { Steps } from "@/components/sections/steps";
import { Platform } from "@/components/sections/platform";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { PartnersAndTeam } from "@/components/sections/partners-and-team";
import { News } from "@/components/sections/news";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <HomeScrollSnap />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <Steps />
        <Platform />
        <Testimonials />
        <Faq />
        <PartnersAndTeam />
        <News />
      </main>
      <SiteFooter />
    </>
  );
}
