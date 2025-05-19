// Hits the Plant ID V3 API to get the plant name and information from an image taken by the user

export interface PlantIdResponse {
  access_token: string;
  model_version: string;
  custom_id: null;
  input: {
    latitude?: number;
    longitude?: number;
    similar_images: boolean;
    images: string[];
    datetime: string;
  };
  result: {
    is_plant: {
      probability: number;
      binary: boolean;
      threshold: number;
    };
    classification: {
      suggestions: Array<{
        id: string;
        name: string;
        probability: number;
        similar_images: Array<{
          id: string;
          url: string;
          license_name?: string;
          license_url?: string;
          citation?: string;
          similarity: number;
          url_small: string;
        }>;
        details?: {
          language: string;
          entity_id: string;
          // Common plant details
          common_names?: string[];
          url?: string;
          description?: {
            value: string;
            citation: string;
            license_name: string;
            license_url: string;
          };
          // GPT-generated description (usually more fun and readable)
          description_gpt?: string;
          // Full taxonomy information
          taxonomy?: {
            class: string;
            family: string;
            genus: string;
            kingdom: string;
            order: string;
            phylum: string;
          };
          // Plant care information
          watering?: {
            min: number;
            max: number;
          };
          // Edible parts of the plant
          edible_parts?: string[];
          // Toxicity information
          toxicity?: string;
          // Cultural significance
          cultural_significance?: string;
        };
      }>;
    };
    // Health assessment information, if requested
    health_assessment?: {
      is_healthy: {
        probability: number;
        binary: boolean;
      };
      diseases?: Array<{
        name: string;
        probability: number;
        details?: {
          local_name?: string;
          description?: string;
          treatment?: {
            biological?: string[];
            chemical?: string[];
            prevention?: string[];
          };
        };
      }>;
    };
  };
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}

// Interface that matches the Card structure from gallery.ts
export interface PlantCardData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  location?: string;
  date?: string;
  isPlant: boolean;
  confidence: number;
  scientificName?: string;
  family?: string;
  isHealthy?: boolean;
  diseases?: Array<{
    name: string;
    probability: number;
  }>;
}

/**
 * Identifies a plant from an image using the Plant.id API v3
 * @param base64Image - Base64 encoded image (without the data:image prefix)
 * @param latitude - Optional latitude coordinate
 * @param longitude - Optional longitude coordinate
 * @returns Promise resolving to plant identification response
 */
export async function identifyPlant(
  base64Image: string, 
  latitude?: number, 
  longitude?: number
): Promise<PlantIdResponse> {
  try {
    const API_KEY = 'AUtALUuF1h6jUxo1cM3dBt0aF0Q3dAWXEWPdCb4nPIWwr3aDbu';
    
    // Build the URL with query parameters for details
    const baseUrl = 'https://plant.id/api/v3/identification';
    const url = new URL(baseUrl);
    
    // Set query parameters for details
    url.searchParams.append('details', 'common_names,url,description,description_gpt,taxonomy,watering,edible_parts,toxicity,cultural_significance');
    url.searchParams.append('language', 'en');
    
    // Build the basic payload with proper TypeScript interface
    const payload: {
      images: string[];
      similar_images: boolean;
      classification_level: string;
      health: string;
      latitude?: number;
      longitude?: number;
    } = {
      images: [`data:image/jpeg;base64,${base64Image}`],
      similar_images: true,
      classification_level: 'all', // Get full classification data
      health: 'all' // Include health assessment
    };
    
    // Add location data if provided
    if (latitude !== undefined && longitude !== undefined) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }
    
    console.log('Sending payload to Plant.id API:', {
      ...payload,
      images: [`data:image/jpeg;base64,${base64Image.substring(0, 20)}...`] // Truncate for logging
    });
    console.log('Using URL with details parameters:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plant.id API error response:', errorText);
      throw new Error(`Plant identification failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: PlantIdResponse = await response.json();
    console.log('Plant ID API response:', result);
    

    
    return result;
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw error;
  }
}

