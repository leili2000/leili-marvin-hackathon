# User Stories — Recovery App

This document captures the full set of user stories for the Recovery App, organized by feature area. Each story reflects the design as implemented: Supabase-backed auth with favorite-color theming, two tabs (Stats + Social), two tracking modes, a calendar widget with a start-date guard, a happy items list, a vent barrier state machine, private replies, bimodal numerical + NLP relapse prediction, and a non-obtrusive nudge system.

---

## 1. Authentication & Profile Setup

**US-1.1 — Sign Up**
As a new user, I want to create an account with my email, a username, my recovery start date, and a favorite color, so that the app is personalized to me from the very first session.

**US-1.2 — Sign In**
As a returning user, I want to sign in with my email and password, so that I can access my private recovery data.

**US-1.3 — Session Persistence**
As a returning user, I want my session to be restored automatically when I reopen the app, so that I don't have to log in every time.

**US-1.4 — Sign Out**
As a user, I want to sign out of the app, so that my data is protected on shared devices.

**US-1.5 — Favorite Color Selection**
As a new user, I want to pick a favorite color during sign-up using a color picker with preset swatches, so that the app's theme reflects my personality from day one.

---

## 2. Color Theming

**US-2.1 — Personalized Theme**
As a user, I want the app's primary color, light variant, dark variant, and text contrast color to all derive from my favorite color, so that the interface feels uniquely mine.

**US-2.2 — Accessible Contrast**
As a user with visual needs, I want the app to automatically choose black or white text on my primary color based on WCAG AA contrast rules, so that the interface is always readable.

**US-2.3 — Theme Update**
As a user, I want to be able to update my favorite color in settings and see the theme change immediately, so that I can refresh the feel of the app over time.

---

## 3. Stats Tab — Overview

**US-3.1 — Clean Day Count**
As a user, I want to see my total number of clean days and the number of days since my recovery start date on the overview screen, so that I can appreciate how far I've come without being pressured by a streak counter.

**US-3.2 — Tracking Mode Awareness**
As a user, I want the overview to show the right input method for my chosen tracking mode (daily check-in form or auto-increment prompt), so that logging my day feels natural and low-friction.

---

## 4. Tracking Mode Selection

**US-4.1 — Choose Daily Check-In Mode**
As a user who wants to reflect on each day, I want to select "Daily Check-In" mode in settings, so that I'm prompted to log my status, write a note, and optionally record a relapse reason every day.

**US-4.2 — Choose Auto-Increment Mode**
As a user who prefers minimal interaction, I want to select "Auto-Increment" mode in settings, so that I can confirm each day as clean with a single tap and only fill in details when something goes wrong.

**US-4.3 — Switch Tracking Mode**
As a user, I want to switch between tracking modes at any time in settings, so that I can adapt my approach as my recovery evolves.

---

## 5. Daily Check-In

**US-5.1 — Log a Clean Day**
As a user in daily check-in mode, I want to mark today as a clean day and optionally add a note about how I'm feeling, so that I build an honest and reflective record.

**US-5.2 — Log a Relapse**
As a user in daily check-in mode, I want to mark today as a relapse and optionally record the reason, so that I can be honest with myself and help the app learn my patterns.

**US-5.3 — Edit Today's Check-In**
As a user, I want to update today's check-in if I made a mistake, so that my record stays accurate.

**US-5.4 — Error Recovery**
As a user, I want to see a clear error message if my check-in fails to save, and have my form data preserved, so that I don't lose what I wrote.

---

## 6. Auto-Increment Tracking

**US-6.1 — Confirm a Clean Day**
As a user in auto-increment mode, I want to tap a single button to confirm today was clean, so that logging my progress takes less than five seconds.

**US-6.2 — Report a Relapse**
As a user in auto-increment mode, I want to report a relapse with a brief reason, so that the app can learn from it even when I'm not in daily check-in mode.

**US-6.3 — Already Logged Today**
As a user, I want the auto-increment prompt to show me today's existing status if I've already logged, so that I don't accidentally double-log.

---

## 7. Calendar Widget

**US-7.1 — View Monthly Calendar**
As a user, I want to see a monthly calendar where each day is color-coded by status (clean, relapse, unlogged, today, before start date), so that I can see my recovery pattern at a glance.

**US-7.2 — Click to Cycle Status**
As a user, I want to click any day on or after my recovery start date to cycle its status through unlogged → clean → relapse → unlogged, so that I can quickly correct my history.

**US-7.3 — Start-Date Guard**
As a user, I want the calendar to prompt me to update my recovery start date if I try to log a day before it, so that I'm not silently blocked and understand why the click didn't work.

