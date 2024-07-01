const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Message = require("../models/Message");

const passport = require("passport");

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("author")
      .sort({ added: -1 });
    res.render("index", { messages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching messages!");
  }
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
      throw new Error("Username already in use!");
    }
  }),
  // Validate password
  body("password").isLength({ min: 5 }),
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
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
      res.status(500).send("Error signing up!");
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

router.get("/create-message", (req, res) => {
  res.render("create-message");
});

router.post("/create-message", async (req, res) => {
  const newMessage = new Message({
    text: req.body.message,
    author: req.user,
    added: new Date(),
  });

  try {
    await newMessage.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new message!");
  }
});

router.get("/become-member", (req, res) => {
  res.render("become-member");
});

router.post("/become-member", async (req, res) => {
  const passcode = "noodle";

  if (req.body.memberPasscode.toLowerCase() === passcode) {
    try {
      req.user.membershipStatus = "member";
      await req.user.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error changing membership status!");
    }
  }
});

router.get("/become-admin", (req, res) => {
  res.render("become-admin");
});

router.post("/become-admin", async (req, res) => {
  const passcode = "sasquatch";

  if (req.body.adminPasscode.toLowerCase() === passcode) {
    try {
      req.user.membershipStatus = "admin";
      await req.user.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error changing membership status!");
    }
  }
});

router.post("/delete-message/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting a message!");
  }
});

module.exports = router;
