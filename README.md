# Echo

Prototype app for Echo — a location-based memory collection experience.

## Structure

- `frontend/` — Expo React Native app
- `backend/` — lightweight Node mock API for prototype data

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run start
```

### Backend

```bash
cd backend
npm run dev
```

### From repo root

```bash
npm run frontend        # start Expo dev server
npm run frontend:web    # start Expo for web
npm run backend         # start mock API server
```

## Notes

- The frontend is an Expo app (React Native).
- The backend uses Node's built-in HTTP server and serves mock JSON only.
- Root `package.json` contains convenience scripts that proxy into `frontend/` and `backend/`.
