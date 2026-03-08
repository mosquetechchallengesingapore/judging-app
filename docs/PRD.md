# Product Requirements Document (PRD)
## Hackathon Judging App

**Version:** 1.0  
**Date:** March 8, 2026  
**Status:** Draft

---

## 1. Overview

A mobile-first web application for managing hackathon judging. Allows organizers to create hackathons, define scoring criteria, assign judges, register participant teams, and tabulate scores in real-time.

---

## 2. Problem Statement

Hackathon organizers need a simple, centralized tool to:
- Manage multiple hackathons
- Define custom judging criteria with weighted scoring
- Coordinate multiple judges
- Collect and aggregate scores in real-time
- Display live results and allow last-minute score adjustments

---

## 3. User Roles

| Role | Description |
|------|-------------|
| **Admin/Organizer** | Creates hackathons, manages criteria/judges/teams, edits final scores |
| **Judge** | Scores assigned teams based on criteria, can view results |

---

## 4. Core Features

### 4.1 Hackathon Lobby (Home Screen)
- Display list of all hackathons with status badges:
  - **Live** - Currently active, scoring enabled
  - **Upcoming** - Scheduled, scoring not yet open
  - **Completed** - Finished, view-only
- Search/filter hackathons
- Create new hackathon (+ Create button)
- Actions per hackathon:
  - **View Results** - See live rankings
  - **Enter Scoring** - Judge scoring interface (Live only)
  - **Edit Results** - Admin score adjustments
  - **Delete** - Remove hackathon

### 4.2 Hackathon Setup (Admin)
Tabbed interface with three sections:

#### 4.2.1 Criteria Tab
- Add new criterion:
  - Name (e.g., "Creativity", "Technical Complexity")
  - Max Points (e.g., 10, 20)
  - Weight % (e.g., 40%)
- Display existing criteria list
- Edit/delete criteria
- **Validation:** Total weight must equal 100%
- Save button (disabled until valid)

#### 4.2.2 Judges Tab
- Add new judge:
  - Full Name
  - Email Address
  - Role (dropdown: Technical Judge, Business Judge, etc.)
- Display current judges list with count
- Remove judges

#### 4.2.3 Participants Tab
- Add new team:
  - Team Name
  - Project Description
- Display current teams list with count
- Remove teams

### 4.3 Judge Scoring Interface
- Header shows:
  - Currently scoring team (dropdown to switch)
  - Assigned judge name (dropdown to switch)
- For each criterion:
  - Display criterion name
  - Score selector (1 to max points, button grid)
  - Show selected score (e.g., "8/10")
- Notes field for judge comments
- **Submit Scores** button
- Scores saved per judge per team

### 4.4 Live Results Screen
- Hackathon name header
- **Podium display** for top 3:
  - 1st place (center, elevated)
  - 2nd place (left)
  - 3rd place (right)
  - Team avatars, names, and total scores
- **Live Rankings** list for remaining teams:
  - Rank number
  - Team name
  - Location (optional)
  - Total weighted score
  - Expandable for score breakdown

### 4.5 Edit Final Scores (Admin)
- Search teams by name
- Per team card:
  - Team name and project description
  - Total score display
  - Editable input fields for each criterion score
- **Save** button to persist changes
- Bottom navigation: Dashboard, Teams, Scoring, Settings

---

## 5. Score Calculation

```
Final Score = Σ (criterion_score × criterion_weight)
```

Example:
| Criterion | Score | Max | Weight | Weighted |
|-----------|-------|-----|--------|----------|
| Creativity | 8 | 10 | 40% | 3.2 |
| Technical | 7 | 10 | 30% | 2.1 |
| Business Value | 9 | 10 | 20% | 1.8 |
| Presentation | 4 | 5 | 10% | 0.8 |
| **Total** | | | | **7.9** |

Scores are normalized to a 0-100 scale for display.

---

## 6. User Flows

### 6.1 Admin Flow
1. Open app → Lobby screen
2. Click "+ Create" → Enter hackathon name, dates
3. Navigate to Criteria tab → Add scoring criteria
4. Navigate to Judges tab → Add judges
5. Navigate to Participants tab → Add teams
6. Save hackathon → Status: Upcoming
7. When event starts → Status changes to Live
8. Monitor results via "View Results"
9. Make adjustments via "Edit Results" if needed

