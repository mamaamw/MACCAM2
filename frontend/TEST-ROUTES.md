# 🔒 Tests de Protection des Routes

## Configuration Actuelle

### ✅ Routes PUBLIQUES (accessibles SANS connexion)
- `/login` - Page de connexion
- `/register` - Page d'inscription

**Comportement :** Si vous êtes DÉJÀ connecté et que vous essayez d'accéder à `/login` ou `/register`, vous serez automatiquement redirigé vers le Dashboard (`/`)

---

### 🔐 Routes PROTÉGÉES (nécessitent une connexion)
- `/` - Dashboard principal
- `/customers` - Liste des clients
- `/customers/create` - Créer un client
- `/customers/:id` - Voir un client
- `/leads` - Liste des opportunités
- `/leads/create` - Créer une opportunité
- `/leads/:id` - Voir une opportunité
- `/projects` - Liste des projets
- `/tasks` - Liste des tâches
- `/invoices` - Liste des factures
- `/settings` - Paramètres

**Comportement :** Si vous n'êtes PAS connecté et que vous essayez d'accéder à une de ces routes, vous serez automatiquement redirigé vers `/login`

---

## 🧪 Comment Tester

### Test 1 : Accès sans connexion
1. Ouvrir http://localhost:3000 dans une navigation privée
2. Vous devriez être automatiquement redirigé vers `/login`
3. Essayer d'accéder à http://localhost:3000/customers
4. Vous devriez être redirigé vers `/login`

### Test 2 : Connexion réussie
1. Sur `/login`, entrer : `admin@maccam.com` / `admin123`
2. Cliquer sur "Se connecter"
3. Vous devriez être redirigé vers `/` (Dashboard)
4. Votre token est maintenant enregistré dans localStorage

### Test 3 : Navigation avec connexion
1. Une fois connecté, vous pouvez accéder à toutes les routes protégées
2. Essayer d'accéder à `/customers`, `/leads`, etc.
3. Tout devrait fonctionner

### Test 4 : Tentative d'accès à /login quand connecté
1. Une fois connecté, essayer d'accéder à http://localhost:3000/login
2. Vous devriez être automatiquement redirigé vers `/` (Dashboard)

### Test 5 : Déconnexion
1. Cliquer sur votre avatar en haut à droite
2. Cliquer sur "Déconnexion"
3. Vous devriez être redirigé vers `/login`
4. Le token est supprimé du localStorage

### Test 6 : URLs invalides
1. Essayer d'accéder à une URL qui n'existe pas : http://localhost:3000/page-inexistante
2. **Sans connexion** → Redirigé vers `/login`
3. **Avec connexion** → Redirigé vers `/` (Dashboard)

---

## 🔍 Vérification Technique

### Vérifier le token dans localStorage
Ouvrir la console du navigateur (F12) et taper :
```javascript
localStorage.getItem('token')
```
- Si connecté : Vous verrez un token JWT
- Si déconnecté : Résultat = `null`

### Vérifier le state Zustand
Dans la console :
```javascript
// Importer depuis window si exposé, ou vérifier React DevTools
// Le store devrait contenir { user: {...}, token: "..." } si connecté
```

---

## ✅ Résultat Attendu

**SANS CONNEXION :**
- ✅ Accès uniquement à `/login` et `/register`
- ✅ Toute autre route redirige vers `/login`
- ✅ Pas de token dans localStorage

**AVEC CONNEXION :**
- ✅ Accès à toutes les routes protégées
- ✅ `/login` et `/register` redirigent vers `/`
- ✅ Token présent dans localStorage
- ✅ User info dans le state Zustand

---

## 🔧 Code de Protection

La protection est implémentée dans [App.jsx](src/App.jsx) :

```jsx
// Routes publiques
<Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
<Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />

// Routes protégées
<Route element={token ? <DashboardLayout /> : <Navigate to="/login" />}>
  <Route path="/" element={<Dashboard />} />
  // ... autres routes
</Route>

// 404
<Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
```

**Logique :**
- Si `token` existe → Accès aux routes protégées autorisé
- Si `token` n'existe pas → Redirection vers `/login`
- Le token est persisté dans localStorage via Zustand middleware
