# Configuration On-Premise - Outlook Analytics Add-in

## 📋 Vue d'ensemble

Ce document décrit la configuration spécifique pour les environnements Exchange Server on-premise.

## 🔧 Versions Exchange Server supportées

### Versions minimales

- **Exchange Server 2013** : Version minimale recommandée
- **Exchange Server 2016** : Entièrement supporté
- **Exchange Server 2019** : Entièrement supporté

### Manifest Requirements

Le manifest spécifie la version minimale requise :

```xml
<Requirements>
  <Sets>
    <Set Name="Mailbox" MinVersion="1.1" />
  </Sets>
</Requirements>
```

**MinVersion="1.1"** correspond à Exchange Server 2013+.

## 🌐 Configuration des URLs internes

### URLs dans le manifest

Modifiez `manifest.xml` pour pointer vers votre serveur interne :

```xml
<SourceLocation DefaultValue="https://votre-serveur-interne.com/taskpane/taskpane.html" />
<IconUrl DefaultValue="https://votre-serveur-interne.com/assets/icon-32.png" />
<HighResolutionIconUrl DefaultValue="https://votre-serveur-interne.com/assets/icon-64.png" />
```

### Options de configuration

#### Option 1 : HTTPS (Recommandé)

**Avantages** :
- Sécurité renforcée
- Compatible avec toutes les versions d'Exchange
- Pas d'avertissements de sécurité

**Configuration** :
- Certificat SSL valide (interne ou public)
- Serveur web configuré pour HTTPS

#### Option 2 : HTTP (Développement/Test uniquement)

**Limitations** :
- ⚠️ Non recommandé pour la production
- Peut fonctionner pour des tests internes
- Certaines fonctionnalités peuvent être limitées

**Configuration** :
- Serveur web HTTP standard
- Vérifiez que votre organisation autorise HTTP pour les add-ins

## 🔐 Certificats SSL

### Certificat interne (Recommandé)

Si vous utilisez une PKI interne :

1. **Obtenir un certificat** :
   - Émis par votre autorité de certification interne
   - Valide pour le domaine de votre serveur

2. **Installer le certificat** :
   - Sur le serveur web hébergeant l'add-in
   - Configuré pour HTTPS

3. **Faire confiance à l'autorité** :
   - Les postes clients doivent faire confiance à l'autorité de certification
   - Généralement géré via GPO (Group Policy) en entreprise

### Certificat auto-signé (Non recommandé)

**Utilisation** : Développement/test uniquement

**Limitations** :
- Avertissements de sécurité pour les utilisateurs
- Nécessite l'acceptation manuelle du certificat
- Non adapté pour la production

## 🔌 Compatibilité des API Office.js

### API disponibles par version Exchange

#### Exchange 2013

**Disponible** :
- ✅ API REST v1.0
- ✅ API Office.js de base
- ✅ getUserIdentityTokenAsync

**Limitations** :
- ⚠️ Certaines fonctionnalités REST avancées peuvent être limitées
- ⚠️ API REST v2.0 peut ne pas être disponible

#### Exchange 2016

**Disponible** :
- ✅ API REST v1.0 et v2.0
- ✅ API Office.js complètes
- ✅ Toutes les fonctionnalités de base

**Recommandé** : Version optimale pour l'add-in

#### Exchange 2019

**Disponible** :
- ✅ API REST v1.0 et v2.0
- ✅ API Office.js complètes
- ✅ Toutes les fonctionnalités

**Recommandé** : Version la plus récente, toutes les fonctionnalités disponibles

### Détection automatique

L'add-in détecte automatiquement :

- **Version Exchange** : Via l'URL REST ou les capacités
- **API disponibles** : REST, EWS, Calendar, etc.
- **Plateforme** : Windows, Mac, Web

**Code de détection** :
```typescript
const diagnostics = OutlookAPI.getDiagnostics();
console.log('Exchange Version:', diagnostics.exchangeVersion);
console.log('Capabilities:', diagnostics.capabilities);
```

### Fallbacks automatiques

L'add-in s'adapte automatiquement :

1. **Si REST v2.0 indisponible** → Utilise REST v1.0
2. **Si REST indisponible** → Utilise Office.js standard
3. **Si Office.js indisponible** → Utilise le mode mock (développement)

## 🔥 Configuration du pare-feu

### Ports requis

**HTTPS** :
- Port **443** (standard)
- Ou port personnalisé si configuré

**HTTP** (non recommandé) :
- Port **80** (standard)

### Règles de pare-feu

