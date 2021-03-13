const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postImageSchema = new Schema({
  postImage: { data: Buffer, contentType: String },
});

var Item = mongoose.model("PostImage", postImageSchema);
