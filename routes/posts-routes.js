const express = require("express");
const { check } = require("express-validator");

const postsController = require("../controllers/posts-controller");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();
// router.get("/user/:uid", placesControllers.getPlacesByUserId);
console.log("---posts-routes Fired---");

router.get("/:uid", postsController.getPostsByUserId);
router.get("/", postsController.getHomePagePosts);

router.use(checkAuth);

router.post(
  "/",
  // fileUpload.single("cardImage"),
  [
    check("title").not().isEmpty(),
    check("caption").not().isEmpty(),
    check("content").not().isEmpty(),
  ],
  postsController.createPost
);

router.delete("/:pid", postsController.deletePost);

module.exports = router;
