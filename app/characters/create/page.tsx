import { redirect } from "next/navigation";

import { CharacterCreateForm } from "@/components/character-create-form";
import { MobileShell } from "@/components/mobile-shell";
import { createClient } from "@/lib/supabase/server";

export default async function CreateCharacterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <MobileShell>
      <CharacterCreateForm />
    </MobileShell>
  );
}
