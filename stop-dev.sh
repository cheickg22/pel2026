#!/bin/bash

# Script pour arrêter l'application

echo "Arrêt de l'application..."

# Arrêter le backend (port 8000)
lsof -ti:8000 | xargs kill 2>/dev/null && echo "✅ Backend arrêté" || echo "Backend non actif"

# Arrêter le frontend (port 5173)
lsof -ti:5173 | xargs kill 2>/dev/null && echo "✅ Frontend arrêté" || echo "Frontend non actif"

echo "✅ Application arrêtée"
