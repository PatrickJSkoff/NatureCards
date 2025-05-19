// MongoDB ObjectId type
export type ObjectId = string;

// Card type matching the database schema
export interface Card {
  creator: ObjectId;
  owner: ObjectId;
  commonName: string;  // common_name in DB
  scientificName: string;  // scientific_name in DB
  funFact: string;  // fun_fact in DB
  timeCreated: string;  // time_created in DB
  location: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  tradeStatus: boolean;  // trade_status in DB
  infoLink: string;  // info_link in DB
  image: string;  // image_link in DB
  id?: string;  // Used for frontend, optional
  family?: string;  // Optional additional field
  username?: string;  // Optional additional field for frontend use
}

// Friend request type
export interface PendingFriend {
  sending: ObjectId;
  receiving: ObjectId;
}

// Trading request type - simplified to just contain the two cards
export interface TradeRequest {
  offeredCard: Card;
  requestedCard: Card;
}

// User type matching the database schema
export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  cards: Card[];
  pendingFriends: PendingFriend[];
  friends: ObjectId[];
  trading: TradeRequest[];
}

// Gallery response type
export interface GalleryResponse {
  _id: string;
  username: string;
  cards: Card[];
  pending_friends?: PendingFriend[]; // Changed from string[] to PendingFriend[]
  friends?: ObjectId[]; // Using ObjectId type for consistency
  profile_picture?: string; // Optional profile picture URL
  trading?: TradeRequest[]; // Add trading array to match MongoDB structure
}

// Feed user type
export interface FeedUser {
  id: string;
  username: string;
  avatar?: string;
  cardCount: number;
}

// Card in post type
export interface CardInPost {
  cardName: string;
  scientificName?: string;
  image: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  cardId: string;
}

// Card post type
export interface CardPost {
  id: string;
  user: FeedUser;
  location: string;
  timestamp: string;
  likes: number;
  comments: number;
  cards: CardInPost[];
}

// Feed response type
export interface FeedResponse {
  posts: CardPost[];
}

// Sort option for gallery
export type SortOption = "name" | "date" | "rarity";

// Maps rarity to star count for display
export const rarityToStars = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5
};

// Plant ID API response type
export interface PlantIdResponse {
  id: string;
  custom_id: null | string;
  meta_data: {
    latitude: null | number;
    longitude: null | number;
    date: string;
    date_timezone: string;
  };
  uploaded_datetime: string;
  finished_datetime: string;
  images: string[];
  modifiers: string[];
  secret: string;
  fail_cause: null | string;
  countable: boolean;
  feedback: null | string;
  is_plant: boolean;
  is_plant_probability: number;
  classification: {
    suggestions: Array<{
      id: string;
      name: string;
      probability: number;
      similar_images: string[];
      details?: {
        common_names?: string[];
        url?: string;
        description?: string;
        description_gpt?: string;
        taxonomy?: {
          class: string;
          family: string;
          genus: string;
          kingdom: string;
          order: string;
          phylum: string;
        };
        url_wikipedia?: string;
        watering?: {
          max: number;
          min: number;
        };
        edible_parts?: string[];
        toxicity?: string;
        cultural_significance?: string;
      };
    }>;
  };
  health_assessment: {
    is_healthy: boolean;
    diseases: Array<{
      name: string;
      probability: number;
      similar_images?: string[];
    }>;
  };
  similar_images: string[];
}