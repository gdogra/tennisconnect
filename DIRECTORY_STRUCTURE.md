# TennisConnect Project Directory Structure

```
tennisconnect-monorepo/
├── frontend/                      # React frontend (Vite)
│   ├── public/                    # Static assets
│   │   └── _redirects             # Netlify redirects configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/             # Admin components
│   │   │   │   ├── AdminPanel.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── auth/              # Authentication components
│   │   │   │   ├── GoogleSignIn.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── RequireRole.jsx
│   │   │   ├── challenges/
│   │   │   │   └── ChallengeRequests.jsx
│   │   │   ├── maps/
│   │   │   │   └── TennisCourtMap.jsx
│   │   │   ├── matches/
│   │   │   │   ├── MatchList.jsx
│   │   │   │   └── MatchScheduler.jsx
│   │   │   ├── stats/
│   │   │   │   └── PlayerStats.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── Profile.jsx
│   │   ├── utils/
│   │   │   └── api.js             # API client with VITE_API_BASE_URL
│   │   ├── App.jsx                # Main app with routes
│   │   ├── index.css              # Tailwind imports
│   │   └── main.jsx               # Entry point
│   ├── .env                       # Environment variables
│   ├── index.html
│   ├── netlify.toml               # Netlify deployment config
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                       # Express.js backend
│   ├── db/
│   │   ├── init.js                # Database initialization
│   │   └── schema.sql             # SQL schema with tables
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role-based guards
│   ├── models/
│   │   ├── index.js               # User, Match models
│   │   └── statistics.js          # Player statistics model
│   ├── routes/
│   │   ├── auth.js                # Auth routes including Google Sign-in
│   │   └── statistics.js          # Statistics API routes
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Main Express server
│
├── DEPLOYMENT.md                  # Deployment documentation
├── package.json                   # Root package.json
├── test.sh                        # Test script
└── todo.md                        # Project checklist
```
