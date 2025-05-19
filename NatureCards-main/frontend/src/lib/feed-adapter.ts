/**
 * Feed Adapter
 * 
 * This module provides functions to create feed data from user documents in the MongoDB database
 */

import { User, CardInPost, FeedUser, CardPost, FeedResponse } from '@/types/index';
import { fetchUserById } from './api-adapter';

/**
 * Convert a user's cards into a feed post
 */
export function createPostFromUserCards(
  user: User, 
  location: string = 'Unknown location',
  timestamp: string = 'Just now'
): CardPost {
  // Create a feed user from the MongoDB user
  const feedUser: FeedUser = {
    id: user._id,
    username: user.username,
    avatar: '/avatar-placeholder.png', // Default avatar
    cardCount: user.cards.length
  };
  
  // Convert the user's cards to cards in post format
  const cardsInPost: CardInPost[] = user.cards.map(card => ({
    cardName: card.commonName,
    scientificName: card.scientificName,
    image: card.image,
    rarity: card.rarity,
    cardId: card.id || `card-${user._id}-${card.commonName.replace(/\s+/g, '-').toLowerCase()}`
  }));
  
  // Return a feed post with the user's cards
  return {
    id: `post-${user._id}-${Date.now()}`,
    user: feedUser,
    location,
    timestamp,
    likes: Math.floor(Math.random() * 10), // Mock likes count
    comments: Math.floor(Math.random() * 5), // Mock comments count
    cards: cardsInPost
  };
}

/**
 * Generate a feed for the current user based on their friends
 */
export async function generateFeedFromFriends(currentUser: User): Promise<FeedResponse> {
  try {
    // Array to store all posts
    const allPosts: CardPost[] = [];
    
    // First add the current user's cards as a post
    if (currentUser.cards.length > 0) {
      const userPost = createPostFromUserCards(
        currentUser,
        'Your location', // Can be replaced with actual location
        'Just now'
      );
      allPosts.push(userPost);
    }
    
    // Fetch each friend and add their cards as posts
    for (const friendId of currentUser.friends) {
      try {
        // In a real implementation, we'd fetch each friend from the database
        const friend = await fetchUserById(friendId);
        
        if (friend.cards.length > 0) {
          const friendPost = createPostFromUserCards(
            friend,
            friend.cards[0].location || 'Unknown location',
            `${Math.floor(Math.random() * 24)} hours ago` // Mock timestamp
          );
          allPosts.push(friendPost);
        }
      } catch (error) {
        console.error(`Error fetching friend ${friendId}:`, error);
        // Continue with other friends if one fails
      }
    }
    
    // Sort posts by newest first (based on random timestamps in this mock example)
    // In a real implementation, we would sort by actual timestamps
    const sortedPosts = allPosts.sort(() => Math.random() - 0.5);
    
    return {
      posts: sortedPosts
    };
  } catch (error) {
    console.error('Error generating feed:', error);
    // Return empty feed if there's an error
    return { posts: [] };
  }
}

/**
 * Fetch feed data for a user by their ID
 * (Mock implementation, would be replaced with real API calls)
 */
export async function fetchFeedDataForUser(userId: string): Promise<FeedResponse> {
  try {
    // In a real implementation, we would:
    // 1. Fetch the user by ID
    // 2. Fetch all their friends
    // 3. Generate a feed from the user and their friends' cards
    
    // For now, we'll return a mock feed
    const user = await fetchUserById(userId);
    return generateFeedFromFriends(user);
  } catch (error) {
    console.error('Error fetching feed data for user:', error);
    return { posts: [] };
  }
} 