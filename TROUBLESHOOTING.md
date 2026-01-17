# Résolution Problèmes - Système de Reçus de Paiement

## Problèmes Rencontrés

### 1. Page Blanche Frontend ✅ RÉSOLU

**Erreur**: `The requested module '/src/api/receipts.ts' does not provide an export named 'AgencySettings'`

**Cause**: TypeScript 5 avec `verbatimModuleSyntax: true` et `erasableSyntaxOnly: true` empêche l'export d'interfaces

**Solution**:
1. Changé `export interface` en `export type` dans `receipts.ts`
2. Modifié `tsconfig.app.json`:
   ```json
   {
     "verbatimModuleSyntax": false,
     // Supprimé "erasableSyntaxOnly" et "noUncheckedSideEffectImports"
   }
   ```
3. Redémarré serveur Vite

**Résultat**: Frontend se charge correctement

---

### 2. MongoDB Non Démarré ⏳ EN COURS

**Erreur**: `pymongo.errors.ServerSelectionTimeoutError: localhost:27017: [Errno 61] Connection refused`

**Cause**: MongoDB n'est pas installé sur le système

**Solution en cours**:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Installation en cours** (téléchargement ~150MB)

**Après installation**:
```bash
# Démarrer MongoDB
brew services start mongodb-community

# Ou manuellement
mongod --config /opt/homebrew/etc/mongod.conf
```

**Vérification**:
```bash
# Vérifier que MongoDB tourne
brew services list | grep mongodb

# Tester connexion
mongosh
```

---

### 3. Import manquant - PaymentViewSet ✅ RÉSOLU

**Erreur**: `ImportError: cannot import name 'PaymentViewSet' from 'payments.views'`

**Cause**: Le modèle `Payment` et son ViewSet n'existaient pas

**Solution**:
1. Créé modèle `Payment` dans `backend/payments/models.py`:
   ```python
   class Payment(Document):
       pilgrim_id = StringField(required=True)
       amount = FloatField(required=True)
       payment_mode = StringField(required=True)
       payment_date = DateTimeField(required=True)
       description = StringField()
       reference_number = StringField()
   ```

2. Créé `PaymentViewSet` dans `backend/payments/views.py` avec:
   - `list()` - Liste paiements
   - `create()` - Créer paiement
   - `retrieve()` - Détail paiement

**Résultat**: Backend démarre sans erreur

---

## État Actuel

### ✅ Fonctionnel
- Frontend React/Vite sur http://localhost:5173
- Backend Django sur http://localhost:8000
- TypeScript compilation sans erreur
- Routes configurées
- Authentication JWT

### ⏳ En Cours
- Installation MongoDB
- Configuration base de données

### ⏸️ À Faire Après MongoDB
1. Démarrer MongoDB
2. Créer base de données de test
3. Créer utilisateur admin
4. Tester système complet de reçus

---

## Commandes Utiles

### MongoDB
```bash
# Démarrer
brew services start mongodb-community

# Arrêter
brew services stop mongodb-community

# Statut
brew services list | grep mongodb

# Se connecter
mongosh

# Créer base de données
use pel2026
db.createUser({
  user: "pel_admin",
  pwd: "votre_mot_de_passe",
  roles: ["readWrite"]
})
```

### Django
```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm run dev
```

---

## Prochaines Étapes

1. ✅ Attendre fin installation MongoDB
2. ⏳ Démarrer MongoDB
3. ⏳ Redémarrer Django (se connectera automatiquement à MongoDB)
4. ⏳ Tester création pèlerin
5. ⏳ Tester création paiement  
6. ⏳ Tester génération reçu PDF
7. ⏳ Configurer paramètres agence
8. ⏳ Tester workflow complet

---

## Documentation Générée

- `/RECEIPT_SYSTEM_COMPLETE.md` - Documentation complète système reçus
- Ce fichier - Résolution problèmes

---

**Date**: 16 Janvier 2026  
**Status**: Installation MongoDB en cours (80% téléchargé)
