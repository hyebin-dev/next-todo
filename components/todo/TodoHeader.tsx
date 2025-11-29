"use client";

type Props = {
  total: number; // 전체 todo 개수
  activeCount: number; // 진행중(todo.is_done === 0) 개수
  doneCount: number; // 완료(todo.is_done === 1) 개수
  progress: number; // 완료 비율(0~100)
};

export default function TodoHeader({
  total,
  activeCount,
  doneCount,
  progress,
}: Props) {
  return (
    // 상단 제목 + 카운트 + 진행률 영역
    <section className="mb-4 rounded-[28px] bg-white/90 p-5 shadow-[0_14px_30px_-22px_rgba(148,163,184,0.6)] ring-1 ring-slate-100 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        {/* 제목/서브문구 */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Todo-list
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            오늘의 할 일을 정리해보자!
          </p>
        </div>

        {/* 전체/진행중/완료 카운트 박스 */}
        <div className="flex gap-2 text-center text-xs font-semibold">
          <div className="min-w-[64px] rounded-2xl bg-[#F3F7FF] px-3 py-2 text-slate-700 ring-1 ring-[#E6EEFF]">
            <div className="text-[11px] text-slate-500">전체</div>
            <div className="mt-0.5 text-base">{total}</div>
          </div>
          <div className="min-w-[64px] rounded-2xl bg-[#F6FFFA] px-3 py-2 text-slate-700 ring-1 ring-[#E7F7F0]">
            <div className="text-[11px] text-slate-500">진행중</div>
            <div className="mt-0.5 text-base">{activeCount}</div>
          </div>
          <div className="min-w-[64px] rounded-2xl bg-[#FFF7FB] px-3 py-2 text-slate-700 ring-1 ring-[#FFE6F1]">
            <div className="text-[11px] text-slate-500">완료</div>
            <div className="mt-0.5 text-base">{doneCount}</div>
          </div>
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">진행률</span>
          <span className="font-semibold text-slate-800">{progress}%</span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-[#EEF2FF] ring-1 ring-[#E5E9FF]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #FFB8D2 0%, #C9C6FF 50%, #A7D8FF 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
