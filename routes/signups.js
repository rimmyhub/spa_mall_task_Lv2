const express = require("express");
const router = express.Router();

const User = require("../schemas/users.js");
const authMiddleware = require("../middlewarses/auth-middleware.js");
// 사용자 인증 미들웨어 연결


// 내 정보 조회 : 로그인한 닉네임 사용자 조회
router.get("/users/me", authMiddleware, async (req, res) => {
  const { nickname } = res.locals.user;

  res.status(200).json({
    user: { nickname },
  });
});


// 회원가입
router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;

  // 닉네임 유효성 검사 : 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9), 한글로 구성
  const nicknameRegex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{3,}$/;
  if (!nicknameRegex.test(nickname)) {
    res.status(412).json({
      errorMessage:
        "닉네임의 형식이 일치하지 않습니다.",
    });
    return;
  }

  // 비밀번호 유효성 검사 : 비밀번호는 최소 4자 이상이어야 하며, 닉네임과 같은 값이 포함될 수 없음, 비밀번호에 숫자가 최소한 하나 이상 포함
  const passwordRegex = new RegExp(`^(?!.*${nickname})(?=.*\\d).{4,}$`)
  if (!passwordRegex.test(password)) {
    res.status(412).json({
      errorMessage:
        "패스워드 형식이 일치하지 않습니다.",
    });
    return;
  }

  //비밀번호가 비밀번호 확인란과 다름
  if (password !== confirm) {
    res.status(412).json({
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
    return;
  }

  // 중복되는 닉네임이 있는지 확인
  const existsUsers = await User.findOne({ nickname });
  if (existsUsers) {
    res.status(412).json({
      errorMessage: "중복된 닉네임입니다.",
    });
    return;
  }

  // 회원가입에 필요한 정보를 담은 user 객체 생성
  const user = new User({ nickname, password, confirm });
  try {
    await user.save();
    res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (error) { // 예외케이스에서 처리하지 못한 에러
    res.status(400).json({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});


module.exports = router;
