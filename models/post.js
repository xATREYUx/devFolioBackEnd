const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  caption: { type: String, required: true },
  content: { type: String, required: true },
  cardImage: { type: String },
  postImageOne: { type: String },
  postImageTwo: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: false, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
