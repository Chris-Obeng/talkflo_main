"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: {
      (command: "config", targetId: string, config?: Record<string, unknown>): void;
      (command: "event", eventName: string, params?: Record<string, unknown>): void;
      (command: "js", date: Date): void;
      // Fallback signature for unforeseen commands; keeps type-safe over `any`.
      (command: string, ...args: unknown[]): void;
    };
  }
}

export function GoogleAnalyticsTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", measurementId, {
        page_path: url,
      });
    }
  }, [measurementId, pathname, searchParams]);

  return null;
}
