# ✅ Checklist de Vérification - Système de Login

## 1. Vérifier que le Backend est démarré

```bash
# Terminal 1
cd /Users/cheickabdoulkadira.kounta/StudioProjects/PEL2026/backend
source venv/bin/activate
python manage.py runserver
```

**Attendu**: Serveur Django sur http://localhost:8000

## 2. Vérifier que le Frontend est démarré

```bash
# Terminal 2
cd /Users/cheickabdoulkadira.kounta/StudioProjects/PEL2026/frontend
npm run dev
```

**Attendu**: Vite sur http://localhost:5173

## 3. Tester le Login via API (Optionnel)

```bash
curl -X POST http://localhost:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Attendu**: Réponse JSON avec `access` et `refresh` tokens

## 4. Se Connecter via l'Interface

1. Ouvrir http://localhost:5173
2. Vous devriez voir la page de login
3. Entrer:
   - **Username**: `admin`
   - **Password**: `admin123`
4. Cliquer sur "Se connecter"

**Attendu**: Redirection vers `/dashboard`

## 5. Vérifier les Permissions Admin

Une fois connecté, vous devriez voir dans la sidebar:

**Navigation principale**:
- 📊 Dashboard
- 👥 Pèlerins
- 💳 Paiements
- 📝 Dépenses
- 💰 Trésorerie

**Section Administration** (visible uniquement pour admin):
- 👤 Utilisateurs
- 🔐 Rôles

## 6. Tester la Création d'un Rôle

1. Cliquer sur **Rôles** dans la sidebar
2. Cliquer sur **Nouveau Rôle**
3. Remplir:
   - Nom: "Test Agent"
   - Description: "Rôle de test"
   - Permissions: Sélectionner quelques niveaux
4. Cliquer sur **Créer le rôle**

**Attendu**: Redirection vers `/roles` avec le nouveau rôle affiché

## 7. Tester la Création d'un Utilisateur

1. Cliquer sur **Utilisateurs** dans la sidebar
2. Cliquer sur **Nouvel Utilisateur**
3. Remplir tous les champs requis:
   - Username: "agent1"
   - Email: "agent1@test.com"
   - Prénom: "Agent"
   - Nom: "Test"
   - Password: "test1234"
   - Confirmer: "test1234"
   - Type de rôle: "Rôle personnalisé"
   - Rôle: Sélectionner le rôle créé précédemment
4. Cliquer sur **Créer l'utilisateur**

**Attendu**: Redirection vers `/users` avec le nouvel utilisateur affiché

## 8. Tester la Déconnexion

1. En bas de la sidebar, cliquer sur le bouton **Déconnexion**

**Attendu**: Redirection vers `/login`

## 9. Tester avec le Nouvel Utilisateur

1. Se connecter avec:
   - Username: "agent1"
   - Password: "test1234"
2. Vérifier que:
   - Le nom affiché est "Agent Test"
   - Le rôle affiché est "Test Agent"
   - Les menus visibles correspondent aux permissions du rôle
   - La section Administration n'est PAS visible (car pas admin)

## Problèmes Courants

### ❌ "Login failed"

**Causes possibles**:
1. Backend pas démarré → Vérifier Terminal 1
2. Mauvais credentials → Utiliser `admin` / `admin123`
3. CORS error → Vérifier console navigateur (F12)

**Solutions**:
```bash
# Recréer l'admin
cd backend && source venv/bin/activate
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(username='admin').delete()
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    first_name='Admin',
    last_name='System',
    role_type='admin'
)
print(f"✅ Admin créé: {admin.username}")
EOF
```

### ❌ CORS Error dans la console

**Vérifier** `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]
```

**Relancer** le backend après modification

### ❌ Page blanche après login

**Ouvrir** la console (F12) et vérifier les erreurs

**Vider** le cache:
1. F12 → Application → Storage → Clear site data
2. Recharger la page
3. Se reconnecter

### ❌ Menu Administration invisible

**Vérifier**:
1. Que vous êtes bien connecté en tant qu'admin
2. Dans la console: `localStorage.getItem('auth-storage')`
3. Chercher `"role_type":"admin"` dans la réponse

**Si le role_type n'est pas admin**:
```bash
cd backend && source venv/bin/activate
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.get(username='admin')
admin.role_type = 'admin'
admin.save()
print(f"✅ Role mis à jour: {admin.role_type}")
EOF
```

Puis se déconnecter et se reconnecter.

## État Actuel du Système

✅ **Backend**:
- Models créés (User, Role)
- Migrations appliquées
- API endpoints fonctionnels
- JWT authentication OK
- Permissions dans le token

✅ **Frontend**:
- Store Zustand avec login()
- Pages Users et Roles créées
- Routes configurées
- Design moderne Tailwind

✅ **Fonctionnel**:
- Login/Logout
- Création rôles
- Création utilisateurs
- Gestion permissions
- Navigation basée sur rôle

## Prochaines Étapes Recommandées

1. ✅ Tester le login → **FAIT**
2. ⏭️ Créer quelques rôles prédéfinis
3. ⏭️ Créer quelques utilisateurs de test
4. ⏭️ Tester les permissions (ex: agent ne voit pas admin section)
5. ⏭️ Compléter les pages Edit pour Users/Roles
6. ⏭️ Ajouter protection des routes basée sur permissions

---

**Date**: 2026-01-16  
**Statut**: ✅ Login fonctionnel avec credentials `admin` / `admin123`
