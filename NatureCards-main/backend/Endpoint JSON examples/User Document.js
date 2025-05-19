/**
 * This is the top level, as in what's stored in each document for each user.
 * - _id is what's stored automatically by MongoDB for each new document.
 * - username: username.
 * - Password: password hashed for security. But might not need this based on Matthew's auth suggestion.
 * - Email: email.
 * - cards_array: This is an array of cards that stores every card that the user owns. For a card example see
 * "cardExample" below
 * - friends: this will be a list that stores the "_id" of each friended user in an array the _id is the unique id Mongo
 * gives to each document in the database. This will be used to keep track of who the user is friends with.
 * - trading_requests: This will be an array of card pairs that the user has requested to trade. The idea is that the
 * initiating user would pick a card they want to send to a friend and then pick a card they want from the friend's
 * gallery and send that request to them. The first card will always be the initiators card and the second card will always be
 * owned by the user receiving the request.
 *
 * TO VIEW WHAT EACH CARD VARIABLE MEANS SEE THE CARD EXAMPLE IN THE CARD STRUCTURE FILE
 */
const userExample = {
  _id: "ObjectID",
  username: "String",
  password: "String (hashed)",
  email: "String",
  cards: [
    //Array of card objects
    {
      creator: "_id",
      owner: "_id",
      common_name: "String",
      scientific_name: "String",
      fun_fact: "String",
      time_created: "DateTime",
      location: "String",
      rarity: "String",
      trade_status: "Boolean",
      info_link: "String",
      image_link: "String",
    },
    {
      creator: "_id",
      owner: "_id",
      common_name: "String",
      scientific_name: "String",
      fun_fact: "String",
      time_created: "DateTime",
      location: "String",
      rarity: "String",
      trade_status: "Boolean",
      info_link: "String",
      image_link: "String",
    },
  ],
  pending_friends: [{ sending: "_id", receiving: "_id" }, {}],
  friends: ["_id1", "_id2"],
  trading: [
    // Array of card object pairs
    {
      offeredCard: {
        creator: "_id",
        owner: "_id",
        common_name: "String",
        scientific_name: "String",
        fun_fact: "String",
        time_created: "DateTime",
        location: "String",
        rarity: "String",
        trade_status: "Boolean",
        info_link: "String",
        image_link: "String",
      },
      requestedCard: {
        creator: "_id",
        owner: "_id",
        common_name: "String",
        scientific_name: "String",
        fun_fact: "String",
        time_created: "DateTime",
        location: "String",
        rarity: "String",
        trade_status: "Boolean",
        info_link: "String",
        image_link: "String",
      },
    },
    {
      offeredCard: {
        creator: "_id",
        owner: "_id",
        common_name: "String",
        scientific_name: "String",
        fun_fact: "String",
        time_created: "DateTime",
        location: "String",
        rarity: "String",
        trade_status: "Boolean",
        info_link: "String",
        image_link: "String",
      },
      requestedCard: {
        creator: "_id",
        owner: "_id",
        common_name: "String",
        scientific_name: "String",
        fun_fact: "String",
        time_created: "DateTime",
        location: "String",
        rarity: "String",
        trade_status: "Boolean",
        info_link: "String",
        image_link: "String",
      },
    },
  ],
};
