import { NextResponse } from "next/server";
import pool from "@/lib/db";


// PUT에서 허용할 컬럼 화이트리스트
// body에 이 목록 외 필드가 들어와도 무시됨
// 타입 안정성 + 보안(임의 컬럼 업데이트 방지)
const ALLOWED_FIELDS = [
  "title",
  "description",
  "priority",
  "due_date",
  "sort_order",
  "is_done",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];


// Next.js 16(Turbopack) 환경에서
// context/params가 간헐적으로 Promise처럼 들어오는 경우가 있어서
// 안전하게 await로 풀어서 id를 꺼내는 헬퍼.
async function getTodoId(context: any) {
  const ctx = await Promise.resolve(context);
  const params = await Promise.resolve(ctx?.params);
  const idStr = params?.id;

  if (!idStr) return null;

  const idNum = Number(idStr);
  if (!Number.isFinite(idNum)) return null;

  return idNum;
}


// GET /api/todo/[id]
// - 특정 todo 1개 조회
export async function GET(req: Request, context: any) {
  try {
    const todoId = await getTodoId(context);
    if (!todoId) {
      return NextResponse.json({ message: "invalid id" }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM todos WHERE id = ?`,
      [todoId]
    );

    // 해당 id가 없으면 null 리턴
    return NextResponse.json(rows[0] ?? null);
  } catch (err: any) {
    console.error("GET /api/todo/[id] error:", err?.message || err);
    return NextResponse.json({ message: "DB error" }, { status: 500 });
  }
}

// PUT /api/todo/[id]
// - todo 수정
// - body로 들어온 필드 중 ALLOWED_FIELDS에 포함된 것만 업데이트
// - 빈 문자열/잘못된 타입은 기존값 유지
export async function PUT(req: Request, context: any) {
  try {
    const todoId = await getTodoId(context);
    if (!todoId) {
      return NextResponse.json({ message: "invalid id" }, { status: 400 });
    }

    const body = await req.json();

    // 기존 데이터 먼저 확인(없는 id면 404)
    const [oldRows]: any = await pool.query(
      `SELECT * FROM todos WHERE id = ?`,
      [todoId]
    );
    const old = oldRows[0];
    if (!old) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }

    // 동적 UPDATE SET 절 구성
    const setClauses: string[] = [];
    const values: any[] = [];

    for (const field of ALLOWED_FIELDS) {
      if (!(field in body)) continue;

      let v = body[field as AllowedField];

      // title: 공백 제거 후 빈 값이면 업데이트 안 함
      if (field === "title") {
        const t = String(v ?? "").trim();
        if (!t) continue;
        v = t;
      }

      // description: 빈 문자열/undefined는 null 처리
      if (field === "description") {
        v = v === "" || v === undefined ? null : String(v);
      }

      // priority: 숫자 아니면 기존값 유지
      if (field === "priority") {
        const p = Number(v);
        v = Number.isFinite(p) ? p : old.priority;
      }

      // due_date: 값 없으면 null (YYYY-MM-DD 문자열 or null)
      if (field === "due_date") {
        v = v ? String(v) : null;
      }

      // sort_order: 숫자 아니면 기존값 유지
      if (field === "sort_order") {
        const s = Number(v);
        v = Number.isFinite(s) ? s : old.sort_order;
      }

      // is_done: truthy면 1, 아니면 0
      if (field === "is_done") {
        v = Number(v) ? 1 : 0;
      }

      setClauses.push(`${field} = ?`);
      values.push(v);
    }

    // 수정할 필드가 0개면 기존 데이터 그대로 반환
    if (setClauses.length === 0) {
      return NextResponse.json(old);
    }

    // WHERE id = ? 값 마지막에 추가
    values.push(todoId);

    await pool.query(
      `UPDATE todos SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // 업데이트 된 데이터 다시 조회해서 반환
    const [rows]: any = await pool.query(
      `SELECT * FROM todos WHERE id = ?`,
      [todoId]
    );

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("PUT /api/todo/[id] error:", err?.message || err);
    return NextResponse.json(
      { message: "DB error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/todo/[id]
 * - todo 삭제
 */
export async function DELETE(req: Request, context: any) {
  try {
    const todoId = await getTodoId(context);
    if (!todoId) {
      return NextResponse.json({ message: "invalid id" }, { status: 400 });
    }

    await pool.query(`DELETE FROM todos WHERE id = ?`, [todoId]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/todo/[id] error:", err?.message || err);
    return NextResponse.json(
      { message: "DB error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
