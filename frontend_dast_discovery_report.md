# Frontend DAST Discovery Report: qb-health-frontend

**Target Application:** `qb-health-frontend` (React 19 / Next.js 16 App Router)  
**Report File:** `frontend_dast_discovery_report.md`  
**Classification Scope:**  
- `APP_CODE`: Application logic living within this repository  
- `CLERK_INTEGRATION`: Application code configuring, wrapping, or integrating Clerk SDK  
- `DELEGATED_TO_CLERK`: Feature/logic not implemented in this repository; owned and rendered by Clerk's hosted dashboard, components, or API endpoints  
- `OUT_OF_SCOPE`: Billing (`/billing`, Paystack integration)  

---

## 1. Architecture Summary (Frontend Only)

`qb-health-frontend` is a Next.js 16 (App Router) client application paired with `@clerk/nextjs` (version `^7.7.4`), `@tanstack/react-query` (`^5.90.21`), and `axios` (`^1.19.0`).

### Authentication & Identity Architecture
1. **Primary Authentication (Clerk):**
   - Initialized at root level in `app/layout.tsx` via `<ClerkProvider>` without inline parameters.
   - Public keys and redirection routes are defined in `.env`:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29ya2FibGUta2l0LTQ1LmNsZXJrLmFjY291bnRzLmRldiQ` (maps to instance `workable-kit-45.clerk.accounts.dev`).
     - Redirect targets: `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`.
   - Middleware protection in `middleware.ts` uses `clerkMiddleware` to guard `/dashboard(.*)` routes and enforce redirects for authenticated users away from landing routes (`/`, `/landing`).
   - Token bridging is implemented in `components/providers/AuthProvider.tsx`: Clerk's `getToken` hook from `@clerk/nextjs` is injected into a custom singleton Axios instance `api` in `lib/api/client.ts`.
   - On every outbound Axios request, `lib/api/client.ts` attaches `Authorization: Bearer <clerk_token>` and `x-tenant-id: <orgId || userId>`.
   - On receiving a 401 response, `lib/api/client.ts` executes a single retry after re-requesting a fresh token via `getToken()`.

2. **Secondary / Legacy Authentication (App-Specific `/login`):**
   - A standalone custom login form exists at `app/(auth)/login/page.tsx`.
   - This form submits credentials directly to the application backend via `authApi.login({ email, password })` (`/api/auth/login`).
   - The returned token is passed to a legacy `login(token, tenantId)` method in `AuthProvider.tsx`, which logs a console warning (`Manual login called while Clerk is active. Use Clerk UI instead.`) and leaves state unchanged.

3. **Account & Profile Management:**
   - There is NO custom profile, security, or password-management page in this codebase.
   - User account operations are delegated to Clerk via the `<UserButton />` component rendered in `components/layout/UserMenu.tsx`. When clicked, Clerk's pre-built modal handles user details, password changes, active session revocation, and sign-out.

4. **External Integrations:**
   - **QuickBooks Online OAuth:** Initiated via `components/connections/ConnectQuickBooks.tsx` (navigating `window.location.href` to backend-provided `authUrl`), with callback handled at Next.js server route `app/api/auth/callback/route.ts`.
   - **Real-time Diagnostics SSE:** Established in `lib/hooks/useDiagnostics.ts` via native `EventSource`.

---

## 2. Findings-to-Files Mapping Table

| Action Point | File(s) | Line(s) | Classification | Related DAST Finding |
|---|---|---|---|---|
| **A. Clerk Provider** | `app/layout.tsx` | 4, 19–25 | `CLERK_INTEGRATION` | Clerk initialization exposure; missing CSP configuration |
| **A. Clerk Env Config** | `.env` | 15–16, 19–22 | `CLERK_INTEGRATION` | Public publishable key exposure; hardcoded redirect defaults |
| **A. Prebuilt `<SignIn/>`** | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | 1, 4 | `CLERK_INTEGRATION` | Third-party auth UI rendering; missing form autocomplete controls in repo |
| **A. Prebuilt `<SignUp/>`** | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | 1, 4 | `CLERK_INTEGRATION` | Third-party signup UI; password policy enforcement delegation |
| **A. `<SignUpButton>` Modals** | `app/(landing)/page.tsx`<br>`app/(landing)/learn/page.tsx` | 258, 281, 687, 774<br>63, 80, 243 | `CLERK_INTEGRATION` | Forced redirection (`forceRedirectUrl="/dashboard"`) |
| **A. `<UserButton/>`** | `components/layout/UserMenu.tsx` | 3, 14–21 | `CLERK_INTEGRATION` | User profile & logout trigger point; minimal appearance styling |
| **A. `<UserProfile/>`** | None (Expected in repo) | N/A | `DELEGATED_TO_CLERK` | Manage Account, Profile, and Security modal UI ownership |
| **A. `@clerk/nextjs` hooks** | `components/providers/AuthProvider.tsx`<br>`lib/hooks/useDiagnostics.ts`<br>`lib/hooks/useConnections.ts`<br>`app/(landing)/disconnect/page.tsx` | 5, 9–10<br>5, 73<br>4, 11, 112, 126, 149<br>6, 17 | `CLERK_INTEGRATION` | Session lifecycle access; token extraction for internal API transport |
| **A. Custom `useAuth` hook** | `lib/hooks/useAuth.ts`<br>`components/providers/AuthProvider.tsx` | 5, 14, 16–22<br>4, 41–53 | `APP_CODE` | Application auth context; stubbed login/logout handlers |
| **A. Custom Clerk API Calls** | None (No calls to `/v1/client/*`) | N/A | `DELEGATED_TO_CLERK` | No direct client calls to Clerk Backend API endpoints |
| **B. Auth Routes: `/sign-in`** | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | 1–5 | `CLERK_INTEGRATION` | Clerk hosted sign-in path |
| **B. Auth Routes: `/sign-up`** | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | 1–5 | `CLERK_INTEGRATION` | Clerk hosted sign-up path |
| **B. Auth Routes: `/forgot-password`, `/reset-password`** | None (Expected routes absent) | N/A | `DELEGATED_TO_CLERK` | Credential recovery hosted entirely by Clerk modal/subdomain |
| **B. Auth Routes: Custom `/login`** | `app/(auth)/login/page.tsx` | 1–111 | `APP_CODE` | Custom credentials endpoint; missing autocomplete attributes |
| **B. Logout Handler** | `components/providers/AuthProvider.tsx`<br>`components/layout/UserMenu.tsx` | 30–32<br>14–21 | `APP_CODE` (stub)<br>`CLERK_INTEGRATION` | Incomplete manual sign-out; sign-out delegated to Clerk `<UserButton/>` |
| **C. `redirect_url` param** | `app/launch/route.ts` | 10–12 | `CLERK_INTEGRATION` / `APP_CODE` | Potential open redirect if query param was variable (hardcoded to `/dashboard`) |
| **C. `redirectUrl` handling** | `app/api/auth/callback/route.ts` | 48–49 | `APP_CODE` | Open redirect vulnerability if backend response `redirectUrl` is unvalidated |
| **C. `forceRedirectUrl`** | `app/(landing)/page.tsx`<br>`app/(landing)/learn/page.tsx` | 258, 281, 687, 774<br>63, 80, 243 | `CLERK_INTEGRATION` | Hardcoded post-signup redirect to `/dashboard` |
| **C. Client-side redirects** | `app/(dashboard)/layout.tsx`<br>`app/(auth)/login/page.tsx`<br>`app/(dashboard)/connections/success/page.tsx`<br>`components/connections/ConnectQuickBooks.tsx` | 33<br>26<br>27<br>26 | `APP_CODE` | Unvalidated external redirection via `window.location.href = response.authUrl` |
| **D. Password Change Form** | None (Absent in repo) | N/A | `DELEGATED_TO_CLERK` | Password modification delegated to Clerk `<UserProfile/>` |
| **D. Current Password Field** | None (Absent in repo) | N/A | `DELEGATED_TO_CLERK` | Current password verification owned by Clerk Security tab |
| **D. Sign out other devices** | None (Absent in repo) | N/A | `DELEGATED_TO_CLERK` | Device revocation owned by Clerk Active Devices UI |
| **D. Password rules / meter** | None (Absent in repo) | N/A | `DELEGATED_TO_CLERK` | Password policy and meter configured in Clerk Dashboard |
| **E. Sensitive Autocomplete** | `app/(auth)/login/page.tsx`<br>`components/ui/input.tsx` | 53–99<br>8–22 | `APP_CODE` | Missing `autoComplete` attributes on custom login form (CWE-524) |
| **E. Clerk Form Autocomplete** | None (Rendered by Clerk SDK) | N/A | `DELEGATED_TO_CLERK` | Third-party input attribute rendering |
| **F. Idle / Inactivity Timer** | None (Absent in repo) | N/A | `DELEGATED_TO_CLERK` | No client-side idle tracking or automatic session expiry |
| **F. Token Refresh / 401 Retry** | `lib/api/client.ts`<br>`components/providers/AuthProvider.tsx` | 46–61<br>20–22 | `APP_CODE` / `CLERK_INTEGRATION` | Client-side 401 interceptor token refresh |
| **G. `document.cookie` writes** | None (No cookie writes in repo) | N/A | `DELEGATED_TO_CLERK` | Cookie security attributes (HttpOnly, Secure, SameSite) owned by Clerk |
| **G. Storage of tokens** | `lib/config.ts`<br>`components/diagnostics/RulesTable.tsx` | 14–17<br>242, 253, 330 | `APP_CODE` | Unused `qbhm_token` config; only non-sensitive UI boolean in localStorage |
| **G. Clerk cookie reading** | None (No reads of `__session`, etc.) | N/A | `DELEGATED_TO_CLERK` | Proprietary Clerk cookies handled inside Clerk SDK |
| **H. Tokens in Query String** | `lib/hooks/useDiagnostics.ts` | 84–88 | `APP_CODE` / `CLERK_INTEGRATION` | **CRITICAL:** JWT token passed in EventSource URL query string (CWE-598) |
| **H. Query Token in OAuth** | `app/api/auth/callback/route.ts` | 6–10 | `APP_CODE` | OAuth authorization code received via URL query parameters |
| **H. Referrer Meta Tags** | None (Absent in repo) | N/A | `APP_CODE` (Absence) | Missing Referrer-Policy meta tag; risks query token leakage in Referer |
| **I. Content-Security-Policy** | None (Absent in layout/config) | N/A | `APP_CODE` (Absence) | Missing CSP header and meta tag (CWE-1021 / CWE-693) |
| **I. Referrer Header / Meta** | None (Absent in layout/config) | N/A | `APP_CODE` (Absence) | Missing Referrer-Policy header/meta tag |
| **I. CSP in `next.config.js`** | `next.config.js` | 1–22 | `APP_CODE` | No `headers()` definition in Next.js configuration |
| **J. Frame-busting JS** | None (Absent in repo) | N/A | `APP_CODE` (Absence) | No legacy frame-busting scripts implemented |
| **J. Iframe Embedding** | `app/(landing)/page.tsx` | 760–767 | `APP_CODE` | Third-party YouTube embed; application itself lacks frame-ancestors |
| **Out of Scope: Billing** | `app/(dashboard)/billing/*`<br>`components/billing/*`<br>`lib/hooks/useSubscription*.ts` | All lines | `OUT_OF_SCOPE` | Paystack payment checkout and verification flows |

---

## 3. Detailed Notes per Action Point (A–J)

### A. Clerk Integration Surface

#### 1. `ClerkProvider` Setup and Publishable Key Usage
- **Classification:** `CLERK_INTEGRATION`
- **Location:** `app/layout.tsx`, Lines 4, 19–25
- **Evidence Snippet:**
  ```tsx
  // app/layout.tsx
  import { ClerkProvider } from '@clerk/nextjs';

  export default function RootLayout({ children }: { children: React.ReactNode; }) {
      return (
          <ClerkProvider>
              <html lang="en">
                  <body className={inter.className}>
                      {children}
                  </body>
              </html>
          </ClerkProvider>
      );
  }
  ```
- **Environment Key:** `.env`, Line 15
  ```env
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29ya2FibGUta2l0LTQ1LmNsZXJrLmFjY291bnRzLmRldiQ
  ```
- **Description:** The `<ClerkProvider>` wraps the root layout. It does not pass explicit props (`publishableKey`, `appearance`, `localization`), relying entirely on default environment variable auto-detection by `@clerk/nextjs`.
- **Related DAST Finding:** Missing explicit CSP/domain restrictions on Clerk initialization; Clerk telemetry and account endpoints permitted globally.

#### 2. `<SignIn/>`, `<SignUp/>`, `<UserProfile/>`, `<UserButton/>`
- **`<SignIn/>`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(auth)/sign-in/[[...sign-in]]/page.tsx`, Lines 1–5
  - **Component / Route:** `Page` (`/sign-in/[[...sign-in]]`)
  - **Snippet:**
    ```tsx
    import { SignIn } from "@clerk/nextjs";
    export default function Page() {
      return <SignIn />;
    }
    ```
- **`<SignUp/>`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(auth)/sign-up/[[...sign-up]]/page.tsx`, Lines 1–5
  - **Component / Route:** `Page` (`/sign-up/[[...sign-up]]`)
  - **Snippet:**
    ```tsx
    import { SignUp } from "@clerk/nextjs";
    export default function Page() {
      return <SignUp />;
    }
    ```
- **`<SignUpButton>` (Modals):**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(landing)/page.tsx` (Lines 258, 281, 687, 774) and `app/(landing)/learn/page.tsx` (Lines 63, 80, 243)
  - **Snippet:**
    ```tsx
    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button ...>Get started</Button>
    </SignUpButton>
    ```
- **`<UserButton/>`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `components/layout/UserMenu.tsx`, Lines 3, 14–21
  - **Component:** `UserMenu` (mounted in `app/(dashboard)/layout.tsx:66`)
  - **Snippet:**
    ```tsx
    import { UserButton } from "@clerk/nextjs";

    export function UserMenu({ user }: { user: any }) {
        return (
            <div className="flex items-center gap-3 px-2 h-10">
                <UserButton 
                    appearance={{
                        elements: {
                            avatarBox: "h-8 w-8 border border-slate-200 shadow-sm",
                            userButtonBox: "hover:bg-slate-50 rounded-lg p-1 transition-all"
                        }
                    }}
                />
    ...
    ```
- **`<UserProfile/>`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `UserProfile`, `<UserProfile`
  - **Directories scanned:** `app/`, `components/`, `lib/`
  - **Classification:** `DELEGATED_TO_CLERK`
  - **Description:** No standalone profile page exists. Profile and security management is accessed strictly through Clerk's modal rendered on clicking `<UserButton />`.

#### 3. Hooks: `useAuth`, `useUser`, `useClerk`, `useSession`
- **`useAuth` (from `@clerk/nextjs`):**
  - **Classification:** `CLERK_INTEGRATION`
  - **Locations:**
    - `components/providers/AuthProvider.tsx`, Lines 5, 10: `const { isLoaded: isAuthLoaded, orgId, userId, getToken } = useClerkAuth();`
    - `lib/hooks/useDiagnostics.ts`, Lines 5, 73: `const { getToken, orgId, userId } = useAuth();`
    - `lib/hooks/useConnections.ts`, Lines 4, 11, 112, 126, 149: `const { isLoaded, isSignedIn } = useAuth();`
    - `app/(landing)/disconnect/page.tsx`, Lines 6, 17: `const { isLoaded, isSignedIn, getToken } = useAuth();`
- **Custom `useAuth` (from `@/lib/hooks/useAuth`):**
  - **Classification:** `APP_CODE`
  - **Locations:** `lib/hooks/useAuth.ts` (Lines 16–22), consumed in `components/connections/ConnectQuickBooks.tsx` (Line 16), `app/(dashboard)/layout.tsx` (Line 28), and `app/(auth)/login/page.tsx` (Line 15).
- **`useUser` (from `@clerk/nextjs`):**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `components/providers/AuthProvider.tsx`, Lines 5, 9, 45–48:
    ```tsx
    const { isLoaded: isUserLoaded, user: clerkUser } = useUser();
    ...
    user: clerkUser ? {
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || ''
    } : null
    ```
- **`useClerk`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `useClerk`, `\buseClerk\b`
  - **Directories scanned:** `app/`, `components/`, `lib/`
- **`useSession`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `useSession`, `\buseSession\b`
  - **Directories scanned:** `app/`, `components/`, `lib/`

#### 4. Clerk Appearance and Localization Config
- **Appearance:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `components/layout/UserMenu.tsx`, Lines 15–20
  - **Snippet:** Sets CSS classes for `avatarBox` and `userButtonBox` only.
- **Localization:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `localization`, `localization=`, `@clerk/localizations`
  - **Directories scanned:** `app/`, `components/`, `lib/`
  - **Description:** Clerk runs with default English language strings; no localization dictionaries are configured.

#### 5. Custom Sign-In / Sign-Up Forms Calling Clerk APIs Directly
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `v1/client`, `/v1/client`, `signIn.create`, `signUp.create`, `clerk.client`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Description:** No client code issues HTTP requests directly to Clerk's Frontend API (`/v1/client/*`). Clerk interactions occur exclusively via standard `@clerk/nextjs` components.

---

### B. Auth Pages and Flows

#### 1. Auth Routes (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/login`)
- **`/sign-in`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(auth)/sign-in/[[...sign-in]]/page.tsx`, Lines 1–6
  - **Snippet:** Catch-all page mounting `<SignIn />`.
- **`/sign-up`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(auth)/sign-up/[[...sign-up]]/page.tsx`, Lines 1–6
  - **Snippet:** Catch-all page mounting `<SignUp />`.
- **`/forgot-password`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `forgot-password`, `forgotPassword`, `/forgot-password`
  - **Directories scanned:** `app/`, `components/`, `lib/`
  - **Classification:** `DELEGATED_TO_CLERK` (Handled via Clerk's `<SignIn />` component links).
- **`/reset-password`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `reset-password`, `resetPassword`, `/reset-password`
  - **Directories scanned:** `app/`, `components/`, `lib/`
  - **Classification:** `DELEGATED_TO_CLERK` (Handled via Clerk's email recovery links).
- **Custom `/login` Route:**
  - **Classification:** `APP_CODE`
  - **Location:** `app/(auth)/login/page.tsx`, Lines 1–111
  - **Component / Route:** `LoginPage` (`/login`)
  - **Snippet:**
    ```tsx
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login({ email, password });
            if (response.success && response.data) {
                login(response.data.token, response.data.tenantId);
                router.push('/dashboard');
            } else {
                setError(response.message || 'Invalid credentials');
            }
        ...
    ```
  - **Description:** Custom username/password form submitting to internal API `/api/auth/login`. Not linked in the application UI (landing pages route users to `/sign-in`).

#### 2. Logout Handler
- **Classification:** `APP_CODE` (stub) & `CLERK_INTEGRATION` / `DELEGATED_TO_CLERK`
- **Location 1 (App Code Stub):** `components/providers/AuthProvider.tsx`, Lines 30–32
  - **Snippet:**
    ```tsx
    const logout = () => {
        console.warn('Manual logout called while Clerk is active. Use Clerk SignOut instead.');
    };
    ```
- **Location 2 (Actual Logout Trigger):** `components/layout/UserMenu.tsx`, Lines 14–21
  - **Snippet:** Rendered inside Clerk's `<UserButton />`. The sign-out action is initiated entirely inside Clerk's popover menu.
- **Related DAST Finding:** Incomplete backend session termination; no token revocation call sent to the application backend on sign-out.

#### 3. Custom Auth API Calls from Client (`/v1/client/*`)
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `v1/client`, `/v1/client`, `client/tokens`
- **Directories scanned:** `app/`, `components/`, `lib/`

---

### C. Redirect Handling

#### 1. URL Parameters & Redirect Config
- **`redirect_url`:**
  - **Classification:** `CLERK_INTEGRATION` / `APP_CODE`
  - **Location:** `app/launch/route.ts`, Lines 10–12
  - **Snippet:**
    ```ts
    const signInUrl = new URL('/sign-in', baseUrl);
    signInUrl.searchParams.set('redirect_url', `${baseUrl}/dashboard`);
    return NextResponse.redirect(signInUrl);
    ```
  - **Description:** Sets `redirect_url` parameter pointing to `/dashboard`.
- **`redirectUrl`:**
  - **Classification:** `APP_CODE`
  - **Location:** `app/api/auth/callback/route.ts`, Lines 48–49
  - **Snippet:**
    ```ts
    const redirectUrl = new URL(result.data?.redirectUrl || result.redirectUrl || '/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
    ```
  - **Related DAST Finding:** Open Redirection vulnerability if the OAuth provider callback response payload contains an untrusted URL.
- **`afterSignInUrl` & `afterSignUpUrl`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `.env`, Lines 21–22
  - **Snippet:**
    ```env
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
    ```
- **`forceRedirectUrl`:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `app/(landing)/page.tsx` (Lines 258, 281, 687, 774) and `app/(landing)/learn/page.tsx` (Lines 63, 80, 243)
  - **Snippet:** `<SignUpButton mode="modal" forceRedirectUrl="/dashboard">`
- **`fallbackRedirectUrl`, `signInFallbackRedirectUrl`, `signUpFallbackRedirectUrl`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `fallbackRedirectUrl`, `signInFallbackRedirectUrl`, `signUpFallbackRedirectUrl`
  - **Directories scanned:** `app/`, `components/`, `lib/`

#### 2. Client-Side Redirect Construction Using Query Params or User Input
- **QuickBooks OAuth Callback Redirects:**
  - **Classification:** `APP_CODE`
  - **Location:** `app/api/auth/callback/route.ts`, Lines 19–21, 52–55
  - **Snippet:**
    ```ts
    if (error) {
        return NextResponse.redirect(
            new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
        );
    }
    ...
    return NextResponse.redirect(
        new URL(`/dashboard?error=authentication_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
    ```
  - **Related DAST Finding:** Reflected query parameter injection in redirect URL.
- **QuickBooks Authorization Initiation:**
  - **Classification:** `APP_CODE`
  - **Location:** `components/connections/ConnectQuickBooks.tsx`, Lines 25–26
  - **Snippet:**
    ```ts
    const response = await connectionsApi.getAuthUrl(tenantId);
    if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
    }
    ```
  - **Related DAST Finding:** Unvalidated external redirect if API payload is tampered with.
- **Client Route Navigation:**
  - `app/(dashboard)/layout.tsx`, Line 33: `router.push('/sign-in')`
  - `app/(dashboard)/connections/success/page.tsx`, Line 27: `router.push('/dashboard')`
  - `app/(auth)/login/page.tsx`, Line 26: `router.push('/dashboard')`

---

### D. Manage Account > Profile > Security
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `changePassword`, `updatePassword`, `currentPassword`, `current-password`, `password`, `signOutOthers`, `devices`, `firstName`, `lastName`, `strength`, `meter`, `UserProfile`, `Manage Account`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Classification:** `DELEGATED_TO_CLERK`
- **Detailed Findings:**
  1. **Password Change Form:** Not implemented in repository. Rendered by Clerk's `<UserProfile />` modal.
  2. **Current-Password Field:** Not implemented in repository. Managed by Clerk's security workflow.
  3. **"Sign out of all other devices" Toggle:** Not implemented in repository. Handled by Clerk's Active Devices session revocation API.
  4. **Email / First Name / Last Name Forms:** Not implemented in repository. Handled by Clerk's Profile tab.
  5. **Password Rules / Strength Meter:** Not implemented in repository. Configured and evaluated by Clerk's backend and rendered within Clerk's modal.

---

### E. Autocomplete on Sensitive Fields

#### 1. Repository-Wide Code Search
- **Search terms used:** `autocomplete`, `autoComplete`, `autocomplete=`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Result:** **0 hits across the entire codebase.** No HTML element in the frontend specifies an `autocomplete` or `autoComplete` attribute.

#### 2. Custom Login Form (`app/(auth)/login/page.tsx`)
- **Classification:** `APP_CODE`
- **Location:** `app/(auth)/login/page.tsx`, Lines 53, 64–74, 79–89
- **Evidence Snippet:**
  ```tsx
  // Line 53: Form element missing autoComplete
  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

  // Lines 64-74: Email input missing autoComplete
  <input
      id="email"
      name="email"
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder="you@company.com"
  />

  // Lines 79-89: Password input missing autoComplete
  <input
      id="password"
      name="password"
      type="password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder="••••••••"
  />
  ```
- **Related DAST Finding:** Missing `autoComplete` on sensitive input fields (CWE-524). Browsers default to caching or predicting credential inputs.

#### 3. Shared Input Component (`components/ui/input.tsx`)
- **Classification:** `APP_CODE`
- **Location:** `components/ui/input.tsx`, Lines 8–22
- **Evidence Snippet:**
  ```tsx
  const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
      return (
        <input
          type={type}
          className={cn("...", className)}
          ref={ref}
          {...props}
        />
      )
    }
  )
  ```
- **Description:** Forwards props without setting default autocomplete behavior.

#### 4. Clerk Forms (`<SignIn/>`, `<SignUp/>`, `<UserProfile/>`)
- **Classification:** `DELEGATED_TO_CLERK`
- **Description:** Autocomplete attributes for Clerk's pre-built forms are rendered client-side by Clerk's external JavaScript bundle.

---

### F. Session / Idle Timeout (Frontend Side)

#### 1. Idle Timer, Visibility Listener, Inactivity Hook
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `idle`, `inactivity`, `visibility`, `visibilitychange`, `idleTimer`, `useIdle`, `addEventListener('visibilitychange'`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Description:** No idle timer or inactivity listener is implemented. (The term `IDLE` in `types/connection.ts` and `SyncStatusCard.tsx` refers exclusively to background QuickBooks synchronization states).

#### 2. Client-Side Logout on Inactivity
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `timeout`, `inactivity`, `signOut`, `logout`
- **Directories scanned:** `app/`, `components/`, `lib/`

#### 3. Session Refresh and Token Handling in Client Code
- **Axios Token Interceptor & 401 Refresh Retry:**
  - **Classification:** `APP_CODE` / `CLERK_INTEGRATION`
  - **Location:** `lib/api/client.ts`, Lines 22–28, 46–61
  - **Evidence Snippet:**
    ```ts
    // Outbound authorization header attachment
    this.client.interceptors.request.use(async (config) => {
        if (this.tokenProvider) {
            const token = await this.tokenProvider();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        if (this.currentTenantId) {
            config.headers['x-tenant-id'] = this.currentTenantId;
        }
        return config;
    });

    // 401 Automatic Refresh Retry
    if (error.response?.status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
        originalRequest._retry = true;
        console.warn('API returned 401. Attempting single token refresh retry...');

        try {
            if (this.tokenProvider) {
                const freshToken = await this.tokenProvider();
                if (freshToken) {
                    originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                    return this.client(originalRequest);
                }
            }
        } catch (retryError) {
            console.error('Token refresh failed on 401 retry', retryError);
        }
    }
    ```
- **Clerk Token Bridge Provider:**
  - **Classification:** `CLERK_INTEGRATION`
  - **Location:** `components/providers/AuthProvider.tsx`, Lines 20–22
  - **Snippet:**
    ```tsx
    // Wire up the token provider
    api.setClerkProvider(getToken, currentTenantId);
    ```
- **Session Expiry Warning UI:**
  - **Classification:** `APP_CODE`
  - **Location:** `app/(dashboard)/dashboard/page.tsx`, Lines 242–250
  - **Snippet:** Renders banner: *"Your authentication session has expired. Please refresh the page to continue."* when 401 errors are captured.

---

### G. Cookies / Storage Touched by the Frontend

#### 1. `document.cookie` Writes
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `document.cookie`, `cookie`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Classification:** `DELEGATED_TO_CLERK`
- **Description:** No frontend code directly reads or writes `document.cookie`. Clerk SDK manages authentication cookies (`__session`, `__client_uat`) directly.

#### 2. Storage of Tokens or Session Data
- **`sessionStorage`:**
  - NO LOGIC FOUND FOR THIS ACTION POINT
  - **Search terms used:** `sessionStorage`
  - **Directories scanned:** `app/`, `components/`, `lib/`
- **`localStorage`:**
  - **Classification:** `APP_CODE`
  - **Location:** `components/diagnostics/RulesTable.tsx`, Lines 242, 253, 330
  - **Evidence Snippet:**
    ```ts
    const saved = localStorage.getItem('qb-health-rules-focus-mode');
    localStorage.setItem('qb-health-rules-focus-mode', String(next));
    localStorage.setItem('qb-health-rules-focus-mode', 'false');
    ```
  - **Description:** `localStorage` is used solely to store a non-sensitive boolean UI display preference (`qb-health-rules-focus-mode`). No session data or tokens are stored.
- **Unused Config Keys:**
  - **Classification:** `APP_CODE`
  - **Location:** `lib/config.ts`, Lines 14–17
  - **Snippet:**
    ```ts
    auth: {
        tokenKey: 'qbhm_token',
        tenantKey: 'qbhm_tenant',
    },
    ```
  - **Description:** Keys declared in configuration object but unused anywhere in the codebase.

#### 3. Reading `_client_uat`, `__session`, `clerk_db_jwt`, `clerk_active_context`
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `_client_uat`, `__session`, `clerk_db_jwt`, `clerk_active_context`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Classification:** `DELEGATED_TO_CLERK`

---

### H. Query-String Token Usage

#### 1. Code Reading or Writing Tokens in URL Query Parameters
- **CRITICAL FINDING: Clerk JWT Transmitted in SSE Query String:**
  - **Classification:** `APP_CODE` / `CLERK_INTEGRATION`
  - **Location:** `lib/hooks/useDiagnostics.ts`, Lines 73–88
  - **Component / Hook:** `useDiagnosticStream`
  - **Evidence Snippet:**
    ```ts
    export function useDiagnosticStream(connectionId: string | null) {
        const queryClient = useQueryClient();
        const { getToken, orgId, userId } = useAuth();
        const tenantId = orgId || userId;
        ...
        const setupEventSource = async () => {
            const token = await getToken({ skipCache: true });
            if (!token) return;

            const url = `${config.api.baseUrl}/diagnostics/stream/${connectionId}?token=${token}&tenantId=${tenantId}`;
            const es = new EventSource(url);
    ```
  - **Description:** Because the standard browser `EventSource` API does not support custom HTTP headers, the client fetches the Clerk session JWT token and appends it directly to the URL query string (`?token=${token}&tenantId=${tenantId}`).
  - **Related DAST Finding:** Information Exposure Through Query Strings in URL (CWE-598 / OWASP A02). Tokens in URLs are logged by intermediate proxies, WAFs, and browser histories.
- **OAuth Authorization Code in Query String:**
  - **Classification:** `APP_CODE`
  - **Location:** `app/api/auth/callback/route.ts`, Lines 6–10
  - **Evidence Snippet:**
    ```ts
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    ```
  - **Related DAST Finding:** OAuth code interception risks if transmitted over insecure transports.

#### 2. Referrer-Policy-Related Meta Tags
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `referrer`, `Referrer-Policy`, `<meta name="referrer"`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Description:** No `<meta name="referrer">` tag exists in `app/layout.tsx`. Outbound `<a>` tags in `components/diagnostics/DetailedRuleMessage.tsx` (Line 354), `components/diagnostics/AuditDrawer.tsx` (Line 137), and `components/dashboard/IssuesTable.tsx` (Line 263) explicitly include `rel="noopener noreferrer"`.
- **Related DAST Finding:** Missing Referrer-Policy; potential leakage of URL query string tokens to external third parties.

---

### I. Client-Side Security Headers / Meta

#### 1. `<meta http-equiv="Content-Security-Policy">`
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `Content-Security-Policy`, `http-equiv="Content-Security-Policy"`, `CSP`
- **Directories scanned:** `app/`, `components/`, `lib/`

#### 2. `<meta name="referrer">`
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `name="referrer"`, `Referrer-Policy`
- **Directories scanned:** `app/`, `components/`, `lib/`

#### 3. Client-Visible CSP Config in `next.config.js`
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `headers`, `Content-Security-Policy`, `CSP`, `X-Frame-Options`
- **Files scanned:** `next.config.js`
- **Evidence Snippet:**
  ```javascript
  // next.config.js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
      reactStrictMode: true,
      images: {
          domains: ['appcenter.intuit.com'],
      },
      experimental: {
          optimizePackageImports: ['lucide-react'],
      },
      async rewrites() {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
          return [
              {
                  source: '/api/:path*',
                  destination: `${apiUrl}/api/:path*`,
              },
          ];
      },
  };

  module.exports = nextConfig;
  ```
- **Description:** `next.config.js` contains no `async headers()` configuration block. No security headers (CSP, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) are configured at the Next.js framework level.
- **Related DAST Finding:** Content Security Policy (CSP) Not Implemented; Missing Anti-clickjacking Header (X-Frame-Options); Missing X-Content-Type-Options.

---

### J. Clickjacking-Related Frontend Code

#### 1. Frame-Busting JavaScript
- NO LOGIC FOUND FOR THIS ACTION POINT
- **Search terms used:** `top.location`, `window.top`, `window.self`, `self !== top`, `frameElement`
- **Directories scanned:** `app/`, `components/`, `lib/`

#### 2. Iframe Embedding of the Application
- **Search terms used:** `iframe`, `<iframe`
- **Directories scanned:** `app/`, `components/`, `lib/`
- **Hit Found (Third-Party Embed Only):**
  - **Classification:** `APP_CODE`
  - **Location:** `app/(landing)/page.tsx`, Lines 760–767
  - **Snippet:**
    ```tsx
    <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/k80TgYyreJ8?si=9jubHhjNNMaA1GSQ"
        title="Audit Gen Demo"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
    />
    ```
  - **Description:** Only embeds an external YouTube video demo within a modal on the landing page.
  - **Application Clickjacking Exposure:** The application itself does not embed itself in an iframe, nor does it define CSP `frame-ancestors 'none'` or `X-Frame-Options: DENY` in `next.config.js` or `middleware.ts`.
  - **Related DAST Finding:** Clickjacking vulnerability on authenticated pages (`/dashboard`, `/connections`, `/settings`).

---

## 4. Files Reviewed

### Root & Configuration Files
- `package.json`
- `middleware.ts`
- `next.config.js`
- `.env`
- `vitest.config.ts`
- `README.md`
- `tsconfig.json`
- `postcss.config.js`
- `tailwind.config.ts`

### Application Routes (`app/`)
- `app/layout.tsx`
- `app/globals.css`
- `app/launch/route.ts`
- `app/api/auth/callback/route.ts`
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `app/(landing)/layout.tsx`
- `app/(landing)/page.tsx`
- `app/(landing)/learn/page.tsx`
- `app/(landing)/disconnect/page.tsx`
- `app/(landing)/pricing/page.tsx`
- `app/(landing)/privacy/page.tsx`
- `app/(landing)/tos/page.tsx`
- `app/(landing)/issues/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/dashboard/DashboardErrorFallback.tsx`
- `app/(dashboard)/connections/page.tsx`
- `app/(dashboard)/connections/success/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/(dashboard)/diagnostics/page.tsx`
- `app/(dashboard)/diagnostics/[runId]/page.tsx`
- `app/(dashboard)/rules/page.tsx`
- `app/(dashboard)/reports/page.tsx`
- `app/(dashboard)/logs/logs(deleted).tsx`
- `app/(dashboard)/billing/page.tsx` *(reviewed for boundary checks)*
- `app/(dashboard)/billing/callback/page.tsx` *(reviewed for boundary checks)*
- `app/(dashboard)/error.tsx`
- `app/(dashboard)/loading.tsx`
- `app/(dashboard)/not-found.tsx`

### Components (`components/`)
- `components/providers/AuthProvider.tsx`
- `components/providers/ClientProviders.tsx`
- `components/providers/QueryProvider.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/UserMenu.tsx`
- `components/layout/EntitySelector.tsx`
- `components/layout/Header.tsx`
- `components/connections/ConnectQuickBooks.tsx`
- `components/connections/ConnectionCard.tsx`
- `components/ui/input.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/label.tsx`
- `components/ui/ErrorBoundary.tsx`
- `components/dashboard/HealthScoreCard.tsx`
- `components/dashboard/HealthScoreChart.tsx`
- `components/dashboard/DiagnosticFindingsSection.tsx`
- `components/dashboard/DetectedIssuesCard.tsx`
- `components/dashboard/ImpactScopeCard.tsx`
- `components/dashboard/SyncStatusCard.tsx`
- `components/dashboard/IssuesTable.tsx`
- `components/dashboard/IssueList.tsx`
- `components/dashboard/DiagnosticSummary.tsx`
- `components/dashboard/DashboardSkeleton.tsx`
- `components/dashboard/EntityFilterBar.tsx`
- `components/diagnostics/AuditDrawer.tsx`
- `components/diagnostics/DetailedRuleMessage.tsx`
- `components/diagnostics/RulesTable.tsx`
- `components/billing/PaymentVerificationModal.tsx` *(reviewed for boundary checks)*
- `components/billing/SubscriptionButton.tsx` *(reviewed for boundary checks)*

### Libraries, Hooks & Contexts (`lib/`)
- `lib/api/auth.ts`
- `lib/api/client.ts`
- `lib/api/connections.ts`
- `lib/api/diagnostics.ts`
- `lib/api/reports.ts`
- `lib/api/subscription.ts`
- `lib/config.ts`
- `lib/hooks/useAuth.ts`
- `lib/hooks/useConnections.ts`
- `lib/hooks/useDiagnostics.ts`
- `lib/hooks/useDiagnosticMetrics.ts`
- `lib/hooks/useDebounce.ts`
- `lib/hooks/useLogs.ts`
- `lib/hooks/useSubscription.ts`
- `lib/hooks/useSubscriptionCheckout.ts`
- `lib/hooks/useHealthScore.ts`
- `lib/contexts/ConnectionContext.tsx`
- `lib/utils/validators.ts`
- `lib/utils/dashboard-helpers.ts`
- `lib/utils/dashboard-helpers.test.ts`
- `lib/utils/cn.ts`
- `lib/utils/format.ts`
- `lib/utils/index.ts`

### Types (`types/`)
- `types/api.ts`
- `types/connection.ts`
- `types/diagnostic.ts`
- `types/user.ts`

---

## 5. Files NOT Found (Expected but Absent)

1. **`app/(auth)/forgot-password/page.tsx` & `app/(auth)/reset-password/page.tsx`**:  
   Expected standard password recovery routes. Completely absent in the frontend; recovery is handled exclusively by Clerk.
2. **`app/(dashboard)/account/page.tsx` or `app/(dashboard)/profile/page.tsx`**:  
   Expected user profile and security configuration pages. The application has no route for managing user credentials, MFA, or active sessions.
3. **`components/auth/UserProfile.tsx`**:  
   Expected custom or wrapped `<UserProfile />` component. Absent; Clerk's default modal is triggered from `<UserButton />`.
4. **`app/(auth)/sign-out/page.tsx` or `app/api/auth/signout/route.ts`**:  
   Expected dedicated logout handler/route. Absent; logout is handled entirely through Clerk's UI popover.
5. **Session Management Hooks (`lib/hooks/useIdleTimer.ts`, `lib/hooks/useInactivity.ts`)**:  
   Expected client-side session timeout listeners. Absent.

---

## 6. Clerk-Delegated Items (DAST Findings Not Fixable in Frontend Code)

The following DAST findings flag endpoints or behaviors owned entirely by Clerk's infrastructure (`*.clerk.accounts.dev` or Clerk dashboard controls) and cannot be fixed by editing application frontend code:

1. **Password Policy and Complexity Enforcement:**  
   DAST findings regarding minimum password length, uppercase/lowercase/symbol requirements, and password strength meters.  
   *Remediation Location:* Clerk Dashboard > Configure > User & Authentication > Password settings.
2. **Current-Password Requirement on Password Change:**  
   DAST finding regarding absence or presence of current password verification when updating credentials.  
   *Remediation Location:* Clerk Dashboard > Configure > User & Authentication > Attack Protection & Password settings.
3. **Session Revocation ("Sign out of all other devices"):**  
   DAST finding regarding session invalidation across concurrent logins.  
   *Remediation Location:* Clerk Dashboard > Sessions > Multi-session handling / Device tracking.
4. **Credential Recovery Flows (Forgot/Reset Password):**  
   DAST findings regarding reset token entropy, email enumeration protection on password reset, and expiration of recovery links.  
   *Remediation Location:* Clerk Dashboard > Email & SMS Templates & Attack Protection.
5. **Session Cookie Security Attributes (`__session`, `__client_uat`, `clerk_db_jwt`):**  
   DAST findings flagging `HttpOnly`, `SameSite=Lax/Strict`, and `Secure` flags on Clerk session cookies.  
   *Remediation Location:* Clerk Dashboard domain configuration / Clerk SDK edge proxying.
6. **Rate-Limiting and Brute-Force Protection on Auth Endpoints:**  
   DAST findings flagging HTTP 429 rate limiting on repeated failed attempts to `/sign-in` and `/sign-up`.  
   *Remediation Location:* Clerk Attack Protection & Cloudflare edge WAF rules for `accounts.auditorgen.com` / `workable-kit-45.clerk.accounts.dev`.

---

## 7. Unknowns / Blockers

1. **Architectural Split Between Clerk Auth and Legacy `/login`:**  
   The codebase contains an active `/login` page (`app/(auth)/login/page.tsx`) calling internal API `/api/auth/login`. Because the landing pages link to Clerk's `/sign-in`, it is unknown whether `/login` is an un-decommissioned development backdoor, a planned migration, or legacy tech debt. This presents a high-risk attack surface because `/login` does not enforce Clerk's WAF, MFA, or password policies.
2. **Clerk Token Transmission via SSE Query Parameter:**  
   In `lib/hooks/useDiagnostics.ts:87`, the Clerk JWT session token is appended to the EventSource URL (`?token=${token}&tenantId=${tenantId}`). Browser `EventSource` cannot send `Authorization` headers. If the backend cannot be modified to accept cookie-based authentication or a short-lived ticket/token exchange for SSE, remediation of this token exposure in URLs may be blocked without restructuring the streaming transport (e.g. migrating to `fetch` with `ReadableStream`).
3. **WAF / Reverse Proxy Boundary (Cloudflare):**  
   Because Cloudflare sits in front of the application, critical security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) might be injected at the Cloudflare Worker or Transform Rules layer rather than inside `next.config.js` or `middleware.ts`. Discovery from repository code alone cannot verify whether Cloudflare is actively enforcing these headers in production.
