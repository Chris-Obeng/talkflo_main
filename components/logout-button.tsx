"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/landing");
  };

  return (
    <Button 
      onClick={logout} 
      variant="outline" 
      size="sm"
      className="text-slate-300 border-slate-500 hover:bg-slate-600 hover:text-white"
    >
      Logout
    </Button>
  );
}
