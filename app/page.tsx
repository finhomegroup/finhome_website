import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { Steps } from "@/components/sections/steps";
import { Platform } from "@/components/sections/platform";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Signup } from "@/components/sections/signup";
import { News } from "@/components/sections/news";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <Steps />
        <Platform />
        <Testimonials />
        <Faq />
        <Signup />
        <News />
      </main>
      <SiteFooter />
    </>
  );
}
