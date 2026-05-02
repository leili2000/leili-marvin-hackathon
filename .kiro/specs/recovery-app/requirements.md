# Requirements Document

## Introduction

The Recovery App is a compassionate, privacy-first addiction recovery companion. It provides two core experiences: a **Stats tab** for personal recovery tracking (calendar, daily check-ins, relapse prediction, and a "things that make me happy" list) and a **Social tab** for anonymous peer support (milestone posts, happy posts, and gated vent posts with a mental-health barrier). The app is non-judgmental, non-streak-focused, and subtly proactive about relapse prevention without being intrusive.

This document derives requirements from the approved design document. All requirements are written in EARS notation and reference the TypeScript interfaces, algorithms, and component contracts defined in the design.

---

## Glossary

- **App**: The Recovery App React application as a whole.
- **Auth_System**: The Supabase-backed authentication and profile creation subsystem (`useAuth`, `AuthScreen`, `SignUpForm`, `SignInForm`).
- **ThemeProvider**: The component that derives CSS custom properties from the user's `favorite_color` and injects them into the document root.
- **StatsTab**: The Stats tab component and its child components (`CalendarWidget`, `DailyCheckIn`, `AutoIncrementPrompt`, `HappyList`, `PatternInsights`, `TrackingModeSelector`).
- **CalendarWidget**: The interactive monthly calendar component that displays and edits per-day check-in status.
- **DailyCheckIn**: The check-in form shown when `tracking_mode = 'daily_checkin'`.
- **AutoIncrementPrompt**: The confirmation prompt shown when `tracking_mode = 'auto_increment'`.
- **HappyList**: The component that displays and manages the user's "things that make me happy" items.
- **HappyItem**: A single entry in the happy items list, with `title`, `description`, `energyLevel` (1–5), and `prepLevel` (1–5).
- **AnalyzeCheckin_System**: The fire-and-forget pipeline (`analyzeCheckin`) that processes check-in text and upserts word flags and relapse patterns.
- **PredictNumerical_Function**: The `predictNumerical` pure function that computes a `NumericalPrediction` from a sorted check-in array.
- **BuildWordFlags_Function**: The `buildWordFlags` pure function that identifies risk words from check-in notes.
- **DetectWordRisk_Function**: The `detectWordRisk` pure function that scans recent notes for flagged words.
- **AssessRelapseRisk_Function**: The `assessRelapseRisk` function that combines numerical and NLP signals into a `RelapseRiskAssessment`.
- **NudgeAction_Builder**: The `buildNudgeAction` function that selects a non-obtrusive suggestion based on risk level.
- **RelapseNudge**: The non-obtrusive overlay/banner component rendered at App level.
- **SocialTab**: The Social tab component and its children (`PostFeed`, `PostCard`, `NewPostForm`, `VentBarrier`, `InboxPanel`).
- **VentBarrier**: The finite state machine component that gates access to vent posts.
- **PostFeed**: The scrollable list of posts, filterable by type.
- **PostCard**: A single post card with inline reply capability.
- **Reply_System**: The subsystem handling private replies between users (`usePosts`, `InboxPanel`, `ReplyBox`).
- **RLS_Policy**: Supabase Row Level Security policies applied to all database tables.
- **Supabase**: The backend-as-a-service providing authentication, Postgres database, and RLS.
- **TrackingMode**: Either `'daily_checkin'` or `'auto_increment'` — controls how the user logs their recovery progress.
- **DayStatus**: One of `'clean'`, `'relapse'`, or `null` (unlogged).
- **BarrierState**: The state object for the VentBarrier state machine, containing `step`, `answers`, `ventPostsViewed`, and `barrierPassed`.
- **NumericalPrediction**: The output of `PredictNumerical_Function`, containing predicted relapse date, confidence, and interval history.
- **RelapseRiskAssessment**: The combined output of `AssessRelapseRisk_Function`, containing `overallRisk`, `numerical`, `wordSignals`, `triggeringWords`, and `suggestedAction`.
- **StopWords**: The fixed set of common English words excluded from word-flag analysis.
- **LOOKBACK_DAYS**: The constant (7) representing how many days before a relapse to scan for pre-relapse context words.
- **SCAN_DAYS**: The constant (3) representing how many recent days of notes to scan for risk word matches.
- **RISK_THRESHOLD**: The constant (0.6) representing the minimum Laplace-smoothed risk score for a word to be flagged.

