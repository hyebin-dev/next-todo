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
    try {
      const res = await fetch("/api/todo", { cache: "no-store" });
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      console.error(e);
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
      console.error("Failed to create todo");
      return;
    }

    const created = await res.json();
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
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: next ? 1 : 0 } : t))
    );

    const res = await fetch(`/api/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: next ? 1 : 0 }),
    });

    if (!res.ok) {
      console.error("toggle failed");
      fetchTodos();
    }
  };

  // 할 일 삭제
  const handleDelete = async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const res = await fetch(`/api/todo/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("delete failed");
      fetchTodos();
    }
  };

  // 헤더용 카운트/진행률 계산
  const total = todos.length;
  const doneCount = todos.filter((t) => t.is_done === 1).length;
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
    let list = [...todos];

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
  }, [todos, filter, query, dateQuery, sort]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F6F7FF] via-[#F9FBFF] to-[#FFF7FB] px-3 py-6">
      <div className="mx-auto w-full max-w-[720px]">
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
