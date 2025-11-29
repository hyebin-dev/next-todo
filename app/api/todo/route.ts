import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
          id,
          title,
          description,
          priority,
          due_date,
          sort_order,
          is_done
       FROM todos
       ORDER BY 
          CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
          due_date ASC,
          sort_order ASC,
          id DESC`
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/todo error:", err?.message || err);
    return NextResponse.json({ message: "DB error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // title은 필수 + 공백 제거 후 검사
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ message: "title required" }, { status: 400 });
    }

    // description은 없거나 빈 값이면 null
    const description =
      body.description === undefined || body.description === ""
        ? null
        : String(body.description);

    // priority 기본값 3(낮음) / 2(보통) / 1(높음)
    const priority = Number(body.priority ?? 2);

    // due_date는 없으면 null
    const due_date = body.due_date ? String(body.due_date) : null;

    // sort_order 기본 0
    const sort_order = Number(body.sort_order ?? 0);

    // 신규 todo 생성
    const [result]: any = await pool.query(
      `INSERT INTO todos (title, description, priority, due_date, sort_order, is_done)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [title, description, priority, due_date, sort_order]
    );

    const insertedId = result.insertId;

    // 방금 생성한 todo 1개만 다시 조회해서 반환
    const [rows]: any = await pool.query(
      `SELECT 
          id,
          title,
          description,
          priority,
          due_date,
          sort_order,
          is_done
       FROM todos
       WHERE id = ?`,
      [insertedId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error("POST /api/todo error:", err?.message || err);
    return NextResponse.json(
      { message: "DB error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
