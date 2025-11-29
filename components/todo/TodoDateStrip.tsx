"use client";

type Props = {
  // 기한이 있는 todo들의 날짜 목록 (YYYY-MM-DD)
  dates: string[];

  // 기한 없는 todo가 존재하는지 여부
  hasNoDate: boolean;

  // 현재 선택된 날짜 필터 상태
  // "all" : 전체 보기
  // "no-date" : 기한 없음만 보기
  // 그 외 문자열 : 특정 날짜(YYYY-MM-DD) 보기
  selectedDate: "all" | "no-date" | string;

  // 날짜 눌렀을 때 선택 상태 변경 콜백
  onSelect: (v: "all" | "no-date" | string) => void;
};

// 요일 한글 표기용 배열 (Date.getDay() 인덱스 기준)
const WEEK_KR = ["일", "월", "화", "수", "목", "금", "토"];

// "YYYY-MM-DD"를 받아서 "MM.DD" + 요일 형태로 칩에 표시할 문자열 생성
function formatChip(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const w = WEEK_KR[d.getDay()];
  return { top: `${m}.${day}`, bottom: w };
}

export default function TodoDateStrip({
  dates,
  hasNoDate,
  selectedDate,
  onSelect,
}: Props) {
  return (
    // 상단 날짜
    <section className="mb-4 rounded-[24px] bg-white/90 px-3 py-2 ring-1 ring-slate-100 shadow-[0_10px_24px_-20px_rgba(148,163,184,0.55)]">
      {/* 가로 스크롤 가능한 날짜 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {/* 전체 보기 */}
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold transition
          ${
            selectedDate === "all"
              ? "bg-[#EDE9FF] text-indigo-700 ring-1 ring-[#DDD6FF]"
              : "bg-[#F7F8FB] text-slate-600 ring-1 ring-slate-100 hover:bg-[#EEF2FF]"
          }`}
        >
          전체
        </button>

        {/* 기한이 있는 날짜 */}
        {dates.map((ds) => {
          const f = formatChip(ds);
          const selected = selectedDate === ds;

          return (
            <button
              key={ds}
              onClick={() => onSelect(ds)}
              className={`shrink-0 rounded-2xl px-3 py-2 text-center transition ring-1
              ${
                selected
                  ? "bg-[#E8F6FF] text-sky-700 ring-[#CFEFFF]"
                  : "bg-white text-slate-700 ring-slate-100 hover:bg-[#F1FAFF]"
              }`}
            >
              <div className="text-xs font-semibold">{f.top}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {f.bottom}
              </div>
            </button>
          );
        })}

        {/* 기한 없는 todo가 있을 때만 */}
        {hasNoDate && (
          <button
            onClick={() => onSelect("no-date")}
            className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold transition ring-1
            ${
              selectedDate === "no-date"
                ? "bg-[#FFF2F6] text-rose-700 ring-[#FFD7E2]"
                : "bg-white text-slate-700 ring-slate-100 hover:bg-[#FFF7FA]"
            }`}
          >
            기한 없음
          </button>
        )}
      </div>
    </section>
  );
}
