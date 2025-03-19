const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:3001", // 👉 본인 포트번호로 수정!
      "http://localhost:3001", // 👉 본인 포트번호로 수정!
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool";

// 클라이언트에서 post 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;

  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword,
  );

  // 유저정보가 없는 경우
  if (!userInfo) {
    res.status(401).send("로그인 실패");
  } else {
    // ✅ 1. 유저정보가 있는 경우 accessToken을 발급하는 로직
    const accessToken = jwt.sign(
      {
        userId: userInfo.user_id,
        userName: userInfo.user_name,
        userInfo: userInfo.user_info,
      },
      secretKey,
      { expiresIn: "1h" }, // 토큰 유효기간: 1시간
    );

    // ✅ 2. 응답으로 accessToken을 클라이언트로 전송
    res.send({ accessToken });
  }
});

// 클라이언트에서 get 요청을 받은 경우
app.get("/", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("토큰이 없습니다!");
  }

  // Bearer <토큰> 형식 처리
  const token = authHeader.split(" ")[1];

  // ✅ 3. accessToken을 검증하는 로직
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("토큰이 유효하지 않습니다!");
    }

    // ✅ 4. 검증이 완료되면 유저정보를 클라이언트로 전송
    res.send({
      userId: decoded.userId,
      userName: decoded.userName,
      userInfo: decoded.userInfo,
    });
  });
});

app.listen(3000, () => console.log("서버 실행!"));
