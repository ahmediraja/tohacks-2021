const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require("./config/keys");
const auth = require("./routes/api/auth");
const users = require("./routes/api/user");

const app = express();

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

// app.use(cors());
const db = require("./config/keys").mongoURI;

app.use(passport.initialize());

// require("./config/passport.js")(passport);

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
  console.log("MongoDB connected");
});

app.use(passport.initialize());

app.use("/api/auth", auth);
app.use("/api/users", users);
// app.use("/api/profile", profiles);
// app.use("/api/friends", friends);
// app.use("/api/collabs", collabs);
// app.use("/api/posts", posts);
// app.use("/api/conversations", conversation);
// app.use("/api/courts", courts);

// Server static assets if in production

//set static folder

// app.use(express.static("client/public"));

const port = 5000;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

const io = require("socket.io")(server);
const img = require("./routes/api/img")(io);

app.use("/api/img", img);
// io.on("connection", (socket) => {
//   console.log("we have a new connection!");
//   socket.on("join", async (conversationId, callbck) => {
//     socket.join(conversationId);
//   });
//   socket.on("disconnect", () => {
//     console.log("user had left");
//   });
//   socket.on("chat", async (data, callback) => {
//     // if(data.profile.conversations.filter(u => u.username === data.userToChat).length > 0){
//     let conversationObj = await Conversation.findOne({ _id: data.conversationId });
//     let userToChatObj = await User.findOne({ username: data.userToChat });
//     try {
//       if (conversationObj !== null && userToChatObj) {
//         const newMessage = new Message({
//           sender: data.profile.username,
//           content: data.message,
//           conversationId: conversationObj._id,
//           read: false,
//         });
//         await newMessage.save();
//         conversationObj.lastActive = Date.now();
//         conversationObj.save();

//         const emailNewMessage = `
//           Hey ${userToChatObj.username}
//           <br/><br/>
//           You have a new message from ${data.profile.username}.
//           <br/><br/>
//           ${data.message}
//           <br/><br/>
//           <a href="https://kloud.live/my-collabs">Click here to check your collabs</a>
//           <br/><br/>
//           From,<br/>
//           The Kloud Team
//           `;
//         const mailOptions = {
//           from: "Kloud",
//           to: userToChatObj.email,
//           subject: `New message from ${data.profile.username}`,
//           //Email to Be sent
//           html: emailNewMessage,
//         };
//         //Send Email
//         transporter.sendMail(mailOptions, function (err, info) {
//           //handle email errors
//           if (err) console.log(err);
//           else console.log(info);
//         });

//         io.to(conversationObj._id).emit("message", {
//           message: newMessage,
//           username: data.profile.username,
//           userToChat: data.userToChat,
//         });
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   });
// });
