import express, { response } from "express";
import pool from "../db/pool.js";
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REKEY = process.env.SECRET_REKEY;
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

        const sql = "SELECT midx, userId, userName, userPw FROM member where userId = ?";
        const [rows] = await pool.query(sql, [userId])


        // 아이디 확인
        if(rows.length === 0){ return res.json({ success: false, message: "아이디를 확인해주세요."}) }
        
        // 비밀번호확인
        if(rows[0].userPw != userPw){
           return res.json({success: false, message: "비밀번호를 확인해주세요."}) 
        }
        else{
          const accessToken = jwt.sign(
            {userMidx: rows[0].midx, userId: rows[0].userId, userName: rows[0].userName},
            SECRET_KEY,
            { expiresIn: '20m'}
          );

          //리플레시 토큰
          const refreshToken = jwt.sign(
            {userMidx: rows[0].midx},
            SECRET_REKEY,
            { expiresIn: '30d'}
          );

          res.json({
            success: true, accessToken, userId: rows[0].userId, userName: rows[0].userName, userMidx: rows[0].midx, refreshToken 
          });
        }


    } catch (err) {
        res.status(500).send(err);
    }
    });

    //4. 리플레시토큰
    router.post('/refresh', async (req, res) => {

      const { oldRefreshToken } = req.body;

      if (!oldRefreshToken) return res.status(401).json({ message: "리프레시 토큰이 없습니다." });
      
      try {

        const decoded = jwt.verify(oldRefreshToken, SECRET_REKEY);

        const sql = "SELECT midx, userId, userName FROM member WHERE midx = ?";
        const [rows] = await pool.query(sql, [decoded.userMidx]);

        const newaccessToken = jwt.sign(
          {userMidx: rows[0].midx, userId: rows[0].userId, userName: rows[0].userName},
          SECRET_KEY,
          { expiresIn: '20m'}
        );

        const newrefreshToken = jwt.sign(
          {userMidx: rows[0].midx},
          SECRET_REKEY,
          { expiresIn: '30d'}
        );

        console.log(newrefreshToken);

        res.json({
          success: true, newaccessToken, userId: rows[0].userId, userName: rows[0].userName, userMidx: rows[0].midx, newrefreshToken 
        });
      }

      catch (err) {
      // 30일짜리 토큰마저 가짜거나 만료된 경우
      return res.status(403).json({ message: "리프레시 토큰이 유효하지 않습니다." });
    }


    });

  export default router;