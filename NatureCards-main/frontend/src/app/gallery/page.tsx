"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CardGlance } from "@/components/CardGlance";
import { Card, SortOption } from "@/types/index";
import { fetchGalleryData, fetchUserGalleryData, sortCards } from "@/lib/gallery";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FriendshipButton } from "@/components/FriendshipButton";
import { GallerySkeleton } from "@/components/CardSkeleton";

// Interface for MongoDB documents that may include _id
interface MongoDBDocument {
  _id?: string;
}

// Create a client component that uses useSearchParams
function GalleryContent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("Your Cards");
  
  // Get the userid parameter from the URL
  const searchParams = useSearchParams();
  const userId = searchParams.get("userid");

  useEffect(() => {
    const getGalleryData = async () => {
      setLoading(true);
      try {
        // If userid is provided, fetch that user's gallery
        let data;
        if (userId) {
          data = await fetchUserGalleryData(userId);
        } else {
          // Otherwise fetch the current user's gallery
          data = await fetchGalleryData();
        }
        
        console.log("data", data);
        // Update the page title to show whose gallery it is
        setUsername(userId ? `${data.username}'s Cards` : "Your Cards");
        
        // Process cards to ensure they have the required properties
        const processedCards = data.cards.map((card: Card & MongoDBDocument, index: number) => {
          // Generate a unique ID if none exists
          if (!card.id) {
            // Use MongoDB _id if available, otherwise generate a fallback ID
            card.id = card._id || `card-${index}-${new Date().getTime()}`;
          }
          
          return card;
        });
        
        // Sort and set the cards
        setCards(sortCards(processedCards, sortBy));
      } catch (error) {
        console.error("Failed to fetch gallery data:", error);
      } finally {
        setLoading(false);
      }
    };

    getGalleryData();
  }, [sortBy, userId]);

  const handleSort = (option: SortOption) => {
    setSortBy(option);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 pt-4 sm:pt-8 pb-24">
      {/* Show examples for demo purposes */}
      {/* <GalleryExamples /> */}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">{username}</h1>
          
          {/* Show friendship button only if viewing another user's gallery */}
          {userId && userId !== "12345" && (
            <div className="mt-2 sm:mt-0 sm:ml-4">
              <FriendshipButton userId={userId} username={username} />
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-sm sm:text-base w-fit">
              Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("date")}>
              Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("rarity")}>
              Rarity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
          {cards.map((card, index) => (
            <CardGlance
              key={card.id || `card-${index}-${card.commonName}`}
              card={card}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No cards found in this collection</p>
        </div>
      )}
    </div>
  );
}

// Fallback component to show while loading
function GalleryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GallerySkeleton />
    </div>
  );
}

// Main Gallery page component with Suspense boundary
export default function Gallery() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
