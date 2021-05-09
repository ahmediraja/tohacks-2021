const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");

module.exports = function (io) {
  //we define the variables
  // var sendResponse = function () {};

  io.sockets.on("connection", function (socket) {
    // Everytime a client logs in, display a connected message
    console.log("Server-Client Connected!");

    socket.on("connected", function (account_id) {
      socket.join(account_id);
    });

    // socket.on("imageFromMaster", (data) => {
    //   //calling a function which is inside the router so we can send a res back
    //   io.to(conversationObj._id).emit("message", {
    //     message: newMessage,
    //     username: data.profile.username,
    //     userToChat: data.userToChat,
    //   });
    // });
  });

  router.post("/", auth, async (req, res) => {
    console.log(req.user.id);
    //pickedUser is one of the connected client
    // var pickedUser = "JZLpeA4pBECwbc5IAAAA";
    // io.to(pickedUser).emit("taskRequest", req.body);
    // console.log(req.body.image);
    // sendResponse = function (data) {

    io.to(req.user.id).emit("imageFromServer", {
      image: req.body.image,
    });
    return res.status(200).json({ success: true });
    // };
  });

  return router;
};
