# REFIT Checkout Server

Malý server, ktorý vytvára Stripe Checkout platby pre refitvintage.sk a po úspešnej platbe pošle objednávku na existujúci objednávkový server (ten istý, čo dnes prijíma objednávky).

## Nasadenie na Railway (nový, samostatný projekt)

1. Na [railway.app](https://railway.app) klikni **New Project → Deploy from GitHub repo** a vyber `DiegoPokusal/REFIT-shop`.
2. V nastaveniach projektu nastav **Root Directory** na `server` (aby Railway spúšťal len tento priečinok, nie celý repozitár).
3. V **Settings → Variables** pridaj:
   - `STRIPE_SECRET_KEY` — tvoj Stripe secret key (Stripe Dashboard → Developers → API keys)
   - `ORDER_SERVER_URL` — `https://glorious-optimism-production-0039.up.railway.app` (existujúci server)
   - `SITE_URL` — `https://refitvintage.sk`
   - `ALLOWED_ORIGIN` — `https://refitvintage.sk`
   - `STRIPE_WEBHOOK_SECRET` — pridáš až v kroku 5
4. Railway ti pridelí verejnú URL (napr. `https://refit-checkout-server-production.up.railway.app`) — v **Settings → Networking** klikni "Generate Domain", ak tam ešte nie je.
5. V [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) klikni **Add endpoint**:
   - Endpoint URL: `<tvoja Railway URL>/webhook`
   - Events to send: `checkout.session.completed`
   - Po vytvorení skopíruj **Signing secret** (začína `whsec_`) a vlož ho do Railway premennej `STRIPE_WEBHOOK_SECRET`.
6. V `index.html` / `generate_old.js` nastav `CHECKOUT_SERVER_URL` na tvoju Railway URL z kroku 4.

## Testovanie

Stripe má testovacie karty — napr. `4242 4242 4242 4242`, ľubovoľný budúci dátum, ľubovoľné CVC. Použi **test mode** kľúče (`sk_test_...`), kým si istý, že všetko funguje, potom prepni na **live mode** kľúče (`sk_live_...`).

## Lokálny beh

```
cd server
npm install
cp .env.example .env   # vyplň skutočné hodnoty
npm start
```

Pre lokálne testovanie webhookov použi [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:4000/webhook`.
