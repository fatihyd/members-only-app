const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../models/User");

exports.getSignUpForm = (req, res) => {
  res.render("sign-up");
};

exports.signupUser = [
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
  },
];

exports.getLoginForm = (req, res) => {
  res.render("login");
};

exports.loginUser = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
});

exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.getMemberForm = (req, res) => {
  res.render("become-member");
};

exports.becomeMember = async (req, res) => {
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
};

exports.getAdminForm = (req, res) => {
  res.render("become-admin");
};

exports.becomeAdmin = async (req, res) => {
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
};
