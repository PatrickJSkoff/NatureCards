"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./CardSkeleton";

export function FeedPostSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* User info section */}
      <div className="flex items-center mb-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="ml-3">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Horizontally scrollable cards container */}
      <div className="mb-2">
        {/* Scrollable container */}
        <div className="overflow-x-auto flex space-x-3 pb-2 -mx-1 px-1">
          {[1, 2].map((index) => (
            <div key={index} className="flex-shrink-0 w-[180px]">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Post metadata */}
      <div className="flex justify-between items-center px-1 mt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <FeedPostSkeleton key={index} />
      ))}
    </div>
  );
} 