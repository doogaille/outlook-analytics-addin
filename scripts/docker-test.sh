#!/bin/bash

# Script pour lancer les tests dans Docker

set -e

echo "🧪 Lancement des tests dans Docker..."

# Utiliser docker compose (nouvelle syntaxe) ou docker-compose (ancienne)
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Lancer les tests
$COMPOSE_CMD run --rm test

