"use client";

import React from "react";

interface NoteSkeletonProps {
  count?: number;
}

export function NoteSkeleton({ count = 8 }: NoteSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-8 min-h-[200px] flex flex-col border border-gray-50 shadow-sm">
      {/* Title skeleton */}
      <div className="mb-4">
        <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-3 mb-4">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-4/5 h-4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Date skeleton */}
      <div className="mt-auto pt-2">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
