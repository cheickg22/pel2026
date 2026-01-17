# Correction Erreur Création Pèlerins

**Date**: 16 janvier 2026  
**Problème**: Erreur lors de la création d'un pèlerin via le formulaire frontend

---

## Cause du Problème

### 1. Serializer avec champs obligatoires
Le `PilgrimSerializer` avait des champs marqués comme obligatoires qui ne correspondaient pas au modèle mis à jour :

```python
# AVANT (❌ Problématique)
email = serializers.EmailField()                    # required=True par défaut
phone = serializers.CharField(max_length=20)        # required=True par défaut
city_of_departure = serializers.CharField()          # required=True par défaut
departure_date = serializers.DateTimeField()         # required=True par défaut
```

**Conséquence** : L'API refusait les créations sans ces champs, malgré que le modèle les accepte comme optionnels.

### 2. Problème request.data.copy() avec MultiPartParser
```python
# AVANT (❌ Problématique)
def create(self, request, *args, **kwargs):
    data = request.data.copy()  # Échoue avec fichiers uploadés
```

**Conséquence** : Erreur `TypeError: cannot pickle 'BufferedRandom'` lors de l'upload de fichiers.

---

## Solutions Appliquées

### 1. Serializer - Champs optionnels (`backend/pilgrims/serializers.py`)

```python
class PilgrimSerializer(serializers.Serializer):
    # ✅ OBLIGATOIRES (seuls nom et prénom)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    
    # ✅ OPTIONNELS (tous les autres)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    passport_number = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    gender = serializers.ChoiceField(choices=[g.value for g in Gender], required=False, default='male')
    profession = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_of_birth = serializers.DateTimeField(required=False, allow_null=True)
    place_of_birth = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city_of_departure = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    departure_date = serializers.DateTimeField(required=False, allow_null=True)
```

**Changements** :
- Ajout de `required=False` sur tous les champs optionnels
- Ajout de `allow_blank=True, allow_null=True` pour permettre valeurs vides
- Genre a une valeur par défaut : `'male'`

---

### 2. ViewSet - Gestion fichiers (`backend/pilgrims/views.py`)

#### Méthode create()
```python
def create(self, request, *args, **kwargs):
    # ✅ Construction manuelle du dictionnaire (sans copier les fichiers)
    data = {}
    for key in request.data.keys():
        if key not in request.FILES:
            data[key] = request.data[key]
    
    # Gérer l'upload du fichier passeport
    if 'passport_file' in request.FILES:
        passport_file = request.FILES['passport_file']
        email = data.get('email', 'unknown')
        file_name = f"passports/{email}_{passport_file.name}"
        file_path = default_storage.save(file_name, passport_file)
        data['passport_file'] = file_path
    
    serializer = self.get_serializer(data=data)
    serializer.is_valid(raise_exception=True)
    pilgrim = serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
```

#### Méthode update()
Même pattern appliqué :
- Construction manuelle du dictionnaire
- Gestion sécurisée des fichiers
- Protection contre `email = None` : `data.get('email', pilgrim.email if pilgrim.email else 'unknown')`

---

## Tests de Validation

### Test 1 : Création minimale (nom + prénom)
```python
data = {
    'first_name': 'Amadou',
    'last_name': 'TOURE',
}
```

**Résultat** :
```
✅ Validation réussie
   - Pèlerin créé: Amadou TOURE
   - Email: Non fourni
   - Genre: male (valeur par défaut)
```

### Test 2 : Création complète
```python
data = {
    'first_name': 'Fatou',
    'last_name': 'DIALLO',
    'email': 'fatou@example.com',
    'phone': '+223 70 00 00 00',
    'gender': 'female',
    'total_cost': 4675000,
}
```

**Résultat** :
```
✅ Validation réussie
   - Pèlerin créé: Fatou DIALLO
   - Email: fatou@example.com
   - Genre: female
   - Coût: 4,675,000 FCFA
```

---

## Fichiers Modifiés

1. **`backend/pilgrims/serializers.py`** (lignes 5-27)
   - Tous les champs (sauf nom/prénom) : `required=False, allow_blank=True, allow_null=True`

2. **`backend/pilgrims/views.py`** (lignes 23-71)
   - Méthode `create()` : Construction manuelle du dictionnaire
   - Méthode `update()` : Idem + gestion email null

---

## Comportement Final

### API Endpoint: POST /api/pilgrims/

#### Champs requis (minimum)
```json
{
  "first_name": "Amadou",
  "last_name": "TOURE"
}
```

#### Champs optionnels (peuvent être omis)
- `email`
- `phone`
- `passport_number`
- `passport_file`
- `gender` (valeur par défaut: "male")
- `profession`
- `date_of_birth`
- `place_of_birth`
- `city_of_departure`
- `departure_date`
- `total_cost` (valeur par défaut: 0.0)

---

## Impact Utilisateur

✅ **Création rapide** : Nom + prénom suffisent  
✅ **Complétion progressive** : Informations ajoutables plus tard  
✅ **Upload fichiers** : Passeport uploadable sans erreur  
✅ **Validation claire** : Messages d'erreur uniquement pour champs requis

---

**Statut** : ✅ Problème résolu  
**Tests** : ✅ Backend validé  
**Prochaine étape** : Tester via l'interface frontend
