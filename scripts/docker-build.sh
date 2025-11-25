#!/bin/bash

# Script pour builder l'add-in dans Docker

set -e

echo "🔨 Build de l'add-in dans Docker..."

# Utiliser docker compose (nouvelle syntaxe) ou docker-compose (ancienne)
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Builder
$COMPOSE_CMD run --rm build

echo "✅ Build terminé ! Les fichiers sont dans le dossier dist/"

