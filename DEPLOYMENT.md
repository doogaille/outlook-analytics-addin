# Guide de déploiement - Outlook on-premise

## 📋 Prérequis

- Exchange Server 2013, 2016 ou 2019
- Outlook Desktop (Windows ou Mac)
- Serveur web interne (IIS, Apache, etc.) avec HTTPS
- Permissions administrateur Exchange
- Node.js 18+ (pour le build) ou Docker (recommandé)

## Étape 1 : Préparation

### 1.1 Générer le GUID

```bash
node scripts/generate-guid.js
```

Mettez à jour `manifest.xml` avec le GUID généré.

### 1.2 Build de production

```bash
npm run build
```

Les fichiers seront dans le dossier `dist/`.

### 1.3 Configurer les URLs

Modifiez `manifest.xml` pour pointer vers votre serveur :

```xml
<SourceLocation DefaultValue="https://votre-serveur.com/taskpane/taskpane.html" />
```

## Étape 2 : Déploiement

### Option A : Exchange Admin Center (Recommandé)

1. Connectez-vous à l'Exchange Admin Center (EAC)
2. Allez dans **Organization** > **Add-ins**
3. Cliquez sur **+** > **Add from file**
4. Sélectionnez le fichier `manifest.xml` depuis le dossier `dist/`
5. Configurez :
   - **Make this add-in available to** : Toute l'organisation ou groupes spécifiques
   - **Default state for users** : Enabled
6. Cliquez sur **Save**

### Option B : SharePoint App Catalog

1. Accédez au SharePoint App Catalog
2. Allez dans **Apps for Office**
3. Uploadez le fichier `manifest.xml`
4. Configurez les permissions et la distribution

### Option C : Manifest local (Développement/Test)

1. Ouvrez Outlook Desktop
2. Fichier > Gérer les compléments > Paramètres (icône ⚙️)
3. Cochez "Activer les compléments de développeur"
4. Cliquez sur "Ajouter" et sélectionnez le fichier `manifest.xml`
5. Redémarrez Outlook

## Étape 3 : Hébergement des fichiers

### 3.1 Copier les fichiers

Copiez le contenu du dossier `dist/` sur votre serveur web :

```
dist/
├── taskpane/
│   ├── taskpane.html
│   ├── taskpane.js
│   └── taskpane.css
└── manifest.xml
```

### 3.2 Configuration HTTPS

L'add-in nécessite HTTPS (sauf pour localhost en développement).

Pour un serveur interne, vous pouvez :
- Utiliser un certificat auto-signé (non recommandé pour production)
- Utiliser un certificat interne émis par votre PKI
- Configurer un reverse proxy avec HTTPS

### 3.3 Configuration CORS (si nécessaire)

Si vous hébergez sur un domaine différent, configurez CORS :

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Étape 4 : Test

### Sur Windows (recommandé pour validation)

1. Ouvrez Outlook Desktop Windows
2. Créez ou ouvrez un message/rendez-vous
3. Vérifiez que le bouton "Analytics" apparaît dans le ruban
4. Cliquez sur le bouton pour ouvrir le panneau
5. Testez le chargement des réunions

### Sur Mac (compatible)

1. Ouvrez Outlook Desktop Mac
2. Suivez les mêmes étapes que Windows
3. Notez toute différence de comportement

> 💡 **Note** : L'add-in fonctionne sur Windows et Mac, mais est optimisé pour Windows.

## Dépannage

### L'add-in n'apparaît pas

- Vérifiez que le manifest est bien déployé dans EAC
- Vérifiez les permissions utilisateur
- Vérifiez les logs Outlook (F12 pour ouvrir la console)

### Erreur de chargement

- Vérifiez que les URLs dans le manifest sont correctes
- Vérifiez que le serveur est accessible
- Vérifiez les certificats SSL
- Vérifiez la console du navigateur (F12)

### Erreur d'authentification

- Vérifiez les permissions dans le manifest (`ReadWriteMailbox`)
- Vérifiez que l'utilisateur a les droits nécessaires

## Script PowerShell pour déploiement automatique

```powershell
# Exemple de script PowerShell pour déploiement Exchange
$manifestPath = "C:\path\to\manifest.xml"
$orgConfig = Get-OrganizationConfig

# Installer l'add-in
New-App -OrganizationApp -Manifest $manifestPath -DefaultStateForUser Enabled
```

## Mise à jour

Pour mettre à jour l'add-in :

1. Rebuild : `npm run build`
2. Copier les nouveaux fichiers sur le serveur
3. Dans EAC, mettre à jour le manifest ou réinstaller l'add-in

## Support

En cas de problème, vérifiez :
- Les logs Exchange
- Les logs Outlook (F12)
- La documentation Microsoft : https://docs.microsoft.com/office/dev/add-ins/

