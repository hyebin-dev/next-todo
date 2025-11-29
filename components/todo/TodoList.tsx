"use client";

import TodoItem from "./TodoItem";
import type { TodoType } from "@/type/todoType";

type Props = {
  // todo 목록 (undefined로 들어와도 안전)
  todos?: TodoType[];

  // 로딩 상태
  loading?: boolean;

  // 완료 토글 콜백
  onToggleDone?: (id: number, next: boolean) => void;

  // 삭제 콜백
  onDelete?: (id: number) => void;
};

export default function TodoList({
  todos = [], // 기본값: 빈 배열
  loading = false,
  onToggleDone = () => {},
  onDelete = () => {},
}: Props) {
  // 로딩 중 화면
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 text-center text-sm text-slate-500 ring-1 ring-slate-100">
        불러오는 중…
      </div>
    );
  }

  // 목록이 비었을 때 화면
  if (todos.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 text-center text-sm text-slate-500 ring-1 ring-slate-100">
        아직 할 일이 없어!
      </div>
    );
  }

  // todo 리스트 렌더링
  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
