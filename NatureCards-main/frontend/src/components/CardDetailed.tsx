"use client"

import Image from "next/image"
import { Calendar, MapPin, User, Star } from "lucide-react"

interface PlantDetails {
  id: string
  name: string
  image: string
  rating: number
  rarity: "common" | "rare" | "epic" | "legendary"
  commonName: string
  scientificName: string
  family: string
  funFact: string
  timePosted: string
  location: string
  username: string
}

export function CardDetailed({ plant }: { plant: PlantDetails }) {
  // Check for required props and provide fallbacks
  const safeImage = plant.image || '/placeholder.svg';
  const safeName = plant.name || plant.commonName || 'Unknown Plant';
  const safeRarity = plant.rarity || 'common';
  
  // Get border color based on rarity
  const getBorderColor = () => {
    switch (safeRarity) {
      case "common":
        return "border-[#1a4e8c]" // Blue border
      case "rare":
        return "border-[#2e7d32]" // Green border
      case "epic":
        return "border-[#6a4c93]" // Purple border
      case "legendary":
        return "border-[#8b5a2b]" // Brown/gold border
      default:
        return "border-gray-300"
    }
  }

  // Get background color for the rarity badge
  const getRarityBgColor = () => {
    switch (safeRarity) {
      case "common":
        return "bg-[#d8e6f3] text-[#1a4e8c]" // Light blue
      case "rare":
        return "bg-[#e8f5e9] text-[#2e7d32]" // Light green
      case "epic":
        return "bg-[#e7e0f4] text-[#6a4c93]" // Light purple
      case "legendary":
        return "bg-[#f9f3e0] text-[#8b5a2b]" // Light cream/gold
      default:
        return "bg-gray-100 text-gray-700"
    }
  }
  
  // Get star color based on rarity
  const getStarColor = () => {
    switch (safeRarity) {
      case "common":
        return "text-[#1a4e8c]" // Blue stars
      case "rare":
        return "text-[#2e7d32]" // Green stars
      case "epic":
        return "text-[#6a4c93]" // Purple stars
      case "legendary":
        return "text-[#8b5a2b]" // Brown/gold stars
      default:
        return "text-gray-400"
    }
  }

  // Get content background color based on rarity
  const getContentBgColor = () => {
    switch (safeRarity) {
      case "common":
        return "bg-[#f1f5fb]" // Very light blue
      case "rare":
        return "bg-[#f3f9f3]" // Very light green
      case "epic":
        return "bg-[#f5f2fa]" // Very light purple
      case "legendary":
        return "bg-[#fdfbf5]" // Very light cream/gold
      default:
        return "bg-gray-50"
    }
  }

  // Capitalize first letter of rarity
  const capitalizeRarity = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }

  return (
    <div className={`rounded-xl border-2 ${getBorderColor()} w-full overflow-hidden mt-4 shadow-xl`}>
      {/* Plant Image */}
      <div className="relative aspect-square w-full">
        <Image 
          src={safeImage}
          alt={safeName} 
          fill 
          className="object-cover"
          priority
        />
      </div>

      {/* Plant Information */}
      <div className={`${getContentBgColor()} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#1a365d]">{safeName}</h2>
          <div className={`px-3 py-1 rounded-full ${getRarityBgColor()} text-sm font-medium`}>
            {capitalizeRarity(safeRarity)}
          </div>
        </div>
        
        {/* Stars display */}
        <div className="flex mb-4">
          {[1, 2, 3, 4].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${getStarColor()} ${star <= plant.rating ? "fill-current" : "fill-transparent"}`}
            />
          ))}
        </div>

        <div className="space-y-2 text-[#2d3748] mb-4">
          <p>
            <span className="font-semibold">Common:</span> {plant.commonName || safeName}
          </p>
          <p>
            <span className="font-semibold">Scientific:</span> <em>{plant.scientificName || 'Unknown'}</em>
          </p>
          <p>
            <span className="font-semibold">Family:</span> {plant.family || 'Unknown'}
          </p>
          <p className="break-words">
            <span className="font-semibold">Fun Fact:</span> {plant.funFact || 'No additional information available.'}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-col space-y-2 mt-4 border-t pt-4 border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{plant.timePosted || 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{plant.location || 'Unknown location'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>{plant.username || 'Unknown user'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

