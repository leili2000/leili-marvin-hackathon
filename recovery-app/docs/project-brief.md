# Recovery Place — Project Brief

## Tech Stack

- HTML, TypeScript, React
- Supabase (PostgreSQL)
- Populated with fake sample data

## Overview

An addiction recovery website focused on core features. This is a prototype — UI polish is not the priority.

---

## Authentication

- Sign in collects a **username** and a **password**
- Passwords are encrypted and saved upon account creation
- Additionally collect **recovery start date** and **favorite color** upon account creation
- The favorite color is used for the **color theme** of the website

---

## App Structure

Two tabs:

1. **User Stats tab** (default/first tab)
2. **Social tab**

---

## Social Tab

- Users can make **posts**
- **Replies** are anonymous and sent directly to the original poster (not shown to anyone else)
- **Number of replies** on a post is not shown to anyone except the original poster
- Three types of posts:
  - **Milestone** — celebrating progress
  - **Something that makes you happy** — positive moments
  - **Relapse "vent" post** — sharing struggles
- **Vent post barriers**: every time before users access vent posts, they go through a mental health check-in. Users are only shown 3 vent posts before they must go through the barriers again. These barriers ensure the user is in a good mental space before reading challenging posts.

---

## User Stats Tab

### Tracking Modes

Users choose one of two modes for tracking their progress:

#### Option 1: Daily Check-In

- Users are expected to check in daily and confirm how their day went
- If they miss a day, they can fill in information, but it is not required

#### Option 2: Auto-Increment

- Assumes users kept their progress up unless they tell us otherwise
- Users are still prompted about their day if they log in
- **No streaks are shown** — instead, users see stats for how many **total days** they have not relapsed on

### Calendar Widget

- Click once for a **clean day**, click twice for a **relapse day**
- If a user clicks a day **before their recorded recovery start date**, they are prompted to change their start date to the clicked day before any changes can be made
- Users can **view and edit** their check-in entries for any given day on the calendar

### Things That Make Me Happy

- Users can **add or remove items**
- Each item consists of:
  - A **title**
  - An optional **description**
  - A level of **energy needed** (1–5)
  - A level of **preparation/resources needed** (1–5), such as time

---

## Relapse Prediction

Users are encouraged to provide a **"why"** for any relapses. This, along with the number of days between each relapse, is used to predict future relapses.

### Goal

The website should attempt to **predict a relapse** so that it can provide support proactively.

### Method 1: Numerical Pattern Analysis

Analyze the pattern of **days between relapses** to predict when another might happen.

### Method 2: Keyword Analysis

Analyze **words that are often mentioned in the days leading up to a relapse** and not often mentioned otherwise. If these words appear in recent entries, flag a potential relapse.

### Nudge System

When a potential relapse is detected, the system should **subtly** suggest one of:

- Logging a **milestone**
- Doing something from their **"things that make me happy"** list

If it suggests a happy activity with a **harder difficulty rating**, it will ask if the user has been able to do that activity recently.

The system will **randomly generate some or none** of this behavior when the user loads a new page. It should **not be obtrusive**.
