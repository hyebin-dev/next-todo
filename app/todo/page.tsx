"use client";

import { useEffect, useMemo, useState } from "react";
import TodoHeader from "@/components/todo/TodoHeader";
import TodoForm from "@/components/todo/TodoForm";
import TodoControls from "@/components/todo/TodoControls";
import TodoList from "@/components/todo/TodoList";
import type { TodoType, Priority } from "@/type/todoType";

type Filter = "all" | "active" | "done";
type Sort = "newest" | "due" | "priority" | "doneFirst";

// DB 없이도 체험 가능한 데모 데이터
const DEMO_TODOS: TodoType[] = [
  {
    id: 10001,
    title: "포트폴리오 README 정리하기",
    description: "Demo mode에서도 CRUD가 동작하도록 구성",
    priority: 2,
    due_date: null,
    sort_order: 0,
    is_done: 0,
  },
  {
    id: 10002,
    title: "우선순위/기한으로 정렬 확인하기",
    description: "필터/정렬/검색이 정상 동작하는지 확인",
    priority: 1,
    due_date: "2026-01-10",
    sort_order: 0,
    is_done: 0,
  },
  {
    id: 10003,
    title: "완료 처리 토글해보기",
    description: null,
    priority: 3,
    due_date: "2026-01-08",
    sort_order: 0,
    is_done: 1,
  },
];

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [loading, setLoading] = useState(true);

  // 에러/데모 모드 상태
  const [apiError, setApiError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

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

  // API 응답을 안전하게 배열로 정규화
  const normalizeTodos = (data: any): TodoType[] | null => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.todos)) return data.todos;
    return null;
  };

  // 전체 목록 불러오기
  const fetchTodos = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/todo", { cache: "no-store" });

      // HTTP 에러 -> 데모 모드로 전환
      if (!res.ok) {
        let msg = `Failed to load todos (HTTP ${res.status})`;
        try {
          const errJson = await res.json();
          if (typeof errJson?.message === "string") msg = errJson.message;
        } catch {
          // ignore
        }

        setDemoMode(true);
        setTodos(DEMO_TODOS);
        setApiError(`${msg} (Demo mode enabled)`);
        return;
      }

      // JSON 파싱 + 타입 방어
      const data = await res.json();
      const list = normalizeTodos(data);

      if (!list) {
        setDemoMode(true);
        setTodos(DEMO_TODOS);
        setApiError("Invalid API response. Demo mode enabled.");
        return;
      }

      // 정상 데이터면 데모 모드 해제
      setDemoMode(false);
      setTodos(list);
    } catch (e) {
      console.error(e);
      setDemoMode(true);
      setTodos(DEMO_TODOS);
      setApiError("Network/DB error. Demo mode enabled.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 데모용 신규 ID 생성
  const genDemoId = () => {
    // Date.now() 기반이면 중복 가능성이 극히 낮고, newest 정렬에도 유리
    return Date.now();
  };

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

    // Demo mode: 로컬 상태로만 동작
    if (demoMode) {
      const created: TodoType = {
        id: genDemoId(),
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        due_date: payload.due_date,
        sort_order: 0,
        is_done: 0,
      };

      setTodos((prev) => [created, ...prev]);

      // 폼 리셋
      setTitle("");
      setPriority(3);
      setDueDate("");
      setDescription("");
      setShowDetails(false);
      return;
    }

    // Full mode: DB API 호출
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

      // DB가 죽었을 수 있으니 데모로 전환(UX 유지)
      setDemoMode(true);
      setApiError(`${msg} (Demo mode enabled)`);
      return;
    }

    const created = await res.json();
    if (!created || typeof created !== "object") {
      setDemoMode(true);
      setApiError("Invalid API response. Demo mode enabled.");
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

    // Demo mode: 로컬 반영만
    if (demoMode) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_done: next ? 1 : 0 } : t))
      );
      return;
    }

    // Full mode: 낙관적 업데이트 + 실패 시 롤백(재조회)
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

    // Demo mode: 로컬 삭제만
    if (demoMode) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    // Full mode
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
        {/* 상태 배너 */}
        {(apiError || demoMode) && (
          <div
            className={`mb-3 rounded-xl border px-4 py-3 text-sm ${
              demoMode
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {demoMode ? (
              <>
                <b>Demo mode</b>
                <span className="ml-2">
                  (DB not connected) — changes are stored in memory only.
                </span>
              </>
            ) : null}

            {apiError ? (
              <>
                <span className="ml-2">{apiError}</span>
              </>
            ) : null}

            <button className="ml-3 underline" onClick={fetchTodos} type="button">
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
