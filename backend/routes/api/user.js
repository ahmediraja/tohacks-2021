const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");
const validateRegisterInput = require("../../validation/register");

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post("/", async (req, res) => {
  console.log(User);
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    console.log(errors);
    return res.status(400).json({ errors: errors });
  }
  const { email, password } = req.body;

  try {
    let userEmail = await User.findOne({ email });

    if (userEmail) {
      return res.status(400).json({ errors: { email: "Email already exists" } });
    }

    let user = new User({
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    return res.json({ success: "Succesfully created User", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
