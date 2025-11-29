"use client";

import { useMemo, useState } from "react";
import type { TodoType } from "@/type/todoType";

type Props = {
  // 렌더링할 todo 1개
  todo: TodoType;

  // 완료 토글 콜백
  onToggleDone: (id: number, next: boolean) => void;

  // 삭제 콜백
  onDelete: (id: number) => void;
};

// 우선순위 숫자를 라벨로 변환
function priorityLabel(p?: number) {
  if (p === 1) return "높음";
  if (p === 2) return "보통";
  return "낮음";
}

// 우선순위 숫자에 따라 스타일 결정
function priorityTone(p?: number) {
  if (p === 1) return "bg-[#FFE8EE] text-rose-700 ring-[#FFD0DF]";
  if (p === 2) return "bg-[#FFF6DF] text-amber-700 ring-[#FFE7B3]";
  return "bg-[#E8F8FF] text-sky-700 ring-[#CFEFFF]";
}

function normalizeDate(val?: string | Date | null): Date | null {
  if (!val) return null;

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  if (typeof val === "string") {
    const base = val.includes("T") ? val.split("T")[0] : val; // YYYY-MM-DD
    const d = new Date(base + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

// Date를 "YYYY.MM.DD" 형태로 변환
function formatFull(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

// 기한 표시 규칙
// 1) 기한 없음 -> "기한 없음"
// 2) 과거 -> "기한 지남"
// 3) 0~7일 -> "D-n"
// 4) 7일 초과 -> "yy.mm.dd"
function dueChip(due?: string | Date | null) {
  const d = normalizeDate(due);

  if (!d) {
    return {
      text: "기한 없음",
      tone: "bg-slate-50 text-slate-600 ring-slate-200",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: "기한 지남",
      tone: "bg-[#FFE9F0] text-rose-700 ring-[#FFD3E2]",
    };
  }

  if (diffDays <= 7) {
    return {
      text: `D-${diffDays}`,
      tone: "bg-[#EEF2FF] text-indigo-700 ring-[#E5E9FF]",
    };
  }

  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return {
    text: `${yy}.${mm}.${dd}`,
    tone: "bg-white text-slate-700 ring-slate-200",
  };
}

export default function TodoItem({ todo, onToggleDone, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  // 우선순위 라벨/톤
  const p = useMemo(() => priorityLabel(todo.priority), [todo.priority]);
  const pTone = useMemo(() => priorityTone(todo.priority), [todo.priority]);

  // 기한 (짧은 표기)
  const due = useMemo(() => dueChip(todo.due_date), [todo.due_date]);

  // 상세 영역에서 보여줄 기한(긴 표기)
  const dueFull = useMemo(() => {
    const d = normalizeDate(todo.due_date);
    return d ? formatFull(d) : "기한 없음";
  }, [todo.due_date]);

  return (
    <li className="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-100 shadow-[0_8px_20px_-16px_rgba(148,163,184,0.6)]">
      <div className="flex items-start gap-3">
        {/* 완료 체크 */}
        <input
          type="checkbox"
          checked={todo.is_done === 1}
          onChange={(e) => onToggleDone(todo.id, e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#C9C6FF]"
        />

        {/* 본문 */}
        <div className="flex-1">
          {/* 우선순위/기한 */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${pTone}`}
            >
              {p}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${due.tone}`}
            >
              {due.text}
            </span>
          </div>

          {/* 제목 */}
          <div
            className={`text-sm font-medium leading-6 ${
              todo.is_done === 1
                ? "text-slate-400 line-through"
                : "text-slate-900"
            }`}
          >
            {todo.title}
          </div>

          {/* 상세 영역: 메모 + 기한 */}
          {open && (
            <div className="mt-2 space-y-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
              <div>{todo.description ? todo.description : "메모 없음"}</div>
              <div className="text-xs text-slate-500">기한: {dueFull}</div>
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            상세
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="rounded-full px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            삭제
          </button>
        </div>
      </div>
    </li>
  );
}
