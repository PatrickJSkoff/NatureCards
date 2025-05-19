"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export function CardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow shadow-lg w-full">
      {/* Header */}
      <div className="p-1 sm:p-2 border-b-2 border-gray-200 bg-gray-50">
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100">
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Footer/Rating */}
      <div className="flex justify-center p-1 sm:p-2 bg-gray-50">
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-300"
          />
        ))}
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
} 