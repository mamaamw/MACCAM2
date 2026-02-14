# 🚀 Duralux CRM - Application Full Stack Moderne

Une application CRM complète construite avec **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM** et **React**.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)

## ✨ Fonctionnalités

- ✅ **Authentification JWT** - Système sécurisé de connexion/inscription
- 👥 **Gestion des clients** - CRUD complet pour les clients
- 🎯 **Gestion des leads** - Suivi des opportunités commerciales
- 📊 **Projets** - Gestion de projets avec membres et tâches
- ✅ **Tâches** - Système de gestion des tâches avec priorités
- 💰 **Factures** - Génération et suivi des factures
- 📈 **Dashboard** - Vue d'ensemble avec statistiques
- 🔒 **Sécurité** - Helmet, rate limiting, CORS
- 🎨 **UI Moderne** - Interface React avec Tailwind CSS
- 📱 **Responsive** - Fonctionne sur tous les appareils

## 🏗️ Architecture

```
MACCAM2/
├── backend/          # API REST Node.js/Express
│   ├── controllers/  # Logique métier
│   ├── routes/       # Routes API
│   ├── middleware/   # Middleware (auth, validation, erreur)
│   ├── prisma/       # Schéma DB et migrations
│   └── server.js     # Point d'entrée
├── frontend/         # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── layouts/     # Layouts (Dashboard, Auth)
│   │   ├── services/    # Services API
│   │   ├── stores/      # State management (Zustand)
│   │   └── lib/         # Utilitaires
│   └── index.html
└── assets/           # Assets du template original
```

## 🛠️ Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **Prisma ORM** - ORM moderne et type-safe
- **JWT** - Authentification par tokens
- **Bcrypt** - Hashage des mots de passe
- **Helmet** - Sécurité HTTP headers
- **Express Rate Limit** - Protection contre les abus

### Frontend
- **React 18** - Bibliothèque UI
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **React Query** - Gestion des données serveur
- **Zustand** - State management
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **React Hot Toast** - Notifications

## 📦 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn

### 1. Cloner le projet

```bash
cd C:\Users\Suira\Documents\MACCAM2
```

### 2. Installer les dépendances Backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend

1. Créer le fichier `.env` dans le dossier `backend/` :

```bash
cd backend
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos informations :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/duralux_db?schema=public"

# Serveur
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend

1. Créer le fichier `.env` dans le dossier `frontend/` :

```bash
cd ../frontend
cp .env.example .env
```

2. Le fichier `.env` devrait contenir :

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Base de données PostgreSQL

1. **Créer la base de données** :

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE duralux_db;

# Créer un utilisateur (optionnel)
CREATE USER duralux_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE duralux_db TO duralux_user;

# Quitter
\q
```

2. **Exécuter les migrations Prisma** :

```bash
cd backend
npx prisma migrate dev --name init
```

3. **Générer le client Prisma** :

```bash
npx prisma generate
```

4. **Peupler la base de données avec des données de test** :

```bash
npm run seed
```

Cela créera :
- Un compte admin : `admin@duralux.com` / `admin123`
- Un compte manager : `manager@duralux.com` / `admin123`
- Des clients, leads, projets et tâches d'exemple

## 🚀 Démarrage

### Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur **http://localhost:5000**

### Démarrer le Frontend

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

L'application démarre sur **http://localhost:3000**

### Accéder à l'application

1. Ouvrez votre navigateur sur **http://localhost:3000**
2. Connectez-vous avec :
   - Email: `admin@duralux.com`
   - Mot de passe: `admin123`

## 📁 Structure du projet

### Backend

```
backend/
├── controllers/           # Logique métier
│   ├── auth.controller.js
│   ├── customer.controller.js
│   └── lead.controller.js
├── routes/               # Routes API
│   ├── auth.routes.js
│   ├── customer.routes.js
│   └── ...
├── middleware/           # Middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validate.middleware.js
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── seed.js           # Données de test
├── .env                  # Variables d'environnement
├── app.js                # Configuration Express
├── server.js             # Point d'entrée
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/       # Composants layout
│   ├── pages/
│   │   ├── auth/         # Pages d'authentification
│   │   ├── customers/    # Pages clients
│   │   ├── leads/        # Pages leads
│   │   └── Dashboard.jsx
│   ├── layouts/          # Layouts principaux
│   ├── services/         # Services API
│   ├── stores/           # State management
│   ├── lib/              # Utilitaires
│   ├── App.jsx           # Composant principal
│   ├── main.jsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🔌 API Documentation

### Authentification

- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/me` - Profil utilisateur (protégé)
- `PUT /api/v1/auth/updateprofile` - Mise à jour profil (protégé)
- `PUT /api/v1/auth/updatepassword` - Changement mot de passe (protégé)

### Clients

- `GET /api/v1/customers` - Liste des clients (avec pagination et recherche)
- `GET /api/v1/customers/:id` - Détails d'un client
- `POST /api/v1/customers` - Créer un client
- `PUT /api/v1/customers/:id` - Modifier un client
- `DELETE /api/v1/customers/:id` - Supprimer un client (Admin/Manager)

### Leads

- `GET /api/v1/leads` - Liste des leads
- `GET /api/v1/leads/:id` - Détails d'un lead
- `POST /api/v1/leads` - Créer un lead
- `PUT /api/v1/leads/:id` - Modifier un lead
- `DELETE /api/v1/leads/:id` - Supprimer un lead

### Autres endpoints

- Projects : `/api/v1/projects`
- Tasks : `/api/v1/tasks`
- Invoices : `/api/v1/invoices`

Toutes les routes (sauf auth) nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 🛠️ Commandes utiles

### Backend

```bash
npm run dev          # Démarrer en mode développement
npm start            # Démarrer en production
npm run seed         # Peupler la DB avec des données de test
npx prisma studio    # Ouvrir l'interface Prisma Studio
npx prisma migrate dev  # Créer une nouvelle migration
```

### Frontend

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build pour production
npm run preview      # Prévisualiser le build
```

## 🔐 Sécurité

- ✅ Hashage des mots de passe avec bcrypt (12 rounds)
- ✅ Authentification JWT
- ✅ Protection CORS
- ✅ Headers sécurisés avec Helmet
- ✅ Rate limiting (100 requêtes / 15 min)
- ✅ Validation des données avec express-validator
- ✅ Protection contre les injections SQL (Prisma ORM)

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `frontend/tailwind.config.js` pour personnaliser le thème.

### Ajouter de nouveaux modèles

1. Modifier `backend/prisma/schema.prisma`
2. Créer une migration : `npx prisma migrate dev --name nom_migration`
3. Créer le contrôleur et les routes correspondants

## 📝 Prochaines étapes

Pour continuer le développement :

1. **Implémenter les pages manquantes** (Projects, Tasks, Invoices)
2. **Ajouter des graphiques** avec Recharts
3. **Système de notifications en temps réel** avec WebSocket
4. **Upload de fichiers** pour les avatars et documents
5. **Export PDF** pour les factures
6. **Filtres avancés** et recherche
7. **Tests unitaires et d'intégration**
8. **Déploiement** sur Vercel (frontend) et Railway/Render (backend)

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé avec ❤️ pour MACCAM2

---

**Besoin d'aide ?** Consultez la documentation de :
- [Prisma](https://www.prisma.io/docs)
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
