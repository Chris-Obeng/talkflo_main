import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TalkfloMain } from "@/components/talkflo-main";
import { ProfileDropdown } from "@/components/profile-dropdown";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div style={{ backgroundColor: '#f5f0eb', minHeight: '100vh' }}>
      {/* Header Navigation - AudioPen Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-700 text-white shadow-sm">
        <div className="w-full flex justify-between items-center px-6 py-3">
          {/* Left - User Avatar with Dropdown */}
          <div className="flex items-center">
            <ProfileDropdown userEmail={data.user.email || ""}>
              <button 
                className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700"
                type="button"
                aria-label="Profile menu"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
            </ProfileDropdown>
          </div>

          {/* Center - Prime Banner */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full px-3 py-1 text-xs text-slate-700 font-semibold">
              Talkflo Prime
            </div>
            <span className="text-slate-300 text-sm font-normal">
              If you like Talkflo, you&apos;ll love Talkflo Prime.
            </span>
          </div>

          {/* Right - Empty space for balance */}
          <div className="flex items-center">
            <div className="w-7 h-7"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <TalkfloMain />
    </div>
  );
}
