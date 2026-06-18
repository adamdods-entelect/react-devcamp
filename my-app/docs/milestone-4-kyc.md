# Milestone 4 — Know Your Customer (KYC) & Document Storage

## 1. Goal

Milestone 4 implements the **user-facing KYC flow**: the customer submits two
identity documents — a **proof of residence** and a **selfie** — each via either
the **device camera** or a **file/photo upload**, and the captured files are
**stored in Firebase Storage**.

> **Handbook deliverable**
> *"Implement the KYC flow where the user must upload proof of residence and a
> selfie. Allow the user to take a photo or select a file."* and *"Use Firebase
> to store the uploaded documents."*

### Scope: how this relates to BRS US7 ("Do Customer Checks")

US7 in the Business Requirement Specification is much broader than this milestone.
The BRS (FR7, SR7–SR11) describes a **backend / fulfilment** responsibility:

- an asynchronous request queue + processor (RabbitMQ),
- fulfilment **types A / B / C** that decide which checks run, and
- integrations into the **KYC, DHA, Fraud, and Credit Check** services.

All of those are **system-to-system backend integrations** performed by the
*Fulfilment System* — **not** the React frontend. The React Handbook deliberately
carves out only the **user-facing slice** of US7 for Milestone 4: *collect the KYC
documents from the user and store them*. The automated checks, fulfilment types,
and service calls are out of scope for the frontend.

| US7 element (BRS)                                   | In React M4? | Owner               |
| --------------------------------------------------- | ------------ | ------------------- |
| Collect proof-of-residence + selfie (camera/file)   | ✅ Yes        | This milestone      |
| Store the documents                                 | ✅ Yes        | This milestone      |
| KYC / DHA / Fraud / Credit service integrations     | ❌ No         | Backend / Fulfilment |
| Fulfilment types A/B/C, RabbitMQ queue              | ❌ No         | Backend / Fulfilment |

> Note: the BRS stores documents as Base64 in the Customer Information Store
> (8.6.8). The Handbook intentionally simplifies this for the frontend camp by
> using **Firebase Storage** instead, which is what we did.

---

## 2. The user flow

```
/kyc  (hub)
 ├─ "Proof of residence" card ──► Upload options sheet (3 options)
 │        ├─ Take photo with camera ─► CameraCaptureFlow (rect, back cam) ─► review ─► upload
 │        ├─ Upload photo            ─► PhotoUploadFlow (image/*)          ─► review ─► upload
 │        └─ Upload document         ─► PhotoUploadFlow (pdf + image)      ─► review ─► upload
 │
 └─ "Selfie upload" card ─────────► Upload options sheet (2 options)
          ├─ Take photo with camera ─► CameraCaptureFlow (oval, front cam) ─► review ─► upload
          └─ Upload photo            ─► PhotoUploadFlow (image/*)           ─► review ─► upload
```

Each card reflects its **upload status**: `idle` (chevron) → `uploading`
(spinner) → `done` (green card + check) or `error` (red, tap to retry).

---

## 3. Files added / changed

| File                                      | Purpose                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `.env.local`                              | Firebase web config, read via Vite `import.meta.env` (gitignored)       |
| `src/services/firebase.js`                | Initializes Firebase, exports the `storage` instance                    |
| `src/services/kycStorage.js`              | `uploadKycDocument(docType, file)` → uploads to Storage, returns URL     |
| `src/pages/KycPage.jsx`                   | The hub screen + orchestration of sheets, camera, upload, status        |
| `src/components/UploadOptionsSheet.jsx`   | Bottom sheet: "Take photo" / "Upload photo" / (optional) "Upload document" |
| `src/components/CameraCaptureFlow.jsx`    | Configurable camera flow (oval/rect) using `react-webcam`               |
| `src/components/PhotoUploadFlow.jsx`      | File-picker flow with prep + revieSow                                     |
| `src/components/PrepSheet.jsx`            | Shared "Prep for your photo/selfie" instructions sheet                  |
| `src/App.jsx`                             | Added the `/kyc` route                                                   |

Dependencies added: **`firebase`** and **`react-webcam`**.

---

## 4. Firebase setup (the "storage" half)

1. Created a Firebase project and enabled **Storage**, then registered a Web app
   to obtain the config keys.
2. Config values live in **`.env.local`** (Vite only exposes `VITE_`-prefixed
   variables to the client). Keeping them in env vars — rather than hard-coded —
   keeps secrets out of source control and sets up the per-environment builds
   needed in Milestone 8.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`src/services/firebase.js` owns the single Firebase connection:

```js
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
```

---

## 5. The upload service

`src/services/kycStorage.js` isolates all Firebase Storage logic, matching the
existing `productService.js` pattern (pages never import Firebase directly):

