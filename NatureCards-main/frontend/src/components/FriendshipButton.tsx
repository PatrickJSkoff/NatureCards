"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AddFriendModal } from "@/components/AddFriendModal";
import { checkFriendshipStatus, FriendshipStatus, handleAcceptFriend, handleDeclineFriend } from "@/lib/social";
import { useToast } from "@/components/ui/toast";
import { Loader2, Check, X, UserCheck, Clock } from "lucide-react";

interface FriendshipButtonProps {
  userId: string;
  username: string;
}

export function FriendshipButton({ userId, username }: FriendshipButtonProps) {
  const [status, setStatus] = useState<FriendshipStatus | "loading">("loading");
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Skip if it's the current user's profile
        if (userId === "12345" || !userId) {
          setStatus("none");
          return;
        }
        
        const friendshipStatus = await checkFriendshipStatus(userId);
        setStatus(friendshipStatus);
      } catch (error) {
        console.error("Error checking friendship status:", error);
        setStatus("none");
      }
    };

    fetchStatus();
  }, [userId]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      handleAcceptFriend(userId);
      setStatus("friend");
      toast.open(
        <div>
          <div className="font-medium">Friend Added</div>
          <div className="text-sm text-green-700">
            You are now friends with {username}!
          </div>
        </div>,
        { variant: "success", duration: 5000 }
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.open(
        <div>
          <div className="font-medium">Error</div>
          <div className="text-sm">
            Failed to accept friend request. Please try again.
          </div>
        </div>,
        { variant: "destructive", duration: 5000 }
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      handleDeclineFriend(userId);
      setStatus("none");
      toast.open(
        <div>
          <div className="font-medium">Friend Request Declined</div>
          <div className="text-sm">
            You have declined the friend request from {username}.
          </div>
        </div>,
        { variant: "default", duration: 5000 }
      );
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.open(
        <div>
          <div className="font-medium">Error</div>
          <div className="text-sm">
            Failed to decline friend request. Please try again.
          </div>
        </div>,
        { variant: "destructive", duration: 5000 }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Return appropriate button based on friendship status
  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (status === "friend") {
    return (
      <Button variant="outline" className="bg-gray-50">
        <UserCheck className="h-4 w-4 mr-2" />
        Friends
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button variant="outline" disabled className="text-amber-600 hover:text-amber-700">
        <Clock className="h-4 w-4 mr-2" />
        Request Sent
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="success" 
          onClick={handleAccept}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Accept
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDecline}
          disabled={actionLoading}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Decline
        </Button>
      </div>
    );
  }

  return (
    <AddFriendModal 
      buttonText="Add Friend" 
      buttonVariant="outline"
      targetUsername={username}
    />
  );
} 