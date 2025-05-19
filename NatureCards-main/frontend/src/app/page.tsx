"use client";

import { Card } from "@/components/ui/card";
import {
  Upload,
  Users,
  Search,
  Plus,
  Loader2,
  MapPin,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { identifyPlant } from "@/lib/plant-id";
import { convertToJpegBase64 } from "@/lib/image-utils";
import { CardDetailed } from "@/components/CardDetailed";
import Image from "next/image";
import { UploadButton } from "@/lib/utils";
import { userState, updateUserData, fetchUserGalleryData } from "@/lib/gallery";
import { Card as CardType } from "@/types/index";

// Define Friend type for UI
type Friend = {
  id: string;
  name: string;
  avatar: string;
};

// Define a type for friend objects as they may appear in the API
interface FriendObject {
  _id?: string;
  id?: string;
  username?: string;
}

// Define a type for location data
interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
}

// Define type for coordinates to avoid using 'any'
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Add a utility function for conditional logging
const logDebug = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

// Add a utility function for important logging
const logError = (message: string, error?: unknown) => {
  // Always log errors, but limit data in production
  if (process.env.NODE_ENV === 'production') {
    console.error(message);
  } else {
    console.error(message, error);
  }
};

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [team, setTeam] = useState<{ name: string; members: string[] } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [identifiedPlant, setIdentifiedPlant] = useState<{
    id: string;
    name: string;
    image: string;
    rating: number;
    rarity: "common" | "rare" | "epic" | "legendary";
    commonName: string;
    scientificName: string;
    family: string;
    funFact: string;
    timePosted: string;
    location: string;
    username: string;
  } | null>(null);
  const [showIdentificationDrawer, setShowIdentificationDrawer] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFetchingFriendDetails, setIsFetchingFriendDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // Create a ref to store the DrawerTrigger element
  const createTeamButtonRef = useRef<HTMLButtonElement>(null);

  // Fix for unused variable - either use it or remove toggle UI if not needed
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Set isBrowser to true once the component mounts
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Function to get the user's location
  const requestUserLocation = useCallback(() => {
    // Only run on the client side
    if (!isBrowser) return;

    setIsRequestingLocation(true);

    // Check if we already have location data in localStorage
    try {
      const savedLocationData = localStorage.getItem("userLocationData");
      if (savedLocationData) {
        try {
          const parsedLocation = JSON.parse(savedLocationData);
          // Check if it's a default location (permission was denied before)
          const isDefaultLocation =
            parsedLocation.latitude === 0 && parsedLocation.longitude === 0;

          if (!isDefaultLocation) {
            setUserLocation(parsedLocation);
            setIsRequestingLocation(false);
            logDebug("Using saved location", parsedLocation);
            return;
          }
          // If it's a default location, try requesting again
        } catch (err) {
          logError("Error parsing saved location data", err);
          // Continue to request new location
        }
      }
    } catch (err) {
      logError("Error accessing localStorage", err);
    }

    // Request location from browser - only run on client
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            logDebug("Obtained coordinates", { latitude, longitude });

            // Get location name using reverse geocoding
            let locationName = "Unknown Location";
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );

              if (response.ok) {
                const data = await response.json();
                locationName = data.display_name
                  .split(",")
                  .slice(0, 2)
                  .join(", ");
              }
            } catch (err) {
              logError("Error getting location name", err);
            }

            // Save location data
            const locationData = {
              latitude,
              longitude,
              locationName,
            };

            setUserLocation(locationData);
            try {
              localStorage.setItem(
                "userLocationData",
                JSON.stringify(locationData)
              );
            } catch (err) {
              logError("Error saving to localStorage", err);
            }
            logDebug("Location saved", locationData);
          } catch (err) {
            logError("Error processing location", err);
          } finally {
            setIsRequestingLocation(false);
          }
        },
        (error) => {
          logError("Error getting location", error.code);
          setIsRequestingLocation(false);

          // Show a prompt if permission was denied
          if (error.code === 1) {
            // PERMISSION_DENIED
            const userResponse = confirm(
              "Location access was denied. Your cards will be saved with 'Location not available'. " +
                "Would you like to enable location access in your browser settings?"
            );

            if (userResponse) {
              // Guide the user to browser settings
              alert(
                "To enable location access:\n\n" +
                  "1. Click the lock/info icon in your browser's address bar\n" +
                  "2. Find 'Location' or 'Site Settings'\n" +
                  "3. Change the permission to 'Allow'\n" +
                  "4. Refresh the page"
              );
            }
          }

          // Create default location data when permission is denied
          const defaultLocation = {
            latitude: 0,
            longitude: 0,
            locationName: "Location not available",
          };
          setUserLocation(defaultLocation);
          try {
            localStorage.setItem(
              "userLocationData",
              JSON.stringify(defaultLocation)
            );
          } catch (err) {
            logError("Error saving to localStorage", err);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      logError("Geolocation is not supported by this browser");
      setIsRequestingLocation(false);

      if (isBrowser) {
        alert(
          "Your browser doesn't support geolocation. Cards will be saved without location information."
        );
      }

      // Create default location data when geolocation is not supported
      const defaultLocation = {
        latitude: 0,
        longitude: 0,
        locationName: "Location not available",
      };
      setUserLocation(defaultLocation);
      try {
        localStorage.setItem(
          "userLocationData",
          JSON.stringify(defaultLocation)
        );
      } catch (err) {
        logError("Error saving to localStorage", err);
      }
    }
  }, [isBrowser]);

  // Request location when the component mounts - but only on the client
  useEffect(() => {
    if (isBrowser && userState.userId) {
      requestUserLocation();
    }
  }, [isBrowser, requestUserLocation]);

  // Load friends from the authenticated user's data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!userState.userId) return;

        setIsLoading(true);
        const userData = await fetchUserGalleryData(userState.userId);

        // Handle friends data if available
        if (
          userData.friends &&
          Array.isArray(userData.friends) &&
          userData.friends.length > 0
        ) {
          // Check if friends are detailed objects or just IDs
          if (typeof userData.friends[0] === "string") {
            // If friends are just IDs, use mock data for display (in a real app, you'd fetch user details)
            const friendIds = userData.friends as string[];
            const mockFriendsList: Friend[] = friendIds.map((id, index) => ({
              id,
              name: `Friend ${index + 1}`,
              avatar: `F${index + 1}`,
            }));
            setFriends(mockFriendsList);
          } else {
            // Friends are objects with details
            const friendObjects = userData.friends as unknown as FriendObject[];
            const friendsList: Friend[] = friendObjects.map((friend) => ({
              id: friend.id || friend._id || "unknown",
              name: friend.username || "Friend",
              avatar: friend.username
                ? friend.username.substring(0, 2).toUpperCase()
                : "FR",
            }));
            setFriends(friendsList);
          }
        }
      } catch (err) {
        logError("Error loading user data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle friend selection when creating a team
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Memoize callback functions to prevent recreation on every render
  // This function won't be recreated unless its dependencies change
  const fetchFriendDetails = useCallback(async () => {
    if (!userState.userId || friends.length === 0 || isFetchingFriendDetails)
      return;

    try {
      setIsFetchingFriendDetails(true);

      // Create a new array to hold updated friend info
      const updatedFriends = [...friends];
      let hasUpdates = false;

      // Fetch details for each friend that only has an ID
      for (let i = 0; i < updatedFriends.length; i++) {
        const friend = updatedFriends[i];

        // Only fetch details if this looks like a placeholder entry
        // (Name is just "Friend X" or similar)
        if (friend.name.startsWith("Friend ") || friend.avatar.length <= 2) {
          try {
            // Fetch friend's full details from the API
            const friendData = await fetchUserGalleryData(friend.id);

            // Update the friend's information if we found it
            if (friendData && friendData.username) {
              updatedFriends[i] = {
                ...friend,
                name: friendData.username,
                avatar: friendData.username.substring(0, 2).toUpperCase(),
              };
              hasUpdates = true;
            }
          } catch (err) {
            logError(`Error fetching details for friend ${friend.id}`, err);
            // Continue with other friends if one fails
          }
        }
      }

      // Update the friends list with new details if any were found
      if (hasUpdates) {
        setFriends(updatedFriends);
      }
    } catch (err) {
      logError("Error fetching friend details", err);
    } finally {
      setIsFetchingFriendDetails(false);
    }
  }, [friends, isFetchingFriendDetails]);

  // Similarly, memoize the team member details fetching function
  const fetchTeamMemberDetails = useCallback(
    async (memberIds: string[]) => {
      if (!userState.userId || memberIds.length === 0) return;

      try {
        // Create a map of existing friends for quick lookup
        const friendMap = new Map(friends.map((friend) => [friend.id, friend]));

        // Create a new array to hold updated friend info
        const updatedFriends = [...friends];
        let hasUpdates = false;

        // For each team member that's not in our friends list with complete details
        for (const memberId of memberIds) {
          const existingFriend = friendMap.get(memberId);

          // Only fetch if we don't have this friend or have incomplete details
          if (
            !existingFriend ||
            existingFriend.name.startsWith("Friend ") ||
            existingFriend.avatar.length <= 2
          ) {
            try {
              // Fetch friend's full details from the API
              const friendData = await fetchUserGalleryData(memberId);

              if (friendData && friendData.username) {
                // Create friend details
                const friendDetails = {
                  id: memberId,
                  name: friendData.username,
                  avatar: friendData.username.substring(0, 2).toUpperCase(),
                };

                if (existingFriend) {
                  // Update existing friend
                  const index = updatedFriends.findIndex(
                    (f) => f.id === memberId
                  );
                  if (index !== -1) {
                    updatedFriends[index] = friendDetails;
                    hasUpdates = true;
                  }
                } else {
                  // Add new friend to the list
                  updatedFriends.push(friendDetails);
                  hasUpdates = true;
                }
              }
            } catch (err) {
              logError(`Error fetching details for team member ${memberId}`, err);
              // Continue with other members if one fails
            }
          }
        }

        // Update the friends list with new details if any were found
        if (hasUpdates) {
          setFriends(updatedFriends);
        }
      } catch (err) {
        logError("Error fetching team member details", err);
      }
    },
    [friends]
  );

  // Fix the drawer open change handler to prevent the loop
  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setIsDrawerOpen(open);
      if (open && !isDrawerOpen) {
        fetchFriendDetails();
      }
    },
    [isDrawerOpen, fetchFriendDetails]
  );

  // Create a team with selected friends
  const createTeam = () => {
    if (selectedFriends.length === 0) {
      alert("Please select at least one friend to create a team.");
      return;
    }

    const teamName =
      (document.getElementById("teamName") as HTMLInputElement)?.value || "";

    if (!teamName || teamName.trim() === "") {
      alert("Please enter a team name.");
      return;
    }

    setTeam({
      name: teamName.trim(),
      members: selectedFriends,
    });

    // Store team in localStorage for persistence
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        "natureCardsTeam",
        JSON.stringify({
          name: teamName.trim(),
          members: selectedFriends,
        })
      );
    }

    // Reset selection
    setSelectedFriends([]);

    // Close drawer by clicking outside (simple approach)
    document.body.click();
  };

  // Fix the useEffect that loads team data to prevent infinite loops
  useEffect(() => {
    if (isBrowser) {
      try {
        const savedTeam = localStorage.getItem("natureCardsTeam");
        if (savedTeam) {
          try {
            const parsedTeam = JSON.parse(savedTeam);
            setTeam(parsedTeam);

            // Make sure we have the full details of team members
            // This will look through the friends list and make sure we have detailed info for team members
            const timer = setTimeout(() => {
              if (userState.userId && parsedTeam.members.length > 0) {
                fetchTeamMemberDetails(parsedTeam.members);
              }
            }, 500); // Small delay to ensure initial friend loading has completed

            // Clean up the timer on unmount
            return () => clearTimeout(timer);
          } catch (err) {
            logError("Error parsing saved team", err);
          }
        }
      } catch (err) {
        logError("Error accessing localStorage", err);
      }
    }
  }, [isBrowser, fetchTeamMemberDetails]);

  // Function to leave the current team
  const leaveTeam = () => {
    if (confirm("Are you sure you want to leave this team?")) {
      setTeam(null);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("natureCardsTeam");
      }
    }
  };

  // Determine rarity based on probability
  const determineRarity = (
    probability: number
  ): "common" | "uncommon" | "rare" | "epic" | "legendary" => {
    if (probability > 0.95) return "legendary";
    if (probability > 0.9) return "epic";
    if (probability > 0.8) return "rare";
    if (probability > 0.7) return "uncommon";
    return "common";
  };

  // Determine star rating based on rarity
  const getRatingFromRarity = (rarity: string): number => {
    switch (rarity) {
      case "legendary":
        return 4;
      case "epic":
        return 3;
      case "rare":
        return 2;
      case "uncommon":
        return 1;
      default:
        return 1;
    }
  };

  // Add a new function to fetch an image as a Blob from a URL
  const fetchImageAsBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }
    return await response.blob();
  };

  // Modified function to handle images from URL with better state management
  const handleImageFromUrl = async (imageUrl: string) => {
    // Prevent duplicate processing
    if (isIdentifying) return;

    setErrorMessage(null);

    try {
      // Show preview and start identification
      setCapturedImage(imageUrl);
      setIsIdentifying(true);

      // Fetch the image from URL and convert to blob
      const imageBlob = await fetchImageAsBlob(imageUrl);

      // Convert blob to File object
      const imageFile = new File([imageBlob], "uploaded-image.jpg", {
        type: "image/jpeg",
      });

      // Convert to base64 using existing utility
      const base64Image = await convertToJpegBase64(imageFile);

      // Call the Plant.id API using existing function
      const plantIdResponse = await identifyPlant(base64Image);

      // Process results using existing logic
      const topResult = plantIdResponse.result.classification.suggestions[0];

      if (!topResult) {
        throw new Error("No plant identification results found");
      }

      // Determine rarity based on confidence
      const rarity = determineRarity(topResult.probability);

      // Extract the first sentence from description for fun fact
      const getFirstSentence = (text: string | undefined): string => {
        if (!text) return "This plant was identified using AI technology!";

        // Match for a sentence ending with period, question mark, or exclamation point
        const sentenceMatch = text.match(/^.*?[.!?](?:\s|$)/);
        return sentenceMatch
          ? sentenceMatch[0].trim()
          : text.substring(0, 100) + "...";
      };

      // Generate a unique ID for the plant
      const plantId = `plant-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create plant details object for CardDetailed
      const plantDetails = {
        id: plantId,
        name: topResult.name,
        image: imageUrl,
        rating: getRatingFromRarity(rarity),
        rarity:
          rarity === "uncommon"
            ? "rare"
            : (rarity as "common" | "rare" | "epic" | "legendary"),
        commonName: topResult.name,
        scientificName: topResult.details?.taxonomy?.genus
          ? `${topResult.details.taxonomy.genus} sp.`
          : topResult.name,
        family: topResult.details?.taxonomy?.family || "Unknown",
        funFact:
          getFirstSentence(topResult.details?.description?.value) ||
          "This plant was identified using AI technology! No additional information is available.",
        timePosted: new Date().toLocaleDateString(),
        location: "Your location",
        username: "You",
      };

      logDebug("Identified plant (from URL)", plantDetails);

      // Set the identified plant
      setIdentifiedPlant(plantDetails);

      // Open the drawer to show results
      setShowIdentificationDrawer(true);
    } catch (err) {
      logError("Error during plant identification", err);
      setErrorMessage("Failed to identify plant. Please try again.");
    } finally {
      setIsIdentifying(false);
    }
  };

  // Modified function to save a card to all team members' collections
  const saveCardToCollection = async () => {
    if (!identifiedPlant) return;

    try {
      setIsSavingCard(true);

      // Check if user is logged in
      if (!userState.userId) {
        throw new Error("Please log in to save cards to your collection");
      }

      // Get current user data
      const userData = await fetchUserGalleryData(userState.userId);

      // Get location string from user's location data - with safe fallback
      const locationString = userLocation
        ? userLocation.locationName
        : identifiedPlant.location || "Unknown location";

      // Create a new card from the identified plant
      // Ensure it matches the backend schema exactly
      const newCard: CardType = {
        id: identifiedPlant.id + "-" + userState.userId,
        creator: userState.userId,
        owner: userState.userId,
        commonName: identifiedPlant.commonName,
        scientificName: identifiedPlant.scientificName,
        funFact: identifiedPlant.funFact,
        timeCreated: new Date().toISOString(),
        location: locationString,
        rarity:
          identifiedPlant.rarity === "rare"
            ? "uncommon"
            : identifiedPlant.rarity,
        tradeStatus: false,
        infoLink: "",
        image: identifiedPlant.image, // Use the uploaded image URL
        family: identifiedPlant.family,
      };

      // Add coordinates if we have them - with proper typing
      if (
        userLocation &&
        userLocation.latitude !== 0 &&
        userLocation.longitude !== 0
      ) {
        (newCard as CardType & { coordinates: Coordinates }).coordinates = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        };
      }

      logDebug("Saving new card", newCard);

      // Save to current user's collection first
      try {
        const updatedCards = [...userData.cards, newCard];
        await updateUserData({
          _id: userData._id,
          username: userData.username,
          cards: updatedCards,
        });
        logDebug("Card successfully added to your collection");
      } catch (err) {
        logError("Error saving card to your collection", err);
        throw new Error("Failed to save card to your collection");
      }

      // Track successes and failures for team sharing
      let successCount = 0;
      let failureCount = 0;

      // Get team members excluding the current user
      const teamMembers = (team?.members || []).filter(
        (id) => id !== userState.userId
      );

      if (teamMembers.length > 0) {
        logDebug(`Attempting to share card with ${teamMembers.length} team members`);

        // Process each team member one by one (sequential processing)
        for (const memberId of teamMembers) {
          try {
            logDebug(`Processing team member: ${memberId}`);

            // Get team member's data
            const memberData = await fetchUserGalleryData(memberId);
            logDebug(`Retrieved data for team member: ${memberData.username}`);

            // Create a version of the card for this team member
            const memberCard = {
              ...newCard,
              owner: memberId, // Update the owner to the team member
            };

            // Add the card to the member's collection
            const memberUpdatedCards = [...memberData.cards, memberCard];

            // Update the member's data with the new card
            await updateUserData({
              _id: memberId,
              username: memberData.username,
              cards: memberUpdatedCards,
            });

            logDebug(`Successfully shared card with team member: ${memberData.username}`);
            successCount++;
          } catch (err) {
            logError(`Failed to share card with team member ${memberId}`, err);
            failureCount++;
            // Continue with the next member even if this one fails
          }
        }
      }

      // Close the drawer and show success message
      setShowIdentificationDrawer(false);

      // Prepare success message
      let message = "Card successfully added to your collection!";
      if (successCount > 0) {
        message += ` Also shared with ${successCount} team member${
          successCount !== 1 ? "s" : ""
        }.`;
      }
      if (failureCount > 0) {
        message += ` Failed to share with ${failureCount} team member${
          failureCount !== 1 ? "s" : ""
        }.`;
      }

      // Show success alert with view collection option
      if (confirm(`${message} Would you like to view your collection?`)) {
        // Redirect to gallery page
        window.location.href = "/gallery";
      }
    } catch (err) {
      logError("Error saving card", err);
      alert(err instanceof Error ? err.message : "Failed to save card");
    } finally {
      setIsSavingCard(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
      {/* Location indicator - only shown on client-side */}
      {isBrowser && userState.userId && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-white bg-opacity-80 rounded-full px-3 py-1 text-xs shadow">
          <MapPin className="w-3 h-3 text-red-500" />
          {isRequestingLocation ? (
            <span className="flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Getting location...
            </span>
          ) : userLocation ? (
            <span title={userLocation.locationName}>
              {userLocation.locationName.length > 20
                ? `${userLocation.locationName.substring(0, 20)}...`
                : userLocation.locationName}
            </span>
          ) : (
            <span>Location unavailable</span>
          )}
        </div>
      )}

      <div className="mb-8 text-center">
        {team ? (
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {team.members.length} team member
              {team.members.length !== 1 ? "s" : ""}
            </p>

            {/* Display the team members */}
            <div className="mt-2 max-w-xs">
              <p className="text-sm text-gray-600 mb-1">Team Members:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {team.members.map((memberId) => {
                  // Check if this is the current user
                  const isCurrentUser = memberId === userState.userId;

                  // Find friend details by ID
                  const memberDetails = isCurrentUser
                    ? { name: "You (Current User)", avatar: "ME" }
                    : friends.find((f) => f.id === memberId);

                  return (
                    <div
                      key={memberId}
                      className={`${
                        isCurrentUser
                          ? "bg-blue-50 text-blue-800"
                          : "bg-green-50 text-green-800"
                      } px-2 py-1 rounded-full text-xs flex items-center`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${
                          isCurrentUser ? "bg-blue-200" : "bg-green-200"
                        } flex items-center justify-center mr-1 text-[10px]`}
                      >
                        {memberDetails?.avatar || memberId.substring(0, 2)}
                      </div>
                      <span>{memberDetails?.name || "Member"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={leaveTeam}
              className="mt-4 text-red-500 border-red-200 hover:bg-red-50"
            >
              Leave Team
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 bg-transparent px-8 rounded-lg">
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <Drawer onOpenChange={handleDrawerOpenChange}>
                <DrawerTrigger asChild>
                  <Button
                    ref={createTeamButtonRef}
                    size="lg"
                    className="w-full bg-yellow-950 text-white hover:bg-yellow-950/80"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[96vh] flex justify-center items-center w-full">
                  <div className="p-4 w-full sm:w-1/3 flex flex-col h-full">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="teamName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Team Name
                        </label>
                        <Input id="teamName" placeholder="Enter team name..." />
                      </div>

                      <div>
                        <label
                          htmlFor="searchFriends"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Select Team Members From Your Friends
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <Input
                            id="searchFriends"
                            placeholder="Search friends..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-4">
                      {isLoading || isFetchingFriendDetails ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          <span>
                            {isLoading
                              ? "Loading friends..."
                              : "Fetching friend details..."}
                          </span>
                        </div>
                      ) : filteredFriends.length > 0 ? (
                        filteredFriends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between py-3 border-b"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {friend.avatar}
                              </div>
                              <span className="font-medium">{friend.name}</span>
                            </div>
                            <Button
                              variant={
                                selectedFriends.includes(friend.id)
                                  ? "default"
                                  : "ghost"
                              }
                              size="sm"
                              onClick={() => toggleFriendSelection(friend.id)}
                            >
                              {selectedFriends.includes(friend.id) ? (
                                "Selected"
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {searchQuery
                            ? "No friends match your search"
                            : "You don't have any friends yet"}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={createTeam}
                        disabled={
                          selectedFriends.length === 0 ||
                          isLoading ||
                          isFetchingFriendDetails
                        }
                      >
                        Create Team ({selectedFriends.length} selected)
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mb-8 px-4">
        <div className="h-px bg-gray-200" />
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <div className="w-36 sm:w-48 h-36 sm:h-48 cursor-pointer">
          <UploadButton
            endpoint="plantImageUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                // Get the URL of the uploaded file
                const uploadedFileUrl = res[0].url;

                if (uploadedFileUrl) {
                  // Process the uploaded image with our identification logic
                  handleImageFromUrl(uploadedFileUrl);
                } else {
                  setErrorMessage(
                    "Upload completed but no file URL was returned."
                  );
                }
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error details:", error);
              // Display more detailed error information
              setErrorMessage(
                `Upload failed: ${error.message || "Unknown error"}`
              );
              // Show alert with the error to make debugging easier
              alert(
                `Upload error: ${
                  error.message || "Unknown error"
                }\n\nCheck browser console for more details.`
              );
            }}
            appearance={{
              container: "w-full h-full",
              button:
                "w-full h-full p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0",
            }}
            content={{
              button({ ready }) {
                if (ready)
                  return (
                    <div className="w-36 sm:w-48 h-36 sm:h-48 cursor-pointer">
                      <Card className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 hover:bg-slate-100 transition-colors p-4">
                        <Upload className="w-8 h-8 sm:w-12 sm:h-12" />
                        <h2 className="text-sm sm:text-xl font-semibold text-center">
                          Identify Plant
                        </h2>
                      </Card>
                    </div>
                  );
                return (
                  <Card className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 hover:bg-slate-100 transition-colors p-4">
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin" />
                    <h2 className="text-sm sm:text-xl font-semibold text-center">
                      Loading...
                    </h2>
                  </Card>
                );
              },
              allowedContent() {
                return null;
              },
            }}
          />
        </div>
      </div>

      {/* Plant Identification Drawer */}
      <Drawer
        open={showIdentificationDrawer}
        onOpenChange={setShowIdentificationDrawer}
      >
        <DrawerContent className="min-h-[70vh] max-h-[90vh]">
          <div className="p-4 overflow-y-auto">
            {identifiedPlant && (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4 text-center">
                  Identified Plant
                </h2>

                {/* Location display - only rendered on client side */}
                {isBrowser && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {isRequestingLocation ? (
                      <span className="flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Getting location...
                      </span>
                    ) : userLocation ? (
                      <span title={userLocation.locationName}>
                        {userLocation.locationName}
                      </span>
                    ) : (
                      <span>Location unavailable</span>
                    )}
                  </div>
                )}

                <CardDetailed plant={identifiedPlant} />
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => setShowIdentificationDrawer(false)}
                    className="mx-2"
                  >
                    Close
                  </Button>
                  <Button
                    className="mx-2 bg-green-600 hover:bg-green-700"
                    onClick={saveCardToCollection}
                    disabled={isSavingCard}
                  >
                    {isSavingCard ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add to Collection"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {capturedImage && isIdentifying && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 text-center">
            <div className="relative w-full aspect-square max-h-[400px] rounded-lg mb-4 overflow-hidden">
              <Image
                src={capturedImage}
                alt="Captured"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-lg font-medium">Identifying plant...</p>
            </div>
          </div>
        </div>
      )}

      {capturedImage && errorMessage && !isIdentifying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full mx-4">
            <div className="relative w-full aspect-square max-h-[400px] rounded-lg mb-4 overflow-hidden">
              <Image
                src={capturedImage}
                alt="Captured"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                priority
                className="object-contain"
              />
            </div>
            <div className="text-center mb-4">
              <p className="text-red-500">{errorMessage}</p>
            </div>
            <button
              onClick={() => {
                setCapturedImage(null);
                setErrorMessage(null);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add a mode toggle button for developers - only shown on client */}
      {isBrowser && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-16 right-2 z-10">
          <Button
            onClick={() => setUseLocalStorage(!useLocalStorage)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {useLocalStorage ? "Using: Local Storage" : "Using: UploadThing"}
          </Button>
        </div>
      )}
    </div>
  );
}
