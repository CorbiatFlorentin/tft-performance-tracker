# TFT Performance Tracker

## Description
TFT Performance Tracker est une application locale permettant aux joueurs de **Teamfight Tactics (TFT)** de suivre leurs performances au fil du temps. Grâce à ce projet, chaque utilisateur peut :
- Enregistrer ses résultats de parties et suivre une **courbe de progression**.
- Ajouter des **commentaires et vidéos** pour analyser ses performances.
- Organiser des **tournois amicaux** avec suivi des scores.
- Gérer son compte utilisateur avec une **suppression automatique après 3 ans d'inactivité** (notification par e-mail).
- Bénéficier d'une **interface optimisée pour mobile** et conforme aux **critères RGAA** d'accessibilité.

## Installation

### Prérequis
- [Node.js](https://nodejs.org/) (v18+ recommandé)
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- [PostgreSQL](https://www.postgresql.org/) (si installation locale)

### 1. Cloner le projet
```bash
git clone https://github.com/TON-USERNAME/tft-performance-tracker.git
cd tft-performance-tracker
```

### 2. Configuration de l'environnement
Créer un fichier `.env` dans `backend/` et ajouter :
```
DATABASE_URL=postgresql://user:password@localhost:5432/tft
JWT_SECRET=ton_secret
EMAIL_HOST=smtp.example.com
EMAIL_USER=ton_email@example.com
EMAIL_PASS=ton_mot_de_passe
```

### 3. Installation des dépendances
```bash
pnpm install
cd frontend && pnpm install && cd ..
cd backend && pnpm install && cd ..
```

### 4. Configuration de la base de données
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Lancer le projet
**Démarrer PostgreSQL (si pas via Docker) :**
```bash
sudo systemctl start postgresql
```

**Lancer le backend :**
```bash
cd backend
pnpm run dev
```

**Lancer le frontend :**
```bash
cd frontend
pnpm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000) ! 🚀