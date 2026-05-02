# Pricing Plan Implementation Tracker - Frontend

This document tracks the Basic, Intermediate, and Enterprise pricing-tier UI, API integration, and user experience for SinLearn Web.

## Current Status

- Status: Backend contract aligned; Phases 1-4 complete; Phases 6-7 partially wired
- Owner: TBD
- Started: 2026-04-30
- Frontend framework: Next.js 16 / React 19 / TypeScript
- Main user field: `user.tier`
- User endpoint: `GET /api/v1/users/me` - backend ready
- Plans endpoint: `GET /api/v1/pricing/plans` - backend ready
- Usage endpoint: `GET /api/v1/usage/me` - backend ready

## Completed

- [x] Types and constants for tiers, plans, limits, and usage
- [x] API integration functions for current user, plans, usage, and admin tier update
- [x] Frontend API adapters for backend snake_case pricing/usage responses
- [x] Pricing hooks with cache and usage refresh support
- [x] Settings Plan tab and Profile tier badge
- [x] Tier badge, tier card, usage stats, limit warning, and limit exceeded components
- [x] Learning input warning/disable state when hourly quota is reached
- [x] Evaluation start warning/disable state when daily session quota is reached
- [x] Evaluation answer upload limit handling for Basic and unlimited tiers
- [x] Removed visible mojibake from pricing/settings tier UI components

## Target Plans

| Tier | Price | Badge | Learning Limit | Evaluation Session Limit | Per-Session Evaluation Limit |
| --- | --- | --- | --- | --- | --- |
| `basic` | Free forever | Starter | 5 requests/hour | 1 session/day | 10 evaluations/session |
| `intermediate` | 5000 LKR/tier | Most Popular | 20 requests/hour | 5 sessions/day | Unlimited/none configured |
| `enterprise` | 10000 LKR onwards/tier | Best for Scale | 50 requests/hour | 10 sessions/day | Extra evaluations billable |

## Frontend-Backend Contract

Backend currently returns snake_case data. The frontend normalizes this in `src/lib/api.ts` and exposes camelCase types to components.

### `GET /api/v1/pricing/plans`

Backend response shape:

```json
{
  "plans": [
    {
      "tier": "basic",
      "name": "Basic Plan",
      "price_label": "Free / forever",
      "description": "A lightweight plan for getting started with Learning Mode",
      "badge": "Starter",
      "features": ["Learning mode: 5 requests per hour"],
      "cta": "Start Free",
      "note": "No credit card required",
      "limits": {
        "learning_requests_per_hour": 5,
        "evaluation_sessions_per_day": 1,
        "evaluations_per_session": 10,
        "allow_evaluation_overage": false
      },
      "is_popular": false
    }
  ]
}
```

Frontend normalized shape:

```ts
{
  plans: [{
    id: "basic",
    tier: "basic",
    name: "Basic Plan",
    priceLabel: "Free / forever",
    limits: {
      learningRequestsPerHour: 5,
      evaluationSessionsPerDay: 1,
      evaluationsPerSession: 10,
      allowEvaluationOverage: false
    }
  }]
}
```

### `GET /api/v1/usage/me`

Backend response shape:

```json
{
  "tier": "intermediate",
  "plan_name": "Intermediate Plan",
  "limits": {
    "learning_requests_per_hour": 20,
    "evaluation_sessions_per_day": 5,
    "evaluations_per_session": null,
    "allow_evaluation_overage": false
  },
  "learning_requests": {
    "used": 12,
    "limit": 20,
    "remaining": 8,
    "reset_at": "2026-04-30T14:00:00Z"
  },
  "evaluation_sessions": {
    "used": 3,
    "limit": 5,
    "remaining": 2,
    "reset_at": "2026-05-01T00:00:00+05:30"
  },
  "evaluations_per_session_limit": null,
  "allow_evaluation_overage": false
}
```

## Implementation Checklist

### Phase 1: Types & Constants - Complete

- [x] `src/types/pricing.ts`
- [x] `src/lib/constants.ts`
- [x] Support `null` per-session evaluation limit for unlimited plans
- [x] Support `allowEvaluationOverage`

### Phase 2: API Integration - Complete

