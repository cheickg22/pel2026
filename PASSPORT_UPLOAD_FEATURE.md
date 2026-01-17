# Fonctionnalité d'Upload de Passeport

## Vue d'ensemble
Cette fonctionnalité permet aux utilisateurs d'uploader et de gérer les fichiers de passeport des pèlerins dans le système.

## Modifications Backend

### 1. Modèle Pilgrim (`backend/pilgrims/models.py`)
- Ajout du champ `passport_file = StringField()` pour stocker le chemin du fichier

### 2. Serializer (`backend/pilgrims/serializers.py`)
- Ajout du champ `passport_file` avec validation appropriée
- Support pour les valeurs null/blank

### 3. ViewSet (`backend/pilgrims/views.py`)
- Ajout des parsers pour gérer les fichiers multipart: `MultiPartParser`, `FormParser`, `JSONParser`
- Méthode `create()` mise à jour pour gérer l'upload de fichier:
  - Sauvegarde du fichier dans `media/passports/`
  - Nom de fichier unique: `{email}_{nom_original}`
- Méthode `update()` mise à jour pour:
  - Remplacer l'ancien fichier si nouveau fichier uploadé
  - Supprimer l'ancien fichier pour éviter l'accumulation

### 4. Configuration URLs (`backend/config/urls.py`)
- Ajout de la configuration pour servir les fichiers média en développement
- Route: `/media/<chemin_fichier>`

### 5. Configuration Settings (`backend/config/settings.py`)
- `MEDIA_URL = 'media/'`
- `MEDIA_ROOT = BASE_DIR / 'media'`

### 6. Structure des Dossiers
```
backend/
  └── media/
      └── passports/
          ├── .gitignore (ignore tous les fichiers)
          └── [fichiers uploadés]
```

## Modifications Frontend

### 1. Type TypeScript (`frontend/src/api/pilgrims.ts`)
- Ajout du champ `passport_file?: string` dans l'interface `Pilgrim`
- Mise à jour des méthodes `create()` et `update()` pour:
  - Accepter `any` comme type de données (pour FormData)
  - Ajouter header `'Content-Type': 'multipart/form-data'`

### 2. Page de Création (`frontend/src/pages/CreatePilgrimPage.tsx`)
**Nouvelles fonctionnalités:**
- État `passportFile` pour stocker le fichier sélectionné
- Handler `handleFileChange` pour gérer la sélection de fichier
- Input de type `file` avec:
  - Accept: `.pdf,.jpg,.jpeg,.png`
  - Style moderne avec Tailwind
  - Indicateur visuel quand fichier sélectionné (icône ✓ + nom)
  - Message d'aide: "PDF, JPG, JPEG ou PNG (max 10MB)"
- Conversion en `FormData` avant envoi

### 3. Page d'Édition (`frontend/src/pages/PilgrimEditPage.tsx`)
**Nouvelles fonctionnalités:**
- État `currentPassport` pour afficher le fichier existant
- Affichage du fichier actuel avec:
  - Badge bleu avec icône document
  - Lien pour voir le fichier (ouvre dans nouvel onglet)
  - Nom du fichier
- Possibilité de remplacer le fichier
- Indicateur visuel du nouveau fichier sélectionné

### 4. Page de Détail (`frontend/src/pages/PilgrimDetailPage.tsx`)
**Nouvelles fonctionnalités:**
- Section "Fichier Passeport" si le fichier existe
- Bouton "Voir le passeport" avec:
  - Style moderne (indigo background)
  - Icône document
  - Ouvre dans nouvel onglet
  - Affichage du nom de fichier

## Formats de Fichiers Supportés
- **PDF** (.pdf)
- **Images** (.jpg, .jpeg, .png)
- **Taille maximale recommandée**: 10 MB

## URLs et Endpoints

### Backend
- Upload/Create: `POST /api/pilgrims/` (avec FormData)
- Update: `PATCH /api/pilgrims/{id}/` (avec FormData)
- Voir fichier: `GET http://localhost:8000/media/passports/{filename}`

