# Nature Cards

A digital trading card game for nature enthusiasts. Identify plants, collect beautiful cards, and trade with friends.

## Project Structure

### TypeScript Type System

The application is built with TypeScript and uses strong typing throughout. The core types are defined in:

- `frontend/src/types/index.ts`: Contains all shared type definitions for the application

Key types include:

- `Card`: Represents a nature card with properties like name, image, and rarity
- `User`: Represents a user with their collection, friends, and trades
- `GalleryResponse`: Data structure for gallery views
- `FeedResponse`: Data structure for social feed views

### Data Adapters

The application uses adapter patterns to convert between MongoDB document format and frontend types:

- `frontend/src/lib/api-adapter.ts`: Converts between MongoDB snake_case and frontend camelCase
- `frontend/src/lib/feed-adapter.ts`: Utilities for creating feed data from user collections

### API Integration

The API layer connects the frontend to MongoDB:

- `frontend/src/api/users.ts`: User-related API calls
- `frontend/src/api/auth.ts`: Authentication API calls

## MongoDB Schema

The MongoDB database uses the following document structure:

```javascript
{
  "_id": ObjectId,
  "username": String,
  "password": String,
  "email": String,
  "cards": [
    {
      "creator": ObjectId,
      "owner": ObjectId,
      "common_name": String,
      "scientific_name": String,
      "fun_fact": String,
      "time_created": Date,
      "location": String,
      "rarity": String, // "common", "uncommon", "rare", "epic", "legendary"
      "trade_status": Boolean,
      "info_link": String,
      "image_link": String
    }
  ],
  "pending_friends": [
    {
      "sending": ObjectId,
      "receiving": ObjectId
    }
  ],
  "friends": [ObjectId],
  "trading": [
    {
      "offeredCard": CardObject,
      "requestedCard": CardObject
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 16+
- MongoDB

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## API Routes

The backend API is structured with the following routes:

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Log in a user
- POST `/api/auth/logout` - Log out the current user
- GET `/api/auth/status` - Check authentication status

### Users
- GET `/api/users/me` - Get current user
- GET `/api/users/:id` - Get a user by ID
- POST `/api/users/:id/cards` - Add a card to user's collection
- PATCH `/api/users/:id/cards/:cardId` - Update a card
- POST `/api/users/:id/friends/request` - Send a friend request
- POST `/api/users/:id/friends/accept` - Accept a friend request
- POST `/api/users/:id/trades` - Initiate a card trade
