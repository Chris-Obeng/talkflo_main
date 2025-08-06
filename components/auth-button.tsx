import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // Using getUser() which handles token refresh automatically
  const { data } = await supabase.auth.getUser();

  const user = data?.user;

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-slate-300 text-sm">Hey, {user.email?.split('@')[0]}!</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"} className="text-slate-300 border-slate-500 hover:bg-slate-600">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="bg-orange-500 hover:bg-orange-600">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
