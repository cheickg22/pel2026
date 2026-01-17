# Credentials de Test

## Utilisateur Administrateur

Pour vous connecter à l'application, utilisez ces identifiants :

**Nom d'utilisateur**: `admin`  
**Mot de passe**: `admin123`

## Créer d'autres utilisateurs

Une fois connecté en tant qu'admin, vous pouvez :

1. Aller sur **Rôles** (`/roles`) pour créer des rôles personnalisés
2. Aller sur **Utilisateurs** (`/users`) pour créer de nouveaux utilisateurs

## Exemples de Rôles à Créer

### 1. Gestionnaire Complet
```
Nom: Gestionnaire Complet
Description: Accès complet à tous les modules
Permissions:
- Dashboard: Full
- Pèlerins: Full
- Paiements: Full
- Dépenses: Full
- Trésorerie: Full
```

### 2. Agent de Saisie
```
Nom: Agent de Saisie
Description: Peut créer et modifier pèlerins et paiements
Permissions:
- Dashboard: View
- Pèlerins: Edit
- Paiements: Edit
- Dépenses: None
- Trésorerie: None
```

### 3. Superviseur
```
Nom: Superviseur
Description: Accès lecture seule
Permissions:
- Dashboard: View
- Pèlerins: View
- Paiements: View
- Dépenses: View
- Trésorerie: View
```

### 4. Comptable
```
Nom: Comptable
Description: Gestion finances
Permissions:
- Dashboard: View
- Pèlerins: View
- Paiements: Full
- Dépenses: Full
- Trésorerie: Full
```

## Démarrer l'Application

### Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Puis ouvrez http://localhost:5173 dans votre navigateur.

## Troubleshooting

### Erreur "Login failed"
- Vérifiez que le backend est bien démarré sur http://localhost:8000
- Vérifiez les credentials : `admin` / `admin123`
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Erreur CORS
- Vérifiez que `CORS_ALLOWED_ORIGINS` dans `settings.py` inclut `http://localhost:5173`

### Token invalide
- Supprimez le localStorage du navigateur (F12 > Application > Local Storage)
- Reconnectez-vous

## Script de Création de Rôles (Optionnel)

Pour créer automatiquement les rôles via le backend :

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

Puis copiez-collez :

```python
from accounts.models import Role

# Gestionnaire Complet
Role.objects.create(
    name="Gestionnaire Complet",
    description="Accès complet à tous les modules",
    dashboard_permission="full",
    pilgrims_permission="full",
    payments_permission="full",
    expenses_permission="full",
    treasury_permission="full",
    is_active=True
)

# Agent de Saisie
Role.objects.create(
    name="Agent de Saisie",
    description="Peut créer et modifier pèlerins et paiements",
    dashboard_permission="view",
    pilgrims_permission="edit",
    payments_permission="edit",
    expenses_permission="none",
    treasury_permission="none",
    is_active=True
)

# Superviseur
Role.objects.create(
    name="Superviseur",
    description="Accès lecture seule à tous les modules",
    dashboard_permission="view",
    pilgrims_permission="view",
    payments_permission="view",
    expenses_permission="view",
    treasury_permission="view",
    is_active=True
)

# Comptable
Role.objects.create(
    name="Comptable",
    description="Gestion finances et trésorerie",
    dashboard_permission="view",
    pilgrims_permission="view",
    payments_permission="full",
    expenses_permission="full",
    treasury_permission="full",
    is_active=True
)

print("✅ 4 rôles créés avec succès!")
```
