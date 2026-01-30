## API 명세서

다음은 `config/routes.rb`에 정의된 API 엔드포인트 명세서입니다. 이 프로젝트는 인증 없이 동작하도록 설계되어 있습니다.

모든 응답은 기본적으로 JSON을 반환합니다. 서버 시간은 UTC를 사용합니다.

---

### GET /api/health

- 설명: 서비스 상태 확인용 헬스체크
- 요청: 없음
- 응답(200):

```json
{ "status": "ok" }
```

---

### GET /api/me

- 설명: 요청 헤더 `X-USER-ID`에 지정된 사용자 정보를 반환합니다. 이 서비스는 인증 미구현 상태이므로, 클라이언트에서 `X-USER-ID`를 전달해야 합니다.
- 요청 헤더:
  - `X-USER-ID`: (integer) 조회할 사용자 ID (필수)
- 성공 응답(200):

```json
{ "id": 2, "name": "User", "admin": false }
```

- 에러(404): 지정된 `X-USER-ID`의 사용자가 존재하지 않을 때 반환됩니다.

```json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found" } }
```

참고: 인증이 도입되면 `X-USER-ID` 방식은 제거하고 표준 인증(토큰 등)을 사용하세요.

---

### GET /api/users

- 설명: 현재 등록된 사용자 목록을 조회합니다.
- 요청: 없음
- 응답(200):

```json
{
  "users": [
    { "id": 1, "name": "어드민", "admin": true },
    { "id": 2, "name": "베이식", "admin": false }
  ]
}
```

---

### GET /api/membership_plans

- 설명: 사용 가능한 멤버십 플랜 목록을 조회합니다.
- 요청 파라미터: 없음
- 응답(200):

```json
{
  "plans": [
    {
      "id": 1,
      "name": "basic",
      "tier": 1,
      "durationDays": 30,
      "canStudy": true,
      "canChat": false,
      "canAnalyze": false
    },
    {
      "id": 2,
      "name": "premium",
      "tier": 2,
      "durationDays": 60,
      "canStudy": true,
      "canChat": true,
      "canAnalyze": true
    }
  ]
}
```

---

### GET /api/membership/status

- 설명: (현재 사용자 기준) 멤버십 상태를 조회합니다. (예: active, expired, none)
- 요청: 없음
- 응답(200):

```json
{
  "state": "basic",
  "plan": { "id": 1, "name": "basic", "tier": 1 },
  "startedAt": "2026-01-30T13:00:00Z",
  "expiresAt": "2026-02-29T13:00:00Z",
  "canChat": false,
  "canStudy": true,
  "canAnalyze": false
}
```

에러(404): 멤버십이 없는 경우

```json
{
  "state": "none",
  "plan": null,
  "startedAt": null,
  "expiresAt": null,
  "canChat": false,
  "canStudy": false,
  "canAnalyze": false
}
```

참고: 이 API는 서버 시간이 `membership.started_at` 및 `membership.expires_at`을 기준으로 상태를 계산하여 응답합니다.
즉, DB의 별도 `active` 컬럼을 사용하지 않고, 읽을 때마다 현재 시각과 비교하여 `active`/`expired`/`none` 상태를 결정합니다.
만약 멤버십이 만료되었거나 존재하지 않으면 응답에서 `state: "none"`과 `membership: null`을 반환하도록 처리하세요.

---

### POST /api/memberships

- 설명: 사용자에게 멤버십을 생성(구독/업그레이드)합니다.
- 요청 헤더: `Content-Type: application/json`
- 요청 바디(JSON):

```json
{
  "membership_plan_id": 1
}
```

- 성공 응답(201)(created or upgraded):

```json
{
  "membership": {
    "plan": { "id": 2, "name": "premium", "tier": 2 },
    "startedAt": "2026-01-30T13:00:00Z",
    "expiresAt": "2026-03-30T13:00:00Z"
  }
}
```

- 400 (invalid plan)

```json
{
  "error": {
    "code": "INVALID_PLAN",
    "message": "plan must be basic or premium"
  }
}
```

- 409 (already subscribed / downgrade / same plan)

```json
{ "error": { "code": "ALREADY_SUBSCRIBED", "message": "이미 구독중입니다" } }
```

---

### DELETE /api/membership

- 설명: 현재(또는 요청에서 지정된) 사용자의 멤버십을 취소/삭제합니다. (단수 경로 사용)
- 성공 응답(204 No Content): 바디 없음
- 에러 응답(404): 멤버십이 존재하지 않을 때

```json
{ "error": { "code": "NO_MEMBERSHIP", "message": "No membership to cancel" } }
```

---

### POST /api/chat/turn

- 설명: 단일 채팅 턴 처리. audio(음성) 업로드 → STT → LLM → TTS 실행 후 결과 반환.
- 요청 헤더:
- X-USER-ID: 2
- Content-Type: multipart/form-data
- 요청 바디(multipart):
- audio (required): 녹음 파일(Blob). React(MediaRecorder) 기준 `audio/webm;codecs=opus` 포맷을 사용합니다.
- history (optional): JSON string

