const express = require("express");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 모든 origin 허용 설정
app.use(
  cors({
    origin: "*", // 모든 origin 허용 (개발 환경)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 라우트 설정
app.use("/api/todos", todoRoutes);

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
