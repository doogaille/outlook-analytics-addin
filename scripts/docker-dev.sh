#!/bin/bash

# Script pour démarrer l'environnement de développement Docker

set -e

echo "🐳 Démarrage de l'environnement de développement Docker..."

# Utiliser docker compose (nouvelle syntaxe) ou docker-compose (ancienne)
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Construire et démarrer le container
echo "📦 Construction de l'image Docker..."
$COMPOSE_CMD build

echo "🚀 Démarrage du serveur de développement..."
echo "📍 L'add-in sera accessible sur https://localhost:3000"
echo ""
echo "Pour arrêter le serveur, utilisez: docker-compose down"
echo "Pour voir les logs: docker-compose logs -f"
echo ""

$COMPOSE_CMD up

