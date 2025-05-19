import { GalleryResponse, PendingFriend, TradeRequest, Card } from "@/types/index";
import { fetchGalleryData, fetchUserGalleryData, updateUserData } from "@/lib/gallery";

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nature-cards-e3f71dcee8d3.herokuapp.com';

// Types for friend data. User id is used to fetch most other data
export interface Friend {
    _id: string;
    username: string;
    profile_image: string;
}

export interface FriendRequest {
    _id: string;
    sender_id: string;
    recipient_id: string;
    username: string;
    profile_image: string;
    sending: string;
    receiving: string;
}

// Convert backend friend data to our Friend interface
async function processFriendData(userId: string): Promise<Friend> {
    const userData = await fetchUserGalleryData(userId);
    return {
        _id: userData._id,
        username: userData.username,
        profile_image: userData.profile_picture || '/default-avatar.png'
    };
}

// Fetch real friend data from backend
export async function fetchFriendData(): Promise<Friend[]> {
    try {
        const currentUser = await fetchGalleryData();
        const friendPromises = (currentUser.friends ?? []).map((friendId: string | { $oid: string }) =>
            processFriendData(typeof friendId === 'string' ? friendId : friendId.$oid)
        );
        return await Promise.all(friendPromises);
    } catch (error) {
        console.error("Error fetching friend data:", error);
        return [];
    }
}

// Fetch this user's friend request data from backend
export async function fetchFriendRequestData(): Promise<FriendRequest[]> {
    try {
        const currentUser = await fetchGalleryData();
        console.log("Current user data:", currentUser);

        if (!currentUser?.pending_friends) {
            console.log("No pending friends found");
            return [];
        }

        // Process friend requests by mapping friend request objects
        const pendingFriendsArray = currentUser.pending_friends.map(request => {
            if (!request?.sending || !request?.receiving) {
                console.error('Invalid request structure:', request);
                return null;
            }
            return request;
        }).filter((request): request is PendingFriend => request !== null);

        console.log("Structured pending friends:", pendingFriendsArray);

        const requestPromises = pendingFriendsArray.map(async (request) => {
            try {
                // note that request.sending and request.receiving represent user IDs
                const otherUserId = request.sending === currentUser._id ?
                    request.receiving : request.sending;

                console.log(`Fetching data for user ${otherUserId}`);
                const otherUserData = await fetchUserGalleryData(otherUserId);

                return {
                    _id: request.sending,
                    sender_id: request.sending,
                    recipient_id: request.receiving,
                    username: otherUserData.username,
                    profile_image: otherUserData.profile_picture || '/default-avatar.png',
                    sending: request.sending,
                    receiving: request.receiving
                };
            } catch (err) {
                console.error('Error processing friend request:', err);
                return null;
            }
        });

        const results = await Promise.all(requestPromises);
        const validResults = results.filter((req): req is FriendRequest => req !== null);
        console.log("Final processed friend requests:", validResults);

        return validResults;
    } catch (error) {
        console.error("Error fetching friend request data:", error);
        return [];
    }
}

// Fetch trade requests for the current user
export async function fetchTradeRequestData(): Promise<TradeRequest[]> {
    try {
        const currentUser = await fetchGalleryData();
        console.log("Current user data for trades:", currentUser);

        if (!currentUser?.trading || currentUser.trading.length === 0) {
            console.log("No trade requests found");
            return [];
        }

        return currentUser.trading;
    } catch (error) {
        console.error("Error fetching trade request data:", error);
        return [];
    }
}

//Get a URL representing the user's gallery. Fetched using the passed in user's ID.
export function fetchFriendGalleryURL(user_id: string): string {
    return ("/gallery?userid=" + user_id);
}

//Social "view profile" button click
export const handleProfileClick = (friend_id: string) => {
    console.log(fetchFriendGalleryURL(friend_id));
    window.location.href = '/gallery?userid=' + friend_id;
}

//View trade request drawer on click
export const handleTradeRequestClick = (trade_id: string) => {
    console.log(fetchFriendGalleryURL(trade_id));
    console.log("open trade request drawer here");
    //window.location.href = '/gallery?userid=' + trade_id;
}

