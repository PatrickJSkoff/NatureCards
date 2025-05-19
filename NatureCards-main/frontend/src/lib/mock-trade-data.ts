import { Card } from "@/types/index";

// Mock card data for testing the trade UI
export const mockCards: Record<string, Card> = {
  "card-1": {
    id: "card-1",
    creator: "12345",
    owner: "12345",
    commonName: "Red Rose",
    scientificName: "Rosa gallica",
    funFact: "Red roses are symbols of love and passion around the world.",
    timeCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Garden, Virginia",
    rarity: "rare",
    tradeStatus: true,
    infoLink: "/cards/roses",
    image: "https://hips.hearstapps.com/hmg-prod/images/close-up-of-blossoming-rose-flower-royalty-free-image-1580853844.jpg?crop=0.668xw:1.00xh;0.248xw,0&resize=980:*",
    family: "Rosaceae",
    username: "nature_lover"
  },
  "card-2": {
    id: "card-2",
    creator: "12345",
    owner: "12345",
    commonName: "Sunflower",
    scientificName: "Helianthus annuus",
    funFact: "Sunflowers track the sun across the sky, a behavior called heliotropism.",
    timeCreated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Meadow, Virginia",
    rarity: "epic",
    tradeStatus: true,
    infoLink: "/cards/sunflowers",
    image: "https://hips.hearstapps.com/hmg-prod/images/summer-flowers-sunflower-1648478429.jpg?crop=0.534xw:1.00xh;0.416xw,0&resize=980:*",
    family: "Asteraceae",
    username: "nature_lover"
  },
  "card-6": {
    id: "card-6",
    creator: "67890",
    owner: "67890",
    commonName: "Red Fox",
    scientificName: "Vulpes vulpes",
    funFact: "Red foxes can hear rodents digging underground from 40 yards away.",
    timeCreated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Forest, Virginia",
    rarity: "legendary",
    tradeStatus: true,
    infoLink: "/cards/red-fox",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Wild_red_fox_%28Vulpes_vulpes%29.jpg/800px-Wild_red_fox_%28Vulpes_vulpes%29.jpg",
    family: "Canidae",
    username: "forest_explorer"
  },
  "card-9": {
    id: "card-9",
    creator: "24680",
    owner: "24680",
    commonName: "Tiger Swallowtail",
    scientificName: "Papilio glaucus",
    funFact: "Tiger swallowtail caterpillars resemble bird droppings as a defense mechanism.",
    timeCreated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Garden, Virginia",
    rarity: "common",
    tradeStatus: true,
    infoLink: "/cards/tiger-swallowtail",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Papilio_glaucus_female_Facing_Left_2000px.jpg/800px-Papilio_glaucus_female_Facing_Left_2000px.jpg",
    family: "Papilionidae",
    username: "butterfly_collector"
  }
};

// Mock function to replace the real fetchCardDetails function during testing
export const mockFetchCardDetails = async (cardId: string): Promise<Card | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCards[cardId] || null);
    }, 500);
  });
}; 