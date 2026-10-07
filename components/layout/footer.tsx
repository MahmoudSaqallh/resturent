import Link from "next/link";
import { restaurant } from "@/data/restaurant";
import { contactLinks, Logo, socialLinks, WhatsAppIcon } from "@/components/ui/brand";
import { MORE_LINKS, NAV_LINKS } from "@/components/navigation/nav-links";
import { StatusPill } from "./restaurant-status";

const YEAR = new Date().getFullYear();

const iconLink =
  "inline-flex size-11 items-center justify-center rounded-md border border-white/15 transition-colors hover:border-white/50";

/** Minimal footer: brand, navigation, contact, configured social links, today's status, copyright. */
export function Footer() {
  return (
    <footer className="bg-ink text-cream print:hidden">
      <div className="container-page py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <Logo tone="light" />
          <nav aria-label="روابط التذييل" className="grid grid-cols-2 gap-x-10 sm:flex sm:gap-x-12">
            {[NAV_LINKS, MORE_LINKS].map((group, index) => (
              <ul key={index} className="flex flex-col">
                {group.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex h-10 items-center text-sm text-cream/75 hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </nav>
          <div className="flex gap-2">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <a key={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`تابعنا على ${label}`} className={iconLink}>
                <Icon />
              </a>
            ))}
            <a
              href={contactLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="راسلنا على واتساب"
              className={iconLink}
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-cream/65 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={contactLinks.maps} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
              {restaurant.address}
            </a>
            <a href={contactLinks.phone} className="tabular hover:text-cream" dir="ltr">
              {restaurant.phoneDisplay}
            </a>
            <StatusPill tone="light" />
          </div>
          <p>
            © {YEAR} {restaurant.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
