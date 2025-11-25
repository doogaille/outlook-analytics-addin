# Architecture du projet - Outlook Analytics Add-in

## 📐 Vue d'ensemble

L'add-in Outlook Analytics est une application web qui s'intègre dans Outlook Desktop (Windows/Mac) pour analyser les réunions du calendrier. L'architecture suit une approche modulaire avec séparation des responsabilités.

## 🏗️ Structure du projet

```
src/
├── models/              # Modèles de données TypeScript
│   └── Meeting.ts       # Interfaces Meeting, ClassifiedMeeting, MeetingColor
│
├── services/            # Services métier (logique applicative)
│   ├── MeetingService.ts           # Récupération des réunions depuis Outlook
│   ├── ClassificationService.ts    # Classification par couleur (rouge/vert/bleu)
│   ├── StatisticsService.ts        # Calcul des statistiques
│   └── ConfigService.ts            # Gestion de la configuration utilisateur
│
├── utils/               # Utilitaires et helpers
│   ├── OutlookAPI.ts              # Abstraction de l'API Office.js
│   ├── OutlookRESTAPI.ts          # Implémentation REST API
│   ├── OutlookAPIMock.ts          # Mock pour développement/test
│   ├── CacheService.ts            # Mise en cache des données
│   └── ErrorHandler.ts           # Gestion centralisée des erreurs
│
├── taskpane/            # Interface utilisateur
│   ├── taskpane.html    # Structure HTML
│   ├── taskpane.ts      # Logique TypeScript (orchestration)
│   └── taskpane.css     # Styles CSS
│
└── types/               # Définitions TypeScript
    └── office.d.ts      # Types Office.js pour on-premise
```

## 🔄 Flux de données

### 1. Chargement des réunions

```
Utilisateur sélectionne période
    ↓
taskpane.ts → loadMeetings()
    ↓
MeetingService.getMeetings()
    ↓
OutlookAPI / OutlookRESTAPI (selon environnement)
    ↓
Parse des rendez-vous → Meeting[]
    ↓
CacheService (mise en cache)
    ↓
Retour à taskpane.ts
```

### 2. Classification

```
Meeting[] (non classifiés)
    ↓
ClassificationService.classifyMeetings()
    ↓
Application des règles (keywords + patterns)
    ↓
ClassifiedMeeting[] (avec couleur et raison)
    ↓
Retour à taskpane.ts
```

### 3. Calcul des statistiques

```
ClassifiedMeeting[]
    ↓
StatisticsService.calculateStatistics()
    ↓
Calculs de fréquence, temps, répartition
    ↓
Objet Statistics
    ↓
Affichage dans l'UI (tableaux + graphiques)
```

## 🧩 Composants principaux

### Services

#### MeetingService
**Responsabilité** : Récupération et parsing des réunions

- `getMeetings(startDate, endDate)` : Récupère les réunions pour une période
- `parseAppointments()` : Convertit les rendez-vous Office.js en objets Meeting
- `filterByDateRange()` : Filtre les réunions par période

**Stratégies** :
- Mode mock pour développement/test
- API REST (Exchange 2013+)
- API Office.js standard (fallback)
- Mise en cache automatique

#### ClassificationService
**Responsabilité** : Classification des réunions par couleur

- `classifyMeetings()` : Classifie une liste de réunions
- `classifyMeeting()` : Classifie une réunion individuelle
- `updateRules()` : Met à jour les règles de classification
- `getRules()` : Récupère les règles actuelles

**Règles de classification** :
- 🔴 **Rouge (No Flex)** : Réunions obligatoires, direction, validation
- 🟢 **Vert (Flex)** : Réunions optionnelles, informatives, stand-ups
- 🔵 **Bleu (Déplacement)** : Formations, déplacements, événements externes

**Priorité** : No Flex > Déplacement > Flex

#### StatisticsService
**Responsabilité** : Calcul des statistiques

- `calculateStatistics()` : Calcule toutes les statistiques
- `calculateFrequency()` : Fréquence hebdomadaire/mensuelle
- `calculateCountByColor()` : Nombre par couleur
- `calculateTimeStats()` : Temps total, moyen, par couleur

#### ConfigService
**Responsabilité** : Gestion de la configuration utilisateur

- `loadPreferences()` : Charge les préférences depuis localStorage
- `savePreferences()` : Sauvegarde les préférences
- `updatePreferences()` : Met à jour partiellement
- `resetPreferences()` : Réinitialise aux valeurs par défaut

### Utilitaires

#### OutlookAPI
**Responsabilité** : Abstraction de l'API Office.js

- Détection de plateforme (Windows/Mac/Web)
- Détection de version Exchange/Outlook
- Détection des capacités API disponibles
- Méthodes adaptatives selon l'environnement

#### CacheService
**Responsabilité** : Mise en cache des données

- Cache en mémoire avec expiration
- Clés basées sur les paramètres de requête
- TTL configurable (5 minutes par défaut)

#### ErrorHandler
**Responsabilité** : Gestion centralisée des erreurs

- Logging structuré
- Messages utilisateur conviviaux
- Gestion des erreurs réseau/API

