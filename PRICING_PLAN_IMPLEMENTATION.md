# Pricing Plan Implementation Tracker - Frontend

This document tracks the implementation of Basic, Intermediate, and Enterprise pricing tiers UI, API integration, and user experience for the SinLearn Web frontend.

## Current Status

- Status: Planning phase
- Owner: TBD
- Started: 2026-04-30
- Frontend framework: Next.js 15 (TypeScript)
- Main user field: `user.tier`
- User endpoint: `GET /api/v1/users/me` (expected)
- Plans endpoint: `GET /api/v1/pricing/plans` (expected)
- Usage endpoint: `GET /api/v1/usage/me` (expected)

## Target Plans

| Tier           | Price                  | Badge          | Learning Limit   | Evaluation Session Limit | Per-Session Evaluation Limit |
| -------------- | ---------------------- | -------------- | ---------------- | ------------------------ | ---------------------------- |
| `basic`        | Free forever           | Starter        | 5 requests/hour  | 1 session/day            | 10 evaluations/session       |
| `intermediate` | 5000 LKR/tier          | Most Popular   | 20 requests/hour | 5 sessions/day           | TBD                          |
| `enterprise`   | 10000 LKR onwards/tier | Best for Scale | 50 requests/hour | 10 sessions/day          | Extra evaluations billable   |

## Implementation Checklist

### Phase 1: Types & Constants

- [ ] Create `src/types/pricing.ts` with TypeScript interfaces:
  - [ ] `PricingPlan` (id, tier, name, description, badge, price, features, limits)
  - [ ] `UserTier` (type for `basic` | `intermediate` | `enterprise`)
  - [ ] `PricingLimits` (learningRequestsPerHour, sessionsPerDay, evaluationsPerSession)
  - [ ] `UserUsage` (currentHourRequests, sessionsTodayCount, evaluationsInSession, resetTimes)
- [ ] Create `src/lib/constants.ts` entries:
  - [ ] Plan metadata (names, badges, colors for each tier)
  - [ ] Feature lists for marketing display
  - [ ] Limit threshold percentages for warnings (e.g., 80% usage = warning)

### Phase 2: API Integration

- [ ] Create `src/lib/api.ts` API client functions:
  - [ ] `fetchPricingPlans()` - GET /api/v1/pricing/plans
  - [ ] `fetchUserUsage()` - GET /api/v1/usage/me
  - [ ] `fetchCurrentUser()` - GET /api/v1/users/me (ensure tier is included)
  - [ ] `updateUserTier(userId, tier)` - PATCH /api/v1/users/{id}/tier (admin only)
- [ ] Add error handling for tier/usage API failures
- [ ] Handle HTTP 403 responses with limit-exceeded details

### Phase 3: Context & State Management

- [ ] Create `src/lib/PricingContext.ts` or hook:
  - [ ] `usePricingPlans()` - fetch and cache all plans
  - [ ] `useUserTier()` - get current user's tier
  - [ ] `useUserUsage()` - fetch user's current usage stats
  - [ ] `useIsPlanLimited(feature)` - check if current feature is limited
  - [ ] Auto-refresh usage stats every 30-60 seconds during chat/evaluation
- [ ] Optionally integrate with existing auth context to access tier
- [ ] Handle stale data and cache invalidation

### Phase 4: Auth & Settings Pages

- [ ] Update `src/app/settings/page.tsx`:
  - [ ] Display current tier with badge
  - [ ] Show current usage (requests used this hour, sessions today, evaluations in session)
  - [ ] Display limits for current tier
  - [ ] Show reset times (next hour, midnight)
  - [ ] Add "Upgrade Plan" CTA button
- [ ] Create tier display component `src/components/settings/TierBadge.tsx`
- [ ] Create usage stats component `src/components/settings/UsageStats.tsx`
- [ ] Update `src/app/auth/page.tsx` (if sign-up shows plan selection)

### Phase 5: Pricing Page / Plan Selection

- [ ] Create `src/app/pricing/page.tsx` (optional, for marketing):
  - [ ] Display all three pricing tiers side-by-side
  - [ ] Show features, limits, and pricing
  - [ ] Include "Choose Plan" CTAs
  - [ ] Highlight "Most Popular" badge on Intermediate
- [ ] Create `src/components/pricing/PricingComparison.tsx`
- [ ] Create `src/components/pricing/PricingTier.tsx` card component
- [ ] Link to payment processing (e.g., Stripe, local payment gateway)

### Phase 6: Chat/Learning Mode UI

