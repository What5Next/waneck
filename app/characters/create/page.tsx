import { notFound, redirect } from "next/navigation";

import { CharacterCreateForm } from "@/components/character-create-form";
import { MobileShell } from "@/components/mobile-shell";
import { CHARACTER_CREATION_ENABLED } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

export default async function CreateCharacterPage() {
  if (!CHARACTER_CREATION_ENABLED) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <MobileShell className="max-w-[1440px]">
      <CharacterCreateForm />
    </MobileShell>
  );
}
