# Ringle Frontend

## 웹페이지 설명 및 주요 기능

- 목적: 영어 자기소개를 음성 기반으로 연습할 수 있는 AI 코칭 서비스
- Home: 학습 진입 카드와 권한별 비활성화 UI 제공
- Chat: 녹음/전송/스트리밍 답변/AI 음성 재생까지 이어지는 대화 경험
- Membership: 멤버십 상태 확인 및 구매, 멤버십마다 다른 권한
- Admin(어드민): 전체 사용자 멤버십 관리 및 변경

## 실행 방법

```bash
yarn
yarn dev
```

환경 변수

- 백엔드 서버를 먼저 실행한 뒤 `.env`에 `VITE_API_BASE_URL`을 설정합니다.
- 로컬 백엔드 사용 시 예: `VITE_API_BASE_URL=http://localhost:3000`

## 설계 및 기술 스택 선정 배경

- **React + TypeScript**: UI 복잡도가 높은 과제에서 컴포넌트 분리와 타입 안정성을 동시에 확보할 수 있었습니다.
- **Vite**: 빠른 HMR과 빌드 성능으로 반복적인 UX 튜닝 사이클을 줄였습니다.
- **styled-components**: 상태 기반 스타일(녹음/재생/에러 등)을 명확하게 표현하고, 컴포넌트 단위로 UI를 캡슐화했습니다.
- **Zustand**: 전역 상태(현재 유저, 권한 등)를 가볍게 관리해 화면 간 동기화를 단순화했습니다.
- **axios**: 공통 인터셉터로 `X-USER-ID` 헤더를 자동 첨부하고 에러 처리를 일관되게 유지했습니다.
- **react-router-dom**: 헤더 네비게이션과 페이지 라우팅을 구조적으로 관리했습니다.
- **Feature 기반 구조**: chat/home/membership 등 도메인 단위로 폴더를 묶어 확장성과 유지보수성을 강화했습니다.
- **SSE 스트리밍 대응**: LLM 응답을 chunk 단위로 파싱해 즉시 렌더링하여 체감 지연을 낮췄습니다.
- **오디오 UX 최적화**: 녹음/재생 상태에 따른 비활성화, 짧은 녹음 검증, 로딩 상태 표시 등 안정적인 음성 흐름을 설계했습니다.
- **에러 메시지 정교화**: 사용자 관점에서 이해 가능한 문구로 전환하고, 상태별로 노출을 제어했습니다.
- **마이크 입력 시간 제한(15초)**:
  - 마이크를 열어두고 많은 요청을 보내는 등의 오남용을 방지하고,
  - 사용자가 마이크 입력을 할 시 음성에서 공백이 많지 않게 제한하는 역할도 수행하며,
  - 입력 음성의 길이가 제한됨에 따라 AI 응답 지연 시간 역시 단축할 수 있습니다.
  - 이는 영어로 자기소개를 연습함에 있어서 실전처럼 연습할 수 있는 효과도 줄 수 있습니다.

## 테스트 및 검증 방법

- 개발 서버 기반 수동 QA와 E2E 테스트를 병행했습니다.
  - 화면 단위 QA: Home/Chat/Membership/Admin 진입 및 전환 흐름 확인
  - 권한 UX: 멤버십 상태에 따른 접근 제한/비활성화 UI 동작 확인
  - 음성 플로우: 녹음 → STT → LLM 스트리밍 → TTS 재생까지 전체 시나리오 점검
  - 스트리밍 UI: SSE chunk 수신 시 텍스트가 자연스럽게 누적되는지 확인
  - 에러 UX: 비영어 입력/짧은 녹음/전송 실패 시 안내 문구 노출 및 복구 동작 확인
  - 스크롤 UX: 메시지 증가 시 자동 스크롤 및 고정 영역 동작 확인
  - 관리자 기능: 멤버십 변경/취소 시 UI 반영 및 서버 응답 처리 확인
- 브라우저 콘솔/네트워크 탭을 활용해 요청/응답 상태, 에러 코드, 스트리밍 데이터 수신 여부를 함께 점검했습니다.
- E2E(Playwright) 스모크 테스트로 헤더 렌더링/네비게이션 전환을 자동 검증했습니다.

## 디렉토리 구조

```
src
  assets/            # Static assets
  constants/         # Shared constant values
  features/          # Domain-driven features
    admin/           # Admin feature
    chat/            # Chat feature (components/hooks/utils)
    home/            # Home feature
    membership/      # Membership feature
    mypage/          # My Page feature
    subscribe/       # Subscribe feature
  mocks/             # Mock data
  pages/             # Route-level pages
  shared/            # Shared, reusable modules
    api/             # API clients
    components/      # Shared UI primitives
    layout/          # App layout + header
    store/           # Global stores
    styles/          # Global styles
    utils/           # Shared utilities
```

- Coding Agent 사용 내역은 docs 폴더 내에 있습니다.
