# Access Gateway Frontend

React + TypeScript 기반의 통합 기능(서비스) 접근 게이트웨이 프론트엔드입니다.  
사용자는 이 포털을 통해 해당 서비스 선택, 로그인, 클라우드서버 로깅 대시보드, 로그인 승인 요청등 다양한 기능(서비스)을 한 곳에서 이용할 수 있습니다.  

기존 포트폴리오의 인증 시스템을 단순 개선하는 수준을 넘어,  
PostgreSQL + JPA 기반으로 데이터 구조와 인증 아키텍처를 재설계하고  
전체 시스템을 처음부터 재구축한 프로젝트입니다.

---
## 진행중인 작업
2026-04-15~ 게시글 상세화면 수정 및 삭제 화면단 개발 및 API연동

## 완료한 작업
2026-04-11 로그인 승인 요청 게시판 화면단 개발완료
2026-04-12 REST API 호출방식으로 변경(/frm)
2026-04-13 로그인 승인 요청 게시판 새 글 작성 화면단 개발완료
2026-04-14 새 글 작성 시 userId localStorage 연동 (접근권한신청/로그인 성공 시 저장, 로그아웃 후에도 게시판 글 작성 가능하도록 유지)
2026-04-15 게시글 작성일자 날짜 포맷 처리 (백엔드 LocalDateTime → 문자열 변환, formatDate 함수 구현)
2026-04-14 ~ 2026-04-15 로그인 승인 요청 게시판 게시글 조회 API 연동 완료
2026-04-21 승인 요청 게시판(ApprovalBoard) 신청상태 로직 수정 및
           ApprovalBoardDetail(상세화면): UI 완성

## 예정 작업
로그인 성공이력, 실패이력, 승인처리 및 실패처리등을 포함한 관리자화면 개발 예정

---

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | React 18 |
| Language | TypeScript |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| 인증 | JWT (localStorage) + js-cookie |
| 알림 | React Toastify |
| 아이콘 | React Icons |

---

## Project Structure

```
src/
├── assets/           # 전역 CSS 스타일
├── components/       # 재사용 컴포넌트
│   ├── TwoFactorAuth/    # 2FA(TWO FACTOR AUTHENTICATION) 모달
│   ├── joinModal/        # 회원가입/접근권한 모달
│   ├── SelectFnModal/    # 기능선택화면으로 되돌아가는 모달
│   └── dbFileList/       # 로깅대시보드의 DB 파일 목록
├── pages/            # 페이지 컴포넌트
│   ├── Intro.tsx         # 인트로 (랜딩 페이지)
│   ├── frm/              # FRM 관련 페이지
│   │   ├── FrmLogin.tsx      # 로그인
│   │   ├── ChooseFn.tsx      # 기능 선택
│   │   └── FrmFnIntro.tsx    # 기능 인트로
│   ├── dashboard/        # 대시보드
│   │   └── LoggingDashboard.tsx  # 로깅 대시보드
│   └── board/            # 게시판
│       ├── ApprovalBoard.tsx       # 로그인 승인 요청 게시판
│       └── ApprovalBoardWrite.tsx  # 로그인 승인 요청 작성
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

---

## Page Routes

| Path | 설명 |
|------|------|
| `/` | 인트로 (랜딩 페이지) |
| `/frm/FrmLogin` | 로그인 페이지 |
| `/frm/ChooseFn` | 기능 선택 페이지 |
| `/frm/FrmFnIntro` | 기능 소개 페이지 |
| `/dashboard/LoggingDashboard` | 로깅 대시보드 |
| `/board/ApprovalBoard` | 로그인 승인 요청 게시판|
| `/board/ApprovalBoardWrite` | 로그인 승인 요청 게시판에서의 새 글 작성 |

---

## Getting Started

### 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run start

# 프로덕션 빌드
npm run build
```

> 백엔드 API 서버는 기본적으로 `http://localhost:8081`을 바라봅니다. (`package.json` proxy 설정)

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하여 아래 변수를 설정하세요.

```env
#Resources Start
REACT_APP_IMG_PROJECT=
REACT_APP_CSS_PROJECT=
REACT_APP_FONTS_PROJECT=
REACT_APP_JS_PROJECT=

#Request URL
REACT_APP_AUTH_BASE_URL=
REACT_APP_FRM_BASE_URL=
REACT_APP_TWOFA_BASE_URL=
REACT_APP_DBFILE_BASE_URL=
REACT_APP_WS_URL=
```

> `.env` 파일은 `.gitignore`에 추가하여 형상관리에서 제외하는 것을 권장합니다.

---

## Authentication Flow

1. 인트로 페이지 진입 시 `localStorage`의 JWT 토큰 존재 여부를 확인합니다.
2. 토큰이 있으면 로깅 대시보드로 바로 이동합니다.
3. 토큰이 없으면 쿠키의 `fnNo` 값에 따라 적절한 페이지로 라우팅됩니다.
   - `fnNo=1` → 로그인 및 로깅 대시보드
   - `fnNo=2` → 로그인 승인 요청 게시판
   - 그 외 → 기능 선택 페이지
4. 아이디 및 PW입력 후 2FA 인증을 거쳐 해당 서비스에 접근합니다.
   - 프론트엔드는 JWT를 기반으로 인증 상태를 관리합니다.
   - 로그인 시 PREAUTH 토큰을 발급받고, 2FA 인증 완료 후 ACCESS 토큰을 사용합니다.
   - 모든 API 요청은 Axios 인터셉터를 통해 토큰을 자동 포함합니다.

## Key Features

- JWT 기반 인증 상태 관리
- 2FA(이중 인증) 로그인 프로세스 구현
- Axios Interceptor를 통하여 refresh 토큰을 이용한 access토큰 재발급 처리
- 서비스별 접근 분기 (fnNo 기반 라우팅)
- 클라우드 서버 로그 모니터링 대시보드 화면단 개발(경로별 해당 파일 조회 및 웹소켓통신을 통한 모니터링)

---

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file.
