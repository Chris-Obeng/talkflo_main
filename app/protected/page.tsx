'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TalkfloMain } from "@/components/talkflo-main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { SupportModal } from "@/components/support-modal";
import type { User } from "@supabase/supabase-js";

export default function ProtectedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f5f0eb', minHeight: '100vh' }}>
      {/* Header Navigation - AudioPen Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-700 text-white shadow-sm">
        <div className="w-full flex justify-between items-center px-6 py-3">
          {/* Left - User Avatar with Dropdown */}
          <div className="flex items-center">
            <ProfileDropdown userEmail={user.email || ""}>
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

          {/* Center - Support Banner */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="bg-white rounded-full px-3 py-1 text-xs text-slate-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Support Talkflo
            </button>
            <span className="text-slate-300 text-sm font-normal hidden sm:inline">
              Support us to keep Talkflo online
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

      {/* Support Modal - for manual access via header button */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </div>
  );
}
