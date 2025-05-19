// Import types from the types directory
import { Card, GalleryResponse, SortOption } from '@/types/index';

// Simple user state management
interface UserState {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
  // Add a function to identify if we're working with the authenticated user
  isAuthenticatedUser: (id: string) => boolean;
}

// Singleton user state manager
export const userState: UserState = {
  userId: typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null,
  
  setUserId(id: string) {
    this.userId = id;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userId', id);
    }
  },
  
  clearUserId() {
    this.userId = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('userId');
    }
  },

  // Helper to check if a given ID matches the authenticated user
  isAuthenticatedUser(id: string) {
    return this.userId === id;
  }
};

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nature-cards-e3f71dcee8d3.herokuapp.com';

// Function to fetch gallery data for the authenticated user
export async function fetchGalleryData(): Promise<GalleryResponse> {
  try {
    // If we have a userId in state, use that
    if (userState.userId) {
      return fetchUserGalleryData(userState.userId);
    }
    
    // Otherwise, we could return a default user or an empty response
    // This depends on your application's requirements
    throw new Error('No user ID available. User must be logged in first.');
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    throw error;
  }
}

// Function to fetch gallery data for a specific user without modifying auth state
export async function fetchUserGalleryData(userId: string): Promise<GalleryResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/db/find/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const userData = await response.json();
    
    // No longer setting userId in state - we only want to do that at login
    // The commented line is removed completely to avoid confusion
    
    // Convert backend response to GalleryResponse format
    const galleryResponse: GalleryResponse = {
      _id: userData._id,
      username: userData.username,
      cards: userData.cards || [],
      friends: userData.friends || [],
      pending_friends: userData.pending_friends || [],
      profile_picture: userData.profile_picture || null,
      trading: userData.trading || [] // Add trading array
    };
    
    return galleryResponse;
  } catch (error) {
    console.error('Error fetching user gallery data:', error);
    throw error;
  }
}


// Function to authenticate a user and set their ID in local storage
export async function authenticateUser(userId: string): Promise<GalleryResponse> {
  try {
    const userData = await fetchUserGalleryData(userId);
    
    // Only here do we set the userId in state/localStorage
    userState.setUserId(userId);
    
    return userData;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

// Function to fetch a single card's details
export async function fetchCardDetails(cardId: string): Promise<Card | null> {
  // For now we're assuming cards are fetched as part of the user data
  // If you have a separate endpoint for cards, you would implement that here
  try {
    if (!userState.userId) {
      throw new Error('No user ID available. User must be logged in first.');
    }
    
    const userData = await fetchUserGalleryData(userState.userId);
    const card = userData.cards.find(card => card.id === cardId || String(card.creator) === cardId) || null;
    
    return card;
  } catch (error) {
    console.error('Error fetching card details:', error);
    throw error;
  }
}

// Function to sort cards by different criteria
export function sortCards(cards: Card[], sortBy: SortOption): Card[] {
  const sortedCards = [...cards];
  
  switch(sortBy) {
    case "name":
      return sortedCards.sort((a, b) => a.commonName.localeCompare(b.commonName));
    case "date":
      return sortedCards.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
    case "rarity":
      // Define rarity order
      const rarityOrder: {[key: string]: number} = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      return sortedCards.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    default:
      return sortedCards;
  }
}

// Function to update a user's data (e.g., after adding a new card)
// This can update either the current user or another user (like a team member)
export async function updateUserData(userData: Partial<GalleryResponse>): Promise<GalleryResponse> {
  try {
    if (!userState.userId) {
      throw new Error('No user ID available. User must be logged in first.');
    }
    
    // Get the ID of the user we want to update
    const userIdToUpdate = userData._id;
    
    if (!userIdToUpdate) {
      throw new Error('Missing user ID in update data');
    }
    
    console.log(`Updating user data for user ID: ${userIdToUpdate}`);
    
    // Use the provided user ID for the endpoint
    const response = await fetch(`${BACKEND_URL}/db/update/${userIdToUpdate}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user data: ${response.statusText}`);
    }
    
    const updatedUserData = await response.json();
    
    // Convert backend response to GalleryResponse format
    const galleryResponse: GalleryResponse = {
      _id: updatedUserData._id,
      username: updatedUserData.username,
      cards: updatedUserData.cards || [],
      friends: updatedUserData.friends || [],
      trading: updatedUserData.trading || [], // Add trading array
    };
    
    return galleryResponse;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

// Function to create a new user
export async function createUser(userData: { username: string, email: string, password: string }): Promise<GalleryResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/db/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        cards: [],
        friends: [],
        trading: []
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    
    const newUserData = await response.json();
    
    // Store the new user ID in state - this is correct as this is a login/authentication action
    userState.setUserId(newUserData._id);
    
    // Convert backend response to GalleryResponse format
    const galleryResponse: GalleryResponse = {
      _id: newUserData._id,
      username: newUserData.username,
      cards: newUserData.cards || [],
      trading: newUserData.trading || [] // Add trading array
    };
    
    return galleryResponse;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
