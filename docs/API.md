# Documentation API Interne

## 📚 Vue d'ensemble

Cette documentation décrit l'API interne de l'add-in Outlook Analytics. Elle est destinée aux développeurs qui souhaitent étendre ou modifier l'add-in.

## 🏗️ Services

### MeetingService

Service pour récupérer et gérer les réunions depuis Outlook.

#### Méthodes

##### `getMeetings(startDate, endDate, useMock?, useCache?)`

Récupère les réunions pour une période donnée.

**Paramètres** :
- `startDate: Date` - Date de début
- `endDate: Date` - Date de fin
- `useMock?: boolean` - Utiliser le mode mock (défaut: false)
- `useCache?: boolean` - Utiliser le cache (défaut: true)

**Retourne** : `Promise<Meeting[]>`

**Exemple** :
```typescript
const service = new MeetingService();
const meetings = await service.getMeetings(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

##### `filterByDateRange(meetings, startDate, endDate)`

Filtre les réunions par période.

**Paramètres** :
- `meetings: Meeting[]` - Liste des réunions
- `startDate: Date` - Date de début
- `endDate: Date` - Date de fin

**Retourne** : `Meeting[]`

---

### ClassificationService

Service pour classifier les réunions par couleur.

#### Méthodes

##### `classifyMeeting(meeting)`

Classe une réunion selon les règles.

**Paramètres** :
- `meeting: Meeting` - Réunion à classifier

**Retourne** : `ClassifiedMeeting`

**Exemple** :
```typescript
const service = new ClassificationService();
const classified = service.classifyMeeting(meeting);
// classified.color === MeetingColor.RED
// classified.classificationReason === 'No Flex - Réunion obligatoire'
```

##### `classifyMeetings(meetings)`

Classe plusieurs réunions.

**Paramètres** :
- `meetings: Meeting[]` - Liste des réunions

**Retourne** : `ClassifiedMeeting[]`

##### `updateRules(rules)`

Met à jour les règles de classification.

**Paramètres** :
- `rules: Partial<ClassificationRules>` - Nouvelles règles

**Exemple** :
```typescript
service.updateRules({
  noFlex: {
    keywords: ['urgent', 'important'],
    patterns: [/urgent/i]
  }
});
```

##### `getRules()`

Récupère les règles actuelles.

**Retourne** : `ClassificationRules`

##### `loadRulesFromJSON(jsonRules)`

Charge les règles depuis un objet JSON.

**Paramètres** :
- `jsonRules: ClassificationRulesJSON` - Règles au format JSON

**Exemple** :
```typescript
const jsonRules = {
  noFlex: {
    keywords: ['obligatoire'],
    patterns: ['/obligatoire/i']
  },
  // ...
};
service.loadRulesFromJSON(jsonRules);
```

##### `fromJSON(jsonRules)` (statique)

Crée une instance avec des règles chargées depuis JSON.

**Paramètres** :
- `jsonRules: ClassificationRulesJSON` - Règles au format JSON

**Retourne** : `ClassificationService`

---

### StatisticsService

Service pour calculer les statistiques sur les réunions.

#### Méthodes

##### `calculateStatistics(meetings)`

Calcule les statistiques complètes.

**Paramètres** :
- `meetings: ClassifiedMeeting[]` - Liste des réunions classifiées

**Retourne** : `MeetingStatistics`

**Structure de retour** :
```typescript
{
  total: number;                    // Nombre total
  totalDuration: number;            // Durée totale (minutes)
  averageDuration: number;          // Durée moyenne (minutes)
  byColor: {                        // Nombre par couleur
    red: number;
    green: number;
    blue: number;
    default: number;
  };
  byColorDuration: {                // Durée par couleur (minutes)
    red: number;
    green: number;
    blue: number;
    default: number;
  };
  weeklyFrequency: number;          // Fréquence hebdomadaire
  monthlyFrequency: number;          // Fréquence mensuelle
  averagePerDay: number;            // Moyenne par jour
  busiestDays: Array<{              // Jours les plus chargés
    date: string;
    count: number;
  }>;
  busiestHours: Array<{             // Créneaux les plus chargés
    hour: number;
    count: number;
  }>;
}
```

**Exemple** :
```typescript
const service = new StatisticsService();
const stats = service.calculateStatistics(classifiedMeetings);
console.log(`Total: ${stats.total}`);
console.log(`Temps total: ${stats.totalDuration} min`);
```

##### `calculateCountByColor(meetings)`

Calcule le nombre de réunions par couleur.

**Paramètres** :
- `meetings: ClassifiedMeeting[]` - Liste des réunions

**Retourne** : `{ red: number; green: number; blue: number; default: number }`

---

### ConfigService

Service pour gérer la configuration utilisateur.

#### Méthodes

##### `loadPreferences()`

Charge les préférences depuis localStorage.

**Retourne** : `UserPreferences`

##### `savePreferences(preferences)`

Sauvegarde les préférences.

**Paramètres** :
- `preferences: UserPreferences` - Préférences à sauvegarder

##### `updatePreferences(preferences)`

Met à jour partiellement les préférences.

**Paramètres** :
- `preferences: Partial<UserPreferences>` - Préférences à mettre à jour

##### `resetPreferences()`

Réinitialise les préférences aux valeurs par défaut.

##### `getPreference(key)`

Récupère une préférence spécifique.

**Paramètres** :
- `key: keyof UserPreferences` - Clé de la préférence

**Retourne** : `any`

##### `setPreference(key, value)`

Définit une préférence spécifique.

**Paramètres** :
- `key: keyof UserPreferences` - Clé de la préférence
- `value: any` - Valeur à définir

---

## 🛠️ Utilitaires

### OutlookAPI

Abstraction de l'API Office.js avec détection d'environnement.

#### Méthodes statiques

##### `isAvailable()`

Vérifie si Office.js est disponible.

**Retourne** : `boolean`

##### `isDesktop()`

Vérifie si on est dans Outlook Desktop.

**Retourne** : `boolean`

##### `isWindows()`

Vérifie si on est sur Windows.

**Retourne** : `boolean`

##### `isMac()`

Vérifie si on est sur Mac.

**Retourne** : `boolean`

##### `getExchangeVersion()`

Détecte la version d'Exchange Server.

**Retourne** : `string | null`

##### `getOutlookVersion()`

Détecte la version d'Outlook.

**Retourne** : `string | null`

##### `getAvailableCapabilities()`

Récupère les capacités API disponibles.

**Retourne** : `string[]` (ex: ['REST', 'Calendar', 'UserProfile'])

##### `hasCapability(capability)`

Vérifie si une capacité est disponible.

**Paramètres** :
- `capability: string` - Nom de la capacité

**Retourne** : `boolean`

##### `getDiagnostics()`

Récupère toutes les informations de diagnostic.

**Retourne** : `DiagnosticsInfo`

---

### CacheService

Service de mise en cache.

#### Méthodes statiques

##### `get<T>(key)`

Récupère une valeur du cache.

**Paramètres** :
- `key: string` - Clé du cache

**Retourne** : `T | null`

##### `set(key, value, ttl?)`

Définit une valeur dans le cache.

**Paramètres** :
- `key: string` - Clé du cache
- `value: T` - Valeur à mettre en cache
- `ttl?: number` - Durée de vie en millisecondes (défaut: 5 minutes)

##### `clear()`

Vide le cache.

##### `generateKey(type, ...args)`

Génère une clé de cache.

**Paramètres** :
- `type: string` - Type de données
- `...args: any[]` - Arguments pour la clé

**Retourne** : `string`

---

### ErrorHandler

Gestion centralisée des erreurs.

#### Méthodes statiques

##### `logError(error, context)`

Enregistre une erreur.

**Paramètres** :
- `error: any` - Erreur à enregistrer
- `context: string` - Contexte de l'erreur

##### `getUserFriendlyMessage(error)`

Retourne un message utilisateur convivial.

**Paramètres** :
- `error: any` - Erreur

**Retourne** : `string`

---

## 📦 Modèles

### Meeting

```typescript
interface Meeting {
  id: string;
  subject: string;
  start: Date;
  end: Date;
  duration: number;        // en minutes
  location?: string;
  organizer?: string;
  attendees?: string[];
  body?: string;
  isAllDay?: boolean;
  recurrence?: RecurrenceInfo;
}
```

### ClassifiedMeeting

```typescript
interface ClassifiedMeeting extends Meeting {
  color: MeetingColor;
  classificationReason?: string;
}
```

### MeetingColor

```typescript
enum MeetingColor {
  RED = 'red',      // No flex
  GREEN = 'green',  // Flex
  BLUE = 'blue',    // Déplacement/Formation
  DEFAULT = 'gray'  // Non classifié
}
```

### UserPreferences

```typescript
interface UserPreferences {
  defaultDateRange?: {
    days: number;
  };
  meetingsPerPage?: number;
  autoLoad?: boolean;
  theme?: 'light' | 'dark';
  classificationRules?: ClassificationRulesJSON;
}
```

---

## 🔌 Intégration

### Exemple d'utilisation complète

```typescript
import { MeetingService } from './services/MeetingService';
import { ClassificationService } from './services/ClassificationService';
import { StatisticsService } from './services/StatisticsService';

// Initialiser les services
const meetingService = new MeetingService();
const classificationService = new ClassificationService();
const statisticsService = new StatisticsService();

// Charger les réunions
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const meetings = await meetingService.getMeetings(startDate, endDate);

// Classifier
const classified = classificationService.classifyMeetings(meetings);

// Calculer les statistiques
const stats = statisticsService.calculateStatistics(classified);

console.log(`Total: ${stats.total}`);
console.log(`Rouges: ${stats.byColor.red}`);
console.log(`Temps total: ${stats.totalDuration} min`);
```

---

## 📝 Notes

- Tous les services sont des classes instanciables
- Les méthodes asynchrones retournent des Promises
- Les erreurs sont gérées automatiquement avec fallback vers mock
- Le cache est automatique pour les requêtes répétées

