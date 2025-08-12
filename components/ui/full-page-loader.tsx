"use client";

import React from "react";

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center text-center">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-700 animate-spin"></div>
      </div>
      <h2 className="text-xl font-semibold text-slate-700">Loading your space...</h2>
      <p className="text-slate-500">Please wait a moment.</p>
    </div>
  );
}
