import { ProfileView } from "@/components/profile/profile-view";
import { MobileShell } from "@/components/mobile-shell";

export const metadata = {
  title: "프로필 | 와넥",
};

export default function ProfilePage() {
  return (
    <MobileShell>
      <ProfileView />
    </MobileShell>
  );
}
