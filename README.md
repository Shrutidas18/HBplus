# HB+ Portal: Google Sign-In with Domain Restriction

A cross-platform app (Android, iOS and Web from **one codebase**) where users sign in with Google and only accounts from an allowed email domain (default `@hbplus.fit`) get in.

- **Live demo:** `<add your Netlify URL here>`
- **Allowed domain:** configurable via an environment variable (see [Configuration](#configuration))

## Features

- Google Sign-In (OAuth 2.0) on web and mobile
- Email-domain validation, with the exact error message required:
  *"Access restricted. Please login using your official domain email."*
- Protected Dashboard: it cannot be reached by URL without a verified login
- Logout, loading states and error handling
- Responsive, minimal UI (split layout on wide screens, single column on phones)
- **Bonus:** role-based access (Admin / User), user profiles stored in Firestore, admin-only user list

## Tech stack

| Layer | Technology |
|---|---|
| UI (mobile + web) | React Native + React Native for Web |
| Backend | Node.js (Netlify Functions, REST) |
| Auth | Google OAuth 2.0 through Firebase Authentication |
| Database | Firebase Firestore |
| Version control | Git / GitHub |
| Deployment | Netlify |

Tooling note: React Native for Web needs a bundler. This project uses **Expo's** toolchain (Metro) for that, so a single command builds for Android, iOS and web. Application code is plain React Native components in JavaScript.

## Project structure

```
.
├── App.js                      # providers + navigator
├── index.js                    # app entry
├── shared/domain.js            # domain validation, used by BOTH app and server
├── src/
│   ├── config/                 # env.js (config), firebase.js (SDK init)
│   ├── context/AuthContext.js  # auth state: user, role, loading, error, signIn/out
│   ├── hooks/                  # useGoogleSignIn.web.js / .native.js (per platform)
│   ├── navigation/             # AppNavigator.js (route protection)
│   ├── screens/                # LoginScreen, DashboardScreen
│   ├── components/             # GoogleButton, Loader, ErrorBanner, Avatar, RoleBadge, AdminUsersPanel
│   ├── services/api.js         # REST calls to /api/*
│   └── theme.js                # colours, spacing
├── server/                     # firebase-admin init + token/domain verification
├── netlify/functions/          # me.js (profile + role), users.js (admin only)
├── firestore.rules             # database security rules
├── tests/domain.test.js        # unit tests for the domain logic
├── netlify.toml                # build, redirects, headers
└── .env.example                # every variable explained
```

## Authentication flow

```
 User taps "Login with Google"
          │
          ▼
 Google OAuth 2.0 (popup on web, expo-auth-session on mobile)
          │  Google ID token
          ▼
 Firebase Authentication creates the session
          │
          ▼
 [Check 1] client: email verified AND domain allowed?
          │ no ──► sign out + "Access restricted. Please login using your official domain email."
          ▼ yes
 [Check 2] server: POST /api/me with the Firebase ID token
          │   verifies signature, Google provider, verified email, domain
          │   creates/updates users/{uid} in Firestore, returns { role }
          │ 403 ──► sign out + same error message
          ▼ ok
 Dashboard (role = Admin or User)
```

Loading is shown the whole time (button spinner, plus a full-screen loader while a saved session is restored on startup).

## How the domain restriction works

The restriction is enforced in **three layers**, because a check that only exists in the browser can be bypassed:

1. **Account-picker hint (UX only).** The web sign-in passes Google's `hd` parameter so the picker favours the company domain. This is a hint, not security.
2. **Client check.** After sign-in, `isAllowedEmail()` in `shared/domain.js` checks that the email has exactly one `@` and that the part after it **equals** the allowed domain, case-insensitively. (It compares the whole domain rather than using a bare `endsWith("hbplus.fit")`, which would wrongly accept `me@evilhbplus.fit`.) It also requires `emailVerified`. On failure the user is signed out immediately and shown the error.
3. **Server enforcement (the real boundary).** The Netlify Functions verify the Firebase ID token with `firebase-admin` and re-run the same `isAllowedEmail()` on the **verified token's** email. A modified client cannot get a profile, a role or any data. Firestore rules (`firestore.rules`) also deny access to non-domain users and forbid all client writes.

The logic has unit tests: `npm test`.

## Role-based access

- First sign-in creates `users/{uid}` with role `user`.
- Emails listed in `ADMIN_EMAILS` become `admin`. You can also edit the `role` field in the Firestore console.
- Roles are written **only by the server**. Firestore rules block client writes, so a user cannot promote themselves.
- The admin-only user list (`/api/users`) checks the caller's role **on the server** and returns 403 otherwise. Hiding the panel in the UI is only a convenience.

## Protected routes

`src/navigation/AppNavigator.js` registers screens **conditionally**: while logged out, only `Login` exists in the navigator; once verified, only `Dashboard` does. Opening `/dashboard` directly while logged out therefore cannot render the dashboard and falls back to the login screen. A saved session is restored before the first screen renders, so a logged-in user refreshing the page is not bounced to login.

## Token handling

- Tokens are managed by the Firebase SDK (IndexedDB on web, AsyncStorage on mobile) and refreshed automatically. The app never stores tokens itself.
- The ID token is sent only in the `Authorization: Bearer` header, over HTTPS, to the app's own API.
- The server verifies the token signature on every request and never trusts claims sent by the client.
- Secrets (the Firebase service account) live only in Netlify environment variables. Only `EXPO_PUBLIC_*` values, which are public by design, reach the client bundle.

## Setup

### 1. Prerequisites

Node.js 20+, a Google account, and (optional) the Android Studio / Xcode emulator for mobile.

### 2. Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method →** enable **Google**.
3. **Authentication → Settings → Authorized domains →** add `localhost` and, later, your Netlify domain.
4. **Firestore Database →** create a database, then paste `firestore.rules` into the Rules tab and publish.
5. **Project settings → Your apps →** add a **Web app** and copy its config values.
6. **Project settings → Service accounts → Generate new private key** (used by the Netlify Functions only; never commit it).

### 3. Install and configure

```bash
git clone <this-repo>
cd hbplus-auth
cp .env.example .env     # fill in the values
npm run setup            # npm install + aligns every package to the right Expo SDK version
```

Commit the generated `package-lock.json` so installs are reproducible.

### 4. Run on the web

```bash
npm run web
```

The sign-in flow works with only the client variables. To also exercise the server layer locally (profile, roles, admin list), run the app together with the functions:

```bash
npm install -g netlify-cli
netlify dev
```

(`netlify dev` uses the server variables from `.env`.) For quick UI-only work without functions, set `EXPO_PUBLIC_REQUIRE_API=false`. Never set it in production.

### 5. Run on mobile (Android / iOS)

1. In **Google Cloud Console → APIs & Services → Credentials** (same project as Firebase), create OAuth client IDs of type **Android** (package `com.example.hbplusauth` + your SHA-1) and **iOS** (bundle id `com.example.hbplusauth`). Change both IDs in `app.json` to your own first. The auto-created **Web** client ID is also needed.
2. Put the three IDs in `.env` and set `EXPO_PUBLIC_API_BASE_URL` to your deployed Netlify URL so the app can reach `/api/*`.
3. Google sign-in redirects need the custom scheme from `app.json`, so use a development build rather than Expo Go:

```bash
npx expo run:android     # or: npx expo run:ios
```

### Testing the restriction without an `@hbplus.fit` account

Set `EXPO_PUBLIC_ALLOWED_DOMAIN` and `ALLOWED_DOMAIN` to a domain you can sign in with (for example `gmail.com`), try an account on a different domain to see the error, then switch both back to `hbplus.fit` before submitting. Also update the regex in `firestore.rules` if you changed the domain.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `EXPO_PUBLIC_ALLOWED_DOMAIN` | client | domain(s) allowed in the UI check |
| `ALLOWED_DOMAIN` | server | domain(s) allowed in the API check (keep equal to the one above) |
| `ADMIN_EMAILS` | server | emails that receive the admin role |
| `FIREBASE_*` | server | service-account credentials for firebase-admin |
| `EXPO_PUBLIC_FIREBASE_*` | client | Firebase web config |
| `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | client | mobile OAuth client IDs |
| `EXPO_PUBLIC_API_BASE_URL` | client | API origin for mobile builds |

See `.env.example` for details.

## Deployment (Netlify)

1. Push the repo to GitHub.
2. In Netlify: **Add new site → Import from Git**. The build settings come from `netlify.toml` (`npm run build:web`, publish `dist`, functions in `netlify/functions`).
3. In **Site configuration → Environment variables**, add every variable from `.env.example` (both client and server).
4. Deploy, then add the Netlify domain to **Firebase → Authentication → Authorized domains**. Without this, sign-in fails with `auth/unauthorized-domain`.

## Manual test checklist

| Scenario | Expected |
|---|---|
| Sign in with `name@hbplus.fit` | Dashboard shows name, email, role |
| Sign in with `name@gmail.com` | Error: "Access restricted. Please login using your official domain email." and no dashboard |
| Open `/dashboard` while logged out | Login screen |
| Refresh the page while logged in | Stays on the dashboard |
| Logout | Back to login; `/dashboard` is no longer reachable |
| Admin account | "Team members" panel with the user list |
| Normal account calls `/api/users` | 403 |

## Troubleshooting

- **`auth/unauthorized-domain`**: add your site's domain to Firebase authorized domains.
- **`auth/popup-blocked`**: allow popups for the site.
- **"Unable to verify your account right now"**: the `/api/me` function failed. Check the `FIREBASE_*` variables on Netlify and the function logs.
- **Mobile: "not configured"**: the OAuth client ID for that platform is missing in `.env`.
- **"Component auth has not been registered yet" (native)**: uncomment the line in `metro.config.js`.

## Known limitations

- The domain appears in `firestore.rules` as a literal, so changing the domain also means editing and re-publishing the rules.
- Mobile sign-in requires a development build and platform-specific OAuth client IDs.
- Session revocation is not checked on every API call (tokens expire after about an hour); add `verifyIdToken(token, true)` if you need immediate revocation.
