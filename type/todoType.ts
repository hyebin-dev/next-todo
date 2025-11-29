export type Priority = 1 | 2 | 3;

export interface TodoType {
  // PK
  id: number;

  // 할 일 제목(필수)
  title: string;

  // 메모(선택)
  description: string | null;

  // 우선순위: 1(높음) / 2(보통) / 3(낮음)
  priority: Priority;

  // 기한: "YYYY-MM-DD" 또는 null
  due_date: string | null;

  // 수동 정렬용 값
  sort_order: number;

  // 완료 여부: 0(미완료) / 1(완료)
  is_done: 0 | 1;
}