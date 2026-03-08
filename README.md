# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Installation

```bash
npm install
```

### Development

1. Start the Vite dev server:
```bash
npm run dev
```

2. In a separate terminal, start Convex:
```bash
npx convex dev
```

The app will be available at `http://localhost:5173/`

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── Lobby.jsx           # Hackathon list & creation
│   │   ├── HackathonSetup.jsx  # Criteria, judges, teams management
│   │   ├── JudgeScoring.jsx    # Score submission interface
│   │   ├── Results.jsx         # Live results & podium
│   │   └── EditScores.jsx      # Admin score editing
│   ├── App.jsx
│   └── index.css
├── convex/
│   ├── schema.ts               # Database schema
│   ├── hackathons.ts           # Hackathon CRUD
│   ├── criteria.ts             # Criteria CRUD
│   ├── judges.ts               # Judge CRUD
│   ├── teams.ts                # Team CRUD
│   └── scores.ts               # Score submission & calculation
├── vite.config.js
├── tailwind.config.js
└── convex.json
```

## Features

### Admin
- Create hackathons with custom dates
- Define scoring criteria with max points and weights
- Manage judges and teams
- View live results
- Edit final scores

### Judges
- Submit scores for assigned teams
- Add notes for each submission
- View live rankings
- Edit scores before finalization

## Database Schema

- **hackathons**: Event information (name, dates, status)
- **criteria**: Scoring criteria (name, max points, weight %)
- **judges**: Judge information (name, email, role)
- **teams**: Participating teams (name, description)
- **scores**: Individual judge scores (judge → team → criteria)

## Score Calculation

Final Score = Σ (criterion_score × criterion_weight / 100)

Scores are normalized to 0-100 scale for display.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Backend**: Convex (TypeScript)
- **Database**: Convex (managed)
- **Real-time**: Convex subscriptions

## Next Steps

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the dev server
3. In another terminal, run `npx convex dev` to start Convex
4. Open http://localhost:5173 in your browser
5. Create a hackathon and start managing judges & teams
