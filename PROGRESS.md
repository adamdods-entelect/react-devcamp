# Work in progress — cart persistence, ID validation, registration

Handoff notes. Last updated 2026-06-29.

All code below is committed to the working tree and passes `npm run lint`
(run from `my-app/`). Two things still need a human: deploying Firestore rules
and a manual smoke test. See **Pending**.

---

## 1. SA ID number validation — DONE

**What:** the ID field on the registration "About you" step now validates a real
South African ID number (13 digits + valid birth date + Luhn check digit),
not just "13 digits".

- `my-app/src/utils/saId.js` (new) — `isValidSaId(value)`. Luhn + date checks.
- `my-app/src/components/register/AboutYouStep.jsx` — field uses
  `validate: (v) => isValidSaId(v) || 'Enter a valid SA ID number'`.

## 2. ID field validity indicator — DONE

`AboutYouStep.jsx` shows live feedback (`mode: 'onChange'`):
- invalid → red border + message
- valid → green border + ✓
- The shared `Field` component now takes `error` / `valid` props (reusable for
  the name/surname fields too, if wanted later).

## 3. Cart persistence → Firestore (hybrid) — DONE (code), PENDING (rules deploy)

**Why:** the old cart was a single shared `localStorage` key (`'cart'`) with no
owner, so it leaked across users (login → add → logout → guest still saw items).
Milestone 6 only requires same-browser persistence, but we went further for
production realism: a real per-user, cross-device cart using Firestore (Firebase
was already set up for auth/storage/OTP).

**Design — hybrid:**
- Guest (no Firebase session) → `localStorage` key `cart.guest`.
- Logged in → Firestore doc `carts/{uid}`.
- On login → merge guest cart into `carts/{uid}`, then clear the guest key.
- On logout → user's Firestore cart stays; guest view is empty.
- `uid` = Firebase Auth UID. Google users already had a Firebase session; email/
  password users now get one too (see SignInPage change).

**Files:**
- `my-app/src/services/firebase.js` — added `export const db = getFirestore(app)`.
- `my-app/firestore.rules` — added owner-only rule:
  `match /carts/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid }`
- `my-app/src/services/cartLocal.js` (new) — guest localStorage cart (key `cart.guest`).
- `my-app/src/services/cartRemote.js` (new) — Firestore cart (`carts/{uid}`, doc `{ items: [] }`).
- `my-app/src/services/cart.js` — facade; routes to local vs remote by `auth.currentUser`.
  Public API unchanged (`addToCart`, `setQty`, `removeFromCart`, `clearCart`, `subscribe`).
- `my-app/src/hooks/useCart.js` — subscribes via `cart.subscribe`, re-points on auth change.
- `my-app/src/services/cartSync.js` (new) — `initCartSync()` merges guest→user on
  `onAuthStateChanged`.
- `my-app/src/main.jsx` — calls `initCartSync()` at startup.
- `my-app/src/pages/SignInPage.jsx` — after backend login, also
  `signInWithEmailAndPassword(auth, email, password).catch(() => {})` so password
  users get a Firebase session (account already exists from registration).

**Consumers unchanged:** `PriceBar`, `CartPage`, nav badges — the facade kept the
same signatures, so no edits needed there for the Firestore swap.

## 4. Move create-account gate from add-to-cart → checkout — DONE

**Why:** old code blocked guests at *add to cart* (a popup), which made the guest
cart above unreachable and contradicted the handbook ("logged in to *complete the
process*" = checkout, not add-to-cart).

- `my-app/src/components/product/PriceBar.jsx` — guests can now add to cart
  (removed the guest gate + unused `useAuth`/`CreateAccountSheet`).
- `my-app/src/pages/CartPage.jsx` — "Pay now" now gates: guest → CreateAccountSheet,
  logged-in → `/checkout`.

**Resulting flow:** guest adds items (saved in `cart.guest`) → Pay now → create
account / log in → guest cart merges into Firestore → checkout.

---

## Pending / next up

### Must do (human-only)
- [ ] **Deploy Firestore rules:** `cd my-app && firebase deploy --only firestore:rules`
      Until this runs, the live rules deny all client access and cart writes fail.
- [ ] **Smoke test:** guest add → login (merge) → reload (persists) → logout
      (guest empty) → login on a 2nd browser (cart follows = cross-device works).

### Designed, NOT yet built — choose account type on register
Let the user pick their **customer type** (INDIVIDUAL / SOLE PROP / NON-PROFIT /
CIPC) during registration. Decided to fold it into the **About you** step (no new
step needed).

Key finding: `GET /client/v1/types` is **unauthenticated** (`security: []`) and
returns `{ customerTypes: [{id,name,description}], accountTypes: [...] }`. So the
UI can fetch real type IDs before login — no hardcoding. (Note: `registration.js`
currently hardcodes `CUSTOMER_TYPE_INDIVIDUAL = 1`, which isn't guaranteed correct
since IDs are backend-configured.)

Implementation (in `AboutYouStep.jsx`):
1. `useEffect` → `fetch('/client/v1/types')` → `setTypes(d.customerTypes)`.
2. `<select {...register('customerTypeId', { required: true })}>` of the types.
3. `submit = (v) => onNext({ ...v, customerTypeId: Number(v.customerTypeId) })`.
4. `RegisterPage.handleSubmit` → pass `customerTypeId: all.customerTypeId` to
   `registerCustomer` (it already accepts the param; stop relying on the default).

Required field means the existing `disabled={!isValid}` Next button blocks until a
type is chosen. Works for the Google flow too (it renders the About step).

Open question: enabling non-INDIVIDUAL types unlocks products gated to those types
(BRS §13.4 eligibility). Confirm that's wanted vs. INDIVIDUAL-only-for-now.

### Optional hardening / cleanup
- [ ] `cartRemote.js` mutations do read-then-write — wrap in `runTransaction` to
      avoid lost updates on rapid concurrent clicks (devcamp-fine as-is).
- [ ] Remove leftover `brs.txt` / `handbook.txt` from repo root (extracted from the
      PDFs to read requirements; git already tracked them as deleted before).

---

## Reference (from the BRS / handbook PDFs in repo root)
- **Milestone 6** = Add to Cart + Data Persistence. Cart items must survive closing/
  reopening the site (localStorage-level). Checkout (US8 Generate Contract) requires
  login + KYC/DHA/fraud/credit checks.
- **Customer types** (BRS §13.4): a customer is exactly one of INDIVIDUAL / SOLE PROP /
  NON-PROFIT / CIPC, and the type gates which products they can take up.
- Backend has **no cart endpoint** — that's why the cart lives in localStorage/Firestore,
  not the devcamp services.
