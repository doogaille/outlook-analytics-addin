# Dockerfile pour l'environnement de développement
FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Exposer le port pour le serveur de développement
EXPOSE 3000

# Commande par défaut (peut être surchargée)
CMD ["npm", "run", "dev"]

