# Règles de Classification des Réunions

## 🎨 Vue d'ensemble

Les réunions sont automatiquement classifiées en trois catégories selon leur contenu (sujet, description, lieu) :

- 🔴 **Rouge (No Flex)** : Réunions obligatoires
- 🟢 **Vert (Flex)** : Réunions optionnelles/flexibles
- 🔵 **Bleu (Déplacement/Formation)** : Réunions externes, formations, déplacements

## 📋 Ordre de priorité

Les règles sont appliquées dans cet ordre (la première correspondance gagne) :

1. **No Flex** (Rouge) - Priorité la plus haute
2. **Déplacement/Formation** (Bleu)
3. **Flex** (Vert) - Priorité la plus basse

Si aucune règle ne correspond, la réunion est classifiée comme **Non classifiée** (Gris par défaut).

## 🔴 Rouge - No Flex (Réunions obligatoires)

### Mots-clés

Les réunions contenant ces mots-clés sont classifiées en rouge :

- `obligatoire`
- `requis`
- `required`
- `mandatory`
- `direction`
- `validation`
- `comité`
- `board`
- `réunion importante`

### Patterns (expressions régulières)

- `/réunion\s+(de\s+)?direction/i` - Réunion de direction
- `/comité\s+(de\s+)?direction/i` - Comité de direction
- `/board\s+meeting/i` - Board meeting
- `/validation\s+(de\s+)?(projet|budget|stratégie)/i` - Validation de projet/budget/stratégie
- `/obligatoire/i` - Obligatoire
- `/mandatory/i` - Mandatory

### Exemples

✅ **Classifiées en rouge** :
- "Réunion de direction - Budget 2024"
- "Comité de validation obligatoire"
- "Board meeting - Q4 review"
- "Validation projet - Réunion requise"

## 🟢 Vert - Flex (Réunions optionnelles)

### Mots-clés

- `optionnel`
- `optional`
- `info`
- `information`
- `stand-up`
- `standup`
- `daily`
- `point`
- `briefing`
- `sync`
- `synchronisation`

### Patterns

- `/stand[-\\s]?up/i` - Stand-up
- `/daily\\s+(stand[-\\s]?up|meeting|sync)/i` - Daily stand-up/meeting/sync
- `/point\\s+(info|information)/i` - Point info/information
- `/briefing/i` - Briefing
- `/optionnel/i` - Optionnel
- `/optional/i` - Optional

### Exemples

✅ **Classifiées en vert** :
- "Stand-up quotidien"
- "Point info équipe"
- "Daily sync - Optionnel"
- "Briefing hebdomadaire"

## 🔵 Bleu - Déplacement/Formation

### Mots-clés

- `formation`
- `training`
- `déplacement`
- `travel`
- `client`
- `customer`
- `external`
- `externe`
- `conférence`
- `conference`
- `événement`
- `event`
- `seminar`
- `séminaire`

### Patterns

- `/formation/i` - Formation
- `/training/i` - Training
- `/déplacement/i` - Déplacement
- `/travel/i` - Travel
- `/chez\\s+(le\\s+)?client/i` - Chez le client
- `/external/i` - External
- `/externe/i` - Externe
- `/conférence/i` - Conférence
- `/conference/i` - Conference
- `/événement/i` - Événement
- `/event/i` - Event
- `/seminar/i` - Seminar
- `/séminaire/i` - Séminaire

### Exemples

✅ **Classifiées en bleu** :
- "Formation React - Avancé"
- "Déplacement client - Paris"
- "Conférence Tech 2024"
- "Training external - Office 365"

## ⚙️ Personnalisation

### Via l'interface utilisateur

1. Ouvrez l'add-in dans Outlook
2. Cliquez sur **⚙️ Paramètres**
3. Cliquez sur **Règles de classification**
4. Ajoutez/modifiez/supprimez des mots-clés pour chaque catégorie
5. Cliquez sur **Enregistrer**

### Via fichier de configuration

Les règles peuvent être chargées depuis un fichier JSON :

```json
{
  "noFlex": {
    "keywords": ["obligatoire", "direction"],
    "patterns": ["/réunion\\s+de\\s+direction/i"]
  },
  "flex": {
    "keywords": ["optionnel", "stand-up"],
    "patterns": ["/stand[-\\s]?up/i"]
  },
  "deplacement": {
    "keywords": ["formation", "déplacement"],
    "patterns": ["/formation/i", "/déplacement/i"]
  },
  "priority": ["noFlex", "deplacement", "flex"],
  "defaultColor": "green"
}
```

### Format des patterns

Les patterns sont des expressions régulières JavaScript au format string :

- Format complet : `"/pattern/flags"`
  - Exemple : `"/réunion\\s+de\\s+direction/i"`
  - Flags : `i` (insensible à la casse), `g` (global), `m` (multiline)

- Format simple : `"pattern"`
  - Exemple : `"formation"`
  - Par défaut, insensible à la casse

## 🔍 Logique de correspondance

Pour qu'une réunion soit classifiée dans une catégorie, elle doit correspondre à :

- **Au moins un mot-clé** dans le sujet, le corps ou le lieu, OU
- **Au moins un pattern** (regex) dans le sujet, le corps ou le lieu

Le texte est converti en minuscules avant la comparaison (sauf pour les patterns qui peuvent avoir leurs propres flags).

## 📝 Notes

- Les règles sont appliquées dans l'ordre de priorité
- La première correspondance gagne
- Les mots-clés sont recherchés dans : sujet + corps + lieu
- Les patterns regex sont également appliqués sur le texte combiné
- La classification est insensible à la casse (sauf si le pattern spécifie autrement)

## 🎯 Bonnes pratiques

1. **Soyez spécifiques** : Utilisez des mots-clés précis pour éviter les faux positifs
2. **Testez vos règles** : Après modification, testez avec vos réunions réelles
3. **Utilisez les patterns** : Pour des correspondances plus complexes, utilisez les regex
4. **Priorité** : Placez les règles les plus spécifiques en premier dans l'ordre de priorité

## 🔄 Mise à jour des règles

Les règles peuvent être mises à jour :
- **Via l'interface** : Modifications immédiates, sauvegardées dans localStorage
- **Via fichier JSON** : Nécessite un redémarrage ou rechargement de l'add-in
- **Via code** : Modification du fichier `ClassificationService.ts` (nécessite rebuild)

