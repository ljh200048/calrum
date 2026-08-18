# Netlify 및 로컬 개발 환경 Firebase 연동 가이드

글결 (Geulgyeol) 프로젝트는 Vite 환경변수(`import.meta.env.VITE_FIREBASE_*`)를 통해 Firebase 설정을 안전하게 관리합니다.

---

## 1. Firebase Console에서 설정값 확인하기

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. 프로젝트를 선택한 후 좌측 상단의 톱니바퀴 아이콘 ➔ **프로젝트 설정 (Project settings)** 으로 이동합니다.
3. **일반 (General)** 탭에서 하단의 **내 앱 (Your apps)** ➔ **웹 앱 (Web apps)** 섹션을 찾습니다.
4. **Firebase SDK snippet** 중 **Config (구성)** 라디오 버튼을 선택하면 다음과 같은 설정 객체를 확인할 수 있습니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## 2. Netlify 배포 환경에 환경변수 등록하기

Netlify 대시보드에서 다음 경로로 이동하여 환경변수를 등록합니다:

1. Netlify 관리자 페이지에서 해당 사이트를 선택합니다.
2. **Site configuration** (또는 Site settings) 메뉴를 클릭합니다.
3. 좌측 메뉴에서 **Environment variables**를 클릭합니다.
4. **Add a variable** (또는 Add multiple variables) 버튼을 클릭하여 아래 6가지 변수를 추가합니다:

| 환경변수 키 (Key) | Firebase Config 매핑 값 | 설명 |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` | Firebase 웹 API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | 인증 도메인 (`*.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Storage 버킷 주소 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | 메시징 발신자 번호 |
| `VITE_FIREBASE_APP_ID` | `appId` | 웹 앱 식별자 ID |

> **선택 사항 (Custom Firestore Database ID를 사용하는 경우):**  
> `VITE_FIREBASE_FIRESTORE_DATABASE_ID`: 기본 DB가 아닌 별도 ID를 지정한 경우에만 설정합니다.

변수를 저장한 후 **Deploys ➔ Trigger deploy ➔ Clear cache and deploy site**를 실행하여 새로 빌드 및 배포합니다.

---

## 3. 로컬 개발 환경 (.env) 설정

로컬 개발 환경에서는 프로젝트 루트에 `.env` 파일을 만들고 설정합니다:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 4. 빌드 및 배포 명령어

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build
```

- Vite 빌드 과정에서 `firebase-applet-config.json` 등 로컬 파일 의존성 없이 표준 환경변수로 정상 번들링됩니다.
- 환경변수가 등록되지 않은 상태에서도 빌드 에러 없이 컴파일되며, 런타임에서 친절한 안내 로그가 출력됩니다.
