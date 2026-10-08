# Nexumons Skyblock — distribution joueurs

Serveur Kinetic 2 : **172.241.3.147:25585**. Minecraft 1.21.1, Fabric 0.17.3, Java 21, Cobblemon 1.8.1, Quest HUD 1.8.4, correspondant au test local déployé le 8 octobre 2026.

[Launchers Windows et Mac](https://github.com/Snlex/nexumons-launcher/releases/tag/skyblock-players-1.0.0) · [Pack joueurs et mrpack actuels](https://github.com/Snlex/nexumons-launcher/releases/tag/skyblock-players-1.0.1)

Le launcher autonome ne nécessite ni Prism ni Modrinth. Connectez votre compte Microsoft puis cliquez sur Jouer : Java, les mods et l’adresse du serveur sont gérés automatiquement. Les mises à jour du pack et de l’interface sont téléchargées depuis GitHub et vérifiées par SHA-256. Un changement du moteur Electron nécessite un nouvel installateur.

Windows : installer le fichier win-x64.exe. Mac Apple Silicon : mac-arm64.zip ; Mac Intel : mac-x64.zip. Les applications ne disposent pas de certificat de signature commerciale ; macOS peut demander une autorisation d’ouverture.

Le mrpack s’importe dans Modrinth App. Une instance importée ne se met pas automatiquement à jour via ce manifeste ; réimporter le nouveau mrpack lors d’une mise à jour.

Le canal principal Kinetic 1 reste indépendant. Les releases Skyblock sont marquées préversions pour ne pas remplacer sa release Latest. Ancien manifeste de test conservé sous test/manifest.json.

Validation : intégrité des archives et tests de remplacement, restauration, corruption et chemins du système de mise à jour. La connexion Microsoft et une session complète restent à tester sur les machines des joueurs.

## Mise à jour joueurs 1.0.2

Le launcher existant charge automatiquement l’application 0.2.1 et le pack joueurs 1.0.2. Les visuels des pets et les icônes AZOTH pour Xaero sont activés. Le HUD client 1.8.5 ajoute `/quetehud afficher`, `/quetehud reset`, `/quetehud position` et `/quetehud etat`. Le reset rétablit le panneau visible en haut à droite à 50 %.

Les utilisateurs de Modrinth doivent importer le mrpack 1.0.2 disponible sur la release `skyblock-players-1.0.2`. Les mods restent en Minecraft 1.21.1 / Fabric 0.17.3 / Cobblemon 1.8.1. Les sauvegardes, comptes et réglages personnels ne sont pas inclus dans les archives distribuées.
