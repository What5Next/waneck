import { MyPageView } from "@/components/mypage/my-page-view";
import { MobileShell } from "@/components/mobile-shell";

export const metadata = {
  title: "마이페이지 | 와넥",
};

export default function MyPagePage() {
  return (
    <MobileShell>
      <MyPageView />
    </MobileShell>
  );
}
