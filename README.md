# Outlook Meeting Analytics Add-in

Add-in Outlook on-premise pour l'analytique des réunions avec classification par couleur.

## 🎯 Fonctionnalités

- 📊 Analyse de la fréquence et du nombre de réunions
- 🎨 Classification par couleur :
  - 🔴 **Rouge** : No flex (réunions obligatoires)
  - 🟢 **Vert** : Flex (réunions flexibles)
  - 🔵 **Bleu** : Déplacement/Formation
- 📈 Statistiques détaillées (temps, fréquence, répartition)
- 📤 Export des données (CSV/JSON)

## 🏗️ Architecture

```
src/
├── services/          # Services métier
│   ├── MeetingService.ts
│   ├── ClassificationService.ts
│   └── StatisticsService.ts
├── models/            # Modèles de données
│   └── Meeting.ts
├── utils/             # Utilitaires
│   └── OutlookAPI.ts
└── taskpane/          # Interface utilisateur
    ├── taskpane.html
    ├── taskpane.ts
    └── taskpane.css
```

## 🚀 Installation

### Prérequis

**Option 1 : Avec Docker (Recommandé - Pas d'installation locale)**
- Docker Desktop installé et fonctionnel
- C'est tout ! Plus besoin d'installer Node.js ou npm

**Option 2 : Installation locale**
- Node.js 18+
- npm ou yarn

**Commun**
- **Développement** : Mac ou Windows
- **Déploiement cible** : Outlook Desktop Windows (compatible aussi Mac)
- Exchange Server on-premise (2013+)

> 💡 **Note** : Vous pouvez développer sur Mac, l'add-in fonctionnera sur Windows. Le code est cross-platform.

### Installation avec Docker (Recommandé)

```bash
# Démarrer l'environnement de développement
npm run docker:dev
```

L'add-in sera accessible sur `https://localhost:3000`

> 📖 Consultez [DOCKER.md](./DOCKER.md) pour le guide complet Docker

### Installation locale (Alternative)

```bash
# Installer les dépendances
npm install

# Configuration HTTPS locale (développement)
npm run start
```

Cela génère des certificats SSL pour le développement local.

## 🧪 Tests

### Avec Docker

```bash
# Lancer les tests
npm run docker:test

# Tests en mode watch (dans le container)
docker-compose exec dev npm run test:watch
```

### Installation locale

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

## 🛠️ Développement

### Avec Docker (Recommandé)

```bash
# Mode développement
npm run docker:dev

# Build production
npm run docker:build

# Voir les logs
npm run docker:logs

# Arrêter
npm run docker:down
```

L'add-in sera accessible sur `https://localhost:3000`

### Installation locale

```bash
# Mode développement
npm run dev

# Build production
npm run build
```

## 📦 Déploiement on-premise

### Option 1 : Exchange Admin Center

1. Connectez-vous à l'Exchange Admin Center
2. Allez dans **Organization** > **Add-ins**
3. Cliquez sur **+** > **Add from file**
4. Sélectionnez le fichier `manifest.xml`
5. Configurez les permissions et la distribution

### Option 2 : SharePoint App Catalog

1. Accédez au SharePoint App Catalog
2. Uploadez le manifest.xml
3. Configurez les permissions

### Option 3 : Manifest local (développement)

1. Ouvrez Outlook Desktop
2. Fichier > Gérer les compléments > Paramètres
3. Ajoutez le chemin vers `manifest.xml`
4. Redémarrez Outlook

## ⚙️ Configuration

### URLs de production

Modifiez les URLs dans `manifest.xml` pour pointer vers votre serveur de production :

```xml
<SourceLocation DefaultValue="https://votre-serveur.com/taskpane/taskpane.html" />
```

### Règles de classification

Les règles de classification peuvent être personnalisées dans `src/services/ClassificationService.ts` ou via un fichier de configuration.

## 📝 Notes

- Compatible avec Exchange Server 2013, 2016, 2019
- **Développement** : Compatible Mac et Windows
- **Production** : Optimisé pour Outlook Desktop Windows, compatible Mac
- Nécessite des permissions `ReadWriteMailbox`
- Le code détecte automatiquement la plateforme (Windows/Mac)

### Développement sur Mac pour Windows

L'add-in est conçu pour fonctionner sur Windows tout en permettant le développement sur Mac :

- ✅ Le code est cross-platform
- ✅ Les tests fonctionnent sur Mac
- ✅ Le build est identique pour les deux plateformes
- ⚠️ Pour tester sur Windows, vous aurez besoin d'une machine Windows ou d'une VM
- ⚠️ Le manifest est configuré pour `DesktopFormFactor` (Windows et Mac)

## 📄 Licence

MIT

