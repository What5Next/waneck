import { ProfileView } from "@/components/profile/profile-view";
import { MobileShell } from "@/components/mobile-shell";

export const metadata = {
  title: "Profile | Waneck",
};

export default function ProfilePage() {
  return (
    <MobileShell>
      <ProfileView />
    </MobileShell>
  );
}