---

## Requirements

### Requirement 1: User Authentication and Profile Creation

**User Story:** As a new user, I want to sign up with my email, a username, my recovery start date, and a favorite color, so that the app is personalized to me from the first session.

#### Acceptance Criteria

1. WHEN a user submits valid sign-up credentials (email, password, username, recovery_start_date, favorite_color), THE Auth_System SHALL create a Supabase auth user and insert a corresponding profile row with all provided fields.
2. WHEN a user submits sign-in credentials that match an existing account, THE Auth_System SHALL establish an authenticated session and render the main App tabs.
3. WHEN a user submits sign-in credentials that do not match any account, THE Auth_System SHALL display the message "Invalid email or password" inline without clearing the form.
4. WHEN a user provides a `favorite_color` value that does not match the pattern `^#[0-9a-fA-F]{6}$`, THE Auth_System SHALL reject the registration and display a validation error.
5. WHEN a user signs out, THE Auth_System SHALL terminate the session and render the AuthScreen.
6. WHILE a session exists on page load, THE Auth_System SHALL restore the authenticated state and render the App tabs without requiring re-login.

---

### Requirement 2: Color Theming

**User Story:** As a user, I want the app's color scheme to reflect my favorite color, so that the interface feels personal and calming.

#### Acceptance Criteria

1. WHEN an authenticated user's profile is loaded, THE ThemeProvider SHALL inject the following CSS custom properties into `document.documentElement`: `--color-primary`, `--color-primary-light`, `--color-primary-dark`, and `--color-primary-contrast`.
2. THE ThemeProvider SHALL derive `--color-primary-light` by increasing the HSL lightness of `favorite_color` by 20 percentage points, clamped to a maximum of 95%.
3. THE ThemeProvider SHALL derive `--color-primary-dark` by decreasing the HSL lightness of `favorite_color` by 15 percentage points, clamped to a minimum of 10%.
4. THE ThemeProvider SHALL set `--color-primary-contrast` to `#000000` when the lightness of `favorite_color` exceeds 50%, and to `#ffffff` otherwise, ensuring WCAG AA contrast compliance.

---

### Requirement 3: Tracking Mode Selection

**User Story:** As a user, I want to choose between daily check-in mode and auto-increment mode, so that I can track my recovery in the way that feels right for me.

#### Acceptance Criteria

1. WHILE `tracking_mode = 'daily_checkin'`, THE StatsTab SHALL render the DailyCheckIn component in the Overview pane and hide the AutoIncrementPrompt.
2. WHILE `tracking_mode = 'auto_increment'`, THE StatsTab SHALL render the AutoIncrementPrompt component in the Overview pane and hide the DailyCheckIn.
3. WHEN a user changes their tracking mode via the TrackingModeSelector, THE StatsTab SHALL persist the new mode to the `profiles` table and immediately update the Overview pane rendering.

---

### Requirement 4: Daily Check-In

**User Story:** As a user in daily check-in mode, I want to log whether today was a clean day or a relapse, along with an optional note, so that I can build an honest record of my recovery.

#### Acceptance Criteria

1. WHEN a user submits a check-in with a `status` of `'clean'` or `'relapse'`, an optional `note`, and an optional `relapse_reason`, THE DailyCheckIn SHALL upsert the record to the `checkins` table using `(user_id, date)` as the conflict key.
2. WHEN a check-in is successfully saved, THE AnalyzeCheckin_System SHALL process the check-in text asynchronously (fire-and-forget) without blocking the UI.
3. IF a check-in upsert fails, THEN THE DailyCheckIn SHALL display an inline error message and preserve the form state.
4. WHEN a user submits a check-in for a date that already has a record, THE DailyCheckIn SHALL replace the existing record with the new values.

---

### Requirement 5: Auto-Increment Tracking

**User Story:** As a user in auto-increment mode, I want to confirm each day as clean with a single tap, so that I don't have to fill out a form every day.

#### Acceptance Criteria

