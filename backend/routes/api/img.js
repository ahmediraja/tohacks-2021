const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");
const vision = require("@google-cloud/vision");
const credentials = require("../../config/cred.json");

function getConfidence(data) {
  let average = 0;
  let sum = 0;
  if (data.textAnnotations) {
    data.textAnnotations.forEach((data, index) => {
      sum += data.confidence;
      average = sum / (index + 1);
    });
  } else {
    data.pages.forEach((data, index) => {
      sum += data.confidence;
      average = sum / (index + 1);
    });
  }

  return average;
}

const client = new vision.ImageAnnotatorClient({
  credentials,
});

module.exports = function (io) {
  //we define the variables
  // var sendResponse = function () {};

  io.sockets.on("connection", function (socket) {
    // Everytime a client logs in, display a connected message
    console.log("Server-Client Connected!");

    socket.on("connected", function (account_id) {
      console.log(account_id);
      socket.join(account_id);
    });
  });
  router.post("/", auth, async (req, res) => {
    try {
      let data = req.body.image;
      if (data.split(",")[1] !== undefined) {
        data = data.split(",")[1];
      }
      const [result] = await client.documentTextDetection({ image: { content: data } });
      const handwriting = result.fullTextAnnotation;
      let handwritingConfidence = getConfidence(handwriting);
      // console.log(`Confidence: ${handwritingConfidence}`);
      // console.log(`Handwriting Full text: ${handwriting.text}`);

      const [result2] = await client.textDetection({ image: { content: data } });
      const printedTest = result2.fullTextAnnotation;
      let printedConfidence = getConfidence(printedTest);
      // console.log(`Confidence: ${printedConfidence}`);
      // console.log(`Printed Full text: ${printedTest.text}`);

      let finalText = printedConfidence >= handwritingConfidence ? handwriting.text : printedConfidence.text;

      io.to(req.user.id).emit("imageFromServer", {
        image: data,
        text: finalText,
      });
      return res.status(200).json({ success: true });
      // };
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
  });

  return router;
};