```js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadKycDocument(docType, file) {
  const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `kyc/${docType}/${Date.now()}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

Files are grouped by document type, e.g. `kyc/selfie/<timestamp>.jpg` and
`kyc/residence/<timestamp>.png`. The returned download URL is not persisted in M4
(it becomes relevant in Milestone 5, when registering the customer with document
references).

---

## 6. The components

### `KycPage.jsx` — hub + orchestrator

Owns **all** state and decides which overlay is showing. A `DOCS` config map
drives both documents from one set of components:

```js
const DOCS = {
  residence: { label: 'Proof of residence', allowDocument: true,  camera: { shape: 'rect', facingMode: 'environment', noun: 'photo',  prep: {...} } },
  selfie:    { label: 'Selfie',             allowDocument: false, camera: { shape: 'oval', facingMode: 'user', mirrored: true, noun: 'selfie', frameCaption: ..., reviewTitle: ..., prep: {...} } },
}
```

State:

| State        | Meaning                                                          |
| ------------ | ---------------------------------------------------------------- |
| `status`     | per-document upload status: `idle \| uploading \| done \| error` |
| `sheetDoc`   | which document's options sheet is open                           |
| `cameraDoc`  | which document's camera is open                                  |
| `upload`     | `{ doc, accept, noun }` for the active file-upload flow          |

When a capture/upload submits, `startUpload(doc, file)` sets the card to
`uploading`, calls `uploadKycDocument`, then sets `done` (or `error`).

### `UploadOptionsSheet.jsx` — bottom sheet

Emits **intents** (`onUseCamera`, `onUploadPhoto`, `onUploadDocument`) rather than
handling files itself. The third "Upload document" row only renders when
`onUploadDocument` is provided (residence only).

### `CameraCaptureFlow.jsx` — configurable camera

One component for both documents, using `react-webcam`. Phases:
`prep → frame → capturing → review`.

- **selfie**: `shape="oval"`, front camera, mirrored, oval face guide, captions.
- **residence**: `shape="rect"`, back camera, full-frame, no oval.

Camera screenshots come back as a data URL, so a small `dataUrlToFile` helper
converts the still into a real `File` before it's handed up.

### `PhotoUploadFlow.jsx` — file picker flow

Phases: `prep → review`. After the prep sheet, it opens a native
`<input type="file">`. Handles non-image files (PDF) by showing a file icon +
filename instead of an `<img>` preview. Includes a "switch to camera" affordance.

### `PrepSheet.jsx` — shared instructions

The "Prep for your selfie / photo" sheet (tips + gradient **Got it**), reused by
both the camera and upload flows.

---

## 7. Key React concepts used

- **Lifting state up** — `KycPage` holds all state; child flows are controlled via
  props/callbacks (`onSubmit`, `onClose`, `onSwitchToCamera`).
- **Conditional rendering** — overlays render based on state
  (`{cameraDoc && <CameraCaptureFlow … />}`).
- **Config-driven components** — a single `DOCS` map + prop-driven components
  instead of separate selfie/residence copies.
- **Service layer** — Firebase logic lives in `services/`, keeping pages clean.
- **Refactor / DRY** — the camera components were merged into one
  `CameraCaptureFlow`, and the duplicated prep sheet + `dataUrlToFile` helper were
  deduplicated.

---

## 8. How to run & verify

```powershell
cd my-app
npm install        # ensures firebase + react-webcam are present
npm run dev
```

1. Open `http://localhost:5173/kyc`.
2. Submit a selfie (camera or upload) and a proof of residence.
3. Watch each card go: spinner → green check.
4. Confirm storage: **Firebase Console → Build → Storage → Files** should show a
   `kyc/` folder with `selfie/<timestamp>.jpg` and `residence/<timestamp>.*`.

> Camera (`getUserMedia`) only works on **localhost or HTTPS**.

### Storage rules (dev)

During development, Storage is in test mode (open writes). For the camp this is
fine; for production these must be locked down:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;   // DEV ONLY — restrict before production
    }
  }
}
```

---

## 9. Status & remaining work

**Done**
- KYC hub screen (matches the wireframes)
- Proof of residence: camera + upload photo + upload document (prep + review)
- Selfie: camera (oval) + upload photo (prep + review)
- Firebase Storage upload with spinner / green / error states
- Component cleanup (merged camera flow, shared `PrepSheet`, deduped helper)

**Remaining / optional**
- **Unit tests** (Jest / React Testing Library) — listed as an M4 resource; none
  written yet.
- The bottom **Submit** button on the hub is currently a placeholder.
- **Entry point**: `/kyc` is standalone and unprotected; it gets wired into the
  registration flow in **Milestone 5**.
- Tighten the Firebase Storage rules before any real deployment.
```