1. WHEN a user confirms the AutoIncrementPrompt, THE AutoIncrementPrompt SHALL record a `'clean'` check-in for today's date with the provided optional note.
2. WHEN a user indicates a relapse via the AutoIncrementPrompt, THE AutoIncrementPrompt SHALL record a `'relapse'` check-in for today's date with the provided reason.
3. WHEN today's check-in has already been recorded, THE AutoIncrementPrompt SHALL display the existing status and not prompt for re-confirmation.

---

### Requirement 6: Calendar Widget

**User Story:** As a user, I want to view and edit my check-in history on a monthly calendar, so that I can see my progress at a glance and correct any mistakes.

#### Acceptance Criteria

1. WHEN a user clicks a calendar day that is on or after their `recovery_start_date` and is not a future date, THE CalendarWidget SHALL cycle the day's status through the sequence: `null → 'clean' → 'relapse' → null`.
2. WHEN a user clicks a calendar day that is before their `recovery_start_date`, THE CalendarWidget SHALL display a prompt asking whether the user wants to update their recovery start date, and SHALL NOT update the day's status.
3. WHEN a user clicks a future calendar day, THE CalendarWidget SHALL take no action and SHALL NOT update the day's status.
4. WHEN a user selects a calendar day, THE CalendarWidget SHALL open the DayDetailModal for that date, allowing the user to view or edit the full check-in record including note and relapse reason.
5. THE CalendarWidget SHALL visually distinguish days by status: clean days, relapse days, unlogged days, today, and days before the recovery start date.

---

### Requirement 7: Happy Items List

**User Story:** As a user, I want to maintain a list of things that make me happy, so that I have a personal toolkit of positive activities to draw on when I'm struggling.

#### Acceptance Criteria

1. THE HappyList SHALL display all happy items belonging to the current user, ordered by creation date descending.
2. WHEN a user submits a new happy item with a non-empty `title`, a valid `energyLevel` (integer 1–5), and a valid `prepLevel` (integer 1–5), THE HappyList SHALL persist the item to the `happy_items` table and display it immediately.
3. IF a user submits a happy item with an `energyLevel` or `prepLevel` outside the range 1–5, THEN THE HappyList SHALL reject the submission and display a validation error.
4. WHEN a user removes a happy item, THE HappyList SHALL delete the record from the `happy_items` table and remove it from the display.
5. IF a happy item deletion fails, THEN THE HappyList SHALL display an error message and restore the item in the display.

---

### Requirement 8: NLP Word-Flag Analysis

**User Story:** As a user, I want the app to learn which words in my notes tend to appear before relapses, so that it can give me a heads-up when those words show up in my recent writing.

#### Acceptance Criteria

1. WHEN the AnalyzeCheckin_System processes a check-in, THE BuildWordFlags_Function SHALL scan the `note` and `relapse_reason` fields of all check-ins to identify words that appear disproportionately in the 7 days before a relapse (`LOOKBACK_DAYS = 7`).
2. THE BuildWordFlags_Function SHALL exclude all words in the StopWords set from the output.
3. THE BuildWordFlags_Function SHALL exclude words shorter than 4 characters from the output.
4. THE BuildWordFlags_Function SHALL only include a word in the output if it has appeared in at least 2 check-ins.
5. THE BuildWordFlags_Function SHALL only include a word in the output if its Laplace-smoothed risk score (`relapseContextCount / (relapseContextCount + cleanContextCount + 1)`) is greater than or equal to `RISK_THRESHOLD` (0.6).
6. WHEN the AnalyzeCheckin_System identifies risk words, THE AnalyzeCheckin_System SHALL upsert each word to the `relapse_word_flags` table, incrementing the frequency counter if the word already exists.
7. WHEN the DetectWordRisk_Function scans the last `SCAN_DAYS` (3) days of check-in notes, THE DetectWordRisk_Function SHALL return a list of `WordRiskSignal` objects for each flagged word found, sorted by `riskScore` descending.

---

### Requirement 9: Numerical Relapse Prediction

**User Story:** As a user, I want the app to analyze the pattern of my past relapses and give me an estimate of when I might be at risk again, so that I can be more prepared.

#### Acceptance Criteria

