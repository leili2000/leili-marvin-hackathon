# Implementation Plan: Recovery App

## Overview

Rebuild the Recovery App from scratch using spec-driven development. The app is a React 19 + TypeScript + Vite application backed by Supabase, providing a Stats tab (calendar, check-ins, relapse prediction, happy items) and a Social tab (anonymous posts, vent barrier, private replies). Implementation proceeds bottom-up: types and utilities first, then hooks and data layer, then UI components, and finally integration and wiring.

## Tasks

- [x] 1. Set up project foundation and core types
  - [x] 1.1 Clean the existing src/ directory and set up fresh project structure
    - Remove all existing components, hooks, lib, types, and test files from `src/`
    - Create directory structure: `src/types/`, `src/lib/`, `src/hooks/`, `src/components/auth/`, `src/components/stats/`, `src/components/social/`, `src/components/shared/`, `src/test/`
    - Keep `src/main.tsx`, `src/index.css`, and `src/assets/` intact
    - _Requirements: N/A (project setup)_

  - [x] 1.2 Define all TypeScript interfaces and types
    - Create `src/types/index.ts` with all interfaces from the design: `AppUser`, `Post`, `Reply`, `CheckIn`, `DayStatus`, `RelapsePattern`, `HappyItem`, `RelapseWordFlag`, `NumericalPrediction`, `IntervalCluster`, `DistributionMode`, `WordRiskSignal`, `RelapseRiskAssessment`, `NudgeAction`, `NudgeType`, `BarrierState`, `BarrierStep`, `BarrierAnswer`, `CalendarDay`, `TrackingMode`, `PostType`
    - _Requirements: All (foundational types)_

  - [x] 1.3 Set up Supabase client and test configuration
    - Create `src/lib/supabase.ts` with the Supabase client initialization using environment variables
    - Verify `recovery-app/.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - Set up `src/test/setup.ts` with Testing Library and Vitest configuration
    - Add `fast-check` as a dev dependency
    - _Requirements: 15.7_

- [x] 2. Implement Supabase schema and seed data
  - [x] 2.1 Write the complete database schema SQL
    - Create `supabase/schema.sql` with all tables: `profiles`, `posts`, `replies`, `checkins`, `relapse_patterns`, `happy_items`, `relapse_word_flags`
    - Include all CHECK constraints, UNIQUE constraints, and DEFAULT values from the design
    - Enable RLS on all tables and create policies per the RLS Summary
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 2.2 Write seed data SQL
    - Create `supabase/seed.sql` with sample data: 3 profiles, 10 posts, 30 check-ins per user, 5 relapse patterns per user, 3 happy items per user, and word flags
    - Ensure seed data covers all post types (milestone, happy, vent) and both tracking modes
    - _Requirements: N/A (development support)_

- [ ] 3. Implement pure algorithm functions
  - [x] 3.1 Implement `predictNumerical` function
    - Create `src/lib/predictRelapse.ts` with the `predictNumerical` function
    - Extract relapse dates, compute intervals, calculate weighted average, predict date, clamp to today, determine confidence level
    - Follow the algorithm exactly as specified in the design document
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 3.2 Write property tests for `predictNumerical`
    - **Property 12: Predicted date is never in the past** — for any sorted check-in array with ≥2 relapses and any today value, predictedDate ≥ today
    - **Validates: Requirements 9.5**

  - [ ]* 3.3 Write property tests for `predictNumerical` confidence levels
    - **Property 13: Confidence level matches relapse count** — low for <2, medium for 2–4, high for ≥5 relapses
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [ ]* 3.4 Write property test for weighted average interval
    - **Property 14: Weighted average interval correctness** — averageInterval equals round(Σ(interval[i] × (i+1)) / Σ(i+1))
    - **Validates: Requirements 9.4**

  - [x] 3.5 Implement `buildWordFlags` and `detectWordRisk` functions
    - Create `src/lib/analyzeCheckin.ts` with `buildWordFlags` and `detectWordRisk`
    - Implement LOOKBACK_DAYS scanning, stop word filtering, MIN_WORD_LENGTH filtering, Laplace-smoothed risk scoring, and RISK_THRESHOLD filtering
    - Implement `detectWordRisk` to scan recent notes for flagged words
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7_

  - [ ]* 3.6 Write property tests for `buildWordFlags`
    - **Property 10: Word flags exclude stop words** — no stop word appears in output
    - **Validates: Requirements 8.2**

  - [ ]* 3.7 Write property test for word flag minimum evidence
    - **Property 11: Word flags minimum evidence and risk threshold** — every output word has ≥2 occurrences and risk score ≥ 0.6
    - **Validates: Requirements 8.4, 8.5**

  - [~] 3.8 Implement `assessRelapseRisk` function
    - Create `src/lib/assessRisk.ts` with the `assessRelapseRisk` function
    - Combine numerical prediction and word-flag detection into a single `RelapseRiskAssessment`
    - Implement risk level determination logic: numerical proximity + word signal count
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 3.9 Write property tests for `assessRelapseRisk`
    - **Property 15: No risk implies no action** — overallRisk = 'none' implies suggestedAction = null
    - **Validates: Requirements 10.6**

  - [ ]* 3.10 Write property test for high word-signal risk override
    - **Property 16: High word-signal count forces high risk** — wordSignals.length ≥ 3 implies overallRisk = 'high'
    - **Validates: Requirements 10.4**

  - [~] 3.11 Implement `buildNudgeAction` function
    - Create `src/lib/nudge.ts` with the `buildNudgeAction` function
    - Implement random suppression (40% for non-high risk), low-energy item selection for low risk, mixed suggestions for medium risk, always-suggest for high risk
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 3.12 Write property tests for `buildNudgeAction`
    - **Property 17: High risk always produces a nudge action** — buildNudgeAction('high', anyItems) is never null
    - **Validates: Requirements 11.1**

  - [ ]* 3.13 Write property test for askIfDoneRecently
    - **Property 18: askIfDoneRecently set for high-energy items** — when happyItem.energyLevel ≥ 4, askIfDoneRecently = true
    - **Validates: Requirements 11.5**

  - [~] 3.14 Implement `transitionBarrier` function
    - Create `src/lib/ventBarrier.ts` with the pure `transitionBarrier` state machine function
    - Implement all action types: START, ANSWER, NEXT, PASS, DECLINE, POST_VIEWED, RESET
    - Implement the 3-post reset logic for POST_VIEWED
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

  - [ ]* 3.15 Write property tests for `transitionBarrier`
    - **Property 19: ventPostsViewed never exceeds 3 before reset** — for any action sequence, ventPostsViewed ≤ 2 in returned state
    - **Validates: Requirements 12.7**

  - [ ]* 3.16 Write property test for barrier DECLINE behavior
    - **Property 20: 'no' answer always returns to idle** — DECLINE at any check step returns step='intro', barrierPassed=false, ventPostsViewed=0
    - **Validates: Requirements 12.3**

  - [~] 3.17 Implement theme derivation utilities
    - Create `src/lib/theme.ts` with `hexToHsl`, `hslToHex`, and `deriveTheme` functions
    - Implement HSL lightness adjustments: +20 (clamped to 95) for light, -15 (clamped to 10) for dark
    - Implement contrast calculation: #000000 for lightness > 50%, #ffffff otherwise
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.18 Write property tests for theme derivation
    - **Property 3: Theme derivation completeness** — deriveTheme returns all four CSS custom property keys with valid values
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 3.19 Write property test for theme contrast correctness
    - **Property 4: Theme contrast correctness** — lightness > 50% → contrast = #000000, lightness ≤ 50% → contrast = #ffffff
    - **Validates: Requirements 2.4**

- [ ] 4. Checkpoint — Ensure all pure function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement custom hooks (data layer)
  - [~] 5.1 Implement `useAuth` hook
    - Create `src/hooks/useAuth.ts` with session management, sign-in, sign-up, sign-out, and profile fetching
    - Handle session restoration on page load via `getSession()`
    - On sign-up, create auth user and insert profile row with all fields (username, recovery_start_date, favorite_color, tracking_mode)
    - Return `AppUser` object with camelCase field mapping from snake_case DB columns
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 15.7_

  - [~] 5.2 Implement `useStats` hook
    - Create `src/hooks/useStats.ts` with check-in CRUD, happy item CRUD, pattern fetching, word flag fetching, and relapse risk assessment
    - Implement check-in upsert with `(user_id, date)` conflict key
    - Implement fire-and-forget pattern analysis after check-in save
    - Implement happy item add/remove with optimistic updates
    - Fetch and expose `RelapseRiskAssessment` for the current user
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 7.1, 7.2, 7.4, 7.5, 8.1, 8.6_

  - [~] 5.3 Implement `usePosts` hook
    - Create `src/hooks/usePosts.ts` with post fetching (ordered by created_at desc, limit 50), post creation, reply sending, and inbox fetching
    - Implement type-based filtering
    - Expose reply count only for posts owned by the current user
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6, 14.1, 14.2, 14.3, 14.5_

- [ ] 6. Implement authentication UI
  - [~] 6.1 Implement AuthScreen with SignInForm and SignUpForm
    - Create `src/components/auth/AuthScreen.tsx` with toggle between sign-in and sign-up forms
    - SignInForm: email + password fields, inline error display for invalid credentials
    - SignUpForm: email, password, username, recovery start date, and favorite color fields
    - Validate favorite_color format (`^#[0-9a-fA-F]{6}$`) before submission
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [~] 6.2 Implement ColorPicker component
    - Create `src/components/auth/ColorPicker.tsx` with preset color swatches and custom hex input
    - Validate hex format on change
    - _Requirements: 1.1, 1.4_

  - [~] 6.3 Implement ThemeProvider component
    - Create `src/components/shared/ThemeProvider.tsx` that calls `deriveTheme` and injects CSS custom properties into `document.documentElement`
    - Apply theme on mount and when `favoriteColor` changes
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Implement Stats tab components
  - [~] 7.1 Implement StatsTab with sub-navigation
    - Create `src/components/stats/StatsTab.tsx` with StatsNav (overview, calendar, happy, patterns, settings)
    - Conditionally render DailyCheckIn or AutoIncrementPrompt based on tracking mode
    - Include StatCards showing total clean days and days since recovery start
    - _Requirements: 3.1, 3.2_

  - [~] 7.2 Implement DailyCheckIn component
    - Create `src/components/stats/DailyCheckIn.tsx` with status selection (clean/relapse), optional note, optional relapse reason
    - Display inline error on upsert failure, preserve form state
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [~] 7.3 Implement AutoIncrementPrompt component
    - Create `src/components/stats/AutoIncrementPrompt.tsx` with single-tap clean confirmation and relapse option
    - Show existing status if today's check-in already recorded
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 7.4 Implement CalendarWidget and DayDetailModal
    - Create `src/components/stats/CalendarWidget.tsx` with monthly grid, click-to-cycle (null → clean → relapse → null), start-date guard, future-date guard
    - Create `src/components/stats/DayDetailModal.tsx` for viewing/editing a day's full check-in record
    - Visually distinguish days by status: clean, relapse, unlogged, today, before start date
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [~] 7.5 Implement HappyList, HappyItemCard, and AddHappyItemForm
    - Create `src/components/stats/HappyList.tsx` displaying items ordered by creation date descending
    - Create `src/components/stats/HappyItemCard.tsx` with title, description, energy/prep badges, and remove button
    - Create `src/components/stats/AddHappyItemForm.tsx` with validation for energyLevel and prepLevel (1–5 range)
    - Handle deletion failure with error message and item restoration
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 7.6 Implement PatternInsights component
    - Create `src/components/stats/PatternInsights.tsx` displaying relapse patterns grouped by side (regression/protective)
    - Show total clean days, total days since start, total relapse count
    - Conditionally display risk assessment summary (triggering words, nearest predicted date) when overallRisk is medium or high
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [~] 7.7 Implement TrackingModeSelector component
    - Create `src/components/stats/TrackingModeSelector.tsx` in the Settings pane
    - Persist mode change to profiles table and trigger immediate re-render
    - _Requirements: 3.3_

