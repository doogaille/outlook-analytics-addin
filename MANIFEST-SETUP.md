# Configuration du Manifest

## Génération du GUID

Avant de déployer l'add-in, vous devez générer un GUID unique pour le manifest.xml.

### Option 1 : Via le script Node.js

```bash
node scripts/generate-guid.js
```

### Option 2 : Via PowerShell (Windows)

```powershell
[guid]::NewGuid()
```

### Option 3 : Via un générateur en ligne

Visitez https://www.guidgenerator.com/

## Mise à jour du manifest.xml

1. Ouvrez `manifest.xml`
2. Remplacez `YOUR-GUID-HERE` par le GUID généré
3. Mettez à jour les URLs pour pointer vers votre serveur de production

## URLs de production

Pour un déploiement on-premise, modifiez les URLs suivantes dans `manifest.xml` :

- `SourceLocation` : URL de votre serveur hébergeant l'add-in
- `IconUrl` : URL des icônes (16x16, 32x32, 64x64, 80x80)
- `SupportUrl` : URL de support (optionnel)

### Exemple pour un serveur interne

```xml
<SourceLocation DefaultValue="https://addin.entreprise.local/taskpane/taskpane.html" />
<IconUrl DefaultValue="https://addin.entreprise.local/assets/icon-32.png" />
```

## Permissions

Le manifest est configuré avec `ReadWriteMailbox` pour accéder au calendrier.

Pour un accès en lecture seule, changez en `ReadMailbox`.

## Validation

Validez le manifest avant le déploiement :

```bash
npm run validate
```

