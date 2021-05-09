const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require("./config/keys");
const auth = require("./routes/api/auth");
const users = require("./routes/api/user");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

app.use(cors({ origin: "http://localhost:3000" }));
const db = require("./config/keys").mongoURI;

app.use(passport.initialize());

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
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

app.use(express.static(path.join(__dirname, "front-end", "home")));
app.use(express.static(path.join(__dirname, "front-end", "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "front-end", "home", "index.html"));
});

app.get("/app", function (req, res) {
  res.sendFile(path.join(__dirname, "front-end", "build", "index.html"));
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

const io = require("socket.io")(server);
const img = require("./routes/api/img")(io);

app.use("/api/img", img);
