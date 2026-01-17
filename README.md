# 🕌 Système de Gestion de Pèlerinage 2026

Application complète de gestion de pèlerinage (Hajj & Omra) avec backend Django/MongoDB et frontend React/TypeScript.

## 🚀 Fonctionnalités

### 📋 Gestion des Pèlerins
- Enregistrement complet des pèlerins (informations personnelles, passeport, contacts)
- Upload de photos de passeport
- Suivi du statut de paiement
- Historique des paiements
- Gestion des documents

### 💰 Gestion Financière
- Enregistrement des paiements (Cash, Carte, Virement, Mobile Money, Chèque)
- Génération automatique de reçus PDF
- Tableau de bord financier
- Statistiques en temps réel
- Trésorerie avec transactions de type revenu/dépense
- Rapports financiers détaillés

### ✈️ Billetterie
- Émission de billets d'avion pour pèlerins
- Support des clients externes (non-pèlerins)
- Informations complètes de vol (compagnie, numéros de vol, dates, heures)
- Suivi des réservations et références PNR
- Historique des billets

### 🏨 Gestion d'Hôtels
- Enregistrement des hôtels à La Mecque et Médine
- Réservations avec dates et prix
- Association aux pèlerins
- Suivi des capacités

### 🎨 Personnalisation
- Logo et nom de l'agence personnalisables
- Slogan/sous-titre modifiable
- Couleurs du sidebar et interface personnalisables (3 couleurs)
- Signature numérique pour les reçus
- Informations légales (numéro d'enregistrement, NIF)

### 👥 Gestion des Utilisateurs
- Système d'authentification JWT
- Gestion des rôles et permissions
- Interface d'administration Django
- Profils utilisateurs

## 🛠️ Stack Technique

### Backend
- **Framework** : Django 6.0.1 + Django REST Framework 3.16.1
- **Base de données** : MongoDB 8.2.4 avec MongoEngine 0.29.1
- **Authentification** : JWT (djangorestframework-simplejwt 5.5.1)
- **Génération PDF** : ReportLab 4.4.9
- **Serveur production** : Gunicorn 23.0.0

### Frontend
- **Framework** : React 18 + TypeScript 5
- **Build tool** : Vite 7.3.1
- **État global** : Zustand
- **HTTP Client** : Axios
- **Routing** : React Router v6
- **Styling** : Tailwind CSS

### Infrastructure Production
- **Reverse Proxy** : Nginx
- **SSL** : Let's Encrypt (certbot)
- **Process Manager** : systemd
- **Server** : VPS Hostinger

## 📁 Structure du Projet

```
PEL2026/
├── backend/                    # Backend Django
│   ├── config/                # Configuration Django
│   ├── pilgrims/              # App gestion pèlerins
│   ├── payments/              # App paiements et reçus
│   ├── tickets/               # App billetterie
│   ├── hotels/                # App hôtels
│   ├── treasury/              # App trésorerie
│   ├── users/                 # App utilisateurs
│   ├── media/                 # Fichiers uploadés
│   ├── venv/                  # Environnement virtuel Python
│   └── manage.py
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── api/               # Clients API
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── store/             # État global Zustand
│   │   └── main.tsx
│   ├── dist/                  # Build production
│   └── package.json
├── deployment/                 # Scripts de déploiement
│   ├── install.sh             # Installation initiale VPS
│   ├── deploy.sh              # Script de mise à jour
│   ├── gunicorn.service       # Service systemd
│   ├── nginx.conf             # Configuration Nginx
│   └── env.production.example
├── logs/                       # Logs développement
├── DEPLOYMENT.md              # Guide déploiement complet
└── README.md                  # Ce fichier
```

## 📦 Installation Locale

### Prérequis
- Python 3.11+
- Node.js 18+
- MongoDB 8.2+

### Backend

```bash
# Aller dans le dossier backend
cd backend

# Créer environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer MongoDB (si pas déjà démarré)
brew services start mongodb-community@8.2  # macOS
# ou
sudo systemctl start mongod  # Linux

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API
# Créer .env.local et définir :
# VITE_API_URL=http://localhost:8000

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### Scripts utilitaires

```bash
# Démarrer backend + frontend simultanément
./start-dev.sh

# Arrêter les serveurs
./stop-dev.sh
```

## 🚀 Déploiement Production

Voir le guide complet dans [DEPLOYMENT.md](DEPLOYMENT.md)

### Résumé rapide

1. **Configuration DNS** : Ajouter enregistrement A `confort` → IP VPS chez Hostinger

2. **Cloner le code sur VPS** :
```bash
cd /var/www
git clone [URL_REPO] confort.abdatytch.com
cd confort.abdatytch.com
```

3. **Exécuter le script d'installation** :
```bash
sudo bash deployment/install.sh
```

4. **Accéder à l'application** :
```
https://confort.abdatytch.com
```

### Mise à jour

```bash
cd /var/www/confort.abdatytch.com
sudo bash deployment/deploy.sh
```

## 🔐 Sécurité

- ✅ JWT pour l'authentification
- ✅ CORS configuré
- ✅ Variables d'environnement pour secrets
- ✅ SSL/TLS en production (Let's Encrypt)
- ✅ Validation des entrées utilisateur
- ✅ Protection CSRF Django

## 📝 Variables d'Environnement

### Backend (.env)

```bash
DEBUG=False
SECRET_KEY=votre-cle-secrete-tres-longue
ALLOWED_HOSTS=confort.abdatytch.com,localhost
CORS_ALLOWED_ORIGINS=https://confort.abdatytch.com,http://localhost:5173
MONGO_DB_NAME=pilgrimage_production
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
```

### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:8000
```

## 🧪 Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

## 📊 Endpoints API Principaux

- `POST /api/auth/login/` - Connexion
- `POST /api/auth/register/` - Inscription
- `GET /api/pilgrims/` - Liste des pèlerins
- `POST /api/pilgrims/` - Créer un pèlerin
- `GET /api/payments/` - Liste des paiements
- `POST /api/payments/` - Créer un paiement
- `POST /api/payments/receipts/generate/` - Générer un reçu
- `GET /api/tickets/` - Liste des billets
- `POST /api/tickets/` - Créer un billet
- `GET /api/hotels/` - Liste des hôtels
- `GET /api/payments/agency-settings/public/` - Paramètres publics (sans auth)

Documentation API complète : `http://localhost:8000/api/docs/` (en dev)

## 🤝 Support

Pour toute question ou problème :
- Email : support@abdatytch.com
- Documentation : [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 Licence

Propriétaire - Abdaty Technologie © 2026

## 👥 Crédits

Développé par l'équipe Abdaty Technologie pour la gestion du pèlerinage 2026.
