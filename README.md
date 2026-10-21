# Todo Tutorial

[Claude Code Playbook](https://docs.claude-hunt.com) 강의의 실습용 저장소입니다. Next.js 와 shadcn/ui 로 시작하는 작은 Todo 앱을 단계별로 발전시키며 Claude Code 사용법을 익힙니다.

## 관련 링크

- 강의 본문: https://docs.claude-hunt.com
- 수강생 결과물 공유: https://claude-hunt.com

## 주요 기능

- 할 일 추가 · 완료 표시 · 삭제
- 더블클릭으로 텍스트 편집 (Enter 확정, Esc 취소, 빈 값으로 확정하면 삭제)
- 우선순위(높음 · 보통 · 낮음), 카테고리(업무 · 개인 · 쇼핑), 마감일 지정
- 상태 필터(전체 · 진행중 · 완료), 카테고리 필터, 텍스트 검색
- 정렬(생성일순 · 이름순 · 마감일순)
- `d` 키로 다크 모드 전환
- 데이터는 브라우저 `localStorage`(`todos` 키)에 저장되며 별도 서버나 DB가 없습니다

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- shadcn/ui (radix-maia 스타일, taupe 베이스)
- TypeScript / ESLint / Prettier
- 패키지 매니저: bun 1.3.6

## 시작하기

사전 준비: [bun](https://bun.sh) 이 설치되어 있어야 합니다.

```bash
git clone https://github.com/iori2395/todo-tutorial.git
cd todo-tutorial
bun install
bun dev
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000) 에서 열립니다.

자주 쓰는 스크립트:

```bash
bun dev             # 개발 서버 실행
bun run build       # 프로덕션 빌드
bun run start       # 빌드 결과 실행
bun run test        # 테스트 1회 실행 (Vitest)
bun run test:watch  # 테스트 감시 모드
bun run lint        # ESLint
bun run typecheck   # tsc --noEmit
bun run format      # Prettier 포맷팅
```

> 테스트는 `bun test` 가 아니라 `bun run test` 로 실행합니다. `bun test` 는 bun 내장 테스트 러너를 실행하므로 Vitest 설정(jsdom 등)이 적용되지 않습니다.

## 챕터별 시작 브랜치

각 레슨은 시작 시점의 코드 상태를 브랜치로 제공합니다. 레슨 본문에서 안내하는 브랜치로 전환한 뒤 따라가시면 됩니다.

```shell
git checkout ch02-03
```

## 컴포넌트 추가

shadcn/ui 컴포넌트는 다음과 같이 추가합니다.

```bash
bunx --bun shadcn@latest add button
```

`components/ui` 디렉토리에 컴포넌트가 추가됩니다.

## 컴포넌트 사용

```tsx
import { Button } from "@/components/ui/button";
```

## Contributors

- 토이크레인 - Frontend Developer
