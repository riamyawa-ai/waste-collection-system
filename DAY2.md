# Day 2: Authentication System

**Date**: Day 2 of 10  
**Focus**: Complete authentication flow with Supabase Auth

---

## 📋 Objectives

- Implement user registration with email verification
- Create secure login system with rate limiting
- Build password recovery flow
- Set up role-based authentication middleware
- Implement session management with timeout
- Create profile completion flow

---

## 🛠️ Tasks

### 2.1 Supabase Auth Configuration (1 hour)

#### Setup Tasks:
- [ ] Configure Supabase Auth settings in dashboard:
  - Enable email provider
  - Set up email templates (verification, password reset) with eco-green branding
  - Configure redirect URLs
  - Set JWT expiry and refresh token settings
  - **Set session timeout to 30 minutes of inactivity**
- [ ] Create auth helper functions:
  - `src/lib/auth/actions.ts` - Server actions for auth
  - `src/lib/auth/helpers.ts` - Auth utility functions
  - `src/lib/auth/session.ts` - Session management with timeout
- [ ] Set up auth callback route:
  - `src/app/auth/callback/route.ts`

### 2.2 Registration Page (2.5 hours)

#### Page: `src/app/(auth)/register/page.tsx`

#### UI Design (Eco Theme):
- [ ] White card centered on light green (#f0fdf4) background
- [ ] Green leaf/recycling icon at top of form
- [ ] Primary green submit button
- [ ] Green checkmarks for validation success

#### Features to Implement:
- [ ] Registration form with fields:
  - First Name (required)
  - Last Name (required)
  - Email Address (required, validation)
  - Phone Number (required, Philippine format: +63 or 09XX)
  - Password (required, with strength indicator)
  - Confirm Password (real-time matching)
- [ ] Optional fields:
  - Complete Address
  - Barangay dropdown (36 Panabo City areas from constants)
- [ ] Form validation:
  - Real-time email format validation
  - Password policy enforcement (8+ chars, uppercase, lowercase, number, special char)
  - Phone number format validation (Philippine format)
- [ ] Password strength meter component (green gradient from weak to strong)
- [ ] Terms & Conditions checkbox with modal/link
- [ ] Submit with loading state (green spinner)
- [ ] Error handling and display (red text with icon)
- [ ] Success redirect to email verification page

#### Password Policy Requirements (display as checklist):
- [ ] Minimum 8 characters
- [ ] At least one uppercase letter (A-Z)
- [ ] At least one lowercase letter (a-z)
- [ ] At least one number (0-9)
- [ ] At least one special character (!@#$%^&*)

#### Components to Create:
- [ ] `src/components/forms/RegisterForm.tsx`
- [ ] `src/components/ui/password-strength.tsx` - Green gradient strength meter
- [ ] `src/components/ui/barangay-select.tsx` - Searchable dropdown with 36 barangays
- [ ] `src/components/ui/phone-input.tsx` - Philippine format validation

### 2.3 Login Page (2 hours)

#### Page: `src/app/(auth)/login/page.tsx`

#### UI Design (Eco Theme):
- [ ] White card on light green background
- [ ] System logo at top (green recycling/leaf theme)
- [ ] Green primary login button
- [ ] Subtle green focus rings on inputs

#### Features to Implement:
- [ ] Login form with fields:
  - Email address
  - Password (masked with show/hide toggle - eye icon)
- [ ] "Remember Me" checkbox (green checkmark when checked)
- [ ] "Forgot Password?" link (green text)
- [ ] "Don't have an account? Sign Up" redirect link
- [ ] Rate limiting display (max 5 attempts per 15 minutes)
  - Show remaining attempts counter
  - Display lockout timer when exceeded
- [ ] CAPTCHA integration after 3 failed attempts (reCAPTCHA v3)
- [ ] Error messages for invalid credentials (red alert box)
- [ ] Success redirect to appropriate dashboard based on role:
  - Admin → `/admin/dashboard`
  - Staff → `/staff/dashboard`
  - Client → `/client/dashboard`
  - Collector → `/collector/dashboard`

#### Security Features:
- [ ] Session timeout after 30 minutes of inactivity
- [ ] Secure session cookie configuration (httpOnly, secure, sameSite)
- [ ] Login attempt logging for security monitoring

#### Components to Create:
- [ ] `src/components/forms/LoginForm.tsx`
- [ ] `src/components/ui/password-input.tsx` (with visibility toggle)
- [ ] `src/components/ui/rate-limit-warning.tsx` - Lockout display

### 2.4 Email Verification (1.5 hours)

#### Page: `src/app/(auth)/verify-email/page.tsx`

#### UI Design:
- [ ] White card with green checkmark/envelope icon
- [ ] Green "Resend" button
- [ ] Green progress indicator for timer

#### Features to Implement:
- [ ] Verification pending screen with:
  - Email icon (green themed)
  - "Check your email" message
  - Display user's email address (masked: j***@email.com)
- [ ] Check email instructions
- [ ] Resend verification email button (60-second cooldown)
  - Countdown timer display
  - Disable button during cooldown
- [ ] Link expiration timer display (1 hour)
- [ ] Success redirect to dashboard
- [ ] Handle verification callback from email link
- [ ] Handle expired link scenario with re-send option

#### Components to Create:
- [ ] `src/components/auth/VerifyEmailCard.tsx`
- [ ] `src/components/ui/countdown-timer.tsx` - Green circular timer
- [ ] `src/components/auth/EmailVerificationSuccess.tsx`

### 2.5 Password Recovery (1.5 hours)

#### Pages:
- [ ] `src/app/(auth)/forgot-password/page.tsx`
- [ ] `src/app/(auth)/reset-password/page.tsx`

#### Forgot Password Features:
- [ ] Email input with validation
- [ ] Submit button (green primary)
- [ ] Success message with instructions:
  - "Password reset link sent!"
  - "Please check your email inbox"
  - "Link expires in 1 hour"
- [ ] Link to return to login

#### Reset Password Features:
- [ ] New password input (with strength meter)
- [ ] Confirm new password input (with matching validation)
- [ ] Submit with validation
- [ ] Single-use link validation (show error if already used)
- [ ] Expiration handling (1 hour) with re-request option
- [ ] Success redirect to login with success message

#### Components to Create:
- [ ] `src/components/forms/ForgotPasswordForm.tsx`
- [ ] `src/components/forms/ResetPasswordForm.tsx`

### 2.6 Auth Middleware & Protection (1.5 hours)

#### Setup Tasks:
- [ ] Create middleware for route protection:
  - `src/middleware.ts`
- [ ] Define protected route groups:
  ```typescript
  const protectedRoutes = {
    admin: ['/admin/:path*'],
    staff: ['/staff/:path*'],
    client: ['/client/:path*'],
    collector: ['/collector/:path*'],
  };
  ```
- [ ] Implement role-based access control:
  - Admin routes: `/admin/*` - Admin only
  - Staff routes: `/staff/*` - Staff and Admin
  - Client routes: `/client/*` - Client only
  - Collector routes: `/collector/*` - Collector only
- [ ] Create redirect logic for unauthorized access:
  - Unauthenticated → Login page
  - Wrong role → Unauthorized page or correct dashboard
- [ ] Session refresh logic on activity
- [ ] **Session timeout implementation (30 minutes of inactivity)**:
  - Track last activity timestamp
  - Auto-logout on timeout
  - Show session expiring warning (5 min before)

#### Utility Functions:
- [ ] `src/lib/auth/getUser.ts` - Get current user server-side
- [ ] `src/lib/auth/getSession.ts` - Get current session with role
- [ ] `src/lib/auth/requireAuth.ts` - Higher-order function for protected pages
- [ ] `src/lib/auth/requireRole.ts` - Role-specific access checker
- [ ] `src/lib/auth/sessionTimeout.ts` - Session timeout handler

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Registration page |
| `src/app/(auth)/verify-email/page.tsx` | Email verification page |
| `src/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `src/app/(auth)/reset-password/page.tsx` | Reset password page |
| `src/app/(auth)/layout.tsx` | Auth layout (green bg, white cards) |
| `src/app/auth/callback/route.ts` | Auth callback handler |
| `src/middleware.ts` | Route protection middleware |
| `src/lib/auth/actions.ts` | Server actions for auth |
| `src/lib/auth/helpers.ts` | Auth utility functions |
| `src/lib/auth/session.ts` | Session management |
| `src/lib/auth/sessionTimeout.ts` | Timeout handler |
| `src/components/forms/*` | Form components |
| `src/lib/validators/auth.ts` | Zod schemas for auth validation |

---

## ✅ Acceptance Criteria

- [ ] Users can register with valid information
- [ ] Password strength indicator works correctly (green gradient)
- [ ] Email verification flow works end-to-end
- [ ] Login works with valid credentials
- [ ] Rate limiting prevents brute force attacks (5 attempts/15 min)
- [ ] CAPTCHA appears after 3 failed attempts
- [ ] Password recovery sends reset email
- [ ] Reset password updates credentials successfully
- [ ] Single-use reset links work correctly
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based routing works correctly
- [ ] Session persists across page refreshes
- [ ] Session times out after 30 minutes of inactivity
- [ ] Logout clears session properly
- [ ] All pages follow eco-green theme

---

## 🔒 Security Considerations

- All passwords are hashed by Supabase (bcrypt)
- Implement HTTPS-only cookies (secure flag)
- Use secure session tokens (httpOnly flag)
- Validate all inputs server-side
- Prevent SQL injection through prepared statements (Supabase handles)
- XSS protection in form inputs (escape user input)
- CSRF tokens for form submissions
- Rate limiting: Max 5 login attempts per 15 minutes
- Session timeout: 30 minutes of inactivity
- Log all authentication events for security monitoring:
  - Successful logins
  - Failed login attempts
  - Password reset requests
  - Account lockouts

---

## 📝 Notes

- Use Zod for form validation schemas
- Implement proper error boundaries
- Add loading states for all async operations (green spinners)
- Log authentication events for security monitoring
- Consider adding OAuth providers later (Google, Facebook)
- All auth UI should maintain the green/white eco theme
- Green success states, red error states

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Supabase Auth Config | 1 hour |
| Registration Page | 2.5 hours |
| Login Page | 2 hours |
| Email Verification | 1.5 hours |
| Password Recovery | 1.5 hours |
| Middleware & Protection | 1.5 hours |