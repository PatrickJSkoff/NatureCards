"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { CardPost, Card } from "@/types/index";
import { CardGlance } from "./CardGlance";

interface FeedCardProps {
  post: CardPost;
}

// Helper function to convert CardInPost to Card
function convertToCard(cardInPost: CardPost['cards'][0], postId: string, username: string): Card {
  return {
    id: cardInPost.cardId,
    commonName: cardInPost.cardName,
    scientificName: cardInPost.scientificName || "",
    image: cardInPost.image,
    rarity: cardInPost.rarity,
    creator: postId, // Using post ID as placeholder
    owner: postId, // Using post ID as placeholder
    funFact: "",
    timeCreated: new Date().toISOString(), // Current date as placeholder
    location: "",
    tradeStatus: false,
    infoLink: "",
    username: username
  };
}

export function FeedCard({ post }: FeedCardProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* User info section */}
      <Link href={`/gallery?userid=${post.id}`} className="flex items-center mb-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-green-100 border border-gray-200">
          {post.user && post.user.avatar ? (
            <Image
              src={post.user.avatar}
              alt={post.user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-green-700 text-xl font-bold">
              {post.user ? post.user.username.charAt(0) : '?'}
            </div>
          )}
        </div>
        <div className="ml-3">
          <div className="font-semibold text-gray-800">
            {post.user ? post.user.username : 'Unknown User'}
          </div>
          <div className="text-sm text-gray-500">
            {post.cards.length} cards
          </div>
        </div>
      </Link>

      {/* Horizontally scrollable cards container */}
      <div className="mb-2">
        {/* Scrollable container */}
        <div className="overflow-x-auto flex space-x-3 pb-2 -mx-1 px-1">
          {post.cards.map((cardInPost, index) => (
            <div key={`${post.id}-card-${index}`} className="flex-shrink-0 w-[180px]">
              <CardGlance 
                card={convertToCard(
                  cardInPost, 
                  post.id, 
                  post.user ? post.user.username : 'Unknown'
                )} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Post metadata */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1 mt-2">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{post.location}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{post.timestamp}</span>
        </div>
      </div>
    </div>
  );
} 