# Frontend (Vite + React + TypeScript)

This folder contains the client application built with Vite, React and TypeScript.

Quick start

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser (Vite default). The project uses the scripts defined in `package.json`.

Available npm scripts

- `dev` — start Vite dev server
- `build` — compile TypeScript (tsc -b) and produce a production build (Vite)
- `preview` — preview the production build locally
- `lint` — run ESLint across the project

Environment variables

Create a `.env` or `.env.local` in the `frontend/` folder for local overrides. Example:

```env
VITE_API_URL=http://localhost:5000
```

Access variables in code via `import.meta.env.VITE_API_URL` (note the `VITE_` prefix — Vite exposes only variables that start with `VITE_`).

Build & Preview

```bash
# build for production
npm run build

# preview the production build
npm run preview
```

Linting

```bash
npm run lint
```

Tips & troubleshooting

- If port 5173 is already in use, Vite will suggest another port or set `PORT` in `.env`.
- If you see type errors during `build`, run `npx tsc -p tsconfig.json` to view detailed TypeScript errors.
- If an environment change isn’t picked up by Vite, restart the dev server.

Contributing

- Create a feature branch: `git checkout -b feat/<name>`
- Run lint and tests (if any) before opening a PR.

Notes

- To call the backend set `VITE_API_URL` to match your backend (default in root README: `http://localhost:5000`).
- If you want a Docker or CI workflow for the frontend I can add a sample `Dockerfile` and GitHub Actions workflow.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
