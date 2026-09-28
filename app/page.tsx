import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { BuyerQuestions } from "@/components/sections/buyer-questions";
import { AppDownloadPreview } from "@/components/sections/app-download-preview";
import { Steps } from "@/components/sections/steps";
import { Platform } from "@/components/sections/platform";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { News } from "@/components/sections/news";
import { JsonLd } from "@/components/json-ld";
import { websiteSchema } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      {/* Shared white pill on the gray page shell; the hero starts below it. */}
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <BuyerQuestions />
        <AppDownloadPreview />
        <Steps />
        <Platform />
        <Testimonials />
        <Faq />
        <News />
      </main>
      <SiteFooter />
    </>
  );
}