### Frontend
- Création: `/pilgrims/create`
- Édition: `/pilgrims/{id}/edit`
- Détail: `/pilgrims/{id}`

## Sécurité et Bonnes Pratiques

### Backend
✅ Validation des formats de fichiers
✅ Noms de fichiers uniques (évite les collisions)
✅ Suppression des anciens fichiers lors de la mise à jour
✅ Fichiers stockés en dehors du code source
✅ .gitignore configuré pour ne pas commiter les fichiers

### Frontend
✅ Validation côté client (accept attribute)
✅ Indicateurs visuels clairs
✅ Messages d'aide pour l'utilisateur
✅ Liens sécurisés (rel="noopener noreferrer")

## Points d'Attention pour la Production

⚠️ **À FAIRE avant la mise en production:**

1. **Limite de taille fichier**
   - Ajouter validation backend pour taille max (ex: 10MB)
   - Configuration Nginx/Apache pour upload_max_filesize

2. **Validation type MIME**
   - Vérifier le type MIME réel du fichier (pas seulement l'extension)
   - Utiliser `python-magic` ou similaire

3. **Stockage**
   - Considérer stockage cloud (AWS S3, Google Cloud Storage)
   - Configuration CDN pour servir les fichiers

4. **Permissions**
   - Vérifier les permissions des dossiers media/
   - S'assurer que seuls les utilisateurs autorisés peuvent voir les passeports

5. **Backup**
   - Inclure les fichiers média dans la stratégie de backup
   - Prévoir synchronisation multi-serveur si nécessaire

6. **HTTPS**
   - Forcer HTTPS pour la transmission des fichiers sensibles
   - Configurer CORS approprié

## Test de la Fonctionnalité

### Scénarios de Test

1. **Création avec passeport**
   - Créer pèlerin + upload passeport
   - Vérifier fichier dans `media/passports/`
   - Vérifier affichage dans page détail

2. **Création sans passeport**
   - Créer pèlerin sans fichier
   - Vérifier que c'est optionnel

3. **Mise à jour - Ajouter passeport**
   - Éditer pèlerin sans passeport
   - Ajouter un fichier
   - Vérifier sauvegarde et affichage

4. **Mise à jour - Remplacer passeport**
   - Éditer pèlerin avec passeport
   - Uploader nouveau fichier
   - Vérifier que ancien fichier est supprimé
   - Vérifier nouveau fichier affiché

5. **Visualisation**
   - Cliquer "Voir le passeport"
   - Vérifier ouverture dans nouvel onglet
   - Vérifier affichage correct (PDF/image)

## Migration des Données Existantes

Si vous avez déjà des pèlerins dans la base de données:
- Le champ `passport_file` sera `null`/vide pour les pèlerins existants
- Aucune migration MongoDB nécessaire (MongoEngine gère dynamiquement)
- Les pèlerins peuvent être mis à jour pour ajouter leur passeport

## Commandes Utiles

```bash
# Créer les dossiers média
mkdir -p backend/media/passports

# Vérifier les permissions (Linux/Mac)
chmod 755 backend/media
chmod 755 backend/media/passports

# Vider le dossier passports (DEV uniquement!)
rm -rf backend/media/passports/*

# Voir la taille du dossier
du -sh backend/media/passports/
```

## Améliorations Futures Possibles

1. **Prévisualisation**
   - Aperçu de l'image avant upload
   - Miniature dans la liste des pèlerins

2. **Multi-fichiers**
   - Upload de plusieurs documents (passeport, visa, etc.)
   - Galerie de documents par pèlerin

3. **OCR**
   - Extraction automatique du numéro de passeport
   - Pré-remplissage des champs depuis le scan

4. **Compression**
   - Compression automatique des images
   - Optimisation de la taille des PDF

5. **Watermark**
   - Ajout filigrane "Confidentiel"
   - Protection des documents sensibles
