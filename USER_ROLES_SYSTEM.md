# Système de Gestion des Utilisateurs et des Rôles

## Vue d'ensemble

Ce système fournit une gestion complète des utilisateurs avec des rôles personnalisables et des permissions granulaires par module (Dashboard, Pèlerins, Paiements, Dépenses, Trésorerie).

## Architecture

### Backend (Django)

#### Modèles

**Role** - Rôle personnalisé avec permissions par module
```python
class Role(models.Model):
    name = CharField  # Nom du rôle
    description = TextField  # Description
    
    # Permissions par module (5 modules)
    dashboard_permission = CharField(choices=PermissionLevel)
    pilgrims_permission = CharField(choices=PermissionLevel)
    payments_permission = CharField(choices=PermissionLevel)
    expenses_permission = CharField(choices=PermissionLevel)
    treasury_permission = CharField(choices=PermissionLevel)
    
    is_active = BooleanField
```

**User** - Utilisateur avec rôle
```python
class User(AbstractUser):
    role_type = CharField  # 'admin' ou 'custom'
    custom_role = ForeignKey(Role)  # Si role_type='custom'
    phone = CharField
    avatar = CharField
    is_active = BooleanField
```

#### Niveaux de Permission

| Niveau | Description | Permissions incluses |
|--------|-------------|---------------------|
| `none` | Aucun accès | - |
| `view` | Lecture seule | Voir |
| `create` | Lecture + Création | Voir, Créer |
| `edit` | Lecture + Création + Modification | Voir, Créer, Modifier |
| `delete` | Lecture + Création + Modification + Suppression | Voir, Créer, Modifier, Supprimer |
| `full` | Accès complet | Toutes les actions |

#### Modules Disponibles

1. **dashboard** - Tableau de bord
2. **pilgrims** - Gestion des pèlerins
3. **payments** - Gestion des paiements
4. **expenses** - Gestion des dépenses
5. **treasury** - Gestion de la trésorerie

### API Endpoints

#### Authentification
```
POST   /api/accounts/token/              # Login (JWT)
POST   /api/accounts/token/refresh/      # Refresh token
GET    /api/accounts/users/me/          # Profil utilisateur
PATCH  /api/accounts/users/update_profile/  # Mise à jour profil
GET    /api/accounts/users/permissions/  # Permissions utilisateur
```

#### Utilisateurs (Admin uniquement pour CRUD)
```
GET    /api/accounts/users/              # Liste utilisateurs
POST   /api/accounts/users/              # Créer utilisateur
GET    /api/accounts/users/{id}/         # Détail utilisateur
PATCH  /api/accounts/users/{id}/         # Modifier utilisateur
DELETE /api/accounts/users/{id}/         # Supprimer utilisateur
```

#### Rôles (Admin uniquement pour CRUD)
```
GET    /api/accounts/roles/              # Liste rôles
POST   /api/accounts/roles/              # Créer rôle
GET    /api/accounts/roles/{id}/         # Détail rôle
PATCH  /api/accounts/roles/{id}/         # Modifier rôle
DELETE /api/accounts/roles/{id}/         # Supprimer rôle
GET    /api/accounts/roles/permission_levels/  # Liste niveaux permission
GET    /api/accounts/roles/modules/      # Liste modules
```

### Frontend (React + TypeScript)

#### Store Zustand (authStore.ts)

**État**:
- `user`: Utilisateur connecté
- `token`: JWT token
- `permissions`: Permissions par module
- `isAuthenticated`: État connexion

**Méthodes**:
- `setAuth(user, token, permissions)` - Initialiser auth
- `logout()` - Déconnexion
- `hasPermission(module, level)` - Vérifier permission
- `canView(module)` - Peut voir ?
- `canCreate(module)` - Peut créer ?
- `canEdit(module)` - Peut modifier ?
- `canDelete(module)` - Peut supprimer ?

