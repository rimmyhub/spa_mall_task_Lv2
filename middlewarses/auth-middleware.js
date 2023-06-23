const jwt = require("jsonwebtoken"); // 설치한 jsonwebtoken를 끌어옴
const User = require("../schemas/users.js");

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  // const { authorization } = req.headers; // headers를 사용해서 전송할 수도 있음

  if(!authorization){
    res.status(403).send({
      errorMessage: "로그인이 필요한 기능입니다.", //Cookie가 존재하지 않을 경우
  })}

  const [authType, authToken] = (authorization ?? "").split(" ");
  // 객체구조분해 할당, 쿠키가 존재하지 않는다면 undefined로 존재하게 되고 이걸 스플릿하면 오류가 날 수 있기에
  //존재하지 않을때를 대비해야해서 보안을 향상시키는 용도
  // undefined로 나올땐 빈 문자열로 주어서 split메서드(앞에있는 Bearer와 뒤에 Token을 분리하기 위해 씀)를 쓰더라도 에러가 나지 않게 한다

  //authType이 Bearer 값인지 !authToken 없는게 아닌지
  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }

  // jwt검증
  try {
    // authToken이 만료되었는지, 서버가 발급한 토큰이 맞는지 확인
    const { userId } = jwt.verify(authToken, "customized-secret-key");
    const user = await User.findById(userId);

    // authToken에 있는 userId에 해당하는 사용자가 실제로 DB에 존재하는지
    res.locals.user = user; // 가져온 사용자 정보를 굳이 데이터베이스에서 가져오지 않게 res.locals에 담아두고 언제나 꺼내서 사용할 수 있게 함, 쓰고나면 소멸됨
    next(); // 이 미들웨어 다음으로 보낸다
  } catch (err) {
    console.error(err);
    res.status(403).send({
      errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",  //Cookie가 비정상적이거나 만료된 경우
    });
  }
};
