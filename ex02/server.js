const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 모든 origin 허용 설정
app.use(cors());
app.use(express.json());

app.get("/login", async (req, res) => {
  const id = req.query.id;
  const pw = req.query.pw;
  if (id === "kyunghee" && pw === "1234") res.status(200).send("ok");
  else res.status(401).send("login failed");
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