- [ ] Update `src/components/chat/InputBar.tsx`:
  - [ ] Check learning limit before sending message
  - [ ] Display warning when approaching limit (80% used)
  - [ ] Show error message when limit exceeded with tier info
  - [ ] Disable input or show "Upgrade" prompt on 403 error
- [ ] Create `src/components/chat/LimitWarning.tsx`:
  - [ ] Show visual warning (color-coded bar or badge)
  - [ ] Display remaining requests in current hour
  - [ ] Provide "Upgrade Plan" link
- [ ] Create `src/components/chat/LimitExceededModal.tsx`:
  - [ ] Show detailed limit info
  - [ ] Explain when limit resets
  - [ ] Provide upgrade CTA

### Phase 7: Evaluation Mode UI

- [ ] Update `src/components/chat/EvaluationStartScreen.tsx`:
  - [ ] Check evaluation session limit before allowing new session
  - [ ] Display current session count for today
  - [ ] Show warning if approaching daily session limit
- [ ] Update `src/components/chat/EvaluationInputs.tsx`:
  - [ ] Check per-session evaluation limit before adding answer scripts
  - [ ] Show warning when approaching evaluation count limit
  - [ ] Display error when limit exceeded with tier info and "Upgrade" CTA
- [ ] Create `src/components/chat/EvaluationLimitWarning.tsx`:
  - [ ] Show session usage (e.g., "3/5 sessions used today")
  - [ ] Show evaluation count usage (e.g., "9/10 evaluations in session")
  - [ ] Provide contextual upgrade suggestions

### Phase 8: Error Handling & User Feedback

- [ ] Create `src/components/errors/LimitExceededError.tsx`:
  - [ ] Parse 403 response with limit details
  - [ ] Show friendly error message
  - [ ] Display current tier and limits
  - [ ] Provide "Upgrade Plan" link
- [ ] Update API call handling in:
  - [ ] `src/lib/api.ts` - add limit-specific error handler
  - [ ] Chat message sending logic
  - [ ] Evaluation workflow logic
- [ ] Add toast notifications for:
  - [ ] "Approaching usage limit"
  - [ ] "Usage limit exceeded, upgrade to continue"
  - [ ] "Daily session limit reached"

### Phase 9: Settings & Profile

- [ ] Update `src/components/settings/ProfileSettings.tsx`:
  - [ ] Display full tier information and benefits
  - [ ] Show when subscription renews (if applicable)
  - [ ] Show upgrade/downgrade options
- [ ] Create admin-only view `src/components/settings/AdminPricingManagement.tsx` (if needed):
  - [ ] List all users and their tiers
  - [ ] Allow admin to change user tiers
  - [ ] Show usage analytics by tier
- [ ] Add "Manage Subscription" link (placeholder for payment portal)

### Phase 10: Responsive Design & Accessibility

- [ ] Ensure pricing cards are responsive (mobile, tablet, desktop)
- [ ] Ensure all tier badges and usage displays are accessible:
  - [ ] Use semantic HTML (`<div role="status">` for usage updates)
  - [ ] Add ARIA labels for tier badges
  - [ ] Color should not be the only indicator (use text/icons too)
- [ ] Test on mobile devices (especially chat UX with limits)
- [ ] Ensure upgrade CTAs are keyboard-accessible

### Phase 11: Localization

- [ ] Add pricing plan strings to `public/locales/en/common.json`:
  - [ ] Tier names and descriptions
  - [ ] Plan feature lists
  - [ ] "Choose Plan", "Upgrade", "Current Plan" labels
  - [ ] Limit messages ("X requests remaining", "Daily limit reached", etc.)
  - [ ] Reset time messages ("Resets in X minutes", "Resets at midnight", etc.)
- [ ] Add pricing plan strings to `public/locales/si/common.json` (Sinhala translations)
- [ ] Ensure date/time formatting respects user locale and `Asia/Colombo` timezone context

### Phase 12: Loading States & Skeleton Screens

- [ ] Create skeleton components:
  - [ ] `src/components/pricing/PricingTierSkeleton.tsx`
  - [ ] `src/components/settings/UsageStatsSkeleton.tsx`
- [ ] Show skeletons while pricing plans and usage data are loading
- [ ] Handle network errors gracefully (retry logic, fallback UI)

### Phase 13: Offline Support (PWA)

- [ ] Cache pricing plans when online (static data)
- [ ] Cache user tier and usage when last fetched
- [ ] In offline mode:
  - [ ] Show cached tier info
  - [ ] Show last-known usage stats
  - [ ] Disable "Upgrade" CTAs (no payment processing offline)
  - [ ] Allow offline chat with warning "Offline mode: limits may be inaccurate"
