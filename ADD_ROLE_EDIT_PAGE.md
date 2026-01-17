# Ajout Page Modification Rôle

**Date**: 16 janvier 2026  
**Problème**: Impossible de modifier un rôle (page manquante)

---

## Problème Identifié

### Page manquante
La page `RolesPage.tsx` affichait un bouton "Modifier" pointant vers `/roles/:id/edit`, mais cette page n'existait pas.

### Routes existantes
- ✅ `/roles` - Liste des rôles
- ✅ `/roles/create` - Création de rôle
- ❌ `/roles/:id/edit` - **Manquant**

---

## Solution Appliquée

### Page Modification Rôle (`RoleEditPage.tsx`)

**Fonctionnalités** :
- ✅ Chargement des données existantes du rôle
- ✅ Modification du nom et description
- ✅ Activation/Désactivation du rôle
- ✅ Configuration des permissions pour tous les modules
- ✅ Interface identique à CreateRolePage pour cohérence
- ✅ Validation et messages d'erreur
- ✅ Retour automatique à la liste après enregistrement

---

## Structure de la Page

### Sections du formulaire

#### 1. Informations de base
```tsx
- Nom du rôle* (text input, requis)
- Description (textarea, optionnel)
- Rôle actif (checkbox)
```

#### 2. Permissions par Module
Configuration pour chaque module :
- 📊 **Tableau de bord**
- 🕌 **Pèlerins**
- 💳 **Paiements**
- 💸 **Dépenses**
- 💰 **Trésorerie**

#### Niveaux de permissions disponibles
| Niveau | Label | Description |
|--------|-------|-------------|
| `none` | Aucun | Aucun accès au module |
| `view` | Lecture | Voir les données uniquement |
| `create` | Création | Voir et créer |
| `edit` | Modification | Voir, créer et modifier |
| `delete` | Suppression | Voir, créer, modifier et supprimer |
| `full` | Complet | Accès total au module |

---

## Code Principal

### Chargement des données existantes

```typescript
const fetchRole = async () => {
  const response = await rolesAPI.get(parseInt(id!));
  const role: Role = response.data;
  
  setFormData({
    name: role.name,
    description: role.description || '',
    dashboard_permission: role.dashboard_permission,
    pilgrims_permission: role.pilgrims_permission,
    payments_permission: role.payments_permission,
    expenses_permission: role.expenses_permission,
    treasury_permission: role.treasury_permission,
    is_active: role.is_active,
  });
};
```

### Mise à jour du rôle

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await rolesAPI.update(parseInt(id!), formData);
    navigate('/roles');
  } catch (err) {
    // Gestion d'erreur
  }
};
```

---

## Interface Utilisateur

### Sélection des permissions

Chaque module affiche 6 options (radio buttons) :

```tsx
<div className="p-4 border rounded-lg">
  <div className="flex items-center mb-3">
    <span className="text-2xl mr-3">📊</span>
    <h3>Tableau de bord</h3>
  </div>
  
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {permissionLevels.map((level) => (
      <label className={selected ? 'border-indigo-500 bg-indigo-50' : ''}>
        <input type="radio" name="dashboard_permission" />
        <div>
          <span>{level.label}</span>
          <span>{level.description}</span>
        </div>
      </label>
    ))}
  </div>
</div>
```

**Effet visuel** :
- Option sélectionnée : Bordure bleue + fond bleu clair
- Option non sélectionnée : Bordure grise
- Hover : Bordure gris foncé

---

## Route Ajoutée

### App.tsx

```tsx
// Import
import RoleEditPage from './pages/RoleEditPage';

// Route
<Route
  path="/roles/:id/edit"
  element={
    <ProtectedRoute>
      <Layout>
        <RoleEditPage />
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## Navigation Complète des Rôles

```
RolesPage (liste)
  ├─→ Bouton "Nouveau Rôle" → CreateRolePage
  │                            └─→ Créé → Retour liste
  │
  └─→ Bouton "Modifier" → RoleEditPage
                           └─→ Modifié → Retour liste
```

---

## Différences avec CreateRolePage

| Aspect | CreateRolePage | RoleEditPage |
|--------|----------------|--------------|
| Titre | "Créer un Rôle" | "Modifier le Rôle" |
| Chargement initial | Non | Oui (`fetchRole()`) |
| État de chargement | Non | Oui (spinner) |
| Bouton submit | "Créer le rôle" | "Enregistrer les modifications" |
| API call | `rolesAPI.create()` | `rolesAPI.update()` |
| Paramètre URL | Aucun | `id` (useParams) |

---

## Tests Suggérés

### Test 1 : Chargement
1. Aller sur `/roles`
2. Cliquer "Modifier" sur un rôle
3. **Résultat attendu** :
   - ✅ Formulaire pré-rempli avec données existantes
   - ✅ Permissions actuelles sélectionnées
   - ✅ Checkbox "Rôle actif" dans bon état

### Test 2 : Modification nom
1. Modifier le nom du rôle
2. Cliquer "Enregistrer"
3. **Résultat attendu** :
   - ✅ Rôle mis à jour
   - ✅ Retour à `/roles`
   - ✅ Nouveau nom visible dans la liste

### Test 3 : Changement permissions
1. Modifier les permissions d'un module
2. Passer de "Aucun" à "Complet"
3. Enregistrer
4. **Résultat attendu** :
   - ✅ Permissions sauvegardées
   - ✅ Badge mis à jour dans la liste

### Test 4 : Désactivation rôle
1. Décocher "Rôle actif"
2. Enregistrer
3. **Résultat attendu** :
   - ✅ Rôle marqué "Inactif" dans la liste
   - ✅ Badge gris "Inactif" visible

### Test 5 : Validation
1. Vider le champ "Nom"
2. Tenter d'enregistrer
3. **Résultat attendu** :
   - ✅ Validation HTML5 empêche soumission
   - ✅ Message "Ce champ est requis"

---

## Gestion d'Erreur

### Erreurs API formatées

```typescript
if (typeof errorData === 'object') {
  const errors = Object.entries(errorData)
    .map(([key, value]) => 
      `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
    )
    .join('\n');
  setError(errors);
}
```

**Affichage** :
```
name: Ce champ est requis
dashboard_permission: Sélectionnez un niveau valide
```

---

## Fichiers Modifiés

### 1. Créé : `frontend/src/pages/RoleEditPage.tsx` (242 lignes)
- Import de `useParams` pour récupérer l'ID
- `useEffect` pour charger les données au montage
- État `isLoading` pour afficher un spinner
- État `isSaving` pour le bouton de soumission
- Formulaire identique à CreateRolePage

### 2. Modifié : `frontend/src/App.tsx`
- **Ligne 25** : Import `RoleEditPage`
- **Lignes 249-257** : Route `/roles/:id/edit`

---

## Design System

### Couleurs des permissions (badges dans RolesPage)
```typescript
const colors = {
  none: 'bg-gray-100 text-gray-800',
  view: 'bg-blue-100 text-blue-800',
  create: 'bg-green-100 text-green-800',
  edit: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800',
  full: 'bg-purple-100 text-purple-800',
};
```

### États interactifs
- **Non sélectionné** : `border-gray-200 hover:border-gray-300`
- **Sélectionné** : `border-indigo-500 bg-indigo-50`
- **Focus** : `focus:ring-2 focus:ring-indigo-500`

---

**Statut** : ✅ Page créée et route ajoutée  
**Tests** : À effectuer via l'interface  
**Prochaine étape** : Tester la modification complète d'un rôle
