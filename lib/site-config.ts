import { SUPPORT_EMAIL } from "@/lib/user-settings";

/** 푸터 정책 링크 */
export const SITE_FOOTER_LINKS = [
  { href: "/policy", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/account-deletion", label: "Account & Data Deletion" },
] as const;

/** 푸터 사업자·연락처 정보 (환경변수로 덮어쓸 수 있음) */
export const SITE_COMPANY_INFO = {
  copyright: `© ${new Date().getFullYear()} Waneck. All Rights Reserved.`,
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS,
  businessRegistrationNumber:
    process.env.NEXT_PUBLIC_BUSINESS_REGISTRATION_NUMBER,
  mailOrderRegistrationNumber:
    process.env.NEXT_PUBLIC_MAIL_ORDER_REGISTRATION_NUMBER,
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE,
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? SUPPORT_EMAIL,
  representative: process.env.NEXT_PUBLIC_COMPANY_REPRESENTATIVE,
} as const;
