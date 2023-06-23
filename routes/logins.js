const jwt = require("jsonwebtoken"); // jwt를 생성하는 용도 토큰을 가지고 와서 사용
const express = require("express");
const router = express.Router();

const User = require("../schemas/users.js");


// 로그인
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({ nickname }); //닉네임이 일치하는 유저를 찾음

  // user가 존재하지 않거나 user를 찾았지만, user의 비밀번호와 입력한 비밀번호가 다를때
  if (!user || password !== user.password) {
    res.status(412).json({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  }

  try {
    // JWT 생성
    const token = jwt.sign({ userId: user.userId }, "customized-secret-key");
    console.log(token);
    res.cookie("authorization", `Bearer ${token}`); // JWT를 Cookie로 할당
    res.status(200).json({ token }); // JWT를 Body로 할당
  } catch (error) {
    res.status(400).json({
      errorMessage: "로그인에 실패하였습니다.", // 예외 케이스에서 처리하지 못한 에러
    });
  }
});

module.exports = router;