- [x] `fetchCurrentUser()` - `GET /api/v1/users/me`
- [x] `fetchPricingPlans()` - `GET /api/v1/pricing/plans`
- [x] `fetchUserUsage()` - `GET /api/v1/usage/me`
- [x] `updateUserTier(userId, tier)` - `PATCH /api/v1/users/{id}/tier`
- [x] Normalize backend snake_case responses to frontend camelCase types
- [x] Preserve API errors for 403 handling

### Phase 3: Context & State Management - Complete

- [x] `usePricingPlans()`
- [x] `useUserTier()`
- [x] `useUserUsage()`
- [x] `useIsTierLimited(feature)`
- [x] `usePricingContext()`
- [x] Cache plans/profile and refresh usage during active chat/evaluation

### Phase 4: Auth & Settings Pages - Complete

- [x] Add Plan tab to settings navigation
- [x] Display current tier with badge
- [x] Show current usage and limits
- [x] Use backend plan metadata when available
- [x] Show upgrade CTAs
- [x] Display tier badge in profile

### Phase 5: Pricing Page / Plan Selection - Open

- [ ] Create `src/app/pricing/page.tsx`
- [ ] Create pricing comparison/tier components for a dedicated page
- [ ] Link CTAs to payment/contact flow

### Phase 6: Chat/Learning Mode UI - Partially Complete

- [x] Fetch usage in `InputBar`
- [x] Display warning when approaching limit
- [x] Disable send when hourly learning quota is reached
- [x] Show reset time and upgrade link when blocked
- [ ] Parse and display backend 403 limit errors from send-message failures
- [ ] Refresh usage immediately after successful sends

### Phase 7: Evaluation Mode UI - Partially Complete

- [x] Fetch usage in `EvaluationStartScreen`
- [x] Warn when approaching daily session limit
- [x] Disable evaluation start/process action when daily session limit is reached
- [x] Apply per-session answer upload limit for Basic
- [x] Treat `null` per-session limit as unlimited for Intermediate/Enterprise
- [ ] Parse and display backend 403 limit errors from evaluation workflow failures
- [ ] Add upgrade CTA to evaluation limit warnings

### Phase 8: Error Handling & User Feedback - Open

- [ ] Add shared error UI for backend 403 limit errors
- [ ] Add toast notifications for warning/reached states
- [ ] Wire chat and evaluation API failures to limit-specific messages

### Phase 9: Admin / Subscription Management - Open

- [ ] Admin-only pricing/user tier management view if needed
- [ ] Manage Subscription link after payment portal exists
- [ ] Payment-webhook driven tier updates remain backend/future work

### Phase 10: Localization & Accessibility - Partially Complete

- [x] Existing settings plan strings in English and Sinhala locale files
- [x] Tier badge ARIA label
- [x] Usage warning status role
- [ ] Move new hard-coded pricing/limit strings into locale files
- [ ] Full Sinhala translations for new warning/upgrade strings
- [ ] Manual mobile/accessibility pass

### Phase 11: Testing - Open

- [ ] Unit tests for API normalizers and hooks
- [ ] Integration tests for chat learning limit UI
- [ ] Integration tests for evaluation session/upload limit UI
- [ ] E2E: user hits learning limit and navigates to upgrade
- [ ] E2E: admin changes tier and frontend reflects change after refresh

## Code Touchpoints

- `src/types/pricing.ts`
- `src/lib/constants.ts`
- `src/lib/api.ts`
- `src/hooks/usePricing.ts`
- `src/app/settings/[tab]/page.tsx`
- `src/components/settings/SettingsNav.tsx`
- `src/components/settings/PlanSettings.tsx`
- `src/components/settings/ProfileSettings.tsx`
- `src/components/pricing/TierBadge.tsx`
- `src/components/pricing/LimitWarning.tsx`
- `src/components/chat/InputBar.tsx`
- `src/components/chat/EvaluationStartScreen.tsx`
- `src/components/chat/EvaluationInputs.tsx`
- `public/locales/en/common.json`
- `public/locales/si/common.json`

## Notes

- Learning request limits are enforced by the backend using a rolling one-hour window.
- Evaluation session limits reset daily using `Asia/Colombo`.
- Backend currently returns simple string `detail` for limit 403 errors in enforcement paths; frontend structured `LimitExceededError` support is ready for richer payloads later.
- `GET /api/v1/usage/me` does not return live per-session evaluation count, only the configured per-session limit. The frontend uses uploaded answer count locally for upload guarding.
