// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F6F7FF] via-[#F9FBFF] to-[#FFF7FB] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white/90 p-8 text-center ring-1 ring-slate-100 shadow-[0_14px_30px_-22px_rgba(148,163,184,0.6)] backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Todo-list
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          오늘의 할 일을 정리해보자!
        </p>

        <Link
          href="/todo"
          className="
            mt-7 inline-flex w-full items-center justify-center
            rounded-2xl px-5 py-3 text-sm font-semibold text-black
            bg-[#B9C6FF]
            shadow-md shadow-indigo-200/70
            hover:bg-[#AEBBFF] hover:shadow-lg
            active:bg-[#9EACFF] active:shadow-sm active:translate-y-[1px]
            transition-all duration-150
            cursor-pointer select-none
          "
        >
          Todo 페이지로 이동
        </Link>

        <p className="mt-4 text-xs text-slate-400">
          Next.js + MySQL 기반 Todo 프로젝트
        </p>
      </div>
    </main>
  );
}