**Postes clients → Serveur add-in** :
- Autoriser HTTPS (443) vers le serveur hébergeant l'add-in
- Autoriser HTTP (80) si utilisé (non recommandé)

**Outlook → Exchange Server** :
- Ports Exchange standards (443, 25, etc.)
- Pas de modification nécessaire pour l'add-in

## 🌍 Configuration CORS

### Si serveur sur domaine différent

Si l'add-in est hébergé sur un domaine différent d'Exchange :

**IIS (web.config)** :
```xml
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="Access-Control-Allow-Origin" value="*" />
      <add name="Access-Control-Allow-Methods" value="GET, POST, OPTIONS" />
      <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

**Apache (.htaccess)** :
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

**Note** : Pour la production, remplacez `*` par le domaine spécifique d'Exchange.

## 📊 Limitations par version

### Exchange 2013

**Limitations connues** :
- API REST v2.0 peut ne pas être disponible
- Certaines fonctionnalités avancées limitées
- Performance légèrement inférieure à 2016+

**Recommandations** :
- Utilisez REST v1.0
- Activez le cache pour améliorer les performances
- Testez avec vos données réelles

### Exchange 2016

**Aucune limitation majeure** :
- Toutes les fonctionnalités disponibles
- Performance optimale
- Version recommandée

### Exchange 2019

**Aucune limitation** :
- Toutes les fonctionnalités disponibles
- Performance optimale
- Version la plus récente

## 🖥️ Différences Windows vs Mac

### Outlook Desktop Windows

**Caractéristiques** :
- ✅ Support complet de toutes les API
- ✅ Performance optimale
- ✅ Cible principale de développement

**Configuration** :
- Aucune configuration spécifique requise
- Fonctionne avec toutes les versions Exchange supportées

### Outlook Desktop Mac

**Caractéristiques** :
- ✅ Compatible avec toutes les fonctionnalités
- ⚠️ Certaines API peuvent avoir des différences subtiles
- ✅ Détection automatique de la plateforme

**Configuration** :
- Aucune configuration spécifique requise
- L'add-in s'adapte automatiquement

### Détection automatique

L'add-in détecte automatiquement la plateforme :

```typescript
if (OutlookAPI.isWindows()) {
  // Code spécifique Windows
} else if (OutlookAPI.isMac()) {
  // Code spécifique Mac
}
```

## 🔍 Vérification de la configuration

### Checklist de vérification

- [ ] Manifest configuré avec URLs internes
- [ ] Certificat SSL valide (si HTTPS)
- [ ] Serveur web accessible depuis les postes clients
- [ ] Pare-feu configuré correctement
- [ ] CORS configuré (si domaine différent)
- [ ] Version Exchange vérifiée (2013+)
- [ ] Testé sur Windows et Mac (si applicable)

### Tests de validation

1. **Test de connexion** :
   ```bash
   curl -I https://votre-serveur-interne.com/taskpane/taskpane.html
   ```

2. **Test de certificat** :
   ```bash
   openssl s_client -connect votre-serveur-interne.com:443
   ```

3. **Test depuis Outlook** :
   - Ouvrir Outlook Desktop
   - Charger l'add-in
   - Vérifier les logs (F12)

## 📝 Notes importantes

### Développement vs Production

**Développement** :
- HTTP peut être utilisé (localhost)
- Certificat auto-signé acceptable
- Mode mock disponible

**Production** :
- HTTPS obligatoire
- Certificat valide requis
- Configuration sécurisée nécessaire

### Mise à jour

Lors de la mise à jour de l'add-in :

1. Rebuild : `npm run build`
2. Copier les nouveaux fichiers sur le serveur
3. Mettre à jour le manifest dans Exchange Admin Center
4. Les utilisateurs verront la nouvelle version après redémarrage d'Outlook

## 🆘 Dépannage

### L'add-in ne se charge pas

**Vérifiez** :
1. URLs dans manifest.xml correctes
2. Serveur accessible depuis les postes clients
3. Certificat SSL valide (si HTTPS)
4. Console navigateur (F12) pour erreurs

### Erreurs de certificat

**Solutions** :
1. Vérifier que le certificat est valide
2. Faire confiance à l'autorité de certification
3. Vérifier la date d'expiration

### API non disponibles

**Solutions** :
1. Vérifier la version Exchange (2013+)
2. Vérifier les logs de détection
3. Utiliser les fallbacks automatiques

## 📞 Support

Pour plus d'informations :
- Consultez `ARCHITECTURE.md` pour l'architecture
- Consultez `DEPLOYMENT.md` pour le déploiement
- Consultez `ADMIN-GUIDE.md` pour le guide administrateur

