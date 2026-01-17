#!/bin/bash

# Script pour démarrer l'application en mode développement

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Démarrage Application Pèlerinage${NC}"
echo -e "${BLUE}========================================${NC}"

# Arrêter les processus existants
echo -e "\n${YELLOW}Arrêt des processus existants...${NC}"
lsof -ti:8000 | xargs kill 2>/dev/null || true
lsof -ti:5173 | xargs kill 2>/dev/null || true
sleep 1

# Démarrer le backend
echo -e "\n${GREEN}Démarrage du backend Django (port 8000)...${NC}"
cd backend
source venv/bin/activate
python manage.py runserver > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
echo -e "\n${GREEN}Démarrage du frontend React (port 5173)...${NC}"
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Attendre que le frontend démarre
sleep 3

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Application démarrée avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}URLs:${NC}"
echo -e "  - Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "  - Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "  - API:      ${YELLOW}http://localhost:8000/api/${NC}"
echo -e "\n${BLUE}Logs:${NC}"
echo -e "  - Backend:  tail -f logs/backend.log"
echo -e "  - Frontend: tail -f logs/frontend.log"
echo -e "\n${YELLOW}Pour arrêter:${NC} kill $BACKEND_PID $FRONTEND_PID"
echo -e "${YELLOW}Ou:${NC} ./stop-dev.sh\n"

# Garder le script en vie
wait
