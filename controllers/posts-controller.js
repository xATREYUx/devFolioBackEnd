const HttpError = require("../models/http-error");
const post = require("../models/post");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Post = require("../models/post");

const getPostsByUserId = async (req, res, next) => {
  console.log("---getPostsByUserId Fired---");

  const userId = req.params.uid;
  console.log("User in controller", userId);

  // let posts;
  let userWithPosts;
  const sort = { timestamp: -1 };
  try {
    userWithPosts = await User.findById(userId).populate({
      path: "posts",
      options: { sort: sort },
    });
    console.log("userWithPosts", JSON.stringify(userWithPosts));
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!posts || posts.length === 0) {
  if (!userWithPosts || userWithPosts.posts.length === 0) {
    return next(
      new HttpError("Could not find posts for the provided user id.", 404)
    );
  }

  res.json({
    posts: userWithPosts.posts.map((post) => post.toObject({ getters: true })),
  });
  // console.log("res", res);
};

const getHomePagePosts = async (req, res, next) => {
  let allPosts;
  try {
    allPosts = await Post.find().sort({ timestamp: -1 }).limit(10);
    console.log("allPosts", JSON.stringify(allPosts));
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    posts: allPosts.map((post) => post.toObject({ getters: true })),
  });
};

const createPost = async (req, res, next) => {
  console.log("createPost req.body", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, caption, content, cardImage } = req.body;

  const createdPost = new Post({
    title,
    caption,
    content,
    // cardImage,

    cardImage: req.file.path,
    creator: req.userData.userId,
    time: Date.now,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating post failed, please try again", 500);
    console.log(err);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  console.log("createPost user object", user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Post creation failed, please try again.", 500);
    return next(error);
  }
  res.status(201).json({ post: createdPost });
};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    console.log(err);

    const error = new HttpError(
      "Something went wrong, could not find by id.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess });
    post.creator.posts.pull(post);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted post." });
};

exports.createPost = createPost;
exports.deletePost = deletePost;
exports.getPostsByUserId = getPostsByUserId;
exports.getHomePagePosts = getHomePagePosts;
