import express from "express";
import pool from "../db/pool.js";
import jwt from 'jsonwebtoken';
const SECRET_KEY = "ABCD_key"

const router = express.Router();

    //1. 회원가입
    router.post('/join', async (req, res) => {
    try{
        const { userId, userPw, userName, userEmail, userPhone } = req.body;
        const sql = 'INSERT INTO member (userId, userPw, userName, userEmail, userPhone) VALUES (?, ?, ?, ?, ?)';
        await pool.query(
        sql,
        [userId, userPw, userName, userEmail, userPhone]
        );
        
        res.send("등록 완료");
    }catch(err){
        console.error("진짜 에러 원인:", err);
        res.status(500).send(err.message);
    }
    });

    
    //2. 아이디 중복체크
    router.post('/check-id', async (req, res) => {
    try{
        const { userId } = req.body;
        const sql = "SELECT COUNT(*) as cnt FROM member where userId=?";
        const [rows] = await pool.query(sql,[userId]);

        const isIdCnt = Number(rows[0].cnt > 0);
                
        res.json({checkResult : isIdCnt});
    }catch(err){
        console.error("진짜 에러 원인:", err);
        res.status(500).send(err.message);
    }
    });
    
  
    //3. 로그인
    router.post('/login', async (req, res) => {
    try {
        const {userId, userPw} = req.body;

        const sql = "SELECT userId, userName, userPw FROM member where userId = ?";

        const [rows] = await pool.query("SELECT * FROM board");
        res.json(rows);
    } catch (err) {
        res.status(500).send(err);
    }
    });


    // 3. 글 수정 (UPDATE)
    router.put("/:id", async (req, res) => {
    try {
        const { title, content } = req.body;
        const id = req.params.id;

        await pool.query(
        "UPDATE board SET title=?, content=? WHERE id=?",
        [title, content, id]
        );

        res.send("수정 완료");
    } catch (err) {
        res.status(500).send(err);
    }
    });
  

  // 4. 글 삭제 (DELETE)
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
  
      await pool.query(
        "DELETE FROM board WHERE id=?",
        [id]
      );
  
      res.send("삭제 완료");
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // 5. 글 상세
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        "SELECT * FROM board WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).send("게시글 없음");
      }

      res.json(rows[0]);
    } catch (err) {
      res.status(500).send(err);
    }
  });


  export default router;