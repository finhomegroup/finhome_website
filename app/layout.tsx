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
        {/* TEMPORARY diagnostic overlay for the iPhone 11 "content stuck invisible"
           report — surfaces uncaught JS errors on-screen since the site has no
           error tracking. ES5-only so it still runs if later scripts crash.
           Remove once root-caused. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function reportErr(msg, url, line, col, err) {
                  try {
                    var box = document.getElementById('__debug_err_box');
                    if (!box) {
                      box = document.createElement('div');
                      box.id = '__debug_err_box';
                      box.style.position = 'fixed';
                      box.style.top = '0';
                      box.style.left = '0';
                      box.style.right = '0';
                      box.style.zIndex = '2147483647';
                      box.style.background = '#b00020';
                      box.style.color = '#fff';
                      box.style.fontSize = '12px';
                      box.style.fontFamily = 'monospace';
                      box.style.padding = '8px';
                      box.style.maxHeight = '60vh';
                      box.style.overflow = 'auto';
                      box.style.whiteSpace = 'pre-wrap';
                      box.style.wordBreak = 'break-word';
                      document.documentElement.appendChild(box);
                    }
                    var text = 'ERROR: ' + msg + ' @ ' + url + ':' + line + ':' + col;
                    if (err && err.stack) text += '\\n' + err.stack;
                    var p = document.createElement('div');
                    p.style.borderTop = '1px solid rgba(255,255,255,0.3)';
                    p.style.paddingTop = '4px';
                    p.style.marginTop = '4px';
                    p.textContent = text;
                    box.appendChild(p);
                  } catch (e) {}
                }
                window.onerror = function (msg, url, line, col, err) {
                  reportErr(msg, url, line, col, err);
                };
                window.addEventListener('unhandledrejection', function (ev) {
                  var reason = ev.reason;
                  var msg = 'unhandledrejection: ' + (reason && reason.message ? reason.message : String(reason));
                  reportErr(msg, location.href, '', '', reason);
                });
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
