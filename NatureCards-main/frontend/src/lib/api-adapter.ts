/**
 * API Adapter
 * 
 * This module handles data conversion between backend MongoDB format and frontend type format
 * It helps standardize data access across the application
 */

import { Card, User, GalleryResponse, ObjectId } from '@/types/index';
import { getUserById as getMockUserById, getUserByUsername } from './mock-db';

// Type for MongoDB ObjectId reference
interface MongoDBObjectId {
  $oid: string;
}

// Type for MongoDB Date
interface MongoDBDate {
  $date: string;
}

// Helper to safely get string ID from MongoDB ObjectId
function getIdFromMongo(id: MongoDBObjectId | string | unknown): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && '$oid' in (id as Record<string, unknown>)) {
    return (id as MongoDBObjectId).$oid;
  }
  return '';
}

// Helper to safely get date string from MongoDB Date
function getDateFromMongo(date: MongoDBDate | string | unknown): string {
  if (typeof date === 'string') return date;
  if (date && typeof date === 'object' && '$date' in (date as Record<string, unknown>)) {
    return (date as MongoDBDate).$date;
  }
  return new Date().toISOString();
}

/**
 * Convert snake_case MongoDB card fields to camelCase for frontend use
 */
export function convertCardFromDB(dbCard: Record<string, unknown>): Card {
  return {
    creator: getIdFromMongo(dbCard.creator),
    owner: getIdFromMongo(dbCard.owner),
    commonName: String(dbCard.common_name || ''),
    scientificName: String(dbCard.scientific_name || ''),
    funFact: String(dbCard.fun_fact || ''),
    timeCreated: getDateFromMongo(dbCard.time_created),
    location: String(dbCard.location || ''),
    rarity: (dbCard.rarity as string || 'common') as "common" | "uncommon" | "rare" | "epic" | "legendary",
    tradeStatus: Boolean(dbCard.trade_status),
    infoLink: String(dbCard.info_link || ''),
    image: String(dbCard.image_link || ''),
    id: getIdFromMongo(dbCard._id) || generateCardId(),
    // These fields may be added later in the frontend
    family: String(dbCard.family || ''),
    username: String(dbCard.username || '')
  };
}

/**
 * Convert camelCase frontend card to snake_case for MongoDB storage
 */
export function convertCardToDB(card: Card): Record<string, unknown> {
  return {
    creator: card.creator,
    owner: card.owner,
    common_name: card.commonName,
    scientific_name: card.scientificName,
    fun_fact: card.funFact,
    time_created: card.timeCreated,
    location: card.location,
    rarity: card.rarity,
    trade_status: card.tradeStatus,
    info_link: card.infoLink,
    image_link: card.image
  };
}

/**
 * Convert a MongoDB user document to our frontend User type
 */
export function convertUserFromDB(dbUser: Record<string, unknown>): User {
  return {
    _id: getIdFromMongo(dbUser._id),
    username: String(dbUser.username || ''),
    email: String(dbUser.email || ''),
    cards: Array.isArray(dbUser.cards) 
      ? dbUser.cards.map(card => convertCardFromDB(card as Record<string, unknown>))
      : [],
    pendingFriends: Array.isArray(dbUser.pending_friends)
      ? dbUser.pending_friends.map(pf => ({
          sending: getIdFromMongo((pf as Record<string, unknown>).sending),
          receiving: getIdFromMongo((pf as Record<string, unknown>).receiving)
        }))
      : [],
    friends: Array.isArray(dbUser.friends)
      ? dbUser.friends.map(f => getIdFromMongo(f))
      : [],
    trading: Array.isArray(dbUser.trading)
      ? dbUser.trading.map(t => ({
          offeredCard: convertCardFromDB((t as Record<string, unknown>).offeredCard as Record<string, unknown>),
          requestedCard: convertCardFromDB((t as Record<string, unknown>).requestedCard as Record<string, unknown>)
        }))
      : []
  };
}

/**
 * Convert a MongoDB user document or User object to a GalleryResponse for the gallery view
 */
export function convertUserToGalleryResponse(dbUser: Record<string, unknown> | User): GalleryResponse {
  if ('username' in dbUser && '_id' in dbUser && 'cards' in dbUser) {
    // It's already a User object
    const user = dbUser as User;
    return {
      _id: user._id,
      username: user.username,
      cards: user.cards
    };
  }
  
  // Otherwise treat as a MongoDB document
  return {
    _id: getIdFromMongo(dbUser._id),
    username: String(dbUser.username || ''),
    cards: Array.isArray(dbUser.cards)
      ? dbUser.cards.map(card => convertCardFromDB(card as Record<string, unknown>))
      : []
  };
}

/**
 * Generate a unique ID for a card if one doesn't exist
 */
function generateCardId(): string {
  return `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Fetch a user by their ObjectId
 */
export async function fetchUserById(userId: ObjectId): Promise<User> {
  try {
    // Mock implementation using our mock database
    const user = getMockUserById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Fetch a user by their Username
 */
export async function fetchUserByUsername(username: string): Promise<User> {
  try {
    // Mock implementation using our mock database
    const user = getUserByUsername(username);
    
    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Fetch a user's gallery data by their ObjectId
 */
export async function fetchUserGallery(userId: ObjectId): Promise<GalleryResponse> {
  try {
    // TODO: Replace with actual API call
    // This is a mock implementation
    const response = await fetch(`/api/users/${userId}/gallery`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery: ${response.statusText}`);
    }
    const userData = await response.json();
    return convertUserToGalleryResponse(userData);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
} 