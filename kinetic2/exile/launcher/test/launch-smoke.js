// Test CI : lance réellement Forge 1.20.1 avec le pack installé par prepare-client.js.
// Sans écran sur la machine de CI, le jeu finit par s'arrêter ; on valide seulement que
// Forge s'installe et charge les mods avant ce point.
const fs = require('fs'), path = require('path');
const { Client } = require('minecraft-launcher-core');
const { PROFILE } = require('../electron/profile');
const { download } = require('../electron/download');
const { offlineAuth } = require('../electron/offline-auth');

const root = path.resolve(process.env.RUNNER_TEMP || '.', 'nexumons-exile-client-test');
const javaPath = process.env.JAVA17 || 'java';
const markers = [/ModLauncher running/, /Loading \d+ mods/, /Forge mod loading|FML|fmlloader/];

(async () => {
  const installer = path.join(root, '..', 'forge-installer.jar');
  await download(PROFILE.forgeInstaller.url, installer, { sha256: PROFILE.forgeInstaller.sha256, size: PROFILE.forgeInstaller.size });
  const client = new Client();
  const seen = new Set();
  const log = [];
  const check = line => { log.push(line); markers.forEach((m, i) => { if (m.test(line)) seen.add(i); }); };
  client.on('data', check);
  client.on('debug', check);
  const child = await client.launch({
    authorization: offlineAuth('ExileTest'), root, javaPath,
    version: { number: PROFILE.minecraft, type: 'release' }, forge: installer,
    memory: { max: '6G', min: '2G' }, overrides: { detached: false, maxSockets: 8 },
  });
  if (!child) throw Error('Le moteur Minecraft n’a pas démarré');
  const deadline = Date.now() + 15 * 60 * 1000;
  while (seen.size < 2 && Date.now() < deadline && child.exitCode === null) await new Promise(r => setTimeout(r, 2000));
  try { child.kill(); } catch {}
  fs.writeFileSync(path.join(root, '..', 'launch-smoke.log'), log.join('\n'));
  if (seen.size < 2) throw Error('Forge n’a pas chargé les mods. Voir launch-smoke.log');
  console.log('Forge 1.20.1 démarre et charge le pack CTE2.');
})().catch(e => { console.error(e); process.exitCode = 1; });
