const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

postsSchema.set("timestamps",true); // createdAt, updatedAt 을 자동적으로 생성해주는 것
module.exports = mongoose.model("Posts", postsSchema);

