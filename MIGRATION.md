# Migration des données de développement vers production

## Étape 1 : Export des données (machine locale)

```bash
# Aller dans le répertoire backend local
cd /Users/cheickabdoulkadira.kounta/StudioProjects/PEL2026/backend

# Activer l'environnement virtuel
source venv/bin/activate

# Exporter les données
python export_data.py
```

Cela créera un fichier `data_export.json` contenant tous vos pèlerins, paiements, dépenses et paramètres.

## Étape 2 : Copier le fichier vers le VPS

```bash
# Depuis votre machine locale
scp data_export.json root@srv1078884.vs.hosting-server.net:/var/www/confort.abdatytch.com/backend/
```

## Étape 3 : Import des données (sur le VPS)

```bash
# Se connecter au VPS
ssh root@srv1078884.vs.hosting-server.net

# Aller dans le répertoire backend
cd /var/www/confort.abdatytch.com/backend

# Activer l'environnement virtuel
source venv/bin/activate

# Importer les données
python import_data.py data_export.json
```

Le script vous demandera une confirmation avant d'importer (tapez 'OUI' en majuscules).

## Notes importantes

- ⚠️ **L'import supprime toutes les données existantes** avant d'importer les nouvelles
- Les fichiers attachés (passeports, logo, signature) doivent être copiés séparément
- Les IDs MongoDB seront régénérés automatiquement

## Copier les fichiers media (passeports, logo, etc.)

Si vous avez des fichiers passeports ou un logo d'agence :

```bash
# Depuis votre machine locale
# Copier le dossier media complet
scp -r /Users/cheickabdoulkadira.kounta/StudioProjects/PEL2026/backend/media/* root@srv1078884.vs.hosting-server.net:/var/www/confort.abdatytch.com/backend/media/

# Sur le VPS, corriger les permissions
ssh root@srv1078884.vs.hosting-server.net
sudo chown -R www-data:www-data /var/www/confort.abdatytch.com/backend/media/
```