- [ ] 8. Checkpoint — Ensure Stats tab renders and functions correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Social tab components
  - [~] 9.1 Implement SocialTab with PostFilterBar
    - Create `src/components/social/SocialTab.tsx` with filter bar (All, Milestones, Good Things, Vent Posts)
    - Gate vent post filter behind VentBarrier completion
    - _Requirements: 13.3, 13.4_

  - [~] 9.2 Implement PostFeed and PostCard components
    - Create `src/components/social/PostFeed.tsx` displaying posts ordered by created_at desc, limit 50
    - Create `src/components/social/PostCard.tsx` with post content, anonymous name, timestamp, and inline ReplyBox
    - Show reply count only to post owner
    - Display "Couldn't load posts" with retry on fetch failure
    - _Requirements: 13.2, 13.5, 14.2_

  - [~] 9.3 Implement NewPostForm component
    - Create `src/components/social/NewPostForm.tsx` with post type selection and content input
    - Require VentBarrier completion before allowing vent post creation
    - Display inline error on creation failure, preserve draft
    - _Requirements: 13.1, 13.4, 13.6_

  - [~] 9.4 Implement VentBarrier component
    - Create `src/components/social/VentBarrier.tsx` using the `transitionBarrier` state machine
    - Render step-by-step UI: intro, check1, check2, check3, ready
    - Handle decline paths (return to idle), answer recording, and 3-post reset
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [~] 9.5 Implement InboxPanel and ReplyBox components
    - Create `src/components/social/InboxPanel.tsx` showing replies where current user is recipient, with sender anonymous name, content, and timestamp
    - Create `src/components/social/ReplyBox.tsx` as inline reply form on PostCard
    - Display "Couldn't send reply — try again" on failure, preserve draft
    - _Requirements: 14.1, 14.3, 14.5_

