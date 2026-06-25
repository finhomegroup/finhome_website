import Link from "next/link";
import { Container } from "@/components/ui/container";
import { img } from "@/lib/images";
import { FOOTER, CONTACT, LOGO } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-4/20 bg-bg-soft">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="FinHome">
              <img src={img(LOGO.footer)} alt="FinHome" className="h-8 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-3">
              Người bạn đồng hành tài chính cho hành trình an cư của bạn.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-ink">{FOOTER.contactTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-2">
              <li>{CONTACT.address}</li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-ink"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.phoneLabel}</li>
            </ul>
          </div>

          {/* Link columns */}
          {FOOTER.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-4/20 pt-6">
          <p className="text-sm text-ink-3">{FOOTER.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
