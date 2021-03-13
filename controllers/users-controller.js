const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Post = require("../models/post");

const signup = async (req, res, next) => {
  console.log("---signup fired---");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { email, password } = req.body;
  console.log("email, password", email, password);

  let userExists;
  try {
    userExists = await User.findOne({ email: email });
    console.log("userExists", userExists);
  } catch (err) {
    const error = new HttpError("Signup failed.  Please try again.", 500);
    return next(error);
  }

  if (userExists) {
    const error = new HttpError(
      "User already exists. Please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
    console.log("hashedPassword", hashedPassword);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    console.log("err", err);

    return next(error);
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
    posts: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed, please try again.", 500);
    console.log(err);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "flabergasted",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in. !existingUser",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let userPosts = [];
  try {
    userPosts = await await Post.find({ userId: existingUser.id });
    console.log("found userPosts", userPosts);
  } catch (err) {}

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "flabergasted",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    userPosts: userPosts,
  });
};

exports.signup = signup;
exports.login = login;
