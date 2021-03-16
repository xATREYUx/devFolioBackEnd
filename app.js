const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
const bodyParser = require("body-parser");

const HttpError = require("./models/http-error");
const usersRoutes = require("./routes/users-routes");
const postsRoutes = require("./routes/posts-routes");

const app = express();
const fs = require("fs");
const path = require("path");

app.use(bodyParser.json());
// const corsOptions = {
//   origin: "http://localhost:3000",
// };
// app.use(cors(corsOptions));
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(express.static("public"));

app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);

app.use((req, res, next) => {
  const error = new HttpError(
    "Could not find that route. Please try again.",
    404
  );
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log("req.file.path app.js", err);
    });
  }
  if (!req.file) {
    console.log("no req.file");
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://ga1act1c:F7974639s@cluster0.iipjr.mongodb.net/devPortMERN?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