**Exemple d'utilisation**:
```typescript
import { useAuthStore } from '@/store/authStore';

function PilgrimsPage() {
  const { permissions, canCreate, canEdit } = useAuthStore();
  
  // Vérifier permission
  if (!canView('pilgrims')) {
    return <AccessDenied />;
  }
  
  return (
    <div>
      {canCreate('pilgrims') && (
        <button>Créer Pèlerin</button>
      )}
      
      {canEdit('pilgrims') && (
        <button>Modifier</button>
      )}
    </div>
  );
}
```

#### API Client (users.ts)

**Types**:
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role_type: 'admin' | 'custom';
  custom_role?: number;
  custom_role_details?: Role;
  role_name: string;
  permissions: Permissions;
  is_active: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
  dashboard_permission: PermissionLevel;
  pilgrims_permission: PermissionLevel;
  payments_permission: PermissionLevel;
  expenses_permission: PermissionLevel;
  treasury_permission: PermissionLevel;
  is_active: boolean;
  users_count: number;
}

type PermissionLevel = 'none' | 'view' | 'create' | 'edit' | 'delete' | 'full';
```

**APIs**:
- `usersAPI` - CRUD utilisateurs
- `rolesAPI` - CRUD rôles

## Configuration Initiale

### 1. Migrations

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations accounts
python manage.py migrate
```

### 2. Créer un Super Utilisateur (Admin)

```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: ********
```

### 3. Créer des Rôles Prédéfinis (Optionnel)

Via Django Admin ou API, créer des rôles comme:

**Gestionnaire Complet**
```json
{
  "name": "Gestionnaire Complet",
  "description": "Accès complet à tous les modules",
  "dashboard_permission": "full",
  "pilgrims_permission": "full",
  "payments_permission": "full",
  "expenses_permission": "full",
  "treasury_permission": "full",
  "is_active": true
}
```

**Agent de Saisie**
```json
{
  "name": "Agent de Saisie",
  "description": "Peut créer et modifier pèlerins et paiements",
  "dashboard_permission": "view",
  "pilgrims_permission": "edit",
  "payments_permission": "edit",
  "expenses_permission": "none",
  "treasury_permission": "none",
  "is_active": true
}
```

**Superviseur (Lecture Seule)**
```json
{
  "name": "Superviseur",
  "description": "Accès lecture seule à tous les modules",
  "dashboard_permission": "view",
  "pilgrims_permission": "view",
  "payments_permission": "view",
  "expenses_permission": "view",
  "treasury_permission": "view",
  "is_active": true
}
```

**Comptable**
```json
{
  "name": "Comptable",
  "description": "Gestion finances et trésorerie",
  "dashboard_permission": "view",
  "pilgrims_permission": "view",
  "payments_permission": "full",
  "expenses_permission": "full",
  "treasury_permission": "full",
  "is_active": true
}
```

## Flux de Travail

### 1. Connexion

```typescript
// Frontend
import api from './api/client';
import { useAuthStore } from './store/authStore';

const login = async (username: string, password: string) => {
  const response = await api.post('/accounts/token/', {
    username,
    password
  });
  
  const { access, refresh, ...userData } = response.data;
  const permissions = userData.permissions;
  
  // Sauvegarder dans store
  useAuthStore.getState().setAuth(userData, access, permissions);
  
  // Configurer axios
  api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};
```

### 2. Vérifier les Permissions

**Côté Frontend** (UX):
```typescript
const { canCreate, canEdit, canDelete } = useAuthStore();

// Afficher/cacher boutons
{canCreate('pilgrims') && <CreateButton />}
{canEdit('pilgrims') && <EditButton />}
{canDelete('pilgrims') && <DeleteButton />}
```

**Côté Backend** (Sécurité):
```python
# Dans une vue Django
from rest_framework.decorators import api_view

@api_view(['POST'])
def create_pilgrim(request):
    if not request.user.has_module_permission('pilgrims', 'create'):
        return Response(
            {"detail": "Permission refusée"},
            status=403
        )
    # ... logique création
```

