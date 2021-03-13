const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const postsController = require("../controllers/posts-controller");

const router = express.Router();
console.log("---UsersRoutes---");
router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);
router.post("/login", usersController.login);

module.exports = router;
