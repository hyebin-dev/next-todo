"use client";

import { useEffect, useMemo, useState } from "react";
import TodoHeader from "@/components/todo/TodoHeader";
import TodoForm from "@/components/todo/TodoForm";
import TodoControls from "@/components/todo/TodoControls";
import TodoList from "@/components/todo/TodoList";
import type { TodoType, Priority } from "@/type/todoType";

type Filter = "all" | "active" | "done";
type Sort = "newest" | "due" | "priority" | "doneFirst";

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // 입력 폼 상태(기본값 포함)
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // 필터/정렬/검색 상태
  const [filter, setFilter] = useState<Filter>("all");
  const [showOptions, setShowOptions] = useState(false);
  const [query, setQuery] = useState("");
  const [dateQuery, setDateQuery] = useState(""); // YYYY-MM-DD (기한 검색)
  const [sort, setSort] = useState<Sort>("due");

  // 전체 목록 불러오기
  const fetchTodos = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/todo", { cache: "no-store" });

      // 1) HTTP 에러 처리
      if (!res.ok) {
        let msg = `Failed to load todos (HTTP ${res.status})`;
        try {
          const errJson = await res.json();
          if (typeof errJson?.message === "string") msg = errJson.message;
        } catch {
          // ignore
        }
        setTodos([]);
        setApiError(msg);
        return;
      }

      // 2) JSON 파싱 + 타입 방어
      const data = await res.json();

      if (Array.isArray(data)) {
        setTodos(data);
        return;
      }

      // 혹시 { todos: [...] } 형태도 지원
      if (Array.isArray((data as any)?.todos)) {
        setTodos((data as any).todos);
        return;
      }

      // 3) 배열이 아니면 안전 처리
      setTodos([]);
      setApiError("Invalid API response (expected an array).");
    } catch (e) {
      console.error(e);
      setTodos([]);
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 할 일 추가
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const t = title.trim();
    if (!t) return;

    setApiError(null);

    const payload = {
      title: t,
      priority,
      due_date: dueDate || null,
      description: description || null,
    };

    const res = await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "Failed to create todo";
      try {
        const errJson = await res.json();
        if (typeof errJson?.message === "string") msg = errJson.message;
      } catch {
        // ignore
      }
      setApiError(msg);
      return;
    }

    const created = await res.json();

    // created가 객체 1개가 아닐 수도 있으니 방어
    if (!created || typeof created !== "object") {
      setApiError("Invalid API response (expected a todo object).");
      return;
    }

    setTodos((prev) => [created, ...prev]);

    // 폼 리셋
    setTitle("");
    setPriority(3);
    setDueDate("");
    setDescription("");
    setShowDetails(false);
  };

  // 완료 상태 토글
  const toggleDone = async (id: number, next: boolean) => {
    setApiError(null);

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: next ? 1 : 0 } : t))
    );

    const res = await fetch(`/api/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: next ? 1 : 0 }),
    });

    if (!res.ok) {
      setApiError("Failed to update todo. Refreshing...");
      fetchTodos();
    }
  };

  // 할 일 삭제
  const handleDelete = async (id: number) => {
    setApiError(null);

    setTodos((prev) => prev.filter((t) => t.id !== id));

    const res = await fetch(`/api/todo/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setApiError("Failed to delete todo. Refreshing...");
      fetchTodos();
    }
  };

  // 항상 배열로 안전 처리
  const safeTodos = Array.isArray(todos) ? todos : [];

  // 헤더용 카운트/진행률 계산
  const total = safeTodos.length;
  const doneCount = safeTodos.filter((t) => t.is_done === 1).length;
  const activeCount = total - doneCount;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // 정렬 헬퍼
  const sortList = (list: TodoType[]) => {
    const copy = [...list];

    switch (sort) {
      case "newest":
        copy.sort((a, b) => b.id - a.id);
        break;

      case "due":
        copy.sort((a, b) => {
          const ad = a.due_date
            ? new Date(String(a.due_date).split("T")[0]).getTime()
            : Infinity;
          const bd = b.due_date
            ? new Date(String(b.due_date).split("T")[0]).getTime()
            : Infinity;
          return ad - bd;
        });
        break;

      case "priority":
        copy.sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));
        break;

      case "doneFirst":
        copy.sort((a, b) => (b.is_done ?? 0) - (a.is_done ?? 0));
        break;
    }

    return copy;
  };

  // 필터/검색/정렬 적용된 최종 리스트
  const filteredTodos = useMemo(() => {
    let list = [...safeTodos];

    // 1) 상태 필터
    if (filter === "active") list = list.filter((t) => t.is_done === 0);
    if (filter === "done") list = list.filter((t) => t.is_done === 1);

    // 2) 텍스트 검색(제목 기준)
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => (t.title ?? "").toLowerCase().includes(q));
    }

    // 3) 날짜 검색(기한 기준)
    if (dateQuery) {
      list = list.filter((t) => {
        if (!t.due_date) return false;
        const base = String(t.due_date).includes("T")
          ? String(t.due_date).split("T")[0]
          : String(t.due_date);
        return base === dateQuery;
      });
    }

    // 4) 전체 탭에서는 진행중 먼저, 완료는 아래로
    if (filter === "all") {
      const active = list.filter((t) => t.is_done === 0);
      const done = list.filter((t) => t.is_done === 1);
      return [...sortList(active), ...sortList(done)];
    }

    return sortList(list);
  }, [safeTodos, filter, query, dateQuery, sort]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F6F7FF] via-[#F9FBFF] to-[#FFF7FB] px-3 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        {apiError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
            <button
              className="ml-3 underline"
              onClick={() => fetchTodos()}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        <TodoHeader
          total={total}
          activeCount={activeCount}
          doneCount={doneCount}
          progress={progress}
        />

        <TodoForm
          title={title}
          setTitle={setTitle}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          description={description}
          setDescription={setDescription}
          showDetails={showDetails}
          toggleDetails={() => setShowDetails((v) => !v)}
          onAdd={handleAdd}
        />

        <TodoControls
          filter={filter}
          setFilter={setFilter}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          query={query}
          setQuery={setQuery}
          dateQuery={dateQuery}
          setDateQuery={setDateQuery}
          sort={sort}
          setSort={setSort}
        />

        <TodoList
          todos={filteredTodos}
          loading={loading}
          onToggleDone={toggleDone}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
