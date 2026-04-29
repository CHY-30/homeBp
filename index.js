import pool from "./db/pool.js";
import express from "express";
import cors from "cors";

import boardRouter from "./api/board.js";
import memberRouter from "./api/member.js";

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

app.use("/api/board", boardRouter); //게시판api 연결
app.use("/api/member", memberRouter); //회원api 연결

// DB 테스트용 (연결 확인)
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('서버 정상 작동');
});

app.listen(PORT, () => {
  console.log('서버 실행 3001');
});