const express = require("express");
const router = express.Router();

const ObjectId = require("mongoose").Types.ObjectId; // Id를 ObjectId 타입으로 변경하기 위한 방법
const Posts = require("../schemas/posts.js");
const authMiddleware = require("../middlewarses/auth-middleware.js");
// 사용자 인증 미들웨어 연결

// 게시글 전체 조회
router.get("/posts", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;

  try {
    const posts = await Posts.find({ userId, nickname }).sort({
      createdAt: -1,
    }); // 작성 날짜 기준으로 내림차순 정렬
    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
  }
});


// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const postOid = new ObjectId(postId);
  const getPostById = await Posts.findOne({ _id: postOid });

  if (!getPostById) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    res.status(200).json({ posts: getPostById });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." }); //예외 케이스에서 처리하지 못한 에러
  }
});


// 게시글 작성 : 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user; // 로그인된 사용자 정보를 가져와서 게시글 작성
  const { title, content } = req.body;

  // Title의 형식이 비정상적인 경우 : 영어 대소문자, 한글, 공백, 느낌표, 물음표, 쉼표, 마침표, 숫자를 포함한 제목을 허용, 제목은 최소한 한 글자 이상
  const titleRegex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s!?,.\d]+$/;
  if (!titleRegex.test(title)) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  }

  // Content의 형식이 비정상적인 경우 : 영어 대소문자, 한글, 공백, 느낌표, 물음표, 쉼표, 마침표, 숫자를 포함한 제목을 허용, 제목은 최소한 한 글자 이상
  const contentRegex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s!?,.\d]+$/;
  if (!contentRegex.test(content)) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  // Posts 모델 데이터베이스를 사용해서 새로운 게시글 생성
  try {
    const createdPosts = await Posts.create({
      userId,
      nickname,
      title,
      content,
    });
    res
      .status(200)
      .json({ message: "게시글 작성에 성공하였습니다.", data: createdPosts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "게시글 작성에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
  }
});


//게시글 수정 : 토큰을 검사하여, 해당 사용자가 작성한 게시글만 수정 가능
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;
  const existsPosts = await Posts.findById(postId);

  // Title의 형식이 비정상적인 경우 : 영어 대소문자, 한글, 공백, 느낌표, 물음표, 쉼표, 마침표, 숫자를 포함한 제목을 허용, 제목은 최소한 한 글자 이상
  const titleRegex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s!?,.\d]+$/;
  if (!titleRegex.test(title)) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  }

  // Content의 형식이 비정상적인 경우 : 영어 대소문자, 한글, 공백, 느낌표, 물음표, 쉼표, 마침표, 숫자를 포함한 제목을 허용, 제목은 최소한 한 글자 이상
  const contentRegex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s!?,.\d]+$/;
  if (!contentRegex.test(content)) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  // 게시글 수정권한이 없는 경우 : 로그인 된 사용자 정보 없음
  if (!userId) {
    return res
      .status(403)
      .json({ message: "게시글 수정의 권한이 존재하지 않습니다." });
  }

  // 게시글이 없는 경우
  if (!existsPosts) {
    return res.status(404).json({ message: "게시글 조회에 실패했습니다." });
  }

  try {
    await Posts.updateOne(
      { _id: postId, userId },
      {
        $set: {
          title: title,
          content: content,
        },
      }
    );

    res
      .status(200)
      .json({ message: "게시글을 수정하였습니다.", data: existsPosts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
  }
});

//게시글 삭제 : 토큰을 검사하여, 해당 사용자가 작성한 게시글만 삭제 가능
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const existsPosts = await Posts.findById(postId, userId);

  // 게시글을 삭제할 권한이 없는 경우 : 로그인 된 사용자 정보 없음
  if (!userId) {
    return res
      .status(403)
      .json({ message: "게시글의 삭제 권한이 존재하지 않습니다." });
  }

  // 게시글이 존재하지 않는 경우
  if (!existsPosts) {
    return res.status(404).json({ message: "게시글 조회에 실패했습니다." });
  }

  try {
    await Posts.deleteOne({ _id: postId, userId }); // postId와 userId를 조건으로 삭제

    res
      .status(200)
      .json({ message: "게시글을 삭제하였습니다.", data: existsPosts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
  }
});

module.exports = router;
