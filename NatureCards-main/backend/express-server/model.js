/**
 * Table NatureCards Example
 * model back-end JavaScript code
 *
 * Author: Your Name
 * Version: 1.0
 */
// Import mongoose library
const mongoose = require("mongoose");

// Create schema
const NatureCardsSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    profile_picture: String,
    cards: {
      type: Array,
      items: {
        type: Object,
        properties: {
          creator: mongoose.Schema.Types.ObjectId,
          owner: mongoose.Schema.Types.ObjectId,
          common_name: String,
          scientific_name: String,
          fun_fact: String,
          time_created: Date,
          location: String,
          rarity: String,
          trade_status: Boolean,
          info_link: String,
          image: String,
        },
      },
    },
    pending_friends: {
      type: Array,
      items: {
        type: Object,
        properties: {
          sender: mongoose.Schema.Types.ObjectId,
          receiver: mongoose.Schema.Types.ObjectId,
        },
      },
    },
    friends: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    trading: {
      type: Array,
      items: {
        type: Object,
        properties: {
          offeredCard: {
            type: Object,
            properties: {
              creator: mongoose.Schema.Types.ObjectId,
              owner: mongoose.Schema.Types.ObjectId,
              common_name: String,
              scientific_name: String,
              fun_fact: String,
              time_created: Date,
              location: String,
              rarity: String,
              trade_status: Boolean,
              info_link: String,
              image: String,
            },
          },
          requestedCard: {
            type: Object,
            properties: {
              creator: mongoose.Schema.Types.ObjectId,
              owner: mongoose.Schema.Types.ObjectId,
              common_name: String,
              scientific_name: String,
              fun_fact: String,
              time_created: Date,
              location: String,
              rarity: String,
              trade_status: Boolean,
              info_link: String,
              image: String,
            },
          },
        },
      },
    },
  },
  { versionKey: false }
);

// Export schema
module.exports = mongoose.model("NatureCardsSchema", NatureCardsSchema, "Users");
