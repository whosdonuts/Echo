# Echo

Monorepo for the Echo prototype — a location-based memory discovery app.

## Structure

```
/
  frontend/   Expo React Native app (SDK 53 / RN 0.79)
  backend/    Lightweight Node mock API
```

## Quick start

### Frontend

```bash
cd frontend
npm install
npx expo start --web        # web (map requires web)
npx expo start              # native dev client
```

### Backend

```bash
cd backend
npm run dev
```

### From repo root

```bash
npm run frontend:web        # shortcut for cd frontend && expo start --web
npm run backend              # shortcut for cd backend && node --watch server.js
```

## Notes

- The map tab uses Mapbox GL JS and requires the web target (`npx expo start --web`).
- A `frontend/.env` file with `EXPO_PUBLIC_MAPBOX_TOKEN` is needed for the map. This file is gitignored.
- The backend serves mock JSON and has no external dependencies.
