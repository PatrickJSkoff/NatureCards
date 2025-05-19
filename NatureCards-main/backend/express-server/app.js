// Import modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Set the web server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.get(
  "/",
  (req, res) => res.send("<h1>NatureCards: Server</h1>") // Home web page
);
// Connect to MongoDB database
mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb+srv://naturecardsdev:nature123@naturecards.chz2p.mongodb.net/NatureCards?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.connection.once("open", function () {
  console.log("Connection with MongoDB was successful");
});
// Create routes for database access
const userSchema = require("./model");
const router = express.Router();
app.use("/db", router);

router.route("/find/:id").get(async (req, res) => {
  try {
    const response = await userSchema.findById(req.params.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(response);
  }
});

router.route("/findUsername/:username").get(async (req, res) => {
  try {
    const response = await userSchema.findOne({ username: req.params.username });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const newDocument = await userSchema.create(req.body); // Creates and saves the document
    return res.status(201).json(newDocument); // Respond with the created document
  } catch (error) {
    return res.status(500).json({ error: error.message }); // Handle errors properly
  }
});

router.route("/update/:id").post(async (req, res) => {
  try {
    const response = await userSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(this.response);
  }
});
// Export the app to be used in bin/www.js
module.exports = app;