- curl 예시

```bash
curl -X POST "http://localhost:3000/api/chat/turn" \
  -H "X-USER-ID: 2" \
  -H "Accept: application/json" \
  -F "audio=@./sample.webm" \
  -F 'history=[{"role":"user","content":"안녕"}]'
```

- 응답(200):

```json
{
  "userText": "안녕, 오늘의 공부 플랜을 알려줘",
  "aiText": "좋아! 오늘은 ...",
  "aiAudioBase64": "SUQzBAAAAA..." // mp3 base64
}
```

에러(400): 잘못된 요청 파라미터

```json
{ "errors": { "input_text": ["can't be blank"] } }
```

---

### PATCH /api/admin/users/:id/membership

- 설명: 어드민이 특정 사용자의 멤버십 플랜을 변경합니다.
- 요청 헤더:
  - `X-USER-ID`: (integer) 어드민 사용자 ID (필수)
- 요청 바디(JSON):

```json
{
  "membership_plan_id": 2
}
```

- 성공 응답(200):

```json
{
  "membership": {
    "plan": { "id": 2, "name": "premium", "tier": 2 },
    "startedAt": "2026-01-30T13:00:00Z",
    "expiresAt": "2026-03-30T13:00:00Z"
  }
}
```

- 400 (invalid plan)

```json
{
  "error": {
    "code": "INVALID_PLAN",
    "message": "plan must be basic or premium"
  }
}
```

- 403 (admin only)

```json
{ "error": { "code": "FORBIDDEN", "message": "admin only" } }
```

- 404 (user not found)

```json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found" } }
```

---

## 응답 객체 스키마(간단 요약)

- User

```json
{
  "id": 2,
  "name": "베이식",
  "admin": false
}
```

- MembershipPlan

```json
{
  "id": 1,
  "name": "basic",
  "tier": 1,
  "duration_days": 30,
  "can_study": true,
  "can_chat": false,
  "can_analyze": false
}
```

- Membership

```json
{
  "id": 1,
  "user_id": 2,
  "membership_plan": {
    /* MembershipPlan */
  },
  "started_at": "2026-01-29T17:15:07Z",
  "expires_at": "2026-02-28T17:15:07Z"
}
```

---

## Rails 구현 노트 (for Copilot)

아래는 Rails 코드로 API를 구현할 때 참고할 구현 요약입니다. Copilot 또는 개발자가 컨트롤러/테스트를 빠르게 작성할 수 있도록 구체적으로 적었습니다.

- 라우트
  - `config/routes.rb`에서 `namespace :api do ... end`을 사용하세요. (현재 명세는 /api/\* 경로에 매핑되어 있습니다.)

- ApplicationController / current_user
  - 요청 헤더 `X-USER-ID`를 통해 현재 사용자를 얻습니다(인증 미구현).

```ruby
class ApplicationController < ActionController::API
  private

  def current_user
    uid = request.headers["X-USER-ID"] || "2"
    User.find(uid)
  end
end
```

- Strong params
  - `POST /api/memberships`에서는 `params.require(:plan)` 형태로 파라미터를 처리하도록 안내합니다. 예:

```ruby
def create
  plan_params = params.require(:plan).permit(:id)
  # ...
end
```

- 응답 직렬화 (camelCase)
  - API 응답 키는 camelCase로 반환합니다. 간단한 방법은 컨트롤러에서 수동으로 해시를 만들어 반환하거나, 별도 serializer를 사용하세요.

```ruby
render json: {
  membership: {
    plan: { id: plan.id, name: plan.name, tier: plan.tier },
    startedAt: membership.started_at.iso8601,
    expiresAt: membership.expires_at.iso8601
  }
}
```

- CORS 설정
  - 개발 중 Vite(프론트엔드)를 허용하려면 CORS 설정에 `http://localhost:5173`을 허용하세요. 또한 요청 헤더로 `X-USER-ID`와 `Content-Type`을 허용해야 합니다.

예 (config/initializers/cors.rb):

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '/api/*', headers: %w[Content-Type X-USER-ID], methods: %i[get post patch put delete options]
  end
end
```

- 테스트 요구사항 (request specs)
  - `membership/state`가 `none` / `basic` / `premium`을 올바르게 반환하는지 검증
  - 구독(POST /api/memberships):
    - none -> basic: 성공(201)
    - basic -> basic: 409(ALREADY_SUBSCRIBED)
    - basic -> premium: 성공(업그레이드, 201)
  - chat 엔드포인트: `can_chat` 플래그에 따라 차단/허용
  - X-USER-ID가 없으면 사용자 ID 2로 처리

위 테스트는 `X-USER-ID` 헤더를 사용해 각 사용자(시드된 데이터)를 지정하고 요청을 보낸 뒤 응답 코드를 확인하면 됩니다.
