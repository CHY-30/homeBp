import express from "express";
import pool from "../db/pool.js";
import authMiddleware from "../db/authMiddleware.js"

const router = express.Router();

//1. 리스트 작성
router.post('/', authMiddleware, async (req, res) => {
  try{
    
    //const authMidx = req.user.userMidx;//회원고유번호
    const { userMidx, title, content } = req.body;
    
    const sql = 'INSERT INTO board (midx, title, content) VALUES (?, ?, ?)';
    await pool.query(
      sql,
      [userMidx, title, content]
    );
    
    res.send("등록 완료");
  }catch(err){
    res.status(500).send(err);    
  }
});
  
  //2. 글 리스트
  router.get('/', authMiddleware, async (req, res) => {

    const page = parseInt(req.query.page) || 1; // 기본1페이지
    const size = parseInt(req.query.size) || 10; //기본10개
    const offset = (page - 1) * size;

    try {
      // 전체수
      const [totalCntRow] = await pool.query("SELECT COUNT(*) as total FROM board");
      const totalCnt = totalCntRow[0].total;
      
      // 리스트
      const [rows] = await pool.query("SELECT * FROM board order by id desc LIMIT ? OFFSET ?",[size, offset]);

      res.json({
        data: rows,
        totalCnt,
        totalPages: Math.ceil(totalCnt / size),
        currentPage: page
      });

    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  // 3. 글 수정 (UPDATE)
  router.put("/:id", authMiddleware, async (req, res) => {
    try {

      const authMidx = req.user.userMidx;//회원고유번호
      const { title, content } = req.body;
      const id = req.params.id;
  
      const [ bmc ] = await pool.query(
        "UPDATE board SET title=?, content=? WHERE id=? and midx=?",
        [title, content, id, authMidx]
      );
      
      if(bmc.affectedRows === 0){
        return res.status(555).json({ 
          success: false, 
          message: "본인이 작성한 글만 수정할 수 있거나, 게시글이 존재하지 않습니다." 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: "성공적으로 수정되었습니다." 
      });

    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  // 4. 글 삭제 (DELETE)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const id = req.params.id;
      const authMidx = req.user.userMidx;//회원고유번호
  
      const [ bmc ] = await pool.query(
        "DELETE FROM board WHERE id=? and midx=?",
        [id, 1111]
      );

      if(bmc.affectedRows === 0){
        return res.status(555).json({ 
          success: false, 
          message: "본인이 작성한 글만 수정할 수 있거나, 게시글이 존재하지 않습니다." 
        });
      }
  
      return res.status(200).json({ 
        success: true, 
        message: "삭제되었습니다." 
      });
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