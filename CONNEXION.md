# 🔐 Guide de Connexion - Duralux CRM

## 🚀 Démarrage Rapide

### 1. Lancer l'application

```powershell
cd C:\Users\Suira\Documents\MACCAM2
.\start-dev.ps1
```

### 2. Accéder à l'application

**URL de l'application :** http://localhost:3000

L'application s'ouvrira automatiquement sur la page de connexion.

---

## 👤 Comptes Utilisateurs Disponibles

### Compte Administrateur
- **Email :** `admin@duralux.com`
- **Mot de passe :** `admin123`
- **Rôle :** Administrateur (accès complet)

### Compte Manager
- **Email :** `manager@duralux.com`
- **Mot de passe :** `admin123`
- **Rôle :** Manager

---

## 📝 Instructions de Connexion

1. **Ouvrez votre navigateur** et allez sur http://localhost:3000

2. **Vous serez automatiquement redirigé** vers la page de connexion (`/login`)

3. **Entrez vos identifiants :**
   - Adresse Email : `admin@duralux.com`
   - Mot de passe : `admin123`

4. **Cliquez sur "Se connecter"**

5. **Vous serez redirigé** vers le tableau de bord principal

---

## ✅ Vérification

### Backend (API)
- **URL :** http://localhost:5000
- **Status :** Doit être actif

### Frontend (Interface)
- **URL :** http://localhost:3000
- **Status :** Doit être actif

### Vérifier les serveurs actifs :
```powershell
# Vérifier si les serveurs tournent
Get-NetTCPConnection -LocalPort 3000,5000 -ErrorAction SilentlyContinue
```

---

## 🔧 Dépannage

### Si vous ne pouvez pas vous connecter :

1. **Vérifiez que les serveurs sont actifs**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,5000
   ```

2. **Redémarrez l'application**
   ```powershell
   # Arrêtez les processus
   Get-Process node | Stop-Process -Force
   
   # Relancez
   .\start-dev.ps1
   ```

3. **Vérifiez la console du navigateur** (F12) pour voir les erreurs

4. **Vérifiez la base de données**
   ```powershell
   cd backend
   npx prisma studio
   ```

### Message d'erreur "Erreur de connexion" :

- Vérifiez que le backend est bien démarré sur le port 5000
- Vérifiez que l'email et le mot de passe sont corrects
- Vérifiez la console du navigateur pour plus de détails

---

## 📊 Après Connexion

Une fois connecté, vous aurez accès à :

- 📈 **Dashboard** - Vue d'ensemble de l'activité
- 👥 **Clients** - Gestion des clients
- 🎯 **Leads** - Opportunités commerciales  
- 📁 **Projets** - Gestion des projets
- ✅ **Tâches** - Suivi des tâches
- 💰 **Factures** - Gestion de la facturation
- ⚙️ **Paramètres** - Configuration du système

---

## 🔑 Sécurité

- Le mot de passe est haché avec bcrypt (12 rounds)
- Les sessions utilisent des tokens JWT
- Le token est stocké dans Zustand (store React)
- Déconnexion automatique si le token expire

---

## 💡 Astuces

- Les identifiants de test sont affichés directement sur la page de connexion
- Vous pouvez créer de nouveaux utilisateurs via la page d'inscription
- Pour vous déconnecter, cliquez sur votre avatar en haut à droite

---

**Prêt à vous connecter ?** 🚀

Allez sur http://localhost:3000 et utilisez `admin@duralux.com` / `admin123`
