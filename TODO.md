# TFT Ranked Tracker — Reste à faire

## Fonctionnalités implémentées ✅

- Polling automatique de l'API Riot toutes les 5 min (configurable via `POLL_INTERVAL_MS`)
- Filtrage **uniquement Classé TFT** (queue_id=1100 — pas Normal, pas Fiesta de Pengu)
- Notification Discord via webhook avec embed coloré (or=1er, argent=2e, bronze=3e…)
- Calcul delta LP correct même lors des promotions/rétrogradations (conversion absolue tier+rank+lp)
- Dashboard Next.js : stats globales, graphique LP, historique des parties
- Backend Express + Prisma + SQLite (aucun serveur de base de données requis)
- Proxy Next.js `/api/backend/*` → `localhost:3001/api/*` (pas de CORS)

---

## Reste à faire 🚧

### Priorité haute

- [ ] **Authentification** : l'outil est actuellement mono-utilisateur sans auth.
  Ajouter un mot de passe simple (basic auth ou token env) pour protéger l'API si exposée.

- [ ] **Import rétroactif** : seules les parties jouées *après* le premier lancement sont détectées.
  Implémenter un endpoint `POST /api/games/import?count=N` pour importer les N dernières parties Ranked.

- [ ] **Gestion des erreurs API Riot** : si la clé expire (clés de dev durent 24h), le poller crashe silencieusement.
  Ajouter un retry avec backoff exponentiel et une notification Discord d'erreur.

### Priorité moyenne

- [ ] **Support multi-summoner** : actuellement un seul invocateur configuré via `.env`.
  Étendre le schéma Prisma et l'API pour gérer plusieurs invocateurs.

- [ ] **Fonctionnalité Tournoi** (`pages/_legacy_tournament.tsx`) : stub non implémenté.
  Implémenter un mini-bracket ou un suivi de tournoi privé entre amis.

- [ ] **Page historique dédiée** (`pages/_legacy_history.tsx`) : stub non implémenté.
  Créer une vue historique complète avec filtres (tier, placement, date).

### Priorité basse

- [ ] **Upload vidéo** (`frontend/components/VideoUpload.tsx`) : stub non implémenté.
  Permettre d'associer un replay ou clip à une partie.

- [ ] **Notifications email** : en cas d'inactivité prolongée (ex. pas de partie Ranked depuis 3 jours).
  Utiliser nodemailer ou un service transactionnel (Resend, Sendgrid).

- [ ] **Guide de déploiement production** : Railway, Render, ou VPS Docker.
  Documenter les variables d'environnement nécessaires pour un déploiement hors localhost.

- [ ] **Tests automatisés** : zéro test actuellement.
  Ajouter des tests unitaires pour `toAbsoluteLP()`, `buildDiscordEmbed()`, et les routes API.

---

## Démarrage rapide

```bash
# 1. Cloner et installer
git clone https://github.com/CorbiatFlorentin/tft-performance-tracker.git
cd tft-performance-tracker

# 2. Configurer le backend
cp backend/.env.example backend/.env   # puis remplir RIOT_API_KEY, DISCORD_WEBHOOK_URL, SUMMONER_NAME…

# 3. Lancer le backend
cd backend
pnpm install --ignore-scripts
npx prisma generate
npx prisma db push
npx ts-node src/index.ts

# 4. Lancer le frontend (autre terminal)
cd frontend
pnpm install --ignore-scripts
pnpm dev
# → http://localhost:3000
```

> **Clé Riot API** : obtenir une clé de dev sur https://developer.riotgames.com (expire après 24h).
> Pour une clé production, soumettre un projet via le portail Riot.
