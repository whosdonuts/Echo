# Echo

Repository cleanup for the Echo prototype with the app and backend separated.

## Structure

- `frontend/`: Expo React Native app
- `backend/`: lightweight Node mock API for prototype data

## Run

Frontend:

```bash
cd frontend
npm install
npm run start
```

Backend:

```bash
cd backend
npm run dev
```

## Notes

- The frontend remains an Expo app.
- The backend uses Node's built-in HTTP server and serves mock JSON only.
- A legacy root `node_modules/` may still exist from the pre-cleanup layout; the clean install path is now inside `frontend/`.