1. WHEN given a sorted check-in array with fewer than 2 relapse entries, THE PredictNumerical_Function SHALL return a `NumericalPrediction` with `confidence = 'low'` and `predictedDate = null`.
2. WHEN given a sorted check-in array with 2 to 4 relapse entries, THE PredictNumerical_Function SHALL return a `NumericalPrediction` with `confidence = 'medium'`.
3. WHEN given a sorted check-in array with 5 or more relapse entries, THE PredictNumerical_Function SHALL return a `NumericalPrediction` with `confidence = 'high'`.
4. THE PredictNumerical_Function SHALL compute `averageInterval` as the weighted mean of `intervalHistory`, where the weight of interval at index `i` is `i + 1` (most recent interval has the highest weight).
5. THE PredictNumerical_Function SHALL always return a `predictedDate` that is greater than or equal to today's date (past predictions are clamped to today).
6. THE PredictNumerical_Function SHALL populate `intervalHistory` with the day-gaps between consecutive relapse dates in ascending order.

---

### Requirement 10: Relapse Risk Assessment

**User Story:** As a user, I want the app to combine numerical patterns and word signals into a single risk level, so that I get a coherent picture of my current risk without being overwhelmed by raw data.

#### Acceptance Criteria

1. WHEN `daysUntilPredicted <= 3` and `confidence = 'high'`, THE AssessRelapseRisk_Function SHALL set `overallRisk = 'high'`.
2. WHEN `daysUntilPredicted <= 3` and `confidence` is not `'high'`, THE AssessRelapseRisk_Function SHALL set `overallRisk = 'medium'`.
3. WHEN `daysUntilPredicted` is between 4 and 7 (inclusive), THE AssessRelapseRisk_Function SHALL set `overallRisk` to at least `'low'`.
4. WHEN `wordSignals.length >= 3`, THE AssessRelapseRisk_Function SHALL set `overallRisk = 'high'`, overriding any lower numerical risk.
5. WHEN `wordSignals.length >= 1` and the current `overallRisk = 'none'`, THE AssessRelapseRisk_Function SHALL set `overallRisk = 'low'`.
6. WHEN `overallRisk = 'none'`, THE AssessRelapseRisk_Function SHALL return `suggestedAction = null`.
7. WHEN `overallRisk` is `'medium'` or `'high'`, THE AssessRelapseRisk_Function SHALL return a non-null `suggestedAction`.

---

### Requirement 11: Non-Obtrusive Nudge System

**User Story:** As a user, I want the app to gently suggest positive activities or milestone logging when I might be at risk, without being pushy or alarming, so that I feel supported rather than surveilled.

#### Acceptance Criteria

1. WHEN `risk = 'high'`, THE NudgeAction_Builder SHALL always return a non-null `NudgeAction`.
2. WHEN `risk` is `'low'` or `'medium'`, THE NudgeAction_Builder SHALL return `null` with approximately 40% probability to avoid being intrusive.
3. WHEN `risk = 'low'` and low-energy happy items (energyLevel ≤ 2) are available, THE NudgeAction_Builder SHALL return a `NudgeAction` of type `'happy_item_suggestion'` referencing a randomly selected low-energy item.
4. WHEN `risk = 'low'` and no low-energy happy items exist, THE NudgeAction_Builder SHALL return `null`.
5. WHEN a `NudgeAction` references a `HappyItem` with `energyLevel >= 4`, THE NudgeAction_Builder SHALL set `askIfDoneRecently = true` on the action.
6. WHEN `risk = 'high'` and no happy items exist, THE NudgeAction_Builder SHALL return a `NudgeAction` of type `'milestone_prompt'`.
7. THE RelapseNudge component SHALL render as a non-blocking overlay or banner and SHALL provide a dismiss action.

---

### Requirement 12: Vent Barrier State Machine

**User Story:** As a user, I want to go through a brief mental-health check before reading vent posts, so that I'm in a good headspace before engaging with potentially heavy content.

#### Acceptance Criteria

