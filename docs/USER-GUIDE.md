# Guide d'utilisation - Outlook Analytics Add-in

## 🎯 Introduction

L'add-in Outlook Analytics vous permet d'analyser vos réunions et de les classifier automatiquement par couleur pour mieux comprendre votre charge de travail.

## 🚀 Démarrage rapide

### 1. Ouvrir l'add-in

1. Ouvrez **Outlook Desktop** (Windows ou Mac)
2. Créez ou ouvrez un **message** ou un **rendez-vous**
3. Dans le ruban, cliquez sur le bouton **Analytics** (ou **Analytique**)
4. Le panneau Analytics s'ouvre sur le côté

### 2. Charger vos réunions

1. Sélectionnez une **période** (dates de début et fin)
2. Cliquez sur **Charger les réunions**
3. Les réunions sont automatiquement classifiées et analysées

## 🎨 Classification par couleur

Les réunions sont automatiquement classifiées en trois catégories :

### 🔴 Rouge - No Flex (Réunions obligatoires)
- Réunions de direction
- Réunions de validation
- Réunions obligatoires
- Comités de direction

### 🟢 Vert - Flex (Réunions optionnelles)
- Stand-ups
- Points info
- Réunions optionnelles
- Briefings

### 🔵 Bleu - Déplacement/Formation
- Formations
- Déplacements
- Réunions chez le client
- Conférences externes

## 📊 Statistiques disponibles

### Vue d'ensemble
- **Total de réunions** : Nombre total dans la période
- **Temps total** : Temps passé en réunions (en heures/minutes)
- **Durée moyenne** : Durée moyenne d'une réunion

### Répartition par couleur
- Nombre de réunions par couleur
- Temps passé par type de réunion
- Graphiques visuels (camembert, barres)

### Fréquences
- **Fréquence hebdomadaire** : Nombre moyen de réunions par semaine
- **Fréquence mensuelle** : Nombre moyen de réunions par mois
- **Moyenne par jour** : Nombre moyen de réunions par jour

### Analyses avancées
- **Jours les plus chargés** : Top 10 des jours avec le plus de réunions
- **Créneaux horaires les plus chargés** : Heures où vous avez le plus de réunions

## 🎛️ Fonctionnalités

### Filtrage

#### Par période
- Utilisez les sélecteurs de date pour choisir la période
- Cliquez sur **Charger les réunions** pour actualiser

#### Par couleur
- Cochez/décochez les filtres de couleur en haut
- La liste se met à jour automatiquement

### Tri

Triez les réunions par :
- **Date** (croissant/décroissant)
- **Durée** (croissant/décroissant)
- **Sujet** (A-Z / Z-A)

### Pagination

- Les réunions sont paginées (20 par défaut, configurable)
- Utilisez les boutons de pagination en bas
- Pour les grandes listes (> 50), la virtualisation s'active automatiquement

### Export

Exportez vos données pour analyse externe :

- **Export CSV** : Format tableur (Excel, Google Sheets)
- **Export JSON** : Format structuré pour traitement

Les fichiers sont téléchargés automatiquement.

## ⚙️ Paramètres

### Accéder aux paramètres

1. Cliquez sur **⚙️ Paramètres** en bas de l'add-in
2. Le panneau de paramètres s'ouvre

### Paramètres disponibles

#### Période par défaut
- Nombre de jours à charger par défaut (30 jours recommandé)
- Utilisé au démarrage de l'add-in

#### Réunions par page
- Nombre de réunions affichées par page (20 par défaut)
- Augmentez pour voir plus de réunions, diminuez pour de meilleures performances

#### Chargement automatique
- Activez pour charger automatiquement les réunions au démarrage
- Désactivez pour un contrôle manuel

### Règles de classification

Personnalisez les règles de classification :

1. Dans les paramètres, cliquez sur **Règles de classification**
2. Sélectionnez une catégorie (No Flex, Flex, Déplacement)
3. Ajoutez/modifiez/supprimez des mots-clés
4. Cliquez sur **Enregistrer**

**Exemple** : Pour classifier toutes les réunions contenant "urgent" en rouge :
1. Ouvrez "No Flex"
2. Ajoutez "urgent" dans les mots-clés
3. Enregistrez

## 📈 Graphiques

### Graphique en camembert
- Affiche la répartition des réunions par couleur
- Cliquez sur la légende pour filtrer

### Graphique en barres
- Affiche la distribution hebdomadaire
- Permet de voir les tendances dans le temps

## 💡 Conseils d'utilisation

### Pour une analyse efficace

1. **Choisissez une période pertinente** : 30 jours est un bon compromis
2. **Utilisez les filtres** : Analysez chaque type de réunion séparément
3. **Exportez régulièrement** : Gardez une trace de vos analyses
4. **Personnalisez les règles** : Adaptez la classification à vos besoins

### Pour améliorer les performances

1. **Réduisez la période** : Moins de réunions = chargement plus rapide
2. **Utilisez la pagination** : Ne chargez que ce dont vous avez besoin
3. **Désactivez le chargement automatique** : Si vous ne l'utilisez pas souvent

## ❓ Questions fréquentes

### L'add-in ne charge pas mes réunions

**Vérifiez** :
- Que vous êtes connecté à Outlook
- Que la période sélectionnée contient des réunions
- La console du navigateur (F12) pour les erreurs

### Les réunions ne sont pas bien classifiées

**Solutions** :
- Personnalisez les règles de classification
- Ajoutez vos propres mots-clés
- Vérifiez que les règles sont bien enregistrées

### Les graphiques ne s'affichent pas

**Vérifiez** :
- Que vous avez chargé des réunions
- Que JavaScript est activé
- La console du navigateur (F12) pour les erreurs

### L'export ne fonctionne pas

**Vérifiez** :
- Que vous avez des réunions à exporter
- Que les téléchargements sont autorisés dans votre navigateur
- La console du navigateur (F12) pour les erreurs

## 🔄 Mise à jour

L'add-in se met à jour automatiquement. Si vous ne voyez pas les dernières fonctionnalités :

1. Fermez et rouvrez Outlook
2. Videz le cache du navigateur (si Outlook Web)
3. Contactez votre administrateur pour vérifier la version déployée

## 📞 Support

En cas de problème :

1. Consultez ce guide
2. Vérifiez la console du navigateur (F12)
3. Contactez votre administrateur IT
4. Consultez la documentation technique si vous êtes développeur

## 🎓 Exemples d'utilisation

### Analyser votre charge de réunions

1. Chargez les réunions du dernier mois
2. Regardez le temps total passé en réunions
3. Identifiez les jours les plus chargés
4. Exportez pour analyse plus poussée

### Optimiser votre planning

1. Identifiez les créneaux horaires les plus chargés
2. Voyez quels types de réunions prennent le plus de temps
3. Ajustez votre planning en conséquence

### Suivre l'évolution

1. Exportez régulièrement vos données
2. Comparez les périodes
3. Identifiez les tendances

