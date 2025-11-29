"use client";

type Filter = "all" | "active" | "done";
type Sort = "newest" | "due" | "priority" | "doneFirst";

type Props = {
  // 현재 선택된 필터(전체/진행중/완료)
  filter: Filter;
  setFilter: (v: Filter) => void;

  // 옵션(검색/정렬) 영역 열림 여부
  showOptions: boolean;
  setShowOptions: (v: boolean) => void;

  // 텍스트 검색어(제목 기준)
  query: string;
  setQuery: (v: string) => void;

  // 날짜 검색어(기한 기준, YYYY-MM-DD)
  dateQuery: string;
  setDateQuery: (v: string) => void;

  // 정렬 기준
  sort: Sort;
  setSort: (v: Sort) => void;
};

export default function TodoControls({
  filter,
  setFilter,
  showOptions,
  setShowOptions,
  query,
  setQuery,
  dateQuery,
  setDateQuery,
  sort,
  setSort,
}: Props) {
  return (
    <div className="mb-3">
      {/* 상단 필터 버튼 + 옵션 토글 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: "all", label: "전체" },
            { key: "active", label: "진행중" },
            { key: "done", label: "완료" },
          ].map((b) => {
            const active = filter === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setFilter(b.key as Filter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition
                  ${
                    active
                      ? "bg-[#EEF2FF] text-indigo-700 ring-1 ring-[#DDE3FF]"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition"
        >
          필터
        </button>
      </div>

      {/* 옵션 영역(검색 + 날짜 검색 + 정렬) */}
      {showOptions && (
        <div className="mt-3 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-100">
          {/* 가로폭이 좁아질 때 자연스럽게 줄바꿈되도록 flex-wrap 대응 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {/* 제목 텍스트 검색 */}
            <input
              className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#C9C6FF] focus:ring-2 focus:ring-[#EDE9FF]"
              placeholder="할 일 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* 기한 날짜 검색 + 해제 버튼 */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="date"
                className="w-[160px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#CFEFFF] focus:ring-2 focus:ring-[#E8F6FF]"
                value={dateQuery}
                onChange={(e) => setDateQuery(e.target.value)}
              />

              {/* 날짜가 선택된 경우에만 해제 버튼 노출 */}
              {dateQuery && (
                <button
                  onClick={() => setDateQuery("")}
                  className="
                    h-[38px] min-w-[88px]
                    whitespace-nowrap
                    rounded-xl px-3 py-2 text-xs font-semibold text-slate-600
                    ring-1 ring-slate-200 hover:bg-slate-50 transition
                  "
                >
                  날짜 해제
                </button>
              )}
            </div>

            {/* 정렬 기준 선택 */}
            <select
              className="shrink-0 min-w-[140px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-100"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="due">기한 빠른순</option>
              <option value="newest">최신순</option>
              <option value="priority">우선순위순</option>
              <option value="doneFirst">완료 먼저</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