1. WHEN a user selects the "Vent Posts" filter in the SocialTab, THE VentBarrier SHALL transition from idle to the `intro` step.
2. WHEN a user clicks "Not right now" at the `intro` step, THE VentBarrier SHALL transition back to idle and the vent post feed SHALL NOT be shown.
3. WHEN a user answers `'no'` at any of the three check steps (`check1`, `check2`, `check3`) and clicks "Take me back", THE VentBarrier SHALL transition back to idle.
4. WHEN a user answers `'yes'` or `'okay'` at all three check steps and clicks Continue, THE VentBarrier SHALL transition to the `ready` step with `barrierPassed = true`.
5. WHEN the VentBarrier is in the `ready` step and the user clicks "Continue to posts", THE VentBarrier SHALL display the vent post feed.
6. WHEN a vent post is rendered in the feed, THE VentBarrier SHALL increment `ventPostsViewed` by 1.
7. WHEN `ventPostsViewed` reaches 3, THE VentBarrier SHALL reset to the `intro` step with `ventPostsViewed = 0` and `barrierPassed = false`, requiring the user to complete the barrier again.
8. WHEN a user navigates away from the Vent Posts filter, THE VentBarrier SHALL transition back to idle.
9. THE transitionBarrier function SHALL be a pure function with no side effects.

---

### Requirement 13: Social Feed and Posts

**User Story:** As a user, I want to share milestones, positive moments, and struggles anonymously with a community of peers, so that I feel less alone in my recovery.

#### Acceptance Criteria

1. WHEN a user creates a post of type `'milestone'`, `'happy'`, or `'vent'`, THE SocialTab SHALL persist the post to the `posts` table with the user's `anonymous_name` and display it in the feed.
2. THE PostFeed SHALL display posts ordered by `created_at` descending, limited to 50 posts.
3. WHEN a user selects a filter (All, Milestones, Good Things, Vent Posts), THE PostFeed SHALL display only posts matching the selected `type`, or all posts when "All" is selected.
4. WHEN a user attempts to create a vent post, THE SocialTab SHALL require the VentBarrier to be completed before displaying the vent post creation form.
5. IF a post fetch fails, THEN THE PostFeed SHALL display a "Couldn't load posts" message with a retry button.
6. IF a post creation fails, THEN THE NewPostForm SHALL display an inline error and preserve the draft content.

---

### Requirement 14: Private Replies

**User Story:** As a user, I want to send and receive private replies to posts, so that I can offer and receive personal support without exposing conversations to the whole community.

#### Acceptance Criteria

1. WHEN a user sends a reply to a post, THE Reply_System SHALL persist the reply to the `replies` table with `sender_id`, `recipient_id`, `post_id`, and `content`.
2. THE PostCard SHALL display the `replyCount` only to the post owner (when `post.userId === currentUserId`).
3. THE InboxPanel SHALL display all replies where the current user is the `recipient_id`, showing the sender's `anonymous_name`, the reply content, and the timestamp.
4. THE RLS_Policy SHALL enforce that a reply is readable only by the sender or the recipient.
5. IF a reply send fails, THEN THE Reply_System SHALL display "Couldn't send reply — try again" and preserve the reply draft.

---

### Requirement 15: Data Privacy and Row Level Security

**User Story:** As a user, I want my personal recovery data to be private and inaccessible to other users, so that I can be honest in my tracking without fear of exposure.

#### Acceptance Criteria

1. THE RLS_Policy SHALL prevent any authenticated user from reading another user's `checkins` rows.
2. THE RLS_Policy SHALL prevent any authenticated user from reading another user's `happy_items` rows.
3. THE RLS_Policy SHALL prevent any authenticated user from reading another user's `relapse_patterns` rows.
4. THE RLS_Policy SHALL prevent any authenticated user from reading another user's `relapse_word_flags` rows.
5. THE RLS_Policy SHALL allow all authenticated users to read all `posts` rows.
6. THE RLS_Policy SHALL allow users to write only to their own rows in all tables.
7. THE Auth_System SHALL never store authentication tokens manually; token management SHALL be delegated entirely to the Supabase JS client.

---

### Requirement 16: Pattern Insights Display

**User Story:** As a user, I want to see a summary of the patterns the app has identified in my check-in history, so that I can understand my triggers and protective factors.

#### Acceptance Criteria

1. THE PatternInsights component SHALL display all `relapse_patterns` rows for the current user, grouped by `side` (`'regression'` and `'protective'`).
2. THE PatternInsights component SHALL display the total clean days, total days since recovery start, and total relapse count.
3. WHEN `overallRisk` is `'medium'` or `'high'`, THE PatternInsights component SHALL display the `RelapseRiskAssessment` summary including `triggeringWords` and the nearest predicted date.
4. WHEN `overallRisk` is `'none'` or `'low'`, THE PatternInsights component SHALL not display the risk assessment section.
