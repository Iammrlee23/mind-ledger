# 마음 가계부 (Mind Ledger)

인지심리학 원리를 설계에 반영한 입출금 가계부 웹앱입니다.

**라이브 데모: https://iammrlee23.github.io/mind-ledger/** (GitHub Pages, `gh-pages` 브랜치)

| 원리 | 적용 위치 |
|---|---|
| 손실 회피 (Loss Aversion) | "오늘" 탭 — 쓴 돈이 아닌 **남은 돈** 중심 표시, 줄어드는 게이지 |
| 멘탈 어카운팅 (Mental Accounting) | 카테고리별 봉투 예산과 진행바 |
| 마찰 최소화 + 즉각 피드백 | 3초 빠른 입력, 기록 즉시 잔액 변화 배너 |
| 목표 구배 (Goal Gradient) | 저축 목표 진행률 — 70% 이상 구간 가속 메시지 |
| 공정 비교 | 지난달 **같은 날짜까지**와 비교하는 인사이트 |
| 청킹 (Chunking) | 분석 탭 "핵심 한 줄" 요약 |

## 기능

- 지출/수입 빠른 기록 (카테고리 칩, 금액 프리셋 버튼)
- 월 전체 예산 + 카테고리별 봉투 예산
- 월 저축 목표와 진행률
- 내역: 월 단위 원장 (◀ ▶ 월 이동, 수입/지출/순액 요약)
- 분석: 한 줄 인사이트, 6개월 월별 비교, 카테고리 도넛, 최근 14일, 요일별 패턴
- ⚙ 설정: CSV 내보내기/가져오기(추가·전체 교체), 기록 전체 삭제
- 데이터는 브라우저 localStorage에 저장 (서버 없음, 계정 불필요)

## 개발 환경 실행

```bash
npm install
npm run dev        # http://localhost:5173
```

## 빌드

```bash
npm run build      # 결과물: dist/
npm run preview    # 빌드 결과 로컬 확인
```

## 배포

### 1) Vercel (권장, 가장 간단)

1. 이 폴더를 GitHub 저장소로 push
2. https://vercel.com → Add New Project → 저장소 선택
3. Framework Preset: **Vite** (자동 감지) → Deploy

또는 CLI:

```bash
npm i -g vercel
vercel          # 프롬프트 따라 진행, 기본값 그대로 OK
vercel --prod
```

### 2) Netlify

- Build command: `npm run build`
- Publish directory: `dist`

또는 CLI:

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### 3) GitHub Pages (현재 배포 방식)

1. `vite.config.js`에서 `base: "/저장소이름/"` 으로 변경 (현재 `/mind-ledger/` 설정됨)
2. 빌드 후 `dist`를 gh-pages 브랜치로 배포:

```bash
npm run build
npx gh-pages -d dist
```

> **주의 (Windows)**: 프로젝트 경로에 한글이 포함되어 있으면(`0612 계산기` 등)
> Node↔esbuild 프로세스 통신이 액세스 위반으로 크래시하여 `vite build`가 실패합니다.
> ASCII 경로(예: `C:\Users\User\Desktop\mind-ledger-build`)에 소스를 복사한 뒤
> `npm install --ignore-scripts && npm run build` 로 빌드하세요.

## CSV 형식

```
date,type,category,amount,memo
2026-06-01,expense,식비,12000,"점심"
2026-06-25,income,급여,2800000,"월급"
```

- `type`: `expense`/`지출`/`출금`, `income`/`수입`/`입금` 모두 인식
- `category`: 한글 이름 또는 내부 id, 매칭 실패 시 "기타"로 분류
- UTF-8 BOM 포함으로 내보내므로 Excel에서 한글이 깨지지 않습니다

## 구조

```
mind-ledger/
├── index.html              # 엔트리 HTML (manifest, 메타)
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest  # 홈 화면 추가(PWA manifest)
└── src/
    ├── main.jsx            # React 마운트
    ├── storage.js          # localStorage 어댑터 (async 인터페이스)
    └── App.jsx             # 앱 전체 (UI + 로직 + 스타일)
```

## 주의

- 데이터는 **해당 브라우저에만** 저장됩니다. 브라우저 데이터 삭제 시 함께 사라지므로, 주기적으로 ⚙ → CSV 내보내기로 백업하세요.
- 기기 간 동기화가 필요하면 storage.js를 서버 API나 Supabase 등으로 교체하면 됩니다 (인터페이스: async get/set/delete).
