# Développement sur Mac pour Windows

Ce guide explique comment développer l'add-in Outlook sur Mac alors que la cible de production est Windows.

## ✅ Compatibilité

L'add-in est **cross-platform** et fonctionne sur :
- ✅ Windows (cible principale)
- ✅ Mac (compatible)
- ✅ Outlook Desktop (Windows et Mac)
- ✅ Outlook Web (si configuré)

## 🛠️ Développement sur Mac

### Option 1 : Avec Docker (Recommandé - Pas d'installation)

Avec Docker, vous n'avez besoin d'installer **rien** sur votre Mac (Docker Desktop est supposé installé) :

```bash
# Démarrer l'environnement de développement
npm run docker:dev

# Lancer les tests
npm run docker:test

# Builder
npm run docker:build
```

> 📖 Consultez [DOCKER.md](./DOCKER.md) pour le guide complet

### Option 2 : Installation locale

### 1. Installation

Sur Mac, installez les dépendances normalement :

```bash
npm install
```

### 2. Développement local

Le serveur de développement fonctionne sur Mac :

```bash
npm run dev
```

L'add-in sera accessible sur `https://localhost:3000`

### 3. Tests

Les tests fonctionnent parfaitement sur Mac :

```bash
npm test
npm run test:watch
```

### 4. Build

Le build est identique sur Mac et Windows :

```bash
npm run build
```

## 🪟 Test sur Windows

### Option 1 : Machine Windows physique

1. Copiez le projet sur une machine Windows
2. Installez les dépendances : `npm install`
3. Build : `npm run build`
4. Testez avec Outlook Desktop Windows

### Option 2 : Machine virtuelle Windows

1. Installez une VM Windows (Parallels, VMware, VirtualBox)
2. Partagez le dossier du projet
3. Suivez les mêmes étapes que l'option 1

### Option 3 : Remote Desktop / SSH

1. Connectez-vous à une machine Windows distante
2. Clonez le projet
3. Testez directement

## 🔍 Détection de plateforme

Le code détecte automatiquement la plateforme :

```typescript
import { OutlookAPI } from '@/utils/OutlookAPI';

// Détecter Windows
if (OutlookAPI.isWindows()) {
  // Code spécifique Windows
}

// Détecter Mac
if (OutlookAPI.isMac()) {
  // Code spécifique Mac
}

// Détecter Desktop (Windows ou Mac)
if (OutlookAPI.isDesktop()) {
  // Code pour Desktop
}
```

## 📋 Différences Windows/Mac

### API Office.js

Les API Office.js sont **identiques** sur Windows et Mac pour :
- ✅ Récupération des réunions
- ✅ Lecture du calendrier
- ✅ Accès aux propriétés des rendez-vous
- ✅ Permissions

### Limitations Mac

Certaines fonctionnalités peuvent être limitées sur Mac :
- ⚠️ API REST : Peut nécessiter une configuration supplémentaire
- ⚠️ EWS : Peut ne pas être disponible selon la version
- ⚠️ Performance : Peut être légèrement différente

### Manifest

Le manifest est configuré pour fonctionner sur **les deux plateformes** :

```xml
<DesktopFormFactor>
  <!-- Fonctionne sur Windows ET Mac -->
</DesktopFormFactor>
```

## 🧪 Tests cross-platform

### Tests unitaires

Les tests unitaires fonctionnent sur Mac et testent la logique métier :

```bash
npm test
```

### Tests d'intégration

Pour tester l'intégration complète avec Outlook :
- Sur Mac : Testez avec Outlook Desktop Mac
- Sur Windows : Testez avec Outlook Desktop Windows (recommandé pour validation finale)

## 📦 Déploiement

### Build une fois, déployez partout

Le build est identique pour Windows et Mac :

```bash
npm run build
```

Le dossier `dist/` contient les fichiers prêts pour le déploiement.

### Déploiement Exchange

Le déploiement via Exchange Admin Center fonctionne pour **toutes les plateformes** :

1. Uploadez le manifest.xml
2. L'add-in sera disponible sur Windows ET Mac automatiquement

## 🐛 Dépannage

### L'add-in ne fonctionne pas sur Windows

1. **Vérifiez le manifest** : Assurez-vous que `DesktopFormFactor` est présent
2. **Vérifiez les URLs** : Les URLs doivent être accessibles depuis Windows
3. **Vérifiez les certificats** : HTTPS requis (sauf localhost)
4. **Vérifiez les logs** : Ouvrez la console Outlook (F12) pour voir les erreurs

### Différences de comportement

Si vous observez des différences entre Mac et Windows :

1. Vérifiez la version d'Exchange Server
2. Vérifiez la version d'Outlook Desktop
3. Utilisez `OutlookAPI.isWindows()` pour adapter le comportement si nécessaire

## ✅ Checklist avant déploiement Windows

- [ ] Build réussi : `npm run build`
- [ ] Tests passent : `npm test`
- [ ] Manifest validé : `npm run validate`
- [ ] URLs de production configurées dans manifest.xml
- [ ] Testé sur Windows (si possible)
- [ ] Certificats SSL configurés
- [ ] Documentation mise à jour

## 📚 Ressources

- [Office Add-ins Platform Overview](https://docs.microsoft.com/office/dev/add-ins/overview/office-add-ins)
- [Outlook Add-in Requirements](https://docs.microsoft.com/office/dev/add-ins/outlook/requirement-sets/outlook-api-requirement-sets)
- [Platform Differences](https://docs.microsoft.com/office/dev/add-ins/develop/differences-between-using-a-task-pane-or-content-add-in)

