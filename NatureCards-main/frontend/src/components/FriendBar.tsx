import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Friend, handleProfileClick } from "@/lib/social";

export function FriendBar({ friend }: { friend: Friend }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4">
          <div className="flex items-center">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src={friend.profile_image} alt={friend.username} />
            </Avatar>
            <CardContent className="flex-1 p-0">
              <p className="font-medium">{friend.username}</p>
            </CardContent>
          </div>
        </div>
        <div className="flex items-center justify-end p-4 bg-gray-50 border-t sm:border-t-0 sm:border-l">
          <Button variant="outline" size="sm" onClick={() => handleProfileClick(friend._id)}>
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
