import jwt from "jsonwebtoken";
const SECRET_KEY = "ABCD_key"

const authMiddleware = (req, res, next) => {
  // 1. 헤더에서 토큰 추출 (보통 'Bearer 토큰문자열' 형식)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. 토큰이 아예 없는 경우
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  // 3. 토큰 유효성 검사
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // 유저 정보를 req 객체에 담아서 다음으로 넘김
    next(); 
  } catch (err) {
    // 4. 토큰이 만료되었거나 가짜인 경우 (여기서 401 발생!)
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default authMiddleware;