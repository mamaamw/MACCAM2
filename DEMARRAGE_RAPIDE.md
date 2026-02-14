# 🚀 Guide de Démarrage Rapide - Duralux CRM

## ⚡ Installation en 5 étapes

### 1️⃣ Installer PostgreSQL

Si vous n'avez pas PostgreSQL installé :

1. Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
2. Installez-le avec les paramètres par défaut
3. Notez le mot de passe que vous définissez pour l'utilisateur `postgres`

### 2️⃣ Créer la base de données

Ouvrez PowerShell et exécutez :

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, créez la base de données
CREATE DATABASE duralux_db;

# Quittez psql
\q
```

### 3️⃣ Installer les dépendances

```powershell
# Naviguer vers le projet
cd C:\Users\Suira\Documents\MACCAM2

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ..\frontend
npm install

# Retourner à la racine
cd ..
```

### 4️⃣ Configurer l'environnement

**Backend** :

Modifiez `backend\.env` et configurez votre base de données :

```env
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/duralux_db?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=changez_moi_en_production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

**Frontend** :

Le fichier `frontend\.env` est déjà configuré :

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 5️⃣ Configurer la base de données et démarrer

**Option A : Utiliser le script automatique (recommandé)**

```powershell
# Configurer la base de données
.\setup-database.ps1

# Démarrer l'application
.\start-dev.ps1
```

**Option B : Manuel**

```powershell
# Configurer Prisma et la base de données
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Dans un terminal, démarrer le backend
npm run dev

# Dans un autre terminal, démarrer le frontend
cd ..\frontend
npm run dev
```

## ✅ Accéder à l'application

1. Ouvrez votre navigateur sur : **http://localhost:3000**
2. Connectez-vous avec :
   - **Email** : `admin@duralux.com`
   - **Mot de passe** : `admin123`

## 🎉 C'est tout !

Vous avez maintenant une application CRM complète et fonctionnelle !

## 📚 Que faire ensuite ?

### Explorer l'application
- ✅ Dashboard avec statistiques
- ✅ Gestion des clients (CRUD complet)
- ✅ Gestion des leads (partiellement implémenté)
- ⏳ Projets (à implémenter)
- ⏳ Tâches (à implémenter)
- ⏳ Factures (à implémenter)

### Développer de nouvelles fonctionnalités

La base est là ! Vous pouvez maintenant :

1. **Implémenter les pages manquantes** :
   - Copier la logique de `Customers` pour `Leads`, `Projects`, etc.
   - Les contrôleurs backend sont déjà prêts

2. **Ajouter des graphiques** :
   - Utilisez Recharts (déjà installé)
   - Exemple dans `Dashboard.jsx`

3. **Personnaliser le design** :
   - Modifiez `tailwind.config.js`
   - Ajustez les composants dans `frontend/src/components`

4. **Ajouter de nouveaux modèles** :
   - Modifiez `backend/prisma/schema.prisma`
   - Créez une migration : `npx prisma migrate dev`
   - Créez les contrôleurs et routes correspondants

## 🛠️ Commandes utiles

### Backend

```powershell
cd backend

# Démarrer le serveur
npm run dev

# Ouvrir Prisma Studio (interface graphique pour la DB)
npx prisma studio

# Créer une migration
npx prisma migrate dev --name nom_migration

# Réinitialiser la DB
npx prisma migrate reset
```

### Frontend

```powershell
cd frontend

# Démarrer l'app React
npm run dev

# Build pour production
npm run build
```

## 🐛 Résolution de problèmes

### Le backend ne démarre pas

1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez la connexion dans `backend\.env`
3. Vérifiez les logs pour voir l'erreur exacte

### Le frontend ne se connecte pas au backend

1. Vérifiez que le backend est démarré sur le port 5000
2. Vérifiez `frontend\.env` : `VITE_API_URL=http://localhost:5000/api/v1`
3. Vérifiez la console du navigateur pour les erreurs

### Erreur "Cannot find module"

```powershell
# Réinstallez les dépendances
cd backend
rm -r node_modules
npm install

cd ..\frontend
rm -r node_modules
npm install
```

## 📖 Documentation complète

Consultez [README_FULLSTACK.md](README_FULLSTACK.md) pour la documentation complète.

## 💡 Conseils

1. **Prisma Studio** est votre ami : `npx prisma studio` pour visualiser/modifier la DB
2. Les **React DevTools** sont utiles pour déboguer le frontend
3. Utilisez **Postman** ou **Thunder Client** pour tester l'API
4. Consultez les logs des terminaux en cas d'erreur

## 🎯 Architecture de développement

```
1. Modifier le schéma Prisma (backend/prisma/schema.prisma)
2. Créer une migration (npx prisma migrate dev)
3. Créer le contrôleur et les routes (backend/controllers et routes)
4. Créer le service API (frontend/src/services/api.js)
5. Créer les pages React (frontend/src/pages)
6. Ajouter les routes (frontend/src/App.jsx)
```

---

**Bon développement ! 🚀**

Si vous avez des questions, consultez la documentation de :
- [Prisma](https://www.prisma.io/docs)
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
