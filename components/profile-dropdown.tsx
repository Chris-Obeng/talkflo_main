"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface ProfileDropdownProps {
  userEmail: string;
  children: React.ReactNode;
}

export function ProfileDropdown({ userEmail, children }: ProfileDropdownProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/landing");
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }, [router, isLoggingOut]);

  const displayName = userEmail?.split('@')[0] || 'User';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div>
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-white rounded-xl shadow-2xl border-gray-200 z-[60] p-2"
        align="start"
        sideOffset={12}
        avoidCollisions={true}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Hey, {displayName}!
              </p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={logout}
          disabled={isLoggingOut}
          className="group text-red-500 hover:text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-md cursor-pointer transition-colors duration-200 ease-in-out px-3 py-2 flex items-center"
        >
          <LogOut className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600" />
          <span className="font-medium">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
