import { MyPageView } from "@/components/mypage/my-page-view";
import { MobileShell } from "@/components/mobile-shell";

export const metadata = {
  title: "My Page | whatsnext",
};

export default function MyPagePage() {
  return (
    <MobileShell>
      <MyPageView />
    </MobileShell>
  );
}
