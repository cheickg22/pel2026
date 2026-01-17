#!/bin/bash

# Script de déploiement automatique pour VPS
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN="confort.abdatytch.com"
APP_DIR="/var/www/$DOMAIN"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Déploiement Application Pèlerinage${NC}"
echo -e "${BLUE}   Domaine: $DOMAIN${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Mise à jour du code depuis Git
echo -e "\n${YELLOW}[1/10] Mise à jour du code...${NC}"
cd $APP_DIR
git pull origin main

# 2. Backend - Installation des dépendances
echo -e "\n${YELLOW}[2/10] Installation dépendances backend...${NC}"
cd $BACKEND_DIR
source venv/bin/activate
pip install -r requirements.txt

# 3. Backend - Migrations
echo -e "\n${YELLOW}[3/10] Exécution des migrations...${NC}"
python manage.py migrate --noinput

# 4. Backend - Collecte des fichiers statiques
echo -e "\n${YELLOW}[4/10] Collection des fichiers statiques...${NC}"
python manage.py collectstatic --noinput

# 5. Frontend - Installation des dépendances
echo -e "\n${YELLOW}[5/10] Installation dépendances frontend...${NC}"
cd $FRONTEND_DIR
npm install

# 6. Frontend - Build production
echo -e "\n${YELLOW}[6/10] Build frontend production...${NC}"
npm run build

# 7. Permissions
echo -e "\n${YELLOW}[7/10] Configuration des permissions...${NC}"
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# 8. Redémarrage Gunicorn
echo -e "\n${YELLOW}[8/10] Redémarrage Gunicorn...${NC}"
sudo systemctl restart gunicorn

# 9. Rechargement Nginx
echo -e "\n${YELLOW}[9/10] Rechargement Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

# 10. Vérification du statut
echo -e "\n${YELLOW}[10/10] Vérification des services...${NC}"
sudo systemctl status gunicorn --no-pager | head -5
sudo systemctl status nginx --no-pager | head -5

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Déploiement réussi !${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Application disponible sur:${NC}"
echo -e "  https://$DOMAIN\n"
