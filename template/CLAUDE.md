# 프로젝트 개발 지침

## 기술 스택
- Next.js (App Router + Turbopack) + React + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (new-york)
- React Hook Form + Zod (폼 검증)
- ethers.js (Web3 지갑 연결)
- next-themes (다크모드)

## 명령어
```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run format       # Prettier 포맷팅
```

## 폴더 구조 규칙
```
src/
├── app/                    # 라우팅 (App Router)
│   ├── layout.tsx          # 루트 레이아웃 (폰트, ThemeProvider, Toaster)
│   ├── page.tsx            # 홈
│   ├── globals.css         # Tailwind + CSS 변수 (라이트/다크)
│   ├── not-found.tsx       # 전역 404
│   └── api/                # API Route Handlers
├── components/
│   ├── ui/                 # shadcn/ui (수정 금지)
│   ├── layout/             # Container, Footer 등 공통 레이아웃
│   ├── providers/          # Context Provider 래퍼
│   └── {도메인}/           # 비즈니스 컴포넌트 (index.ts로 Barrel Export)
├── hooks/                  # 커스텀 훅
├── lib/                    # 유틸리티 & 로직
│   ├── utils.ts            # cn() 함수
│   ├── constants.ts        # 전역 상수 (as const)
│   ├── format.ts           # 포맷 유틸 (날짜, 통화)
│   └── env.ts              # Zod 환경변수 검증
└── types/                  # 타입 정의
```

## 코딩 규칙
- 들여쓰기: 2칸
- 세미콜론: 없음 (Prettier)
- 따옴표: 작은따옴표
- 주석/커밋 메시지: 한국어
- 변수/함수명: 영어 (camelCase), 컴포넌트: PascalCase
- any 타입 사용 금지
- 에러 핸들링 필수
- 각 라우트에 error.tsx + loading.tsx 배치

## 컴포넌트 패턴
- shadcn/ui 컴포넌트는 `components/ui/`에서 관리 (직접 수정 X)
- 비즈니스 컴포넌트는 도메인별 폴더로 분류
- 서버 컴포넌트 기본, 클라이언트 필요 시 'use client' 명시
- window 객체 접근은 반드시 useEffect 내에서 (SSR 방지)
