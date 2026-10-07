# Nexumons Skyblock — canal de test autonome

Windows x64, Mac Apple Silicon et Mac Intel. Aucun Prism ni Modrinth requis par le launcher.

Le bootstrap télécharge le bundle applicatif GitHub au démarrage et vérifie SHA-256. Le bouton Jouer vérifie le pack et son intégrité. Une mise à jour corrompue conserve la version précédente. Les sauvegardes et réglages utilisateur restent séparés. Java 21 est installé par le launcher.

Le canal Kinetic 1 (`manifest.json`) reste inchangé. Le Skyblock utilise `skyblock/manifest.json` et des releases distinctes marquées préversions, jamais Latest.

## Destination

Ce pack correspond au serveur de test Fabric 1.21.1 / Cobblemon 1.8.1, pas au Kinetic 2 encore en 1.7.3. L'adresse du test est `127.0.0.1:25598`. Depuis un autre PC, il faut un serveur accessible sur le réseau ; modifier seulement le champ adresse ne rend pas le serveur local accessible.

## Mises à jour

- Pack de mods et interface/logique du launcher : automatiques sur Mac et Windows, appliquées avant une nouvelle session.
- Un changement du moteur Electron ou des dépendances natives nécessite un nouvel installateur. Le remplacement automatique complet du moteur Mac nécessite une signature Developer ID et une configuration de notarisation. Elles ne sont pas configurées ici.
- `.mrpack` : fichier importable, pas une application. Il ne se met pas à jour lui-même. La dernière version est liée dans le manifeste ; l'importateur doit prendre en charge les mises à jour ou il faut réimporter.

## Publication

1. Construire le zip client (`mods/`, `resourcepacks/`, `files.json`) et le bundle application (`electron/`, `build/`, `files.json`).
2. Créer une release Skyblock en préversion, avec `Latest=false`.
3. Charger les deux ZIP et le `.mrpack`.
4. Mettre à jour les URLs, versions et SHA-256 du manifeste, après vérification.
5. Pour un changement du moteur, augmenter package.json et engineVersion, puis lancer GitHub Actions.

Tests locaux : quatre tests de corruption, chemins, remplacement, réparation et restauration. Les builds natifs sont compilés sur GitHub Actions. Tests de connexion Microsoft et lancement natif restent à faire sur chaque OS.