- [ ] 10. Implement RelapseNudge component and App shell
  - [~] 10.1 Implement RelapseNudge overlay/banner
    - Create `src/components/shared/RelapseNudge.tsx` as a non-blocking overlay or banner
    - Display nudge message from `suggestedAction` with dismiss action
    - Run once per page navigation, not on every render
    - _Requirements: 11.7_

  - [~] 10.2 Implement App shell with routing and tab navigation
    - Rewrite `src/App.tsx` to wire together: AuthScreen (unauthenticated), AppHeader + ThemeProvider + TabNav + StatsTab/SocialTab + RelapseNudge (authenticated)
    - Implement tab switching between Stats and Social
    - Run relapse risk assessment on authenticated load and pass suggestedAction to RelapseNudge
    - Handle sign-out to return to AuthScreen
    - _Requirements: 1.2, 1.5, 1.6, 2.1_

- [ ] 11. Implement global styles and CSS theming
  - [~] 11.1 Write base CSS with theme custom properties
    - Update `src/index.css` with CSS custom property usage (`--color-primary`, `--color-primary-light`, `--color-primary-dark`, `--color-primary-contrast`)
    - Style all components using these custom properties for a cohesive themed look
    - Ensure plain HTML/CSS only — no component library
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 12. Checkpoint — Ensure full app renders end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Write remaining unit and integration tests
  - [ ]* 13.1 Write unit tests for CalendarWidget click behavior
    - Test click-to-cycle: null → clean → relapse → null
    - Test start-date guard: clicking before recovery_start_date shows prompt
    - Test future-date guard: clicking future date has no effect
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 13.2 Write unit tests for VentBarrier component
    - Test full barrier progression: intro → check1 → check2 → check3 → ready
    - Test decline paths at each check step
    - Test 3-post reset behavior
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 13.3 Write unit tests for HappyList validation
    - Test rejection of energyLevel/prepLevel outside [1, 5]
    - Test successful add and remove flows
    - Test deletion failure recovery
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ]* 13.4 Write unit tests for PostFeed filtering
    - Test that filter selection shows only matching post types
    - Test "All" filter shows all posts
    - _Requirements: 13.3_

  - [ ]* 13.5 Write unit tests for AuthScreen validation
    - Test favorite_color hex format validation
    - Test inline error display for invalid credentials
    - _Requirements: 1.3, 1.4_

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app uses plain HTML/CSS with CSS custom properties — no UI component library
- All styling uses the theme custom properties derived from the user's favorite color
- fast-check is used for property-based testing alongside Vitest
