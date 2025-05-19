"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, CheckCircle, XCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { handleAcceptTrade, handleDeclineTrade } from "@/lib/social";
import { fetchUserGalleryData, userState } from "@/lib/gallery";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from '@/components/ui/toast';
import { TradeRequest } from "@/types/index";

// Simplified props interface
interface TradeRequestGlanceProps {
  tradeRequest: TradeRequest;
  onTradeComplete?: (status: 'accepted' | 'declined') => void;
  isDisabled?: boolean;
}

export function TradeRequestGlance({ tradeRequest, onTradeComplete, isDisabled }: TradeRequestGlanceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tradeActionLoading, setTradeActionLoading] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [senderUsername, setSenderUsername] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const toast = useToast();

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        // Make sure we have valid cards in the trade request
        if (!tradeRequest?.offeredCard || !tradeRequest?.requestedCard) {
          console.error('Missing card data in trade request');
          return;
        }

        const [senderData, recipientData] = await Promise.all([
          fetchUserGalleryData(tradeRequest.offeredCard.owner),
          fetchUserGalleryData(tradeRequest.requestedCard.owner)
        ]);

        setSenderUsername(senderData.username);
        setRecipientUsername(recipientData.username);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };

    fetchUsernames();
  }, [tradeRequest]);

  // Modify validateTradeData to check for card data explicitly
  const validateTradeData = () => {
    const hasCards = tradeRequest?.offeredCard && tradeRequest?.requestedCard;
    const hasUsernames = senderUsername && recipientUsername;
    return hasCards && hasUsernames;
  };

  const isCurrentUserSender = userState.userId === tradeRequest?.offeredCard?.owner;

  // Determine colors based on rarity
  const getColors = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          border: "border-[#1a4e8c]", // Blue border
          bg: "bg-[#d8e6f3]", // Light blue background
          star: "text-[#1a4e8c]", // Blue stars
          header: "bg-[#d8e6f3]", // Light blue header
          rarityLevel: 1, // 1 star filled
        };
      case "rare":
        return {
          border: "border-[#2e7d32]", // Green border
          bg: "bg-[#e8f5e9]", // Light green background
          star: "text-[#2e7d32]", // Green stars
          header: "bg-[#e8f5e9]", // Light green header
          rarityLevel: 2, // 2 stars filled
        };
      case "epic":
        return {
          border: "border-[#6a4c93]", // Purple border
          bg: "bg-[#e7e0f4]", // Light purple background
          star: "text-[#6a4c93]", // Purple stars
          header: "bg-[#e7e0f4]", // Light purple header
          rarityLevel: 3, // 3 stars filled
        };
      case "legendary":
        return {
          border: "border-[#8b5a2b]", // Brown/gold border
          bg: "bg-[#f9f3e0]", // Light cream/gold background
          star: "text-[#8b5a2b]", // Brown/gold stars
          header: "bg-[#f9f3e0]", // Light cream/gold header
          rarityLevel: 4, // 4 stars filled
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          star: "text-gray-400",
          header: "bg-gray-50",
          rarityLevel: 0,
        };
    }
  };

  // Function to render a single card preview
  const renderCardPreview = (side: 'sender' | 'recipient') => {
    const cardData = side === 'sender' ? tradeRequest?.offeredCard : tradeRequest?.requestedCard;
    if (!cardData) {
      return <div>Loading...</div>;
    }

    const colors = getColors(cardData.rarity);
    const displayUsername = side === 'sender' ? senderUsername : recipientUsername;
    return (
      <div className="flex flex-col items-center w-full">
        <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate max-w-[120px] sm:max-w-[160px] text-center">
          {isCurrentUserSender ? 
            (side === 'sender' ? "Your Card" : `${displayUsername}'s Card`) :
            (side === 'sender' ? `${displayUsername}'s Card` : "Your Card")}
        </p>
        <div 
          className={`rounded-lg border-2 ${colors.border} overflow-hidden cursor-pointer hover:shadow-md transition-shadow shadow-lg w-[120px] sm:w-[160px]`}
        >
          <div className={`p-1 sm:p-2 ${colors.border} ${colors.header}`}>
            <h3 className="text-sm font-semibold truncate">{cardData.commonName}</h3>
          </div>
          <div className="relative aspect-square">
            <Image
              src={cardData.image || "/placeholder.svg"}
              alt={cardData.commonName}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className={`object-cover border-t-2 border-b-2 ${colors.border}`}
            />
          </div>
          <div className={`flex justify-center p-1 ${colors.bg}`}>
            {[1, 2, 3, 4].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${colors.star} ${
                  star <= getRarityStars(cardData.rarity) ? "fill-current" : "fill-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Get star count for rarity visualization
  const getRarityStars = (rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"): number => {
    switch (rarity) {
      case "legendary": return 4;
      case "epic": return 3;
      case "rare": return 2;
      case "uncommon": return 2; // Assuming uncommon is treated as rare for star count. idek how tf uncommon snuck in the project but we're stuck with it now
      case "common":
      default: return 1;
    }
  };

  const handleOpenDrawer = async () => {
    setDrawerOpen(true);
    setIsLoading(true);
    try {
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching card details:", error);
      setIsLoading(false);
    }
  };

  const acceptTrade = async () => {
    if (tradeActionLoading) return;
    setTradeActionLoading(true);
    
    try {
      const success = await handleAcceptTrade({
        offeredCard: tradeRequest.offeredCard,
        requestedCard: tradeRequest.requestedCard
      });
      
      if (success) {
        setTradeStatus('accepted');
        toast.open(
          <div>
            <div className="font-medium">Trade Accepted</div>
            <div className="text-sm">The trade has been completed successfully!</div>
          </div>,
          { variant: "success", duration: 5000 }
        );
        
        if (onTradeComplete) {
          onTradeComplete('accepted');
        }
        
        setTimeout(() => setDrawerOpen(false), 1500);
      } else {
        throw new Error("Trade acceptance failed");
      }
    } catch (error) {
      console.error("Error accepting trade:", error);
      toast.open(
        <div>
          <div className="font-medium">Error</div>
          <div className="text-sm">Failed to complete the trade. Please try again.</div>
        </div>,
        { variant: "destructive", duration: 5000 }
      );
    } finally {
      setTradeActionLoading(false);
    }
  };

  const declineTrade = async () => {
    if (tradeActionLoading) return;
    setTradeActionLoading(true);
    
    try {
      const success = await handleDeclineTrade(tradeRequest);
      
      if (success) {
        setTradeStatus('declined');
        toast.open(
          <div>
            <div className="font-medium">Trade Declined</div>
            <div className="text-sm">You&apos;ve declined this trade request.</div>
          </div>,
          { variant: "default", duration: 5000 }
        );
        
        if (onTradeComplete) {
          onTradeComplete('declined');
        }
        
        setTimeout(() => setDrawerOpen(false), 1500);
      } else {
        throw new Error("Trade decline failed");
      }
    } catch (error) {
      console.error("Error declining trade:", error);
      toast.open(
        <div>
          <div className="font-medium">Error</div>
          <div className="text-sm">Failed to decline the trade. Please try again.</div>
        </div>,
        { variant: "destructive", duration: 5000 }
      );
    } finally {
      setTradeActionLoading(false);
    }
  };

  if (!validateTradeData()) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          onClick={handleOpenDrawer} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
        >
          {isDisabled ? "Loading..." : "View Trade"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-2 sm:px-4 pb-6">
        <div className="mt-4 sm:mt-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 sm:mb-4 text-center">Trade Details</h3>
          
          {isLoading ? (
            <div className="flex justify-center my-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-1 sm:gap-4 mb-4 w-full place-items-center">
                {renderCardPreview('sender')}
                
                <div className="flex flex-col gap-1 text-gray-400 px-1">
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>

                {renderCardPreview('recipient')}
              </div>

              <p className="text-sm text-gray-500 mb-4 text-center">
                {isCurrentUserSender 
                  ? `You offered this trade to ${recipientUsername}`
                  : `${senderUsername} offered this trade to you`}
              </p>
              
              {!isCurrentUserSender && tradeStatus === 'pending' && (
                <div className="flex justify-center gap-3 mb-4">
                  <Button 
                    onClick={acceptTrade} 
                    className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300" 
                    variant="outline"
                    disabled={tradeActionLoading}
                  >
                    {tradeActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Accept
                  </Button>
                  <Button 
                    onClick={declineTrade} 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    disabled={tradeActionLoading}
                  >
                    {tradeActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Decline
                  </Button>
                </div>
              )}
              
              {tradeStatus === 'accepted' && (
                <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 mb-4">
                  <CheckCircle className="h-4 w-4" />
                  Trade accepted successfully!
                </div>
              )}
              
              {tradeStatus === 'declined' && (
                <div className="text-center text-gray-500 flex items-center justify-center gap-1 mb-4">
                  <XCircle className="h-4 w-4" />
                  Trade declined
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-center mt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
