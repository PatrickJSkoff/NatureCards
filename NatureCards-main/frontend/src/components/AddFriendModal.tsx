"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendFriendRequest } from "@/lib/social";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

interface AddFriendModalProps {
  buttonText?: string;
  buttonVariant?: "default" | "success" | "outline";
  targetUsername?: string;
  onRequestSent?: () => void;  // Add this prop
}

export function AddFriendModal({ 
  buttonText = "Add Friend", 
  buttonVariant = "success",
  targetUsername,
  onRequestSent
}: AddFriendModalProps) {
  const [username, setUsername] = useState(targetUsername || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
        toast.open(
            <div>
                <div className="font-medium">Error</div>
                <div className="text-sm">Please enter a username</div>
            </div>,
            { variant: "destructive", duration: 3000 }
        );
        return;
    }
    
    setIsLoading(true);
    
    try {
        await sendFriendRequest(username);
        
        toast.open(
            <div>
                <div className="font-medium">Friend Request Sent</div>
                <div className="text-sm">
                    Your friend request to <span className="font-medium">{username}</span> has been sent!
                </div>
            </div>,
            { variant: "success", duration: 5000 }
        );
        
        // Reset form and close modal
        setUsername("");
        setIsOpen(false);

        // Add this line to refresh friend requests
        if (onRequestSent) {
            onRequestSent();
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send friend request';
        toast.open(
            <div>
                <div className="font-medium">Error</div>
                <div className="text-sm">{errorMessage}</div>
            </div>,
            { variant: "destructive", duration: 5000 }
        );
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add a Friend
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Enter the username of the person you&apos;d like to add as a friend.
          </p>
        </div>
        
        <form onSubmit={handleSendRequest}>
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}