# Backend - MACCAM CRM API

API REST complète pour l'application MACCAM CRM.

## Installation

```bash
npm install
```

## Configuration

1. Copier le fichier `.env.example` vers `.env`
2. Configurer vos variables d'environnement :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/maccam_db?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

## Base de données

### Migrations

```bash
# Créer et appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate

# Peupler la DB avec des données de test
npm run seed

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

## Démarrage

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm start
```

## API Endpoints

### Authentification
- POST `/api/v1/auth/register` - Inscription
- POST `/api/v1/auth/login` - Connexion
- GET `/api/v1/auth/me` - Profil utilisateur (protégé)

### Clients
- GET `/api/v1/customers` - Liste des clients
- GET `/api/v1/customers/:id` - Détails d'un client
- POST `/api/v1/customers` - Créer un client
- PUT `/api/v1/customers/:id` - Modifier un client
- DELETE `/api/v1/customers/:id` - Supprimer un client

### Leads, Projects, Tasks, Invoices
Mêmes endpoints disponibles pour chaque ressource.

## Structure

```
backend/
├── controllers/     # Logique métier
├── routes/          # Routes API
├── middleware/      # Middleware (auth, validation, erreur)
├── prisma/          # Schéma DB et migrations
├── app.js           # Configuration Express
└── server.js        # Point d'entrée
```

## Sécurité

- Helmet pour sécuriser les headers HTTP
- Rate limiting (100 requêtes / 15 min)
- CORS configuré
- Validation des données
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe
