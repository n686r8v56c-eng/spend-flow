# Spend Flow — Supabase + Cloudflare Pages

로그인/회원가입, 사용자별 데이터 저장, 17개 소비 카테고리, 예산/일정/분석/고정비·세금 탭을 갖춘 Vite React 앱입니다.

## 1. Supabase 설정 (필수)
1. Supabase에서 프로젝트 생성 → SQL Editor → `supabase/schema.sql` 전체 실행.
2. Authentication → Providers → Email을 활성화. 이메일 확인 정책은 프로젝트에서 선택.
3. Project Settings → API에서 **Project URL**과 **publishable key/anon key** 확인. **service_role 키 절대 사용 금지**.
4. Authentication → URL Configuration에서 Site URL과 Redirect URLs에 배포 주소 `https://YOUR-PAGES.pages.dev/**` 등록. 이메일 확인 리디렉션도 확인.

## 2. Codespaces / 로컬 실행
```bash
npm install
cp .env.example .env.local
# .env.local 값에 실제 URL 및 publishable/anon 키를 입력
npm run dev
```

## 3. GitHub → Cloudflare Pages
1. 이 폴더의 파일을 새 GitHub 리포지토리에 push.
2. Cloudflare Pages → Connect to Git → 저장소 선택.
3. Framework preset **Vite** / Build command **npm run build** / Build output directory **dist**.
4. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록.
5. Deploy. 이후 Supabase Auth의 Site URL 및 Redirect URL을 실제 Pages 주소로 설정.

## 주요 동작
- 로그인 전에는 데이터 화면에 접근하지 않음. 이메일 로그인/회원가입.
- `spend_flow_data` 테이블의 `user_id`에 따라 RLS로 사용자별 격리.
- 앱 사용 시 데이터 자동 저장 (약 0.5초 디바운스). 다른 기기에서는 페이지 새로고침 후 최신 데이터 반영.
- 메모는 키워드 기반으로 세부 품목 분류. 영수증 사진은 현재 **텍스트 인식 안 됨**, 사용자가 ChatGPT에서 받은 품목 리스트를 메모에 붙여넣는 사용법 권장.
- 영수증은 현재 JSON payload에 용량 제한(사진 1.7MB 이하)으로 포함됨. 대량/원본 영수증 저장을 위해서는 추후 Supabase Storage 업로드 구조가 권장됨.
- **동시 기기 편집 시 마지막 저장 우선**인 단일 문서 동기화 방식. 멀티 유저 동시 편집이나 세밀한 실시간 충돌 해결이 필요한 경우 개별 테이블 구조로 전환 필요.
- 세금의 실제 연도별 법정 납부일은 앱이 자동 검증하지 않습니다. 사용자가 날짜를 입력하는 방식입니다.

## 보안
- 프런트엔드의 publishable/anon 키 노출은 정상이나, 서비스 역할 키는 절대 넣지 마세요.
- RLS 설정 필수. DB에서 다른 사용자 자료 접근이 차단되도록 구성.
- 민감 정보가 포함된 실제 영수증은 서버 암호화/접근 정책이 갖춰진 Storage 구조로 전환할 것을 권장.

## 상태
React UI/계정 연동 소스와 SQL/배포 구성 제공. 실제 Supabase 프로젝트 연결과 클라우드 배포는 사용자 프로젝트 키/계정 연결 뒤 수행해야 합니다.


## 2026-10-30 UI patch
- 전체 팔레트: 보라/화이트로 변경 (Focus Flow 참고)
- iPhone Safari 입력 자동 확대 방지: input/select/textarea 글씨 16px 이상
- 예산 세부 입력 시 화면 가로 밀림 방지: 카드, 내부 flex, grid 너비 제한
- 기존 Supabase 데이터 구조/저장 동작은 변경하지 않음