**US-7.4 — No Future Edits**
As a user, I want future dates to be non-interactive on the calendar, so that I can't accidentally log days that haven't happened yet.

**US-7.5 — Day Detail Modal**
As a user, I want to click any logged day to open a detail modal where I can view and edit the full check-in record (status, note, relapse reason), so that I can add context to past entries.

---

## 8. Happy Items List

**US-8.1 — View Happy Items**
As a user, I want to see a list of things that make me happy, so that I have a personal toolkit of positive activities ready when I need them.

**US-8.2 — Add a Happy Item**
As a user, I want to add a new item to my happy list with a title, an optional description, an energy level (1–5), and a prep level (1–5), so that the nudge system can suggest activities that match my current capacity.

**US-8.3 — Energy and Prep Badges**
As a user, I want each happy item to display its energy and prep level as visual badges, so that I can quickly scan for low-effort options when I'm struggling.

**US-8.4 — Remove a Happy Item**
As a user, I want to remove items from my happy list that are no longer relevant, so that my toolkit stays fresh and meaningful.

**US-8.5 — Input Validation**
As a user, I want the app to reject happy items with energy or prep levels outside 1–5, so that the data stays consistent and the nudge system works correctly.

---

## 9. NLP Word-Flag Analysis

**US-9.1 — Automatic Risk Word Learning**
As a user, I want the app to silently analyze my check-in notes over time and identify words that tend to appear in the days before a relapse, so that it can warn me when those words show up in my recent writing.

**US-9.2 — Pre-Relapse Context Window**
As a user, I want the app to look at notes written up to 7 days before each relapse when building my word profile, so that early warning signs are captured even when they appear days in advance.

**US-9.3 — Noise Filtering**
As a user, I want common English words (stop words) and very short words to be excluded from my risk word profile, so that the signals are meaningful rather than noisy.

**US-9.4 — Minimum Evidence Threshold**
As a user, I want a word to only be flagged as a risk word if it has appeared in at least 2 check-ins and has a Laplace-smoothed risk score of at least 0.6, so that the system doesn't over-react to one-off mentions.

**US-9.5 — Recent Note Scanning**
As a user, I want the app to scan my last 3 days of notes for flagged risk words and surface any matches, so that I get timely warnings based on what I've been writing recently.

---

## 10. Numerical Relapse Prediction

**US-10.1 — Interval-Based Prediction**
As a user with a history of relapses, I want the app to analyze the gaps between my past relapses and predict when I might be at risk again, so that I can be more intentional during high-risk windows.

**US-10.2 — Recency-Weighted Average**
As a user, I want the prediction to weight recent relapse intervals more heavily than older ones, so that the estimate reflects my current patterns rather than distant history.

**US-10.3 — Confidence Levels**
As a user, I want to know how confident the prediction is (low with fewer than 2 relapses, medium with 2–4, high with 5+), so that I can calibrate how seriously to take it.

**US-10.4 — No Past Predictions**
As a user, I want the predicted date to always be today or in the future, so that I'm never shown a prediction that has already passed.

**US-10.5 — Bimodal Detection**
As a user whose relapse pattern has two distinct cycles (e.g., short-cycle and long-cycle relapses), I want the app to detect this bimodal distribution and show predictions for both clusters, so that I'm aware of both risk windows.

---

## 11. Relapse Risk Assessment

**US-11.1 — Combined Risk Signal**
As a user, I want the app to combine my numerical prediction and my word-flag signals into a single overall risk level (none, low, medium, high), so that I get one clear picture instead of two separate numbers.

**US-11.2 — Word Signals Override**
As a user, I want 3 or more simultaneous word-flag matches to always trigger a high risk level, regardless of the numerical prediction, so that strong linguistic signals are never downplayed.

**US-11.3 — Risk-Driven Suggestions**
As a user at medium or high risk, I want the app to always suggest a concrete action (a happy item or a milestone prompt), so that I'm never left with a warning and no path forward.

**US-11.4 — No Action When Safe**
As a user at no risk, I want the app to stay silent and not suggest anything, so that I'm not pestered when things are going well.

---

## 12. Non-Obtrusive Nudge System

**US-12.1 — Gentle Suggestion**
As a user at low or medium risk, I want the app to occasionally (not always) suggest a happy item or milestone prompt as a soft banner or overlay, so that I feel supported without feeling watched.

**US-12.2 — High-Risk Always Nudges**
As a user at high risk, I want the app to always show a suggestion, so that I'm never left without support during the most critical moments.

