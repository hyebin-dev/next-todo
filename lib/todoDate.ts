// due_date 문자열을 "YYYY-MM-DD" 형태로 통일해서 반환
// - null/undefined/빈값이면 null
// - "2025-11-29T00:00:00.000Z"이면 앞 10자리만
export const normalizeDueStr = (s?: string | null) => {
  if (!s) return null;
  if (s.includes("T")) return s.slice(0, 10);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

// 날짜를 00:00(자정) 기준으로 맞춘 새 Date 반환
// - 비교/차이 계산할 때 시간 영향 제거용
const toMidnight = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// "YYYY-MM-DD" 문자열을 해당 날짜 자정 Date로 파싱
const parseDue = (s: string) => new Date(`${s}T00:00:00`);

// 오늘 기준으로 dueStr이 며칠 남았는지 계산
// - 양수: 남은 일수, 0: 오늘, 음수: 지난 날짜
const diffDaysFromToday = (dueStr: string) => {
  const today = toMidnight(new Date());
  const due = toMidnight(parseDue(dueStr));
  const ms = due.getTime() - today.getTime();
  return Math.ceil(ms / 86400000);
};

// "YYYY-MM-DD" → "YY.MM.DD" 형태로 줄여서 표시
const formatShortYYMMDD = (dueStr: string) => {
  const [y, m, d] = dueStr.split("-");
  return `${y.slice(2)}.${m}.${d}`;
};

// todo의 due_date/is_done을 기준으로 기한 배지 텍스트 생성
// 규칙:
// 1) due_date 없음 → "기한 없음"
// 2) (미완료 & 기한 지남) → "기한 지남"
// 3) 0~7일 남음 → "D-n"
// 4) 7일 초과 남음 → "YY.MM.DD"
export const dueBadgeText = (todo: {
  due_date: string | null;
  is_done: 0 | 1;
}) => {
  const d = normalizeDueStr(todo.due_date);
  if (!d) return "기한 없음";

  const today = toMidnight(new Date());
  const due = toMidnight(parseDue(d));

  if (!todo.is_done && due < today) return "기한 지남";

  const diff = diffDaysFromToday(d);
  if (diff >= 0 && diff <= 7) return `D-${diff}`;

  return formatShortYYMMDD(d);
};

// 미완료(is_done=0)인데 기한이 지난 todo인지 여부
export const isOverdue = (todo: {
  due_date: string | null;
  is_done: 0 | 1;
}) => {
  const d = normalizeDueStr(todo.due_date);
  if (!d) return false;
  const today = toMidnight(new Date());
  const due = toMidnight(parseDue(d));
  return !todo.is_done && due < today;
};

// "YYYY-MM-DD"의 요일을 한글로 반환
export const weekdayKo = (dateStr: string) => {
  const d = parseDue(dateStr);
  const w = d.getDay();
  return ["일", "월", "화", "수", "목", "금", "토"][w];
};

// dateStr이 오늘인지 여부
export const isToday = (dateStr: string) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  return dateStr === todayStr;
};
