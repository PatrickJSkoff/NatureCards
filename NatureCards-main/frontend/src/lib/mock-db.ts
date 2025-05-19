/**
 * Mock Database
 * 
 * This file simulates a database with users, cards, friend relationships, etc.
 * Used for development and testing until the real backend is connected.
 */

import { Card, User, ObjectId, PendingFriend, TradeRequest } from '@/types/index';

// Generate an ObjectId-like string
export function generateMockId(): ObjectId {
  return `${Date.now().toString(16)}${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Create timestamps ranging from 30 days ago to now
export function generateRandomTimestamp(): string {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
  return new Date(randomTime).toISOString();
}

// Mock card data
const commonCards: Partial<Card>[] = [
  {
    commonName: "Rose",
    scientificName: "Rosa",
    funFact: "Roses are one of the oldest flowers in existence, with fossil evidence showing they're 35 million years old.",
    location: "Blacksburg, VA",
    rarity: "common",
    tradeStatus: true,
    infoLink: "https://nature-cards-eight.vercel.app/roses",
    image: "https://hips.hearstapps.com/hmg-prod/images/close-up-of-blossoming-rose-flower-royalty-free-image-1580853844.jpg?crop=0.668xw:1.00xh;0.248xw,0&resize=980:*",
    family: "Rosaceae",
  },
  {
    commonName: "Daisy",
    scientificName: "Bellis perennis",
    funFact: "Daisies close their petals at night and reopen in the morning.",
    location: "Europe",
    rarity: "common",
    tradeStatus: true,
    infoLink: "https://nature-cards-eight.vercel.app/daisy",
    image: "https://img.freepik.com/free-photo/purple-osteospermum-daisy-flower_1373-16.jpg",
    family: "Asteraceae",
  },
  {
    commonName: "Lavender",
    scientificName: "Lavandula angustifolia",
    funFact: "Lavender is known for its calming fragrance and is often used in aromatherapy.",
    location: "Mediterranean",
    rarity: "common",
    tradeStatus: false,
    infoLink: "https://example.com/lavender",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Single_lavender_flower02.jpg",
    family: "Lamiaceae",
  }
];

const rareCards: Partial<Card>[] = [
  {
    commonName: "Orchid",
    scientificName: "Orchidaceae",
    funFact: "Orchids have the smallest seeds in the world, resembling fine dust.",
    location: "Norfolk, VA",
    rarity: "rare",
    tradeStatus: false,
    infoLink: "https://nature-cards-eight.vercel.app/orchids",
    image: "https://media.istockphoto.com/id/1369976302/photo/beautiful-purple-orchid-phalaenopsis-flower-background.jpg?s=612x612&w=0&k=20&c=ikZ9PfJ8ObS-adfhuQ9yJNOIWHwlJlAh7LYvfKnlIbI=",
    family: "Orchidaceae",
  },
  {
    commonName: "Sunflower",
    scientificName: "Helianthus annuus",
    funFact: "Sunflowers track the sun's movement across the sky, a behavior known as heliotropism.",
    location: "Richmond, VA",
    rarity: "rare",
    tradeStatus: false,
    infoLink: "https://nature-cards-eight.vercel.app/sunflowers",
    image: "https://hips.hearstapps.com/hmg-prod/images/summer-flowers-sunflower-1648478429.jpg?crop=0.534xw:1.00xh;0.416xw,0&resize=980:*",
    family: "Asteraceae",
  },
  {
    commonName: "Cactus",
    scientificName: "Cactaceae",
    funFact: "Cacti can survive in extremely dry environments by storing water in their stems.",
    location: "Deserts",
    rarity: "rare",
    tradeStatus: false,
    infoLink: "https://example.com/cactus",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlzP9L6gSHOxVcfjO-SUhcdMRFYuRteyyXIg&s",
    family: "Cactaceae",
  }
];

const epicCards: Partial<Card>[] = [
  {
    commonName: "Rafflesia Arnoldii",
    scientificName: "Danaus plexippus",
    funFact: "Known to be the world’s largest flower, this plant is one of the rarest one in the world. Rafflesia Arnoldii, also known as the corpse plant, this name was given to this plant because of its foul odour that is similar to decaying flesh.",
    location: "Central Mexico",
    rarity: "epic",
    tradeStatus: false,
    infoLink: "https://nature-cards-eight.vercel.app/monarch-butterfly",
    image: "https://floweraura-blog-img.s3.ap-south-1.amazonaws.com/Plant+Dec+2019-+Dec+2020/rafflesia-arnoldii.jpg",
    family: "Nymphalidae",
  }
];

const legendaryCards: Partial<Card>[] = [
  {
    commonName: "Venus Flytrap",
    scientificName: "Dionaea muscipula",
    funFact: "Venus flytraps can count! They only snap shut when they detect two touches within 20 seconds.",
    location: "Charlottesville, VA",
    rarity: "legendary",
    tradeStatus: false,
    infoLink: "https://nature-cards-eight.vercel.app/venus-flytrap",
    image: "https://ekkekzo4n8t.exactdn.com/wp-content/uploads/2023/09/IMG_1090.jpg?strip=all&lossy=1&sharp=1&ssl=1",
    family: "Droseraceae",
  },
  {
    commonName: "Giant Sequoia",
    scientificName: "Sequoiadendron giganteum",
    funFact: "Giant sequoias are the world's largest single trees by volume and can live for over 3,000 years.",
    location: "Sierra Nevada, CA",
    rarity: "legendary",
    tradeStatus: false,
    infoLink: "https://nature-cards-eight.vercel.app/sequoia",
    image: "https://i0.wp.com/footpathsblog.com/wp-content/uploads/2024/08/D08D4E4C-F260-4575-967C-E4659336EFDB-768x1024.jpg?resize=723%2C964&ssl=1",
    family: "Cupressaceae",
  }
];

// Create a complete card with IDs and timestamps
function createCard(baseCard: Partial<Card>, creator: ObjectId, owner: ObjectId): Card {
  const id = generateMockId();
  return {
    ...baseCard,
    id,
    creator,
    owner,
    timeCreated: generateRandomTimestamp(),
    tradeStatus: baseCard.tradeStatus || false,
    username: "", // Will be populated when the card is added to a user
  } as Card;
}

// Generate a set of random cards for a user
function generateCardsForUser(userId: ObjectId, cardCount: number): Card[] {
  const cards: Card[] = [];
  
  // Determine how many of each rarity to give (weighted distribution)
  const legendary = Math.floor(Math.random() * Math.min(2, cardCount));
  const epic = Math.floor(Math.random() * Math.min(3, cardCount - legendary));
  const rare = Math.floor(Math.random() * Math.min(4, cardCount - legendary - epic));
  const common = cardCount - legendary - epic - rare;
  
  // Add legendary cards
  for (let i = 0; i < legendary; i++) {
    const template = legendaryCards[Math.floor(Math.random() * legendaryCards.length)];
    cards.push(createCard(template, userId, userId));
  }
  
  // Add epic cards
  for (let i = 0; i < epic; i++) {
    const template = epicCards[Math.floor(Math.random() * epicCards.length)];
    cards.push(createCard(template, userId, userId));
  }
  
  // Add rare cards
  for (let i = 0; i < rare; i++) {
    const template = rareCards[Math.floor(Math.random() * rareCards.length)];
    cards.push(createCard(template, userId, userId));
  }
  
  // Add common cards
  for (let i = 0; i < common; i++) {
    const template = commonCards[Math.floor(Math.random() * commonCards.length)];
    cards.push(createCard(template, userId, userId));
  }
  
  return cards;
}

// Create our mock users
export const mockUsers: Record<string, User> = {};

// Create 10 users with varying card collections
const usernames = [
  "PlantLover42", 
  "WildlifeExplorer", 
  "NaturePhotographer", 
  "GardenGuru", 
  "BotanyBuddy",
  "ForestRanger", 
  "EcoEnthusiast", 
  "BioDiversity", 
  "GreenThumb", 
  "TreeHugger"
];

// Create users with IDs and empty collections
usernames.forEach(username => {
  const userId = generateMockId();
  mockUsers[userId] = {
    _id: userId,
    username,
    email: `${username.toLowerCase()}@example.com`,
    cards: [],
    pendingFriends: [],
    friends: [],
    trading: []
  };
});

// Add cards to each user (random amount, 3-15)
Object.keys(mockUsers).forEach(userId => {
  const cardCount = 3 + Math.floor(Math.random() * 13); // 3-15 cards
  mockUsers[userId].cards = generateCardsForUser(userId, cardCount);
  
  // Add username to each card
  mockUsers[userId].cards.forEach(card => {
    card.username = mockUsers[userId].username;
  });
});

// Create some friend relationships
const userIds = Object.keys(mockUsers);
userIds.forEach((userId) => {
  // Each user has 1-5 friends
  const friendCount = 1 + Math.floor(Math.random() * 5);
  const possibleFriends = userIds.filter(id => id !== userId); // Can't be friends with yourself
  
  for (let i = 0; i < Math.min(friendCount, possibleFriends.length); i++) {
    // Pick a random user to be friends with
    const randomIndex = Math.floor(Math.random() * possibleFriends.length);
    const friendId = possibleFriends[randomIndex];
    
    // Add to friends list if not already there
    if (!mockUsers[userId].friends.includes(friendId)) {
      mockUsers[userId].friends.push(friendId);
    }
    
    // Make sure friendship is bidirectional
    if (!mockUsers[friendId].friends.includes(userId)) {
      mockUsers[friendId].friends.push(userId);
    }
    
    // Remove this friend from possible friends to avoid duplicates
    possibleFriends.splice(randomIndex, 1);
  }
});

// Create some pending friend requests
userIds.forEach((userId) => {
  // Create 0-2 pending friend requests
  const pendingCount = Math.floor(Math.random() * 3);
  
  // Find users who are not already friends
  const nonFriends = userIds.filter(id => 
    id !== userId && 
    !mockUsers[userId].friends.includes(id) &&
    !mockUsers[userId].pendingFriends.some(pf => 
      (pf.sending === id && pf.receiving === userId) || 
      (pf.sending === userId && pf.receiving === id)
    )
  );
  
  for (let i = 0; i < Math.min(pendingCount, nonFriends.length); i++) {
    // Pick a random non-friend
    const randomIndex = Math.floor(Math.random() * nonFriends.length);
    const nonFriendId = nonFriends[randomIndex];
    
    // Create the pending friend request
    const pendingFriend: PendingFriend = {
      sending: userId,
      receiving: nonFriendId
    };
    
    // Add to sending user's pending list
    mockUsers[userId].pendingFriends.push(pendingFriend);
    
    // Add to receiving user's pending list too
    mockUsers[nonFriendId].pendingFriends.push(pendingFriend);
    
    // Remove from nonFriends to avoid duplicates
    nonFriends.splice(randomIndex, 1);
  }
});

// Create some trading offers
userIds.forEach((userId) => {
  // 30% chance to have an active trade offer
  if (Math.random() < 0.3) {
    // Find a random friend
    const friends = mockUsers[userId].friends;
    if (friends.length > 0) {
      const friendId = friends[Math.floor(Math.random() * friends.length)];
      
      // Find tradable cards from both users
      const userTradableCards = mockUsers[userId].cards.filter(card => card.tradeStatus);
      const friendTradableCards = mockUsers[friendId].cards.filter(card => card.tradeStatus);
      
      if (userTradableCards.length > 0 && friendTradableCards.length > 0) {
        // Pick random cards to trade
        const offeredCard = userTradableCards[Math.floor(Math.random() * userTradableCards.length)];
        const requestedCard = friendTradableCards[Math.floor(Math.random() * friendTradableCards.length)];
        
        // Create the trade request
        const tradeRequest: TradeRequest = {
          offeredCard,
          requestedCard
        };
        
        // Add to user's trading list
        mockUsers[userId].trading.push(tradeRequest);
      }
    }
  }
});

// Get a list of all the mocked users
export function getAllUsers(): User[] {
  return Object.values(mockUsers);
}

// Get a user by ID
export function getUserById(userId: ObjectId): User | null {
  return mockUsers[userId] || null;
}

// Get a user by username
export function getUserByUsername(username: string): User | null {
  return Object.values(mockUsers).find(user => user.username === username) || null;
}

// Get all cards across all users
export function getAllCards(): Card[] {
  return Object.values(mockUsers).flatMap(user => user.cards);
}

// Get a card by ID
export function getCardById(cardId: string): Card | null {
  for (const user of Object.values(mockUsers)) {
    const card = user.cards.find(card => card.id === cardId);
    if (card) return card;
  }
  return null;
}

// Get friends of a user
export function getFriendsOfUser(userId: ObjectId): User[] {
  const user = mockUsers[userId];
  if (!user) return [];
  
  return user.friends.map(friendId => mockUsers[friendId]).filter(Boolean);
}

// Create a simple feed for a user based on their friends' cards
export function generateFeedForUser(userId: ObjectId): Card[] {
  const user = mockUsers[userId];
  if (!user) return [];
  
  // Get all friends' cards
  const friendsCards = user.friends.flatMap(friendId => {
    const friend = mockUsers[friendId];
    return friend ? friend.cards : [];
  });
  
  // Add user's own cards
  const allCards = [...user.cards, ...friendsCards];
  
  // Sort by creation date (newest first) and take the most recent 20
  return allCards
    .sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime())
    .slice(0, 20);
} 