**US-12.3 — Low-Energy Suggestions for Low Risk**
As a user at low risk, I want the app to suggest only low-energy happy items (energy level ≤ 2), so that the suggestion feels achievable rather than overwhelming.

**US-12.4 — Ask If Done Recently**
As a user, I want the nudge to ask "have you been able to do that recently?" when it suggests a high-energy activity (energy level ≥ 4), so that the suggestion feels like a caring check-in rather than a command.

**US-12.5 — Dismissible**
As a user, I want to dismiss any nudge with a single tap, so that it never blocks my workflow.

---

## 13. Vent Barrier

**US-13.1 — Mental Health Check Before Venting**
As a user who wants to read vent posts, I want to go through a brief three-question mental health check before the feed is shown, so that I'm in a grounded headspace before engaging with heavy content.

**US-13.2 — Opt Out Gracefully**
As a user who isn't ready, I want to be able to exit the barrier at any step (including the intro) without penalty, so that I never feel forced to engage with content I'm not ready for.

**US-13.3 — Negative Answer Exits**
As a user who answers "no" to any check question, I want to be returned to the idle state immediately, so that the app respects my self-assessment.

**US-13.4 — Three-Post Reset**
As a user, I want the barrier to reset after I've read 3 vent posts, so that I'm periodically reminded to check in with myself rather than doom-scrolling through heavy content.

**US-13.5 — Pure State Machine**
As a developer, I want the barrier's `transitionBarrier` function to be a pure function with no side effects, so that it is easy to test and reason about.

---

## 14. Social Feed

**US-14.1 — Browse Community Posts**
As a user, I want to browse a feed of anonymous posts from the community (milestones, good things, vent posts), so that I feel connected to others on a similar journey.

**US-14.2 — Filter by Post Type**
As a user, I want to filter the feed by post type (All, Milestones, Good Things, Vent Posts), so that I can choose the kind of content I'm in the mood for.

**US-14.3 — Share a Milestone**
As a user, I want to post a milestone anonymously, so that I can celebrate my progress with the community without revealing my identity.

**US-14.4 — Share Something Good**
As a user, I want to post something that made me happy today, so that I can spread positivity and remind others that good moments exist.

**US-14.5 — Share a Struggle (Vent)**
As a user who needs to vent, I want to post anonymously about a struggle after completing the mental health barrier, so that I can be honest about hard days in a safe space.

**US-14.6 — Feed Error Handling**
As a user, I want to see a "Couldn't load posts" message with a retry button if the feed fails to load, so that I know what happened and can try again.

---

## 15. Private Replies

**US-15.1 — Reply to a Post**
As a user, I want to send a private reply to any post in the feed, so that I can offer personal support to someone without broadcasting my message to everyone.

**US-15.2 — Receive Replies**
As a user who posted something, I want to receive private replies in my inbox, so that I can read the support others have offered me.

**US-15.3 — Reply Count Visibility**
As a post owner, I want to see how many replies my post has received, so that I know when to check my inbox.

**US-15.4 — Reply Privacy**
As a user, I want replies to be visible only to the sender and the recipient, so that private conversations stay private.

**US-15.5 — Reply Error Handling**
As a user, I want to see "Couldn't send reply — try again" if a reply fails, with my draft preserved, so that I don't lose what I wrote.

---

## 16. Pattern Insights

**US-16.1 — View Regression Patterns**
As a user, I want to see a list of patterns the app has identified as contributing to my relapses, so that I can recognize and address my triggers.

**US-16.2 — View Protective Patterns**
As a user, I want to see a list of patterns the app has identified as protective factors in my recovery, so that I can lean into what's working.

**US-16.3 — Summary Statistics**
As a user, I want to see my total clean days, total days since my recovery start date, and total relapse count in the pattern insights view, so that I have a factual baseline for reflection.

**US-16.4 — Risk Summary When Elevated**
As a user at medium or high risk, I want the pattern insights view to show my current risk assessment including triggering words and the nearest predicted date, so that I have full context when I need it most.

---

## 17. Data Privacy

**US-17.1 — Private Check-In Data**
As a user, I want my check-in history to be completely private and inaccessible to other users, so that I can be fully honest in my logging.

**US-17.2 — Private Happy Items**
As a user, I want my happy items list to be private, so that my personal coping toolkit is mine alone.

**US-17.3 — Private Relapse Patterns**
As a user, I want my relapse patterns and word flags to be private, so that the app's analysis of my behavior is never exposed to others.

**US-17.4 — Secure Token Handling**
As a user, I want the app to never manually store my authentication token, so that my credentials are managed securely by the Supabase client library.