### 3. Gestion des Rôles (Admin)

**Créer un rôle**:
```typescript
import { rolesAPI } from './api/users';

const createRole = async () => {
  await rolesAPI.create({
    name: "Agent Terrain",
    description: "Enregistrement pèlerins uniquement",
    dashboard_permission: "view",
    pilgrims_permission: "create",
    payments_permission: "none",
    expenses_permission: "none",
    treasury_permission: "none",
    is_active: true
  });
};
```

**Assigner un rôle à un utilisateur**:
```typescript
import { usersAPI } from './api/users';

const assignRole = async (userId: number, roleId: number) => {
  await usersAPI.update(userId, {
    role_type: 'custom',
    custom_role: roleId
  });
};
```

## Sécurité

### Backend

✅ **Authentification JWT** - Tokens sécurisés avec expiration
✅ **Permissions granulaires** - Par module et par niveau
✅ **Validation côté serveur** - Toutes les opérations sont vérifiées
✅ **Hiérarchie des permissions** - Full > Delete > Edit > Create > View > None
✅ **Protection suppression** - Empêche suppression de rôle utilisé
✅ **Auto-protection** - Utilisateur ne peut pas se supprimer lui-même

### Frontend

✅ **Store persistant** - Auth sauvegardée (localStorage)
✅ **Guards de routes** - Protection des pages
✅ **Conditional rendering** - Affichage conditionnel selon permissions
✅ **Token refresh** - Renouvellement automatique

## Guards et Protection des Routes

### HOC ProtectedRoute (à créer)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: keyof Permissions;
  level?: string;
}

export function ProtectedRoute({ children, module, level = 'view' }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (module && !hasPermission(module, level)) {
    return <Navigate to="/access-denied" />;
  }
  
  return <>{children}</>;
}
```

**Utilisation**:
```typescript
<Route path="/pilgrims" element={
  <ProtectedRoute module="pilgrims" level="view">
    <PilgrimsPage />
  </ProtectedRoute>
} />

<Route path="/pilgrims/create" element={
  <ProtectedRoute module="pilgrims" level="create">
    <CreatePilgrimPage />
  </ProtectedRoute>
} />
```

## Tests

### Tester les Permissions Backend

```bash
# Créer un utilisateur test
curl -X POST http://localhost:8000/api/accounts/users/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent1",
    "email": "agent1@example.com",
    "first_name": "Agent",
    "last_name": "Test",
    "password": "password123",
    "password_confirm": "password123",
    "role_type": "custom",
    "custom_role": 2
  }'

# Login
curl -X POST http://localhost:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent1",
    "password": "password123"
  }'

# Vérifier permissions
curl -X GET http://localhost:8000/api/accounts/users/permissions/ \
  -H "Authorization: Bearer $USER_TOKEN"
```

## Troubleshooting

### Problème: Token expiré

**Solution**: Implémenter refresh automatique

```typescript
import axios from 'axios';

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().token;
      if (refreshToken) {
        try {
          const response = await axios.post('/api/accounts/token/refresh/', {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            newToken,
            useAuthStore.getState().permissions!
          );
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Problème: Permissions non mises à jour

**Solution**: Forcer reload des permissions

```typescript
const refreshPermissions = async () => {
  const response = await usersAPI.permissions();
  useAuthStore.getState().setPermissions(response.data);
};
```

## Prochaines Étapes

1. ✅ Backend models, serializers, views, URLs
2. ✅ Frontend API client et store
3. ⏳ Pages de gestion:
   - Liste des utilisateurs
   - Créer/Modifier utilisateur
   - Liste des rôles
   - Créer/Modifier rôle
4. ⏳ Composants UI:
   - Formulaire utilisateur
   - Formulaire rôle
   - Matrice de permissions
5. ⏳ Protection des routes
6. ⏳ Tests unitaires et e2e
