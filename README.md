# Campus Cart

Campus Cart is a youthful campus marketplace frontend for everyday student essentials, paired with a minimal Express API foundation.

## Day 1 status

Landing page, responsive navigation, category and product discovery UI, local wishlist/toast interactions, login/signup validation screens, route transitions, 404 page, and `GET /api/health` are implemented. Product data is mock data and no authentication, database models, cart persistence, or order APIs are implemented yet.

## Stack

- React + Vite + JavaScript
- React Router DOM, Framer Motion, Lucide React
- Plain CSS with CSS variables
- Node.js, Express, CORS, dotenv, Mongoose foundation

## Run locally

```bash
cd client
npm install
npm run dev
```

In another terminal:

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The client runs on the Vite port shown in the terminal and the API on `http://localhost:5000`.

## Environment variables

See `server/.env.example`. Replace placeholders locally only; never commit `.env` or credentials.

## Structure

`client/src` contains routes, focused components, data, hooks, and styles. `server` contains the health route, middleware, and optional database connection foundation.

## Roadmap

- Day 2: database models and API foundations
- Day 3: authentication and protected flows
- Day 4: product APIs and search/filtering
- Day 5: cart and checkout foundations
- Day 6: orders, delivery/pickup flow, and hardening

## Theme system

Light and dark themes are defined in `client/src/styles/variables.css`. Add new colors as CSS tokens there and use the tokens in components; do not hardcode interface colors. The selected theme is persisted under `campusCart.theme.v1`, initialized before CSS loads, and managed through `ThemeProvider` and `ThemeToggle`.

## Navigation and dashboards

The public floating menu links to Home, Marketplace, Categories, About, Login, and the demo Dashboard. `/dashboard/:section` supports Overview, Orders, Profile, and Settings. `/admin/:section` supports Overview, Products, Orders, Users, Analytics, Profile, and Settings. These are mock shells with no role gating until the authentication phase. `ThemeProvider`, `FloatingMenu`, and the dashboard layout are permanent infrastructure for Days 3–6.

## Landing motion

`HeroShowcase` is permanent landing-page infrastructure. Its five mock category tiles live in `client/src/data/heroTiles.js`; the component supports timed cycling, controls, keyboard focus, theme tokens, and reduced-motion behavior. Keep it in place through Days 3–6 while backend work changes only data sources.

