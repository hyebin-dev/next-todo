"use client";

import type { Priority } from "@/type/todoType";
import { FormEvent } from "react";

type Props = {
  // 입력된 제목(필수)
  title: string;
  setTitle: (v: string) => void;

  // 우선순위(1 높음 / 2 보통 / 3 낮음)
  priority: Priority;
  setPriority: (v: Priority) => void;

  // 기한 날짜(YYYY-MM-DD / 없으면 빈 문자열)
  dueDate: string;
  setDueDate: (v: string) => void;

  // 메모(선택)
  description: string;
  setDescription: (v: string) => void;

  // 상세 옵션 영역 열림 여부
  showDetails: boolean;
  toggleDetails: () => void;

  // 추가 제출 핸들러
  onAdd: (e: FormEvent) => void;
};

export default function TodoForm({
  title,
  setTitle,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  description,
  setDescription,
  showDetails,
  toggleDetails,
  onAdd,
}: Props) {
  return (
    // 할 일 추가 폼 컨테이너
    <form
      onSubmit={onAdd}
      className="mb-4 rounded-[26px] bg-white/90 p-4 ring-1 ring-slate-100 shadow-[0_12px_28px_-22px_rgba(148,163,184,0.6)] text-slate-900"
    >
      {/* 제목 입력 + 상세 토글 + 추가 버튼 */}
      <div className="flex gap-2">
        {/* 제목 입력 */}
        <input
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#C9C6FF] focus:ring-2 focus:ring-[#EDE9FF]"
          placeholder="할 일을 입력해보자!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 상세 옵션 열기/닫기 */}
        <button
          type="button"
          onClick={toggleDetails}
          className="shrink-0 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 bg-[#F7F8FB] hover:bg-[#EEF2FF] hover:ring-[#D8D5FF] active:translate-y-[1px] transition cursor-pointer"
        >
          상세
        </button>

        {/* 추가 제출 */}
        <button
          type="submit"
          className="
            shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold text-black
            bg-[#B9C6FF]
            shadow-md shadow-indigo-200/70
            hover:bg-[#AEBBFF] hover:shadow-lg
            active:bg-[#9EACFF] active:shadow-sm
            transition-all duration-150
            cursor-pointer select-none
          "
        >
          추가
        </button>
      </div>

      {/* 상세 옵션 영역(우선순위/기한/메모) */}
      {showDetails && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* 우선순위 선택 */}
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-[#FFD6E7] focus:ring-2 focus:ring-[#FFF0F6]"
            value={priority}
            onChange={(e) =>
              setPriority(Number(e.target.value) as Priority)
            }
          >
            <option value={1}>우선: 높음</option>
            <option value={2}>우선: 보통</option>
            <option value={3}>우선: 낮음</option>
          </select>

          {/* 기한 날짜 입력(없으면 빈값) */}
          <input
            type="date"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-[#CFEFFF] focus:ring-2 focus:ring-[#E8F6FF]"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* 메모 입력(선택) */}
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#D8F3E2] focus:ring-2 focus:ring-[#E9FBF0]"
            placeholder="메모(선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      )}
    </form>
  );
}