// Accept friend request ONLY if this user is the recipient. This logic
// should not be handled by the user who sent the request, but check isn't necessary here;
// Conditional on friend request bar should block the sender from accepting/declining request.
export const handleAcceptFriend = async (friend_id: string) => {
    try {
        const currentUser = await fetchGalleryData();
        const otherUser = await fetchUserGalleryData(friend_id);

        // Find the specific friend request
        const friendRequest = (currentUser.pending_friends ?? []).find(
            request => request.sending === friend_id
        );

        if (!friendRequest) {
            throw new Error('Friend request not found');
        }

        // Update current user's data
        const updatedCurrentUser = {
            ...currentUser,
            friends: [...(currentUser.friends || []), friend_id],
            pending_friends: (currentUser.pending_friends ?? []).filter(
                request => request.sending !== friend_id
            )
        };

        // Update other user's data
        const updatedOtherUser = {
            ...otherUser,
            friends: [...(otherUser.friends || []), currentUser._id],
            pending_friends: (otherUser.pending_friends ?? []).filter(
                request => !(request.sending === friend_id && request.receiving === currentUser._id)
            )
        };

        // Update both users in database
        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedOtherUser)
        ]);

    } catch (error) {
        console.error("Error accepting friend request:", error);
        throw error;
    }
};

//Decline friend request from sender. Simply removes friend request data from both users.
export const handleDeclineFriend = async (friend_id: string) => {
    try {
        const currentUser = await fetchGalleryData();
        const otherUser = await fetchUserGalleryData(friend_id);

        // Update current user's data
        const updatedCurrentUser = {
            ...currentUser,
            pending_friends: (currentUser.pending_friends ?? []).filter(
                request => request.sending !== friend_id
            )
        };

        // Update other user's data - fix the filter condition to remove the request
        const updatedOtherUser = {
            ...otherUser,
            pending_friends: (otherUser.pending_friends ?? []).filter(
                request => !(request.sending === friend_id && request.receiving === currentUser._id)
            )
        };

        // Update both users in database
        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedOtherUser)
        ]);

    } catch (error) {
        console.error("Error declining friend request:", error);
        throw error;
    }
};

//Handled when trade recipient accepts trade request, exchanging card data between sender and recipient
export const handleAcceptTrade = async (trade_request: TradeRequest): Promise<boolean> => {
    try {
        const currentUser = await fetchGalleryData();
        const tradePartner = await fetchUserGalleryData(trade_request.offeredCard.owner);

        // Create the exchanged card objects with updated ownership
        const senderCardWithNewOwner = { ...trade_request.offeredCard, owner: currentUser._id };
        const recipientCardWithNewOwner = { ...trade_request.requestedCard, owner: tradePartner._id };

        // Exchange card ownership
        const updatedCurrentUser = {
            ...currentUser,
            cards: [
                ...currentUser.cards.filter(card => card.id !== trade_request.requestedCard.id),
                senderCardWithNewOwner
            ],
            trading: (currentUser.trading ?? []).filter(t => 
                t.offeredCard.id !== trade_request.offeredCard.id && t.requestedCard.id !== trade_request.requestedCard.id
            )
        };

        const updatedPartnerUser = {
            ...tradePartner,
            cards: [
                ...tradePartner.cards.filter(card => card.id !== trade_request.offeredCard.id),
                recipientCardWithNewOwner
            ],
            trading: (tradePartner.trading ?? []).filter(t => 
                t.offeredCard.id !== trade_request.offeredCard.id && t.requestedCard.id !== trade_request.requestedCard.id
            )
        };

        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedPartnerUser)
        ]);

        return true;
    } catch (error) {
        console.error('Error accepting trade:', error);
        return false;
    }
};

export const handleDeclineTrade = async (trade_request: TradeRequest): Promise<boolean> => {
    try {
        const currentUser = await fetchGalleryData();
        const tradePartner = await fetchUserGalleryData(trade_request.offeredCard.owner);

        // Remove trade from both users' trading arrays
        const updatedCurrentUser = {
            ...currentUser,
            trading: (currentUser.trading ?? []).filter(t =>
                t.offeredCard.id !== trade_request.offeredCard.id
            )
        };

        const updatedPartnerUser = {
            ...tradePartner,
            trading: (tradePartner.trading ?? []).filter(t =>
                t.offeredCard.id !== trade_request.offeredCard.id
            )
        };

        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedPartnerUser)
        ]);

        return true;
    } catch (error) {
        console.error('Error declining trade:', error);
        return false;
    }
};

