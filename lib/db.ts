import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, // DB 호스트
  user: process.env.MYSQL_USER, // DB 유저
  password: process.env.MYSQL_PASSWORD, // DB 비밀번호
  port: Number(process.env.MYSQL_PORT), // DB 포트 (문자열 → 숫자 변환)
  database: process.env.MYSQL_DATABASE, // 사용할 DB명
  waitForConnections: true, // 연결 대기 허용
  connectionLimit: 10, // 최대 연결 수
});

export default pool;