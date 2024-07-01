const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  membershipStatus: {
    type: String,
    enum: ["regular", "member", "admin"],
    default: "regular",
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
