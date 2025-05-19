/**
 * User API Routes
 * 
 * These functions handle API calls to the backend for user data
 */

import { User, Card, GalleryResponse, ObjectId } from '@/types/index';
import { convertUserFromDB, convertUserToGalleryResponse, convertCardToDB } from '@/lib/api-adapter';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the current logged in user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return convertUserFromDB(userData);
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}

/**
 * Get a user by their ID
 */
export async function getUserById(userId: ObjectId): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return convertUserFromDB(userData);
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get a user's gallery data
 */
export async function getUserGallery(userId: ObjectId): Promise<GalleryResponse> {
  try {
    const user = await getUserById(userId);
    return convertUserToGalleryResponse(user);
  } catch (error) {
    console.error(`Error fetching gallery for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Add a new card to the user's collection
 */
export async function addCardToUser(userId: ObjectId, card: Card): Promise<User> {
  try {
    const cardData = convertCardToDB(card);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(cardData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add card: ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    return convertUserFromDB(updatedUser);
  } catch (error) {
    console.error('Error adding card to user:', error);
    throw error;
  }
}

/**
 * Update card details
 */
export async function updateCard(userId: ObjectId, cardId: string, updates: Partial<Card>): Promise<User> {
  try {
    const updatesForDB = convertCardToDB(updates as Card);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updatesForDB),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update card: ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    return convertUserFromDB(updatedUser);
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(senderId: ObjectId, receiverId: ObjectId): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${senderId}/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ receiverId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send friend request: ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    return convertUserFromDB(updatedUser);
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(userId: ObjectId, requestId: ObjectId): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/friends/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ requestId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to accept friend request: ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    return convertUserFromDB(updatedUser);
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Initiate a card trade with another user
 */
export async function initiateCardTrade(
  userId: ObjectId, 
  offeredCardId: string, 
  requestedUserId: ObjectId,
  requestedCardId: string
): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/trades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        offeredCardId,
        requestedUserId,
        requestedCardId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate trade: ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    return convertUserFromDB(updatedUser);
  } catch (error) {
    console.error('Error initiating card trade:', error);
    throw error;
  }
} 