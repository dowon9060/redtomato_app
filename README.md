# 빨간토마토피자 포장 주문 앱

홈페이지(빨간토마토피자) 메뉴·지점·가격·이미지를 기준으로 만든 포장 주문 앱입니다.

## 구성

| 경로 | 설명 |
|---|---|
| `mobile/` | Expo React Native 클라이언트 |
| `backend-cf/` | Cloudflare Workers + Hono + D1 API |

## 화면

- 홈: 현재 위치 / 닉네임, 배너 5장 캐러셀, 메뉴보기·지점보기, 입점 문의
- 메뉴: 카테고리별 목록, 상세(이미지·설명·가격·옵션·장바구니·찜)
- 지점: 한 줄 카드(지점명·연락처·운영시간·영업상태·주소) → 지점 메뉴
- 하단 탭: 홈 / 내주문 / 찜 / 프로필
- 주문 상태: 주문 완료 → 접수 완료 → 조리중 → 조리 완료 → 픽업완료
- 찜: 지점 / 메뉴 탭
- 프로필: 이름·연락처·닉네임·포인트

## 실행

Node.js 22+ 권장 (로컬에 24 사용 가능).

### 1) API

```bash
cd backend-cf
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

기본 주소: `http://127.0.0.1:8787`

### 2) 앱

```bash
cd mobile
npm install
npx expo start
```

시뮬레이터/실기기에서 API 주소가 다르면:

```bash
EXPO_PUBLIC_API_URL=http://<LAN-IP>:8787 npx expo start
```

### 데모 로그인

- 이름: 홍길동
- 닉네임: 토마토러버
- 연락처: 01012345678

시드에 동일 계정이 들어 있습니다.

### 관리자(주문 상태 변경)

```bash
curl -X PATCH http://127.0.0.1:8787/admin/orders/<ORDER_ID>/status \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: redtomato-admin-dev" \
  -d '{"status":"accepted"}'
```

상태 값: `ordered` | `accepted` | `cooking` | `ready` | `picked_up` | `cancelled`

## 데이터 출처

- 메뉴명·가격·이미지: `/Users/do1/Desktop/do1/redtomato` 홈페이지 데이터
- 지점 목록: 홈페이지 매장 정보
- 가격 규칙: 홈페이지와 동일하게 천 원 단위 + 2,000원 반영
