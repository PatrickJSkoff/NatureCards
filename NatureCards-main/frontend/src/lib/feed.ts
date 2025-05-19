// Import types from the types directory
import { CardPost, FeedResponse, Card, GalleryResponse, CardInPost } from '@/types/index';
import { userState, fetchUserGalleryData } from './gallery';

// Helper function to convert a Card to CardInPost
function convertToCardInPost(card: Card): CardInPost {
  return {
    cardId: card.id || String(card.creator),
    cardName: card.commonName,
    scientificName: card.scientificName,
    image: card.image,
    rarity: card.rarity
  };
}

// Helper function to create a post from user data
function createPost(userData: GalleryResponse, timestamp: string = 'Just now'): CardPost {
  if (!userData.cards || userData.cards.length === 0) {
    return {
      id: userData._id,
      user: {
        id: userData._id,
        username: userData.username,
        cardCount: 0
      },
      timestamp: timestamp,
      location: 'Unknown location',
      cards: [],
      likes: 0,
      comments: 0
    };
  }

  // Use location from first card or default
  const location = userData.cards[0].location || 'Unknown location';
  
  // Convert cards to CardInPost format
  const cardsInPost = userData.cards.map(convertToCardInPost);
  
  return {
    id: userData._id,
    user: {
      id: userData._id,
      username: userData.username,
      cardCount: userData.cards.length
    },
    timestamp: timestamp,
    location: location,
    cards: cardsInPost,
    likes: Math.floor(Math.random() * 50), // Placeholder likes
    comments: Math.floor(Math.random() * 10) // Placeholder comments
  };
}

// Function to fetch feed data from backend
export async function fetchFeedData(): Promise<FeedResponse> {
  try {
    if (!userState.userId) {
      throw new Error('No user ID available. User must be logged in first.');
    }
    
    // Fetch current user's data
    const userData = await fetchUserGalleryData(userState.userId);
    
    // Check if user has friends
    if (!userData.friends || userData.friends.length === 0) {
      // If no friends, return just the user's own post
      return { 
        posts: [createPost(userData)] 
      };
    }
    
    // Fetch friends' data
    const friendsPromises = userData.friends.map(friendId => 
      fetchUserGalleryData(friendId)
    );
    
    const friendsData = await Promise.all(friendsPromises);
    
    // Create posts for the user and their friends
    const posts: CardPost[] = [
      createPost(userData, 'Just now'),
      ...friendsData.map((friend) => {
        // Create different timestamps for friends
        const hours = Math.floor(Math.random() * 24) + 1;
        return createPost(friend, `${hours} hours ago`);
      })
    ];
    
    return { posts };
  } catch (error) {
    console.error('Error fetching feed data:', error);
    // Return empty feed on error
    return { posts: [] };
  }
}

// Function to fetch feed data for a specific user
export async function fetchUserFeedData(userId: string): Promise<FeedResponse> {
  try {
    const userData = await fetchUserGalleryData(userId);
    return {
      posts: [createPost(userData)]
    };
  } catch (error) {
    console.error(`Error fetching feed data for user ${userId}:`, error);
    return { posts: [] };
  }
} 