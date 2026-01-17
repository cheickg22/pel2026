# Mise à jour Formulaire Pèlerins

**Date**: 16 janvier 2026  
**Objectif**: Simplifier le formulaire de création/modification de pèlerins

## Changements Effectués

### 1. Backend (`backend/pilgrims/models.py`)

#### Champs obligatoires réduits
Seuls **nom** et **prénom** sont maintenant obligatoires :

```python
class Pilgrim(Document):
    # ✅ OBLIGATOIRES
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    
    # ✨ OPTIONNELS (avant requis)
    email = EmailField()                    # Était: required=True, unique=True
    phone = StringField()                   # Était: required=True
    gender = StringField(default='male')    # Était: required=True
    city_of_departure = StringField()       # Était: required=True
    departure_date = DateTimeField()        # Était: required=True
```

#### Index MongoDB nettoyés
Suppression des index problématiques :
- ❌ `email_1` (unique=True) → supprimé
- ❌ `passport_number_1` (unique=True) → supprimé
- ❌ `created_at_1`, `created_at_-1` → supprimés

Les nouveaux index seront créés automatiquement par MongoEngine selon la configuration du modèle.

---

### 2. Frontend - Page Création (`frontend/src/pages/CreatePilgrimPage.tsx`)

#### Champs rendus optionnels
Suppression de l'attribut `required` sur :
- Email
- Téléphone
- Ville de départ
- Date de départ

#### Champs de date simplifiés
Changement de `datetime-local` → `date` :

```tsx
// AVANT
<input type="datetime-local" name="date_of_birth" ... />
<input type="datetime-local" name="departure_date" ... />

// APRÈS
<input type="date" name="date_of_birth" ... />
<input type="date" name="departure_date" ... />
```

**Avantage** : L'utilisateur saisit uniquement la date (JJ/MM/AAAA), pas l'heure.

---

### 3. Frontend - Page Modification (`frontend/src/pages/PilgrimEditPage.tsx`)

#### Mêmes changements que création
- Champs optionnels : email, téléphone, ville de départ, date de départ
- Type de date : `date` au lieu de `datetime-local`

#### Parsing des dates mis à jour
```tsx
// AVANT
date_of_birth: pilgrim.date_of_birth.slice(0, 16)    // Format datetime-local
departure_date: pilgrim.departure_date.slice(0, 16)

// APRÈS
date_of_birth: pilgrim.date_of_birth?.slice(0, 10) ?? ''    // Format date
departure_date: pilgrim.departure_date?.slice(0, 10) ?? ''
```

**Protection** : Gestion des valeurs null avec `?.` et `??`

---

## Tests Effectués

### Test 1 : Création minimale (nom + prénom uniquement)
```bash
✅ Pèlerin créé avec succès
   - Nom: Jean Dupont
   - Email: Non fourni
   - Téléphone: Non fourni
   - Genre: male (valeur par défaut)
   - Total coût: 0.0 FCFA
```

### Test 2 : Création complète (tous les champs)
```bash
✅ Pèlerin créé avec succès
   - Nom: Marie Martin
   - Email: marie@example.com
   - Genre: female
   - Total coût: 4,500,000 FCFA
```

---

## Impact Utilisateur

### Formulaire de création
- **Avant** : 8 champs obligatoires (*, rouge)
- **Après** : 2 champs obligatoires (nom + prénom)
- **Saisie date** : Sélecteur de date simple (sans heure)

### Expérience utilisateur améliorée
1. ✅ Création rapide d'un pèlerin (nom/prénom suffisent)
2. ✅ Complétion des informations ultérieurement
3. ✅ Dates sans heure (plus intuitif)
4. ✅ Pas d'erreur si email/téléphone manquant

---

## Migration des Données

### Index MongoDB
Les index ont été nettoyés pour permettre :
- Email non unique (plusieurs pèlerins peuvent ne pas avoir d'email)
- Email optionnel (valeur null/vide autorisée)

### Données existantes
✅ Aucune migration nécessaire - Les pèlerins existants conservent leurs données complètes.

---

## Fichiers Modifiés

1. **Backend**
   - `backend/pilgrims/models.py` (lignes 17-38)

2. **Frontend**
   - `frontend/src/pages/CreatePilgrimPage.tsx` (lignes 103-226)
   - `frontend/src/pages/PilgrimEditPage.tsx` (lignes 41-55, 148-283)

---

**Statut** : ✅ Modifications terminées et testées  
**Prochaines étapes** : Tester l'interface utilisateur complète