export async function sendTradeRequest(offeredCard: Card, requestedCard: Card): Promise<boolean> {
    try {
        const currentUser = await fetchGalleryData();
        const targetUser = await fetchUserGalleryData(requestedCard.owner);

        // Create trade request object
        const tradeRequest = {
            offeredCard: offeredCard,
            requestedCard: requestedCard
        };

        // Update both users with the new trade request
        const updatedCurrentUser = {
            ...currentUser,
            trading: [...(currentUser.trading || []), tradeRequest]
        };

        const updatedTargetUser = {
            ...targetUser,
            trading: [...(targetUser.trading || []), tradeRequest]
        };

        // Update both users in database
        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedTargetUser)
        ]);

        return true;
    } catch (error) {
        console.error('Error sending trade request:', error);
        return false;
    }
}

// Simulates sending a friend request to a user by username
export async function sendFriendRequest(username: string): Promise<boolean> {
    try {
        const currentUser = await fetchGalleryData();
        const response = await fetch(`${BACKEND_URL}/db/findUsername/${username}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const userData = await response.json();

        // No longer setting userId in state - we only want to do that at login
        // The commented line is removed completely to avoid confusion

        // Convert backend response to GalleryResponse format
        const targetUser: GalleryResponse = {
            _id: userData._id,
            username: userData.username,
            cards: userData.cards || [],
            friends: userData.friends || [],
            pending_friends: userData.pending_friends || [],
            profile_picture: userData.profile_picture || null
        };

        // Check if a friend request already exists
        const existingRequest = (targetUser.pending_friends ?? []).find(
            request => request.sending === currentUser._id || request.receiving === currentUser._id
        );

        if (existingRequest) {
            throw new Error('Friend request already exists');
        }

        // Check if they're already friends
        if ((targetUser.friends ?? []).includes(currentUser._id)) {
            throw new Error('Already friends with this user');
        }

        // Create friend request object
        const friendRequest: PendingFriend = {
            sending: currentUser._id,
            receiving: targetUser._id
        };

        // Update both users' pending friends lists
        const updatedCurrentUser = {
            ...currentUser,
            pending_friends: [...(currentUser.pending_friends || []), friendRequest]
        };

        const updatedTargetUser = {
            _id: targetUser._id,
            username: targetUser.username,
            cards: targetUser.cards,
            pending_friends: [...(targetUser.pending_friends || []), friendRequest],
            friends: targetUser.friends
        };

        // Update both users in database
        await Promise.all([
            updateUserData(updatedCurrentUser),
            updateUserData(updatedTargetUser)
        ]);

        return true;
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
    }
}

// Enumerates possible friendship statuses
export type FriendshipStatus = "friend" | "pending_outgoing" | "pending_incoming" | "none";

// Check the friendship status of a given user ID relative to the current user
export async function checkFriendshipStatus(userId: string): Promise<FriendshipStatus> {
    try {
        const currentUser = await fetchGalleryData();

        // Check if they're friends
        const isFriend = (currentUser.friends ?? []).some(
            (friendId: string | { $oid: string }) => (typeof friendId === 'string' ? friendId : friendId.$oid) === userId
        );
        if (isFriend) return "friend";

        // Check for outgoing friend request
        const isOutgoingRequest = (currentUser.pending_friends ?? []).some(
            request => request.receiving === userId
        );
        if (isOutgoingRequest) return "pending_outgoing";

        // Check for incoming friend request
        const isIncomingRequest = (currentUser.pending_friends ?? []).some(
            request => request.sending === userId
        );
        if (isIncomingRequest) return "pending_incoming";

        return "none";

    } catch (error) {
        console.error('Error checking friendship status:', error);
        throw error;
    }
}

//Get this user's gallery data. Used for exchanging card data in trades.
export async function getUserGallery(user_id: string): Promise<GalleryResponse> {
    const response = await fetch(`/api/gallery?userid=${user_id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch gallery data");
    }
    return response.json();
}