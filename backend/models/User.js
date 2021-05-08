const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPwToken: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("users", UserSchema);

module.exports = User;