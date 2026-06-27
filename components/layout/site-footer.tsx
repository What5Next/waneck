import Link from "next/link";

import { DISCORD_URL } from "@/lib/user-settings";
import {
  SITE_COMPANY_INFO,
  SITE_FOOTER_LINKS,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

function FooterLinkSeparator() {
  return <span className="mx-1 text-muted-foreground sm:mx-2">·</span>;
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M9.63868 2.49712C8.95794 2.16915 8.23953 1.93528 7.50145 1.80136C7.49474 1.80005 7.48782 1.80099 7.48165 1.80404C7.47548 1.8071 7.47039 1.81212 7.46711 1.81839C7.37479 1.99073 7.27255 2.2155 7.20097 2.39215C6.39392 2.26532 5.59098 2.26532 4.8005 2.39215C4.72893 2.21155 4.62297 1.99073 4.53026 1.81839C4.52683 1.81227 4.52171 1.80737 4.51558 1.80434C4.50946 1.80131 4.5026 1.80028 4.49592 1.8014C3.75776 1.93501 3.0393 2.16886 2.35864 2.49707C2.35282 2.49968 2.34791 2.50412 2.3446 2.50979C0.983364 4.64426 0.610439 6.72625 0.793402 8.78243C0.793919 8.78747 0.795394 8.79234 0.797738 8.79677C0.800083 8.80119 0.80325 8.80508 0.807052 8.80819C1.70515 9.50046 2.57512 9.92071 3.42894 10.1992C3.43558 10.2013 3.44267 10.2012 3.44925 10.199C3.45583 10.1967 3.4616 10.1924 3.46578 10.1866C3.66773 9.8971 3.84776 9.59184 4.00215 9.27087C4.00428 9.26647 4.00549 9.26166 4.00571 9.25674C4.00593 9.25181 4.00515 9.2469 4.00343 9.24231C4.00172 9.23773 3.99909 9.23358 3.99573 9.23013C3.99238 9.22669 3.98836 9.22403 3.98395 9.22233C3.69835 9.10864 3.42645 8.97001 3.16487 8.8126C3.1601 8.80966 3.15609 8.80553 3.1532 8.80058C3.15031 8.79563 3.14863 8.79001 3.1483 8.78421C3.14797 8.77842 3.14901 8.77263 3.15132 8.76735C3.15363 8.76208 3.15714 8.75748 3.16154 8.75396C3.21658 8.71066 3.27166 8.66566 3.3242 8.62016C3.32887 8.61612 3.33453 8.61352 3.34053 8.61267C3.34652 8.61182 3.35263 8.61274 3.35815 8.61534C5.07656 9.43879 6.9369 9.43879 8.63501 8.61534C8.64054 8.61257 8.6467 8.61152 8.65278 8.61229C8.65886 8.61306 8.66461 8.61563 8.66935 8.6197C8.72194 8.66516 8.77698 8.71066 8.83245 8.75396C8.83687 8.75744 8.8404 8.76201 8.84274 8.76726C8.84508 8.77251 8.84616 8.77828 8.84587 8.78407C8.84559 8.78986 8.84395 8.79548 8.84111 8.80045C8.83826 8.80542 8.8343 8.80957 8.82957 8.81256C8.56789 8.97297 8.29377 9.1099 8.01013 9.22187C8.00572 9.22364 8.00173 9.22637 7.99839 9.22987C7.99506 9.23337 7.99247 9.23757 7.99079 9.24219C7.98911 9.24682 7.98837 9.25176 7.98864 9.2567C7.9889 9.26164 7.99016 9.26647 7.99232 9.27087C8.15 9.59138 8.33003 9.89665 8.52826 10.1861C8.53231 10.1921 8.53805 10.1966 8.54466 10.1989C8.55127 10.2013 8.55842 10.2014 8.5651 10.1992C9.42303 9.92066 10.293 9.50041 11.1911 8.80819C11.195 8.80523 11.1982 8.80144 11.2006 8.79707C11.2029 8.7927 11.2044 8.78785 11.2048 8.78285C11.4237 6.40565 10.8381 4.34074 9.65233 2.5102C9.64942 2.50425 9.64457 2.49964 9.63868 2.49712ZM4.25875 7.53042C3.7414 7.53042 3.3151 7.03188 3.3151 6.41965C3.3151 5.80747 3.73313 5.30893 4.25879 5.30893C4.78851 5.30893 5.21066 5.81183 5.20239 6.4197C5.20239 7.03188 4.78436 7.53042 4.25875 7.53042ZM7.74772 7.53042C7.23037 7.53042 6.80407 7.03188 6.80407 6.41965C6.80407 5.80747 7.22206 5.30893 7.74772 5.30893C8.27744 5.30893 8.69958 5.81183 8.69132 6.4197C8.69132 7.03188 8.27744 7.53042 7.74772 7.53042Z"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}

const footerLinkClass =
  "text-muted-foreground transition-colors hover:text-foreground";

/** elyn explore 레이아웃과 동일한 스크롤 하단 푸터 */
export function SiteFooter({ className }: { className?: string }) {
  const supportHref = DISCORD_URL ?? `mailto:${SITE_COMPANY_INFO.email}`;

  const companyLines = [
    SITE_COMPANY_INFO.copyright,
    SITE_COMPANY_INFO.address,
    SITE_COMPANY_INFO.businessRegistrationNumber
      ? `Business registration: ${SITE_COMPANY_INFO.businessRegistrationNumber}`
      : null,
    SITE_COMPANY_INFO.mailOrderRegistrationNumber
      ? `Mail-order sales registration: ${SITE_COMPANY_INFO.mailOrderRegistrationNumber}`
      : null,
    SITE_COMPANY_INFO.phone ? `Phone: ${SITE_COMPANY_INFO.phone}` : null,
    SITE_COMPANY_INFO.email ? `Email: ${SITE_COMPANY_INFO.email}` : null,
    SITE_COMPANY_INFO.representative
      ? `Representative: ${SITE_COMPANY_INFO.representative}`
      : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <footer
      className={cn(
        "mt-8 w-full border-t border-border py-8 text-xs text-muted-foreground",
        className,
      )}
    >
      <div className="mx-auto flex flex-col space-y-2 px-4">
        <div className="mt-4 flex flex-wrap items-start justify-end">
          {SITE_FOOTER_LINKS.map((link, index) => (
            <span key={link.href} className="inline-flex items-center">
              {index > 0 ? <FooterLinkSeparator /> : null}
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClass}
              >
                {link.label}
              </Link>
            </span>
          ))}

          <FooterLinkSeparator />

          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClass}
          >
            Support
          </a>

          <div className="ml-auto w-full text-right text-muted-foreground/60 sm:mt-0 sm:w-auto">
            {DISCORD_URL ? (
              <div className="my-2 flex items-center justify-end gap-2 sm:mt-0">
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                  className={cn(
                    footerLinkClass,
                    "rounded-full border border-muted-foreground p-1",
                  )}
                >
                  <DiscordIcon className="h-4 w-4" />
                </a>
              </div>
            ) : null}

            {companyLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
