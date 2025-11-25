#!/bin/bash

# Script pour créer un package d'installation (.zip)
# Usage: ./scripts/package.sh [version]

set -e

VERSION=${1:-"1.0.0"}
PACKAGE_NAME="outlook-analytics-addin-${VERSION}"
PACKAGE_DIR="packages/${PACKAGE_NAME}"
ZIP_FILE="packages/${PACKAGE_NAME}.zip"

echo "📦 Création du package d'installation..."
echo "Version: ${VERSION}"
echo ""

# Créer le dossier packages s'il n'existe pas
mkdir -p packages

# Nettoyer l'ancien package s'il existe
if [ -d "${PACKAGE_DIR}" ]; then
  echo "🧹 Nettoyage de l'ancien package..."
  rm -rf "${PACKAGE_DIR}"
fi

if [ -f "${ZIP_FILE}" ]; then
  echo "🧹 Suppression de l'ancien zip..."
  rm -f "${ZIP_FILE}"
fi

# Créer la structure du package
echo "📁 Création de la structure..."
mkdir -p "${PACKAGE_DIR}"

# Build de production
echo "🔨 Build de production..."
npm run build

# Copier les fichiers nécessaires
echo "📋 Copie des fichiers..."

# Copier les fichiers compilés
cp -r dist/* "${PACKAGE_DIR}/"

# Copier le manifest
if [ -f "manifest.xml" ]; then
  cp manifest.xml "${PACKAGE_DIR}/"
fi

# Créer un README pour le package
cat > "${PACKAGE_DIR}/README.txt" << EOF
Outlook Analytics Add-in - Package d'installation
Version: ${VERSION}

CONTENU DU PACKAGE
==================

- manifest.xml          : Manifest de l'add-in
- taskpane/             : Fichiers de l'interface utilisateur
  - taskpane.html       : Page HTML principale
  - taskpane.js         : Code JavaScript compilé
  - taskpane.css        : Styles CSS

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

Pour plus d'informations, consultez le README.md du projet.
EOF

# Créer un fichier de version
echo "${VERSION}" > "${PACKAGE_DIR}/VERSION.txt"

# Créer le zip
echo "📦 Création du fichier zip..."
cd packages
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}" > /dev/null
cd ..

# Afficher le résumé
echo ""
echo "✅ Package créé avec succès !"
echo ""
echo "📁 Dossier: ${PACKAGE_DIR}"
echo "📦 Archive: ${ZIP_FILE}"
echo ""
echo "📊 Taille du package:"
du -sh "${PACKAGE_DIR}"
du -sh "${ZIP_FILE}"
echo ""
echo "🚀 Prêt pour le déploiement !"
echo ""
echo "💡 Pour déployer :"
echo "   1. Uploadez le contenu de ${PACKAGE_DIR} sur votre serveur web"
echo "   2. Utilisez le script PowerShell: ./scripts/deploy.ps1"
echo "   3. Ou déployez manuellement via Exchange Admin Center"
echo ""

