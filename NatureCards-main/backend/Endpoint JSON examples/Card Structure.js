/**
 * - creator is the _id of the user who created the card
 * - owner is the _id of the user who currently has the card in their gallery
 * - common_name is the common name of the plant
 * - scientific_name is the scientific name of the plant
 * - fun_fact is a fun fact about the plant
 * - time_created is the time the card was created
 * - location is where the plant was found should be kept to a general region
 * - rarity is the rarity of the card (common, rare, epic, legendary)
 * - trade_status is a boolean that is true if the card is up for trade and false if it is not this is for the
 * purpose of ensuring that a card that is in a pending request cannot be added to another trade request
 * - info_link is a link to detailed information about the plant
 * - image is a link to the corresponding image of the plant (not sure how this link will be generated need to talk to
 * Maguire)
 */
const cardExample = {
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
};
