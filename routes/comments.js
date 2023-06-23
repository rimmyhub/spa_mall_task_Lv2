const express = require("express"); //
const router = express.Router();

const Comments = require("../schemas/comments.js");
const authMiddleware = require("../middlewarses/auth-middleware.js");
// 사용자 인증 미들웨어 연결

// 댓글 조회
router.get("/comments/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.find({ postId }).sort({ createdAt: -1 });

  if (!comments) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  }

  res.status(200).json({ comments });
});


// 댓글 작성 : 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;

  // 댓글 내용을 비워둔 채 댓글 작성 API를 호출한 경우
  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "댓글 내용을 입력해주세요.",
    });
  }

  try {
    const createdComment = await Comments.create({
      userId,
      postId,
      nickname,
      comment,
    });

    // 데이터가 정상적으로 전달되지 못한 경우
    if (!createdComment) {
      return res.status(400).json({
        success: false,
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }

    res
      .status(200)
      .json({ message: "댓글을 작성하였습니다.", comments: createdComment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
  }
});


//댓글 수정 : 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { commentId } = req.params;
    const { comment } = req.body;
    const existsComment = await Comments.findById(commentId, userId);

    // 댓글을 수정할 게시글이 존재하지 않는 경우
    if (!existsComment) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    // 댓글을 수정할 권한이 없는 경우
    if (!userId) {
      return res
        .status(403)
        .json({ message: "댓글의 수정 권한이 존재하지 않습니다." });
    }

    // 입력한 댓글이 존재하지 않는경우
    if (!comment) {
      return res.status(404).json({ message: "댓글 내용을 입력해주세요." });
    }

    try {
      await Comments.updateOne(
        { _id: commentId, userId },
        {
          $set: {
            comment: comment,
          },
        }
      );

      res
        .status(200)
        .json({ message: "댓글을 수정하였습니다.", comments: existsComment });
    } catch (error) {
      console.error(error);
      res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다." }); // 예외 케이스에서 처리하지 못한 에러
    }
  }
);


//댓글 삭제 : 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { commentId } = req.params;
    const { userId } = res.locals.user; // 로그인 사용자 권한
    const existsComments = await Comments.findById(commentId, userId);

    // 댓글을 삭제할 권한이 없는 경우
    if (!userId) {
      return res
        .status(403)
        .json({ message: "댓글의 삭제 권한이 존재하지 않습니다." });
    }

    // 댓글을 삭제할 게시글이 존재하지 않는 경우
    if (!existsComments) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    try {
      await Comments.deleteOne({ _id: commentId, userId });
      res
        .status(200)
        .json({ message: "댓글을 삭제하였습니다.", comments: existsComments });
    } catch (error) {
      console.error(error);
      res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  }
);

module.exports = router;
