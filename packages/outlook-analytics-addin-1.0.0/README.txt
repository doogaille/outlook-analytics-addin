Outlook Analytics Add-in - Package d'installation
Version: 1.0.0

CONTENU DU PACKAGE
==================

- manifest.xml          : Manifest de l'add-in
- taskpane/             : Fichiers de l'interface utilisateur
  - taskpane.html       : Page HTML principale
  - taskpane.js         : Code JavaScript compilé
  - taskpane.css        : Styles CSS (intégrés dans JS)

INSTALLATION
============

Option 1 : Exchange Admin Center (Recommandé)
----------------------------------------------
1. Connectez-vous à l'Exchange Admin Center
2. Allez dans Organization > Add-ins
3. Cliquez sur + > Add from file
4. Sélectionnez le fichier manifest.xml
5. Configurez la distribution et sauvegardez

Option 2 : SharePoint App Catalog
----------------------------------
1. Accédez au SharePoint App Catalog
2. Allez dans Apps for Office
3. Uploadez le fichier manifest.xml
4. Configurez les permissions

Option 3 : Manifest local (Développement/Test)
-----------------------------------------------
1. Ouvrez Outlook Desktop
2. Fichier > Gérer les compléments > Paramètres
3. Cochez "Activer les compléments de développeur"
4. Cliquez sur "Ajouter" et sélectionnez manifest.xml
5. Redémarrez Outlook

HÉBERGEMENT
===========

Les fichiers doivent être hébergés sur un serveur web accessible :
- HTTPS recommandé (obligatoire en production)
- Les URLs dans manifest.xml doivent pointer vers votre serveur
- Vérifiez que tous les fichiers sont accessibles

CONFIGURATION
=============

Avant le déploiement :
1. Modifiez manifest.xml pour mettre à jour les URLs
2. Remplacez "YOUR-GUID-HERE" par un GUID unique
3. Vérifiez que les chemins sont corrects

SUPPORT
=======

Consultez la documentation complète dans le dossier docs/
- ARCHITECTURE.md : Architecture du projet
- DEPLOYMENT.md : Guide de déploiement
- ADMIN-GUIDE.md : Guide administrateur
- USER-GUIDE.md : Guide utilisateur
- API.md : Documentation API interne
- ON-PREMISE-CONFIG.md : Configuration on-premise

Pour plus d'informations, consultez le README.md du projet.

