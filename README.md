## 1. 프로젝트 개요

- **프로젝트 유형**: 개인 프로젝트 (수업 실습 확장)
> DB 없이도 바로 실행 가능한 Demo mode를 지원하는 Next.js Todo 리스트 개인 프로젝트입니다.
- **목적**
  - Next.js App Router 구조 이해
  - API Route를 이용한 CRUD 구현
  - MySQL 연동 및 서버–클라이언트 데이터 흐름 학습
  - DB 장애/미연결 상황에서도 앱이 깨지지 않도록 방어 처리

이 프로젝트는 수업 중 진행한 Next.js 실습을 기반으로,  
UI/UX 개선과 기능 확장을 거쳐 **개인 프로젝트 형태로 분리**하여 관리하고 있습니다.

---

## 2. 주요 기능

### Todo 관리
- 할 일 추가 / 삭제
- 완료 여부 토글
- 우선순위(높음/보통/낮음) 설정
- 기한(due date) 설정

### 목록 제어
- 전체 / 진행중 / 완료 필터
- 제목 검색
- 기한 기준 검색
- 정렬 옵션
  - 최신순
  - 기한순
  - 우선순위순
  - 완료 항목 우선 정렬

### 사용자 경험(UX)
- 진행률(%) 시각화
- 로딩 상태 표시
- 데이터가 없을 때 빈 상태 UI 제공

### 안정성
- API 응답이 비정상일 경우에도 런타임 에러 없이 처리
- DB 연결 실패 시 **자동 Demo mode 전환**

---

## 3. Demo Mode / Full Mode

### Demo Mode (DB 없이 실행)
- MySQL이 연결되지 않은 경우 자동 활성화
- 기본 데모 데이터 제공
- 추가 / 완료 / 삭제 동작 가능
- 데이터는 메모리에만 저장됨 (새로고침 시 초기화)

### Full Mode (DB 연동)
- MySQL과 연동된 실제 CRUD
- 데이터 영속성 보장

---

## 4. 기술 스택

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- MySQL
- mysql2

---

## 5. 실행 방법

### 5-1. Quick Start (Demo mode, DB 불필요)

```bash
npm install
npm run dev
````

브라우저에서 아래 주소로 접속합니다.

```
http://localhost:3000/todo
```

> DB가 연결되지 않은 경우 자동으로 **Demo mode**로 실행됩니다.

---

### 5-2. Full Mode (MySQL 연동)

#### 1) 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=reactUser
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=next_todo
```

#### 2) MySQL 준비

* 데이터베이스 생성
* `todos` 테이블 생성

#### 3) 실행

```bash
npm run dev
```

---

## 6. 폴더 구조

```
next-todo/
 ├─ app/
 │   ├─ api/          # Todo API Routes
 │   └─ todo/         # Todo 페이지
 ├─ components/
 │   └─ todo/         # Todo 관련 UI 컴포넌트
 ├─ lib/              # DB 연결 및 유틸
 ├─ type/             # TypeScript 타입 정의
 ├─ public/
 ├─ .env.example
 └─ README.md
```

---

## 7. 트러블슈팅

### DB error / Demo mode 표시됨

* MySQL이 실행 중인지 확인
* `.env.local` 설정 확인
* DB 및 테이블 존재 여부 확인

DB 연결이 되지 않아도 **Demo mode로 앱은 정상 동작**합니다.

---

## 8. 프로젝트를 통해 배운 점

* Next.js App Router 기반의 프로젝트 구조 설계
* API Route를 활용한 서버 로직 구성
* 클라이언트–서버 간 데이터 흐름 이해
* 비정상 상황(DB 장애, API 실패)에서도 UX를 유지하는 방법
* 유지보수 관점에서의 방어적 코딩의 중요성

---

## 9. 참고

이 프로젝트는 학습 목적의 개인 프로젝트이며,
실무 환경을 가정한 구조와 안정성을 고려하여 설계되었습니다.