## 🎨 Interface utilisateur

### Structure HTML

```
taskpane.html
├── Header (titre, date range picker)
├── Statistics Section
│   ├── Tableau de statistiques
│   ├── Graphiques (pie chart, bar chart)
│   └── Filtres par couleur
├── Meetings List
│   ├── Contrôles (tri, pagination)
│   ├── Liste des réunions (virtualisée si > 50)
│   └── Pagination
├── Export Section
└── Settings Panel (modal)
```

### Logique TypeScript (taskpane.ts)

**Fonctions principales** :
- `initialize()` : Initialisation de l'application
- `loadMeetings()` : Chargement des réunions
- `displayStatistics()` : Affichage des statistiques
- `displayMeetings()` : Affichage de la liste (avec virtualisation)
- `displayCharts()` : Génération des graphiques
- `exportData()` : Export CSV/JSON

**Virtualisation** :
- Activation automatique si > 50 éléments
- Chargement dynamique lors du scroll
- Utilisation de l'Intersection Observer API

## 🔌 Intégration Outlook

### Détection d'environnement

L'add-in détecte automatiquement :
- **Plateforme** : Windows, Mac, ou Web
- **Version Exchange** : Via l'URL REST ou les capacités
- **Version Outlook** : Via les diagnostics Office.js
- **Capacités API** : REST, EWS, Calendar, etc.

### Stratégies d'API

1. **API REST** (priorité) : Exchange 2013+
   - Plus performant
   - Plus de fonctionnalités
   - Nécessite Exchange 2013+

2. **API Office.js standard** (fallback)
   - Compatible toutes versions
   - Fonctionnalités limitées
   - Utilisé si REST indisponible

3. **Mode Mock** (développement)
   - Données de test
   - Pas besoin d'Outlook
   - Utilisé si Office.js indisponible

## 💾 Persistance des données

### localStorage

**Préférences utilisateur** :
- `defaultDateRange` : Période par défaut (jours)
- `meetingsPerPage` : Nombre de réunions par page
- `autoLoad` : Chargement automatique
- `theme` : Thème (light/dark)
- `classificationRules` : Règles personnalisées

**Format** : JSON stringifié

### Cache en mémoire

**Données mises en cache** :
- Réunions (5 minutes TTL)
- Clé basée sur : type + startDate + endDate

**Expiration** : Automatique après TTL

## 🧪 Tests

### Structure des tests

```
tests/
├── services/            # Tests unitaires des services
│   ├── MeetingService.test.ts
│   ├── ClassificationService.test.ts
│   ├── StatisticsService.test.ts
│   └── ConfigService.test.ts
├── utils/               # Tests des utilitaires
│   └── Sorting.test.ts
└── e2e/                 # Tests end-to-end
    └── analytics.e2e.test.ts
```

### Couverture

- **Tests unitaires** : Services, utilitaires
- **Tests d'intégration** : Flux complets
- **Tests E2E** : Scénarios utilisateur complets

## 🚀 Build et déploiement

### Webpack

**Configuration** :
- Entry : `src/taskpane/taskpane.ts`
- Output : `dist/taskpane/`
- Loaders : TypeScript, CSS (style-loader)
- Mode : development/production

**Optimisations** :
- Minification en production
- Tree shaking
- Code splitting (si nécessaire)

### Manifest

**Fichier** : `manifest.xml`

**Configuration** :
- Version Exchange minimale : 1.1 (Exchange 2013+)
- Permissions : ReadWriteMailbox
- FormFactor : Desktop (Windows + Mac)

## 🔐 Sécurité

### Permissions

- **ReadWriteMailbox** : Lecture/écriture du calendrier
- Nécessaire pour récupérer les réunions

### Validation

- Validation des entrées utilisateur
- Échappement HTML pour prévenir XSS
- Validation des dates

## 📊 Performance

### Optimisations

1. **Virtualisation de listes** : Pour > 50 éléments
2. **Mise en cache** : Réduit les appels API
3. **Lazy loading** : Chargement à la demande
4. **Pagination** : Limite le nombre d'éléments affichés
5. **Debouncing** : Pour les interactions utilisateur

### Métriques

- Temps de chargement initial : < 1s
- Temps de classification : < 1s pour 1000 réunions
- Temps de calcul stats : < 500ms pour 1000 réunions

## 🔄 Évolutions futures

### Améliorations possibles

1. **Service Worker** : Cache offline
2. **IndexedDB** : Stockage local plus robuste
3. **Web Workers** : Calculs en arrière-plan
4. **GraphQL** : Si API disponible
5. **React/Vue** : Framework UI (optionnel)

## 📝 Notes techniques

### Compatibilité

- **Exchange Server** : 2013, 2016, 2019
- **Outlook Desktop** : 2013+ (Windows), 2016+ (Mac)
- **Navigateurs** : IE11+ (via Office.js), Edge, Chrome, Firefox

### Limitations

- Certaines API Office.js peuvent ne pas être disponibles selon la version Exchange
- L'add-in s'adapte automatiquement avec des fallbacks
- Les tests sur environnements réels sont nécessaires pour valider

