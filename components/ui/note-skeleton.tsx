"use client";

import React from "react";

interface NoteSkeletonProps {
  count?: number;
  delay?: number;
}

export function NoteSkeleton({ count = 8, delay = 0 }: NoteSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} delay={delay} />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  index: number;
  delay: number;
}

function SkeletonCard({ index, delay }: SkeletonCardProps) {
  // Calculate animation delay based on position
  // Start from middle of first row and expand outward
  const getAnimationDelay = (index: number) => {
    const row = Math.floor(index / 4); // Assuming 4 columns max
    const col = index % 4;
    const middleCol = 1.5; // Middle of 4 columns (0, 1, 2, 3)
    const distanceFromMiddle = Math.abs(col - middleCol);
    return delay + (row * 200) + (distanceFromMiddle * 100);
  };

  // Calculate opacity based on row position - fade out as we go down
  const getOpacity = (index: number) => {
    const row = Math.floor(index / 4);
    const baseOpacity = 0.15; // Much more subtle base opacity
    const fadeRate = 0.03; // How much to fade per row
    return Math.max(0.05, baseOpacity - (row * fadeRate));
  };

  const animationDelay = getAnimationDelay(index);
  const cardOpacity = getOpacity(index);

  return (
    <div
      className="relative rounded-3xl p-8 min-h-[200px] flex flex-col overflow-hidden"
      style={{
        background: `rgba(255, 255, 255, ${cardOpacity * 0.8})`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid rgba(255, 255, 255, ${cardOpacity * 0.6})`,
        boxShadow: `0 4px 16px 0 rgba(31, 38, 135, ${cardOpacity * 0.2})`,
        animationDelay: `${animationDelay}ms`,
        opacity: cardOpacity / 0.15, // Normalize opacity for the entire card
      }}
    >
      {/* Shimmer overlay - much more subtle */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${cardOpacity * 2}), transparent)`,
          animationDelay: `${animationDelay}ms`,
        }}
      />

      {/* Status indicator skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-gray-200/40 rounded-full animate-pulse" />
        <div className="w-16 h-3 bg-gray-200/40 rounded animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="mb-4 space-y-2">
        <div className="w-3/4 h-5 bg-gray-200/50 rounded animate-pulse" />
        <div className="w-1/2 h-5 bg-gray-200/40 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-3 mb-4">
        <div className="w-full h-4 bg-gray-200/40 rounded animate-pulse" />
        <div className="w-5/6 h-4 bg-gray-200/35 rounded animate-pulse" />
        <div className="w-4/5 h-4 bg-gray-200/40 rounded animate-pulse" />
        <div className="w-2/3 h-4 bg-gray-200/35 rounded animate-pulse" />
      </div>

      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="w-16 h-6 bg-gray-200/40 rounded-full animate-pulse" />
        <div className="w-20 h-6 bg-gray-200/35 rounded-full animate-pulse" />
        <div className="w-14 h-6 bg-gray-200/40 rounded-full animate-pulse" />
      </div>

      {/* Date skeleton */}
      <div className="mt-auto pt-2">
        <div className="w-20 h-3 bg-gray-200/35 rounded animate-pulse" />
      </div>

      {/* Checkbox skeleton */}
      <div className="absolute bottom-4 right-4">
        <div className="w-5 h-5 bg-gray-200/40 rounded-full animate-pulse" />
      </div>
    </div>
  );
}