# Echo Frontend

Expo mobile app shell for the Echo prototype.

## Stack

- Expo
- React Native
- TypeScript

## Run

```bash
cd frontend
npm install
npm run start
```

## Structure

- `App.tsx`: app shell, tab state, and screen transition animation
- `src/navigation/tabs.ts`: tab registry and screen wiring
- `src/screens/*`: individual screen components for each tab
- `src/components/*`: reusable shell UI pieces
- `src/data/mock.ts`: placeholder data for presentation and demo flows
