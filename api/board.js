import express from "express";
import pool from "../db/pool.js";
import authMiddleware from "../db/authMiddleware.js"

const router = express.Router();

//1. 리스트 작성
router.post('/', async (req, res) => {
  try{
    const { title, content } = req.body;
    const sql = 'INSERT INTO board (title, content) VALUES (?, ?)';
    await pool.query(
      sql,
      [title, content]
    );
    
    res.send("등록 완료");
  }catch(err){
    res.status(500).send(err);    
  }
});
  
  //2. 글 리스트
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const user = req.user.midx; 
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