### 6.2 Judge Flow
1. Open app → Lobby screen
2. Find hackathon (status: Live)
3. Click "Enter Scoring"
4. Select team from dropdown
5. Score each criterion
6. Add optional notes
7. Click "Submit Scores"
8. Repeat for other teams
9. View results anytime via "View Results"
10. Can re-enter scoring to edit before finalization

---

## 7. Technical Requirements

### 7.1 Platform
- **Mobile-first responsive web app**
- Works on iOS Safari, Android Chrome, desktop browsers

### 7.2 Tech Stack (Recommended)
- **Frontend:** React/Next.js with TailwindCSS
- **Backend:** Next.js API routes or Express.js
- **Database:** See Section 8
- **Hosting:** Vercel or Netlify

### 7.3 Performance
- Page load < 2 seconds
- Real-time score updates (polling or WebSocket)

---

## 8. Database Recommendation

For simplicity and ease of development, I recommend:

### **Option 1: Supabase (Recommended)**
- **Why:** PostgreSQL with built-in auth, real-time subscriptions, REST API auto-generated
- **Pros:**
  - Free tier generous (500MB, 50K monthly active users)
  - Real-time out of the box
  - Row-level security for judge permissions
  - Easy to set up, great docs
- **Cons:** Vendor lock-in

### **Option 2: SQLite + Turso**
- **Why:** Serverless SQLite, extremely simple
- **Pros:**
  - Zero config, works anywhere
  - Turso provides edge replication
  - Familiar SQL
- **Cons:** Less real-time support

### **Option 3: Firebase Firestore**
- **Why:** NoSQL, real-time by default
- **Pros:**
  - Real-time listeners built-in
  - Great for mobile
- **Cons:** NoSQL can be tricky for relational data like scores

### **My Pick: Supabase**
Best balance of simplicity, features, and scalability for this use case.

---

## 9. Data Model

```
┌─────────────────┐
│   hackathons    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ start_date      │
│ end_date        │
│ status          │
│ created_at      │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│criteria │ │ judges  │ │ teams   │
├─────────┤ ├─────────┤ ├─────────┤
│ id (PK) │ │ id (PK) │ │ id (PK) │
│ hack_id │ │ hack_id │ │ hack_id │
│ name    │ │ name    │ │ name    │
│ max_pts │ │ email   │ │ desc    │
│ weight  │ │ role    │ │ avatar  │
└─────────┘ └────┬────┘ └────┬────┘
                 │           │
                 └─────┬─────┘
                       │
                       ▼
                 ┌───────────┐
                 │  scores   │
                 ├───────────┤
                 │ id (PK)   │
                 │ judge_id  │
                 │ team_id   │
                 │ crit_id   │
                 │ score     │
                 │ notes     │
                 │ timestamp │
                 └───────────┘
```

---

## 10. MVP Scope

### In Scope (v1.0)
- [x] Hackathon CRUD
- [x] Criteria management with weights
- [x] Judge management
- [x] Team/participant management
- [x] Judge scoring interface
- [x] Live results with podium
- [x] Admin score editing

### Out of Scope (Future)
- [ ] User authentication/login
- [ ] Judge assignment to specific teams
- [ ] Export results (PDF/CSV)
- [ ] Multiple scoring rounds
- [ ] Audience voting
- [ ] Team member management
- [ ] Notifications/reminders

---

## 11. Success Metrics

- Judges can submit scores in < 2 minutes per team
- Results update within 5 seconds of score submission
- Zero data loss during judging

---

## 12. Open Questions

1. **Authentication:** Should judges log in, or use a simple access code per hackathon?
2. **Conflict resolution:** If multiple judges score the same team, average scores or separate?
3. **Tie-breaking:** How to handle teams with identical final scores?
4. **Offline support:** Required for venues with poor connectivity?

---

## Appendix: Screen Reference

| Screen | File |
|--------|------|
| Lobby | `hackathon_lobby_refined_buttons/` |
| Criteria | `admin_manage_criteria_grey_save/` |
| Judges | `admin_manage_judges_centered_header/` |
| Participants | `admin_manage_participants_recreated/` |
| Scoring | `judge_scoring_header_dropdowns/` |
| Results | `hackathon_live_results_recreated/` |
| Edit Scores | `edit_final_scores/` |
