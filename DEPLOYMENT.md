# 📋 Guide de Déploiement VPS - confort.abdatytch.com

## 🎯 Vue d'ensemble

Ce guide vous aide à déployer votre application de gestion de pèlerinage sur votre VPS Hostinger avec le domaine `confort.abdatytch.com`.

## 📦 Architecture de déploiement

```
┌─────────────────────────────────────────┐
│  confort.abdatytch.com (Nginx)          │
├─────────────────────────────────────────┤
│  Frontend (React/Vite) - Port 443       │
│  ├─ /                → React App        │
│  ├─ /api/*          → Backend Django    │
│  ├─ /admin/*        → Django Admin      │
│  ├─ /static/*       → Static files      │
│  └─ /media/*        → Uploaded files    │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Backend (Django + Gunicorn)            │
│  - Unix Socket                          │
│  - 3 workers                            │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  MongoDB (Base de données)              │
│  - Port 27017 (local)                   │
└─────────────────────────────────────────┘
```

## 🚀 Étapes de déploiement

### Étape 1 : Configuration DNS (Hostinger)

1. **Connectez-vous au panneau Hostinger**
2. **Allez dans "Domaines" → abdatytch.com**
3. **Zone DNS → Ajouter un enregistrement** :
   ```
   Type: A
   Nom: confort
   Pointe vers: [IP de votre VPS]
   TTL: 3600
   ```
4. **Ajouter aussi www (optionnel)** :
   ```
   Type: A
   Nom: www.confort
   Pointe vers: [IP de votre VPS]
   TTL: 3600
   ```

### Étape 2 : Préparation du code

1. **Créer un repository Git** (si pas encore fait) :
   ```bash
   cd /Users/cheickabdoulkadira.kounta/StudioProjects/PEL2026
   git init
   git add .
   git commit -m "Initial commit - Pilgrimage App"
   ```

2. **Pousser vers GitHub/GitLab** :
   ```bash
   git remote add origin https://github.com/votre-username/pilgrimage-app.git
   git push -u origin main
   ```

### Étape 3 : Connexion au VPS

```bash
ssh root@VPS_IP_ADDRESS
# Ou
ssh votre-utilisateur@VPS_IP_ADDRESS
```

### Étape 4 : Installation initiale (À faire UNE SEULE FOIS)

```bash
# Télécharger le script d'installation
wget https://raw.githubusercontent.com/votre-repo/deployment/install.sh
chmod +x install.sh

# Modifier l'email dans le script
nano install.sh
# Changez: EMAIL="votre-email@gmail.com"

# Lancer l'installation
./install.sh
```

Le script va :
- ✅ Installer Python, Node.js, Nginx, MongoDB
- ✅ Cloner votre code
- ✅ Configurer l'environnement virtuel
- ✅ Installer les dépendances
- ✅ Configurer Gunicorn et Nginx
- ✅ Installer SSL (Let's Encrypt)
- ✅ Configurer le firewall

### Étape 5 : Configuration post-installation

1. **Vérifier les services** :
   ```bash
   sudo systemctl status gunicorn
   sudo systemctl status nginx
   sudo systemctl status mongodb
   ```

2. **Tester l'accès** :
   ```bash
   curl https://confort.abdatytch.com
   ```

3. **Accéder à l'admin Django** :
   - URL: https://confort.abdatytch.com/admin/
   - Utilisateur: (créé pendant l'installation)

## 🔄 Mises à jour futures

Pour déployer des modifications :

```bash
# Sur votre machine locale
git add .
git commit -m "Description des modifications"
git push origin main

# Sur le VPS
cd /var/www/confort.abdatytch.com
./deployment/deploy.sh
```

## 📁 Structure des fichiers sur le VPS

```
/var/www/confort.abdatytch.com/
├── backend/
│   ├── venv/                 # Environnement virtuel Python
│   ├── config/               # Configuration Django
│   ├── payments/             # App paiements
│   ├── pilgrims/             # App pèlerins
│   ├── tickets/              # App billetterie
│   ├── manage.py
│   ├── .env                  # Variables d'environnement
│   ├── gunicorn.sock         # Socket Gunicorn
│   ├── staticfiles/          # Fichiers statiques collectés
│   └── media/                # Fichiers uploadés
├── frontend/
│   ├── dist/                 # Build production
│   ├── node_modules/
│   └── .env                  # Config frontend
└── deployment/
    ├── install.sh
    ├── deploy.sh
    ├── gunicorn.service
    └── nginx.conf
```

## 🛠️ Commandes utiles

### Logs

```bash
# Logs Gunicorn
sudo journalctl -u gunicorn -f

# Logs Nginx
sudo tail -f /var/log/nginx/confort_access.log
sudo tail -f /var/log/nginx/confort_error.log

# Logs Django
cd /var/www/confort.abdatytch.com/backend
source venv/bin/activate
python manage.py shell
```

### Redémarrage des services

```bash
# Redémarrer Gunicorn
sudo systemctl restart gunicorn

# Recharger Nginx
sudo systemctl reload nginx

# Redémarrer MongoDB
sudo systemctl restart mongodb
```

### Sauvegarde de la base de données

```bash
# Export MongoDB
mongodump --db pilgrimage_production --out /backup/mongodb/$(date +%Y%m%d)

# Import MongoDB
mongorestore --db pilgrimage_production /backup/mongodb/20260117/pilgrimage_production
```

## 🔐 Sécurité

### Recommandations :

1. **Changer le mot de passe root** :
   ```bash
   passwd
   ```

2. **Désactiver l'accès SSH root** :
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Changer: PermitRootLogin no
   sudo systemctl restart ssh
   ```

3. **Configurer fail2ban** :
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

4. **Sauvegardes automatiques** :
   - Configurer un cron pour sauvegarder MongoDB quotidiennement
   - Sauvegarder les fichiers media/

## 🐛 Dépannage

### Problème : Site non accessible

```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier Gunicorn
sudo systemctl status gunicorn
sudo journalctl -u gunicorn --no-pager | tail -50
```

### Problème : Erreur 502 Bad Gateway

```bash
# Vérifier le socket Gunicorn
ls -la /var/www/confort.abdatytch.com/backend/gunicorn.sock

# Redémarrer Gunicorn
sudo systemctl restart gunicorn
```

### Problème : Base de données

```bash
# Vérifier MongoDB
sudo systemctl status mongodb
mongo

# Tester la connexion
use pilgrimage_production
db.pilgrims.count()
```

## 📞 Support

Pour toute question :
- Email: support@abdatytch.com
- Logs: Consultez toujours les logs en premier

## ✅ Checklist de déploiement

- [ ] DNS configuré (confort.abdatytch.com → IP VPS)
- [ ] Code poussé sur Git
- [ ] VPS accessible via SSH
- [ ] Installation initiale exécutée
- [ ] SSL installé (HTTPS fonctionne)
- [ ] Superutilisateur Django créé
- [ ] Application accessible sur https://confort.abdatytch.com
- [ ] Admin Django accessible
- [ ] Test de création d'un pèlerin
- [ ] Test d'upload de logo
- [ ] Sauvegarde configurée
