#!/bin/bash

# Script d'installation initiale sur VPS
# À exécuter UNE SEULE FOIS lors de la première installation

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="confort.abdatytch.com"
APP_DIR="/var/www/$DOMAIN"
EMAIL="votre-email@gmail.com"  # À MODIFIER

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Installation Initiale VPS${NC}"
echo -e "${BLUE}   Domaine: $DOMAIN${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Mise à jour du système
echo -e "\n${YELLOW}[1/15] Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Installation des dépendances système
echo -e "\n${YELLOW}[2/15] Installation des paquets système...${NC}"
sudo apt install -y python3-pip python3-venv nginx git mongodb curl

# 3. Installation de Node.js 20.x
echo -e "\n${YELLOW}[3/15] Installation Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Création du répertoire de l'application
echo -e "\n${YELLOW}[4/15] Création des répertoires...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 5. Clone du repository
echo -e "\n${YELLOW}[5/15] Clone du code source...${NC}"
echo -e "${RED}IMPORTANT: Ajoutez votre code à Git avant de continuer !${NC}"
read -p "Repository Git URL: " REPO_URL
git clone $REPO_URL $APP_DIR

# 6. Configuration Backend
echo -e "\n${YELLOW}[6/15] Configuration Backend...${NC}"
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install gunicorn
pip install -r requirements.txt

# 7. Configuration .env production
echo -e "\n${YELLOW}[7/15] Configuration .env...${NC}"
cp env.production.example .env
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sed -i "s/votre-cle-secrete-tres-longue-et-complexe-a-changer/$SECRET_KEY/" .env
read -p "IP de votre VPS: " VPS_IP
sed -i "s/VPS_IP_ADDRESS/$VPS_IP/" .env

# 8. Migrations et fichiers statiques
echo -e "\n${YELLOW}[8/15] Migrations et static files...${NC}"
python manage.py migrate
python manage.py collectstatic --noinput

# 9. Création superutilisateur Django
echo -e "\n${YELLOW}[9/15] Création superutilisateur...${NC}"
python manage.py createsuperuser

# 10. Configuration Frontend
echo -e "\n${YELLOW}[10/15] Configuration Frontend...${NC}"
cd $APP_DIR/frontend

# Créer .env pour le frontend
cat > .env << EOF
VITE_API_URL=https://$DOMAIN
EOF

npm install
npm run build

# 11. Configuration Gunicorn
echo -e "\n${YELLOW}[11/15] Configuration Gunicorn...${NC}"
sudo cp $APP_DIR/deployment/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# 12. Configuration Nginx
echo -e "\n${YELLOW}[12/15] Configuration Nginx...${NC}"
sudo cp $APP_DIR/deployment/nginx.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 13. Installation SSL (Let's Encrypt)
echo -e "\n${YELLOW}[13/15] Installation Certbot...${NC}"
sudo apt install -y certbot python3-certbot-nginx

echo -e "\n${YELLOW}[14/15] Génération certificat SSL...${NC}"
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL

# 14. Configuration Firewall
echo -e "\n${YELLOW}[15/15] Configuration Firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Vérifications:${NC}"
echo -e "  - Gunicorn: ${GREEN}$(sudo systemctl is-active gunicorn)${NC}"
echo -e "  - Nginx: ${GREEN}$(sudo systemctl is-active nginx)${NC}"
echo -e "  - MongoDB: ${GREEN}$(sudo systemctl is-active mongodb)${NC}"
echo -e "\n${BLUE}Votre application est accessible sur:${NC}"
echo -e "  ${YELLOW}https://$DOMAIN${NC}\n"
echo -e "${BLUE}Prochaines étapes:${NC}"
echo -e "  1. Configurer le DNS: A record @ et www vers $VPS_IP"
echo -e "  2. Tester l'application: https://$DOMAIN"
echo -e "  3. Pour les mises à jour: ./deployment/deploy.sh\n"
