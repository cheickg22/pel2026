# Correction Erreur 400 - Création Pèlerins

**Date**: 16 janvier 2026  
**Problème**: Erreur 400 (Bad Request) lors de la création d'un pèlerin via le formulaire

---

## Cause du Problème

### Frontend : Envoi de champs vides
Le formulaire envoyait **tous** les champs, y compris les champs vides (`""`), via FormData :

```typescript
// AVANT (❌ Problématique)
Object.entries(formData).forEach(([key, value]) => {
  formDataToSend.append(key, value.toString());  // Envoie tout, même ""
});
```

**Conséquence** : Le backend recevait :
```json
{
  "first_name": "Moussa",
  "last_name": "KONE",
  "date_of_birth": "",      // ❌ Chaîne vide
  "departure_date": "",     // ❌ Chaîne vide
  "email": ""               // ❌ Chaîne vide
}
```

### Backend : Validation stricte des dates
Le `DateTimeField` ne peut pas parser une chaîne vide :

```
❌ Error: La date + heure n'a pas le bon format
```

---

## Solutions Appliquées

### 1. Frontend - Filtrage des champs vides

#### CreatePilgrimPage.tsx
```typescript
// ✅ APRÈS (Correct)
Object.entries(formData).forEach(([key, value]) => {
  // Ignorer les valeurs vides, null ou undefined
  if (value !== '' && value !== null && value !== undefined) {
    formDataToSend.append(key, value.toString());
  }
});
```

**Résultat** : Seuls les champs renseignés sont envoyés :
```json
{
  "first_name": "Moussa",
  "last_name": "KONE",
  "gender": "male"
}
```

#### PilgrimEditPage.tsx
Même correction appliquée pour la page de modification.

---

### 2. Backend - Gestion flexible des dates

#### Serializer (`backend/pilgrims/serializers.py`)

**Ajout de formats de date multiples** :
```python
date_of_birth = serializers.DateTimeField(
    required=False, 
    allow_null=True, 
    input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S', 'iso-8601']
)

departure_date = serializers.DateTimeField(
    required=False, 
    allow_null=True, 
    input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S', 'iso-8601']
)
```

**Avantages** :
- ✅ Accepte format date simple : `2026-01-16`
- ✅ Accepte format datetime : `2026-01-16T14:30:00`
- ✅ Accepte ISO 8601 complet
- ✅ Accepte `null` si non fourni

**Nettoyage des données** :
```python
def create(self, validated_data):
    # Nettoyer les valeurs vides avant création
    cleaned_data = {k: v for k, v in validated_data.items() if v not in ('', None)}
    pilgrim = Pilgrim(**cleaned_data)
    pilgrim.save()
    return pilgrim
```

---

## Tests de Validation

### Test 1 : Création minimale (nom + prénom)
```python
data = {
    'first_name': 'Ibrahim',
    'last_name': 'TRAORE',
}

# Résultat
✅ Validation réussie
   - Pèlerin créé: Ibrahim TRAORE
   - Genre: male (valeur par défaut)
   - Coût: 0 FCFA
```

### Test 2 : Création avec données partielles
```python
data = {
    'first_name': 'Moussa',
    'last_name': 'KONE',
    'gender': 'male',
    'total_cost': 4675000,
}

# Résultat
✅ Validation réussie
   - Email: Non fourni
   - Dates: Non fournies
   - Coût: 4,675,000 FCFA
```

---

## Fichiers Modifiés

### Frontend
1. **`frontend/src/pages/CreatePilgrimPage.tsx`** (lignes 49-54)
   - Ajout filtre `if (value !== '' && value !== null && value !== undefined)`
   - Ajout log erreur console

2. **`frontend/src/pages/PilgrimEditPage.tsx`** (lignes 92-97)
   - Même correction que CreatePilgrimPage
   - Ajout log erreur console

### Backend
3. **`backend/pilgrims/serializers.py`** (lignes 15-18, 41-46)
   - `input_formats` pour dates (accepte format simple `YYYY-MM-DD`)
   - Méthode `create()` nettoie les valeurs vides
   - Méthode `update()` idem

---

## Comportement Final

### Formulaire de création

| Champ | Frontend | Backend |
|-------|----------|---------|
| Nom, Prénom | ✅ Envoyé | ✅ Obligatoire |
| Email vide | ❌ Non envoyé | ✅ Accepte absence |
| Date vide | ❌ Non envoyé | ✅ Accepte absence |
| Date remplie | ✅ `2026-01-16` | ✅ Parse format simple |

### API Response

**Succès (201 Created)** :
```json
{
  "id": "696a475ac76d7ac51607f1d1",
  "first_name": "Ibrahim",
  "last_name": "TRAORE",
  "email": null,
  "phone": null,
  "gender": "male",
  "total_cost": 0.0,
  "total_paid": 0.0,
  "remaining_amount": 0.0,
  "payment_status": "pending"
}
```

---

## Logs de Débogage

Ajout de logs console pour aider au débogage :

```typescript
// Dans CreatePilgrimPage.tsx et PilgrimEditPage.tsx
catch (err: any) {
  setError(err.response?.data?.detail || 'Erreur lors de la création');
  console.error('Erreur création pèlerin:', err.response?.data);
}
```

**Affichage dans la console** :
- Détails complets de l'erreur
- Champs qui ont échoué à la validation
- Messages d'erreur du backend

---

## Impact Utilisateur

✅ **Formulaire simplifié** : Remplir uniquement nom + prénom fonctionne  
✅ **Dates sans heure** : Format `type="date"` HTML5 compatible  
✅ **Pas d'erreur 400** : Validation correcte des champs optionnels  
✅ **Messages clairs** : Erreurs affichées dans console et interface

---

**Statut** : ✅ Problème résolu  
**Tests** : ✅ Validé backend + frontend  
**Prochaine étape** : Tester en environnement de développement complet
