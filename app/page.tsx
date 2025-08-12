import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to protected app
  if (data?.user) {
    redirect("/protected");
  }
  
  // If not authenticated, redirect to landing page
  redirect("/landing");
}
