import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SITE } from "@/content/site";
import { canonicalPath } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s — FinHome",
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  // Favicon resolved from app/icon.svg via the file convention.
  alternates: {
    canonical: canonicalPath("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/*
          Marks JavaScript as RUNNING, which is what `html.js .fh-reveal` in
          globals.css keys the reveal animation's hidden state off. It must be
          the first thing in <body>: it runs before the revealed content below
          is parsed, so the content is never painted visible and then hidden.

          Why the hidden state is gated at all: `initial={{ opacity: 0 }}` on
          `Reveal` used to server-render `style="opacity:0"`, leaving 93% of the
          homepage's visible text invisible until JS ran — measured on the built
          export. Now nothing is hidden unless JS has proved it is alive.

          The watchdog is the second half. The `js` class alone does not help if
          JS loads, sets it, and then throws before framer-motion reveals
          anything — which is the shape of an "iPhone 11 content stuck
          invisible" report. A temporary on-screen error overlay lived below
          this script while that was being chased; it was removed once the
          `initial={{ opacity: 0 }}` SSR output was identified as the cause and
          this watchdog took over as the standing net. Do not re-add a
          user-visible error box to production to debug a recurrence — it ships
          a red banner to every reader to serve one developer.

          IT HAS TO DETECT LIVENESS, NOT JUST WAIT. The first version of this
          added the failsafe class unconditionally on a timer, and that was
          wrong in a way a browser check caught: `opacity: 1 !important` then
          applied to every block below the fold too, so nothing ever faded in
          again. The animation was "fixed" into permanent disablement.

          So it asks a question instead. framer-motion writes an inline
          `opacity` on any element it has revealed, so if at least one
          `.fh-reveal` currently in the viewport has one, the machinery is alive
          and the failsafe must stay out of the way. If elements are in view and
          NONE of them has been touched, JS died between setting the class and
          revealing — and only then is the content forced visible.

          2.5s is five times the 0.5s animation, so a healthy page has long
          since revealed. A page with no reveal element in view proves nothing
          either way and is left alone.

          ES5 only, and no dependency on anything that could fail to load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var h = document.documentElement;
                try {
                  h.className += ' js';
                } catch (e) {
                  return;
                }
                setTimeout(function () {
                  try {
                    var els = document.querySelectorAll('.fh-reveal');
                    var inView = 0;
                    var revealed = 0;
                    for (var i = 0; i < els.length; i++) {
                      var r = els[i].getBoundingClientRect();
                      if (r.top < window.innerHeight && r.bottom > 0) {
                        inView++;
                        if (els[i].style && els[i].style.opacity !== '') revealed++;
                      }
                    }
                    if (inView > 0 && revealed === 0) {
                      h.className += ' fh-reveal-failsafe';
                    }
                  } catch (e) {
                    h.className += ' fh-reveal-failsafe';
                  }
                }, 2500);
              })();
            `,
          }}
        />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
