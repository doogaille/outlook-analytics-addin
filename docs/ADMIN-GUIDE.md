# Guide Administrateur - Déploiement Outlook Analytics Add-in

## 📋 Vue d'ensemble

Ce guide est destiné aux administrateurs Exchange qui souhaitent déployer l'add-in Outlook Analytics dans un environnement on-premise.

## 🎯 Prérequis

### Infrastructure
- **Exchange Server** : 2013, 2016 ou 2019
- **Outlook Desktop** : Windows (cible principale) ou Mac (compatible)
- **Serveur Web** : IIS, Apache ou autre serveur web avec HTTPS
- **Certificat SSL** : Certificat valide pour le serveur hébergeant l'add-in

### Permissions
- **Administrateur Exchange** : Pour déployer via Exchange Admin Center
- **Administrateur SharePoint** : Si déploiement via SharePoint App Catalog
- **Accès réseau** : Les utilisateurs doivent pouvoir accéder au serveur hébergeant l'add-in

## 📦 Étape 1 : Préparation

### 1.1 Build de production

```bash
# Avec Docker (recommandé)
npm run docker:build

# Ou localement
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

### 1.2 Générer un GUID unique

L'add-in nécessite un GUID unique. Si ce n'est pas déjà fait :

```bash
node scripts/generate-guid.js
```

Mettez à jour `manifest.xml` avec le GUID généré dans la section `<Id>`.

### 1.3 Configurer les URLs de production

Modifiez `manifest.xml` pour pointer vers votre serveur de production :

```xml
<SourceLocation DefaultValue="https://votre-serveur-interne.com/taskpane/taskpane.html" />
<IconUrl DefaultValue="https://votre-serveur-interne.com/assets/icon-32.png" />
<HighResolutionIconUrl DefaultValue="https://votre-serveur-interne.com/assets/icon-64.png" />
```

**Important** : 
- Utilisez HTTPS (recommandé) ou HTTP pour les serveurs internes
- Les URLs doivent être accessibles depuis les postes clients
- Vérifiez les règles de pare-feu si nécessaire

## 🚀 Étape 2 : Hébergement des fichiers

### 2.1 Copier les fichiers sur le serveur web

Copiez le contenu du dossier `dist/` sur votre serveur web :

```
dist/
├── taskpane/
│   ├── taskpane.html
│   ├── taskpane.js
│   ├── taskpane.css
│   └── assets/ (si présent)
└── manifest.xml
```

### 2.2 Configuration HTTPS

Pour un serveur interne, vous pouvez :

**Option A : Certificat interne (recommandé)**
- Utiliser un certificat émis par votre autorité de certification interne
- Les utilisateurs doivent faire confiance à l'autorité de certification

**Option B : Certificat auto-signé (non recommandé pour production)**
- Générer un certificat auto-signé
- Les utilisateurs devront accepter l'avertissement de sécurité

**Option C : HTTP (développement/test uniquement)**
- ⚠️ Non recommandé pour la production
- Peut fonctionner pour des tests internes

### 2.3 Configuration CORS (si nécessaire)

Si vous hébergez l'add-in sur un domaine différent d'Exchange, configurez CORS :

**IIS (web.config)** :
```xml
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="Access-Control-Allow-Origin" value="*" />
      <add name="Access-Control-Allow-Methods" value="GET, POST, OPTIONS" />
      <add name="Access-Control-Allow-Headers" value="Content-Type" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

## 📤 Étape 3 : Déploiement

### Option A : Exchange Admin Center (Recommandé)

1. **Connectez-vous à l'EAC**
   - Ouvrez un navigateur et accédez à `https://votre-exchange-server/ecp`
   - Connectez-vous avec un compte administrateur Exchange

2. **Accédez à la section Add-ins**
   - Allez dans **Organization** > **Add-ins**
   - Cliquez sur **+** (Add)

3. **Ajoutez l'add-in**
   - Sélectionnez **Add from file**
   - Naviguez vers le fichier `manifest.xml` sur votre serveur web
   - Cliquez sur **Add**

4. **Configurez la distribution**
   - **Make this add-in available to** : 
     - `The entire organization` : Pour tous les utilisateurs
     - `Specific users/groups` : Pour des utilisateurs ou groupes spécifiques
   - **Default state for users** : 
     - `Enabled` : L'add-in est activé par défaut
     - `Disabled` : Les utilisateurs doivent l'activer manuellement

5. **Sauvegardez**
   - Cliquez sur **Save**
   - L'add-in sera disponible après quelques minutes

### Option B : PowerShell (Automatisé)

Utilisez le script PowerShell fourni :

```powershell
.\scripts\deploy.ps1 -ExchangeServer "mail.domain.com" -ManifestPath ".\dist\manifest.xml"
```

Pour forcer le remplacement d'une version existante :

```powershell
.\scripts\deploy.ps1 -ExchangeServer "mail.domain.com" -ManifestPath ".\dist\manifest.xml" -Force
```

### Option C : SharePoint App Catalog

1. **Accédez au SharePoint App Catalog**
   - Ouvrez votre site SharePoint App Catalog
   - Allez dans **Apps for Office**

2. **Uploadez le manifest**
   - Cliquez sur **New Item** ou **Upload**
   - Sélectionnez le fichier `manifest.xml`
   - Configurez les permissions