- [ ] Sync usage stats when returning online

### Phase 14: Analytics & Monitoring

- [ ] Track user events:
  - [ ] "Pricing page viewed"
  - [ ] "Upgrade plan clicked"
  - [ ] "Usage limit reached"
  - [ ] "Plan downgrade"
- [ ] Monitor API performance:
  - [ ] Response times for `/api/v1/usage/me`
  - [ ] Cache hit rates for pricing plans
- [ ] Create dashboard to view:
  - [ ] Tier distribution across users
  - [ ] Most common limit hit
  - [ ] Upgrade conversion rate

### Phase 15: Testing

- [ ] Unit tests:
  - [ ] `usePricingPlans()` hook returns correct tier data
  - [ ] Usage formatting (e.g., "3/5 remaining")
  - [ ] Tier-to-feature mapping is correct
- [ ] Integration tests:
  - [ ] Chat input correctly checks learning limit
  - [ ] Evaluation start correctly checks session limit
  - [ ] 403 error triggers correct UI response
- [ ] E2E tests:
  - [ ] User hits learning limit, sees error, navigates to upgrade
  - [ ] Admin changes user tier, frontend reflects change after refresh
  - [ ] Offline user sees cached tier, limit check still works locally
- [ ] Manual testing:
  - [ ] Test all three tiers side-by-side
  - [ ] Test limit messages on mobile
  - [ ] Test timezone handling (limits reset at midnight `Asia/Colombo`)

## Code Touchpoints

- `src/types/pricing.ts` (new)
- `src/lib/constants.ts`
- `src/lib/api.ts`
- `src/lib/PricingContext.ts` (new)
- `src/app/settings/page.tsx`
- `src/app/pricing/page.tsx` (new, optional)
- `src/app/auth/page.tsx` (optional)
- `src/components/chat/InputBar.tsx`
- `src/components/chat/EvaluationStartScreen.tsx`
- `src/components/chat/EvaluationInputs.tsx`
- `src/components/settings/ProfileSettings.tsx`
- `src/components/settings/TierBadge.tsx` (new)
- `src/components/settings/UsageStats.tsx` (new)
- `src/components/pricing/` (new directory)
- `src/components/errors/LimitExceededError.tsx` (new)
- `public/locales/en/common.json`
- `public/locales/si/common.json`

## Frontend-Backend Contract

Ensure backend provides these endpoints and responses:

### `GET /api/v1/pricing/plans`

```json
{
  "plans": [
    {
      "id": "basic",
      "tier": "basic",
      "name": "Starter",
      "description": "Free forever plan",
      "badge": "Starter",
      "price": 0,
      "currency": "LKR",
      "features": ["Feature 1", "Feature 2"],
      "limits": {
        "learningRequestsPerHour": 5,
        "evaluationSessionsPerDay": 1,
        "evaluationsPerSession": 10
      }
    },
    ...
  ]
}
```

### `GET /api/v1/users/me`

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "tier": "intermediate",
  "role": "user",
  ...
}
```

### `GET /api/v1/usage/me`

```json
{
  "userId": "user-123",
  "tier": "intermediate",
  "currentHour": {
    "learningRequests": 12,
    "limit": 20,
    "resetAt": "2026-04-30T14:00:00Z"
  },
  "today": {
    "evaluationSessions": 3,
    "limit": 5,
    "resetAt": "2026-05-01T00:00:00+05:30"
  },
  "currentSession": {
    "evaluations": 8,
    "limit": 10
  }
}
```

### Error Response (403 Limit Exceeded)

```json
{
  "detail": "Learning request limit exceeded",
  "tier": "basic",
  "limit": 5,
  "used": 5,
  "resetAt": "2026-04-30T14:00:00Z",
  "suggestedAction": "upgrade"
}
```

## Design System Integration

- Use existing badge/label components from `src/components/ui/`
- Use existing modal components for limit warnings
- Use existing toast/notification system
- Apply existing theme (light/dark mode) to pricing cards
- Use existing button styles for "Upgrade" CTAs

## Notes

- Learning request limits reset every hour (hour boundary, e.g., 2:00 PM → 3:00 PM)
- Evaluation session limits reset daily at midnight `Asia/Colombo` timezone
- Optimistic UI updates: show usage changes immediately, but re-sync with backend
- Consider debouncing usage fetch calls during active chat (not every message)
- Upgrade links should deep-link to payment page or contact form
- If PWA: Clear cached plans weekly to stay in sync with backend pricing changes
- Future: Integrate with payment gateway webhooks to auto-update tier on successful payment
