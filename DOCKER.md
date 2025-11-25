# Guide Docker - Développement sans installation locale

Ce guide explique comment développer l'add-in Outlook en utilisant Docker, sans installer Node.js ou npm directement sur votre Mac.

> 💡 **Prérequis** : Docker Desktop est installé et fonctionne sur votre Mac.

## 🚀 Démarrage rapide

### 1. Démarrer l'environnement de développement

```bash
# Option 1 : Utiliser le script
npm run docker:dev

# Option 2 : Utiliser docker-compose directement
docker-compose up
# ou (nouvelle syntaxe)
docker compose up
```

L'add-in sera accessible sur `https://localhost:3000`

### 2. Arrêter l'environnement

```bash
# Option 1 : Utiliser le script
npm run docker:down

# Option 2 : Utiliser docker-compose directement
docker-compose down
# ou
docker compose down
```

## 📋 Commandes disponibles

### Développement

```bash
# Démarrer le serveur de développement
npm run docker:dev

# Voir les logs
npm run docker:logs
```

### Tests

```bash
# Lancer les tests
npm run docker:test

# Lancer les tests en mode watch (dans le container)
docker-compose exec dev npm run test:watch
```

### Build

```bash
# Builder l'add-in pour la production
npm run docker:build
```

## 🔧 Utilisation avancée

### Accéder au shell du container

```bash
docker-compose exec dev sh
```

Une fois dans le container, vous pouvez exécuter toutes les commandes npm :

```bash
npm install          # Installer une nouvelle dépendance
npm test            # Lancer les tests
npm run build       # Builder
```

### Installer une nouvelle dépendance

1. **Option 1** : Modifier `package.json` et reconstruire
   ```bash
   # Éditez package.json, puis :
   docker-compose build
   docker-compose up
   ```

2. **Option 2** : Installer dans le container
   ```bash
   docker-compose exec dev npm install <package>
   ```
   Puis copiez le `package.json` et `package-lock.json` mis à jour.

### Voir les logs en temps réel

```bash
npm run docker:logs
# ou
docker-compose logs -f dev
```

### Redémarrer le container

```bash
docker-compose restart dev
```

### Nettoyer les containers et volumes

```bash
# Arrêter et supprimer les containers
docker-compose down

# Supprimer aussi les volumes (attention : supprime node_modules du container)
docker-compose down -v

# Supprimer l'image Docker
docker-compose down --rmi all
```

## 📁 Structure des volumes

Le code source est monté dans le container, donc :
- ✅ Les modifications de code sont visibles immédiatement (hot-reload)
- ✅ Les fichiers générés (dist/) sont accessibles sur votre Mac
- ✅ Les `node_modules` sont dans le container (pas sur votre Mac)

## 🔐 Certificats HTTPS

Les certificats de développement sont générés dans le container. Pour les utiliser avec Outlook :

1. Les certificats sont générés automatiquement par `office-addin-dev-certs`
2. Si besoin, accédez au container et générez-les :
   ```bash
   docker-compose exec dev npm run start
   ```

## 🐛 Dépannage

### Le port 3000 est déjà utilisé

Modifiez le port dans `docker-compose.yml` :

```yaml
ports:
  - "3001:3000"  # Utilisez 3001 au lieu de 3000
```

Puis mettez à jour les URLs dans `manifest.xml`.

### Les changements ne sont pas pris en compte

1. Vérifiez que le volume est bien monté :
   ```bash
   docker-compose exec dev ls -la /app
   ```

2. Redémarrez le container :
   ```bash
   docker-compose restart dev
   ```

### Erreur de permissions

Sur Mac, Docker Desktop gère les permissions automatiquement. Si vous avez des problèmes :

```bash
# Vérifiez les permissions des fichiers
ls -la

# Si nécessaire, ajustez les permissions
chmod -R 755 .
```

### Le container ne démarre pas

1. Vérifiez les logs :
   ```bash
   docker-compose logs dev
   ```

2. Reconstruisez l'image :
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

### node_modules manquant

Les `node_modules` sont dans le container. Pour les installer localement (optionnel) :

```bash
# Dans le container
docker-compose exec dev npm install

# Ou copiez depuis le container (non recommandé)
docker cp outlook-addin-dev:/app/node_modules ./node_modules
```

## 📊 Avantages de Docker

✅ **Pas d'installation locale** : Node.js, npm, et toutes les dépendances sont dans le container  
✅ **Environnement isolé** : Pas de conflits avec d'autres projets  
✅ **Reproductible** : Même environnement pour tous les développeurs  
✅ **Facile à nettoyer** : Supprimez le container, c'est tout  
✅ **Cross-platform** : Fonctionne sur Mac, Windows, Linux  
✅ **Prêt à l'emploi** : Docker Desktop installé = prêt à développer  

## 🔄 Workflow recommandé

1. **Démarrer** : `npm run docker:dev`
2. **Développer** : Éditez les fichiers, le hot-reload fonctionne automatiquement
3. **Tester** : `npm run docker:test` (dans un autre terminal)
4. **Builder** : `npm run docker:build` (quand prêt pour la production)
5. **Arrêter** : `npm run docker:down`

## 📝 Notes importantes

- ⚠️ Les `node_modules` sont dans le container, pas sur votre Mac
- ✅ Le code source est synchronisé en temps réel
- ✅ Les fichiers générés (dist/) sont accessibles sur votre Mac
- ✅ Vous pouvez éditer les fichiers directement sur votre Mac
- ✅ Le hot-reload fonctionne normalement

## 🆘 Besoin d'aide ?

- Vérifiez les logs : `npm run docker:logs`
- Accédez au container : `docker-compose exec dev sh`
- Consultez la [documentation Docker](https://docs.docker.com/)