3. **Distribuez l'add-in**
   - Configurez les groupes d'utilisateurs autorisés
   - Activez l'add-in pour les utilisateurs cibles

### Option D : Manifest local (Développement/Test)

Pour tester localement sans déploiement centralisé :

1. **Ouvrez Outlook Desktop**
2. **Accédez aux paramètres**
   - Fichier > Gérer les compléments
   - Cliquez sur l'icône ⚙️ (Paramètres)
3. **Activez les compléments de développeur**
   - Cochez "Activer les compléments de développeur"
4. **Ajoutez le manifest**
   - Cliquez sur "Ajouter"
   - Sélectionnez le fichier `manifest.xml` local
5. **Redémarrez Outlook**

## ✅ Étape 4 : Vérification

### 4.1 Vérifier le déploiement

Dans Exchange Admin Center :
- Allez dans **Organization** > **Add-ins**
- Vérifiez que l'add-in apparaît dans la liste
- Vérifiez l'état (Enabled/Disabled)

### 4.2 Tester sur un poste client

1. **Ouvrez Outlook Desktop**
2. **Vérifiez que l'add-in est disponible**
   - Fichier > Gérer les compléments
   - L'add-in devrait apparaître dans la liste
3. **Activez l'add-in** (si désactivé)
4. **Testez l'add-in**
   - Ouvrez un message ou un rendez-vous
   - L'add-in devrait apparaître dans le ruban

### 4.3 Vérifier les logs

En cas de problème, vérifiez :
- Les logs du serveur web (erreurs 404, 500, etc.)
- Les logs Exchange (Event Viewer)
- La console du navigateur dans Outlook (F12)

## 🔧 Dépannage

### L'add-in n'apparaît pas dans Outlook

**Causes possibles** :
1. L'add-in n'est pas activé pour l'utilisateur
   - **Solution** : Activez l'add-in dans Exchange Admin Center
2. Le manifest n'est pas accessible
   - **Solution** : Vérifiez que l'URL du manifest est correcte et accessible
3. Problème de certificat SSL
   - **Solution** : Vérifiez que le certificat est valide et approuvé
4. Version d'Exchange incompatible
   - **Solution** : Vérifiez que votre version d'Exchange est 2013+

### Erreurs de chargement

**Erreur : "Cannot load add-in"**
- Vérifiez que les fichiers HTML/JS/CSS sont accessibles
- Vérifiez les erreurs dans la console du navigateur (F12)
- Vérifiez les règles de pare-feu

**Erreur : "Office.js not available"**
- Vérifiez que l'add-in est chargé dans Outlook (pas dans un navigateur externe)
- Vérifiez la version d'Exchange (doit être 2013+)

### Problèmes de performance

**L'add-in est lent**
- Vérifiez la latence réseau vers le serveur
- Vérifiez les performances du serveur web
- Activez la virtualisation pour les grandes listes (automatique si > 50 éléments)

## 🔐 Sécurité

### Recommandations

1. **HTTPS obligatoire en production**
   - Utilisez un certificat valide
   - Évitez les certificats auto-signés

2. **Contrôle d'accès**
   - Limitez l'accès au serveur web aux utilisateurs autorisés
   - Utilisez l'authentification si nécessaire

3. **Permissions Exchange**
   - L'add-in nécessite `ReadWriteMailbox`
   - Vérifiez que les utilisateurs ont les permissions nécessaires

4. **Mise à jour**
   - Mettez à jour régulièrement l'add-in
   - Surveillez les vulnérabilités de sécurité

## 📊 Monitoring

### Vérifier l'utilisation

Dans Exchange Admin Center :
- Allez dans **Organization** > **Add-ins**
- Sélectionnez l'add-in
- Consultez les statistiques d'utilisation (si disponibles)

### Logs

Les logs peuvent être consultés dans :
- **Event Viewer** (Windows) : Applications et Services Logs > Microsoft > Exchange
- **Serveur web** : Logs IIS/Apache
- **Console navigateur** : F12 dans Outlook

## 🔄 Mise à jour

Pour mettre à jour l'add-in :

1. **Build de la nouvelle version**
   ```bash
   npm run build
   ```

2. **Copier les nouveaux fichiers** sur le serveur web

3. **Mettre à jour via EAC**
   - Allez dans **Organization** > **Add-ins**
   - Sélectionnez l'add-in
   - Cliquez sur **Edit**
   - Uploadez le nouveau `manifest.xml`
   - Sauvegardez

4. **Vérifier la mise à jour**
   - Les utilisateurs devront peut-être redémarrer Outlook
   - L'add-in se mettra à jour automatiquement

## 📞 Support

En cas de problème :
1. Consultez la section Dépannage ci-dessus
2. Vérifiez les logs
3. Contactez l'équipe de développement avec :
   - Version d'Exchange
   - Version d'Outlook
   - Messages d'erreur complets
   - Logs pertinents

## 📝 Notes importantes

- **Version minimale Exchange** : Exchange Server 2013
- **Version minimale Outlook** : Outlook 2013 (Desktop)
- **Compatibilité** : Windows (optimisé), Mac (compatible)
- **Permissions requises** : ReadWriteMailbox
- **Réseau** : Les utilisateurs doivent pouvoir accéder au serveur hébergeant l'add-in

