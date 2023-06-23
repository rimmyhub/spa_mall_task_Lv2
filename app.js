const express = require("express");
const app = express();
const port = 3000;

const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const loginRouter = require("./routes/logins.js");
const signupRouter = require("./routes/signups.js");

const connect = require("./schemas");
connect();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use("/", [postsRouter, commentsRouter, loginRouter, signupRouter]);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
