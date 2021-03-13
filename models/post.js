const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  caption: { type: String, required: true },
  content: { type: String, required: true },
  cardImage: { type: String },
  postImages: { type: Array },
  // cardImage: { data: Buffer, contentType: String },
  creator: { type: mongoose.Types.ObjectId, required: false, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
