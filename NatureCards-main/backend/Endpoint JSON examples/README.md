We will have three routes.

A route that will be called when a user signs up that creates a new user document

A route that will be called upon opening the app / logging in that will download the specified user's whole document into a variable.

A route that will update a user's document. The information will be updated within the variable containing the user's information on the front and then the whole variable will be sent to the back.

Notes about structure.

The pending_friends and trading arrays will both be structured the same. They will be arrays of object pairs. The first will always be the sender, in the case of friends it's the id of the friend sending the request and in the case of the trades it's the card being offered by the person requesting the trade. The second will be the same but the reciever of the trade request / friend request.

If anything on this document doesn't make sense message Guido!
