import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FriendRequest, handleProfileClick, handleAcceptFriend, handleDeclineFriend } from "@/lib/social";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { userState } from "@/lib/gallery";

interface FriendRequestBarProps {
  friend_request: FriendRequest;
  onRequestComplete?: (requestId: string, status: 'accepted' | 'declined') => void;
}

export function FriendRequestBar({ friend_request, onRequestComplete }: FriendRequestBarProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const toast = useToast();

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      handleAcceptFriend(friend_request._id);
      setRequestStatus('accepted');
      
      toast.open(
        <div>
          <div className="font-medium">Friend Added</div>
          <div className="text-sm">
            You are now friends with {friend_request.username}!
          </div>
        </div>,
        { variant: "success", duration: 5000 }
      );
      
      if (onRequestComplete) {
        onRequestComplete(friend_request._id, 'accepted');
      }
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
      handleDeclineFriend(friend_request._id);
      setRequestStatus('declined');
      
      toast.open(
        <div>
          <div className="font-medium">Friend Request Declined</div>
          <div className="text-sm">
            You have declined the friend request from {friend_request.username}.
          </div>
        </div>,
        { variant: "default", duration: 5000 }
      );
      
      if (onRequestComplete) {
        onRequestComplete(friend_request._id, 'declined');
      }
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

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4">
          <div className="flex items-center">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src={friend_request.profile_image} alt={friend_request.username} />
            </Avatar>
            <CardContent className="flex-1 p-0">
              <p className="font-medium">{friend_request.username}</p>
            </CardContent>
          </div>
        </div>
        <div className="flex items-center justify-end p-4 bg-gray-50 border-t sm:border-t-0 sm:border-l">
          {friend_request.receiving === userState.userId ? (
            <div className="flex flex-row gap-2">
              <Button variant="outline" size="sm" onClick={() => handleProfileClick(friend_request.sender_id)}>
                View Profile
              </Button>
              {requestStatus === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Accept"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDecline}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Decline"
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="disabled" size="sm">
                  {requestStatus === 'accepted' ? 'Friend Added' : 'Request Declined'}
                </Button>
              )}
            </div>
          ) : (
            <Button variant="disabled" size="sm">
              Friend Request Sent
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
