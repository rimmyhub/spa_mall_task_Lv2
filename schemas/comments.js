const mongoose = require("mongoose");
const commentsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId, //postId의 타입을 ObjectId로 변경하기 위해서 사용
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  }
});

commentsSchema.set("timestamps",true); // createdAt, updatedAt 을 자동적으로 생성해주는 것
module.exports = mongoose.model("Comments", commentsSchema);
