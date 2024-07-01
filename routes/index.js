var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

var passport = require("passport");

router.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

router.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

router.post(
  "/sign-up",
  // Validate username
  body("username").custom(async (value) => {
    const user = await User.findOne({ username: value });
    if (user) {
      throw new Error("Username already in use");
    }
  }),
  // Validate password
  body("password").isLength({ min: 5 }),
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  async (req, res) => {
    // Handle errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, return them to the user
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle request
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    try {
      await newUser.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while signing up!");
    }
  }
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
