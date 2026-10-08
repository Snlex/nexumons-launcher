const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const axios = require('axios');
const extract = require('extract-zip');
const { Client } = require('minecraft-launcher-core');


// ============ CONFIG NEXUMONS ============
let SERVER_IP = '172.241.3.147:25585';
const SERVER_LIST_NAME = '§d§lNEXUMONS §r§7· Skyblock';
const MC_VERSION = '1.21.1';
const FABRIC_LOADER = '0.17.3';
// Source du modpack (zip Dropbox en dl=1). À mettre à jour à chaque nouvelle version du pack.
const MODPACK_URL = 'https://github.com/Snlex/nexumons-launcher/releases/download/skyblock-pack-1.20.15/Nexumons-Skyblock-client-1.20.15.zip';
const MODPACK_VERSION = '1.20.15';
// ⬇️ REMPLACE TON_PSEUDO par ton pseudo GitHub. Le launcher lit ce fichier à chaque lancement
// pour connaître la version + le lien du modpack → MAJ sans rebuilder le launcher.
const MANIFEST_URL = 'https://raw.githubusercontent.com/Snlex/nexumons-launcher/main/skyblock/manifest.json';
// Icône du serveur (PNG 64x64 en base64) affichée dans la liste Multijoueur
const SERVER_ICON_B64 = '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';

// ============ DOSSIERS ============
const DATA_DIR = path.join(app.getPath('appData'), 'nexumons-skyblock-launcher');
const GAME_DIR = path.join(DATA_DIR, 'instance');
const JAVA_DIR = path.join(DATA_DIR, 'java21');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
fs.mkdirSync(GAME_DIR, { recursive: true });

// ============ RÉGLAGES ============
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch { return {}; }
}
function saveSettings(s) {
  const cur = loadSettings();
  const next = { ...cur, ...s };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2));
  return next;
}

// ============ AUTH ============
function offlineUUID(username) {
  const hash = crypto.createHash('md5').update('OfflinePlayer:' + username).digest();
  hash[6] = (hash[6] & 0x0f) | 0x30; // version 3
  hash[8] = (hash[8] & 0x3f) | 0x80; // variant
  const h = hash.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function offlineAuth(username) {
  return {
    access_token: '0',
    client_token: crypto.randomUUID(),
    uuid: offlineUUID(username),
    name: username,
    user_properties: '{}',
    meta: { type: 'mojang', demo: false },
  };
}

// ============ UTILITAIRES DE TÉLÉCHARGEMENT ============
function send(win, data) { if (win && !win.isDestroyed()) win.webContents.send('launch:status', data); }

// Nombre de connexions parallèles pour un téléchargement frais (pas une reprise), et taille
// minimale en dessous de laquelle ça ne vaut pas le coup de paralléliser (overhead > gain).
const PARALLEL_PARTS = 6;
const MIN_PARALLEL_SIZE = 20 * 1000 * 1000; // 20 Mo

// Sonde légère (Range sur 1 octet) pour savoir si le serveur supporte les requêtes par plage ET
// nous donner la taille totale — plus fiable qu'un HEAD (les CDN de release GitHub/Dropbox ne
// répondent pas toujours pareil à HEAD qu'à GET). Si la sonde échoue, on suppose juste "non
// supporté" → le téléchargement simple (déjà fiable) prend le relais, jamais de blocage dessus.
async function probeRangeSupport(url) {
  try {
    const res = await axios({
      url, method: 'GET', responseType: 'stream', maxRedirects: 10,
      headers: { Range: 'bytes=0-0' }, validateStatus: (s) => s === 206 || s === 200,
    });
    try { res.data.destroy(); } catch {}
    if (res.status === 206) {
      const cr = res.headers['content-range']; // format: "bytes 0-0/123456"
      const m = cr && /\/(\d+)$/.exec(cr);
      if (m) return { supported: true, total: parseInt(m[1], 10) };
    }
  } catch {}
  return { supported: false, total: 0 };
}

// Téléchargement multi-connexions d'un fichier dont on connaît déjà la taille totale (via
// probeRangeSupport). Chaque partie écrit directement à son offset dans le fichier final
// (pré-alloué à la bonne taille) — pas de fusion de fichiers temporaires à la fin.
async function downloadFileParallel(url, dest, win, label, stage, total, parts) {
  const fd = fs.openSync(dest, 'w');
  fs.ftruncateSync(fd, total);
  fs.closeSync(fd);

  const chunkSize = Math.ceil(total / parts);
  const progress = new Array(parts).fill(0);
  let lastPct = -1;
  const report = () => {
    const done = progress.reduce((a, b) => a + b, 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (pct === lastPct) return;
    lastPct = pct;
    send(win, { stage, percent: pct, text: `${label} — ${(done / 1e6).toFixed(0)} / ${(total / 1e6).toFixed(0)} Mo (×${parts})` });
  };

  const tasks = [];
  for (let i = 0; i < parts; i++) {
    const partStart = i * chunkSize;
    const partEnd = Math.min(partStart + chunkSize - 1, total - 1);
    if (partStart > partEnd) continue;
    const idx = i;
    tasks.push((async () => {
      const res = await axios({
        url, method: 'GET', responseType: 'stream', maxRedirects: 10,
        headers: { Range: `bytes=${partStart}-${partEnd}` }, validateStatus: (s) => s === 206,
      });
      const out = fs.createWriteStream(dest, { flags: 'r+', start: partStart });
      await new Promise((resolve, reject) => {
        res.data.on('data', (chunk) => { progress[idx] += chunk.length; report(); });
        res.data.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
        res.data.on('error', reject);
      });
    })());
  }
  await Promise.all(tasks);
}

async function downloadFile(url, dest, win, label, opts = {}) {
  const stage = opts.stage || 'modpack';
  // Reprise : si un fichier partiel existe, on demande la suite (HTTP Range)
  // au lieu de tout retélécharger — crucial pour le gros modpack sur connexion lente.
  let start = 0;
  if (opts.resume) { try { start = fs.statSync(dest).size; } catch { start = 0; } }

  // Téléchargement frais (pas de reprise en cours) d'un gros fichier avec support Range confirmé
  // → plusieurs connexions en parallèle, nettement plus rapide sur la plupart des connexions.
  if (start === 0) {
    const probe = await probeRangeSupport(url);
    if (probe.supported && probe.total > MIN_PARALLEL_SIZE) {
      try {
        await downloadFileParallel(url, dest, win, label, stage, probe.total, PARALLEL_PARTS);
        return;
      } catch (e) {
        // Une des connexions a lâché en cours de route (coupure réseau...) → on repart sur le
        // chemin simple ci-dessous, qui recommencera ce fichier proprement depuis zéro.
        try { fs.unlinkSync(dest); } catch {}
      }
    }
  }

  const headers = {};
  if (start > 0) headers.Range = `bytes=${start}-`;
  const res = await axios({
    url, method: 'GET', responseType: 'stream', maxRedirects: 10, headers,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 416,
  });
  if (res.status === 416) return; // déjà complet côté serveur
  const append = start > 0 && res.status === 206;
  if (start > 0 && !append) start = 0; // le serveur ignore la reprise → on repart propre
  const remaining = parseInt(res.headers['content-length'] || '0', 10);
  const total = append ? start + remaining : remaining;
  let done = append ? start : 0;
  const out = fs.createWriteStream(dest, append ? { flags: 'a' } : {});
  res.data.on('data', (chunk) => {
    done += chunk.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    send(win, { stage, percent: pct, text: `${label} — ${(done / 1e6).toFixed(0)} / ${(total / 1e6).toFixed(0)} Mo` });
  });
  await new Promise((resolve, reject) => {
    res.data.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
    res.data.on('error', reject);
  });
}

// Réessaie une opération réseau (téléchargement) plusieurs fois avec un délai croissant —
// une coupure Wi-Fi/4G ponctuelle ne doit pas obliger le joueur à recliquer JOUER lui-même.
async function withRetry(fn, { attempts = 3, label = '', win = null, stage = 'modpack' } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (i < attempts) {
        send(win, { stage, percent: 0, text: `${label} — coupure réseau, nouvelle tentative ${i + 1}/${attempts}…` });
        await new Promise((r) => setTimeout(r, 1500 * i));
      }
    }
  }
  throw lastErr;
}

// ============ MODPACK ============
async function syncModpack(win, gameDir, url, version, sha256) {
  const { syncArchive } = require('./updates');
  await syncArchive({root:gameDir,url,version,sha256,dirs:['mods','resourcepacks'],
    download:async (u,p)=>downloadFile(u,p,win,'Modpack',{stage:'modpack',resume:false})});
  const options=path.join(gameDir,'options.txt');
  const text=fs.existsSync(options)?fs.readFileSync(options,'utf8'):'';
  const match=text.match(/^resourcePacks:(.*)$/m);
  let packs=['vanilla'];try{if(match)packs=JSON.parse(match[1]);}catch{}
  if(!packs.includes('file/Nexumons-Astral.zip'))packs.push('file/Nexumons-Astral.zip');
  const line='resourcePacks:'+JSON.stringify(packs);
  fs.writeFileSync(options,match?text.replace(/^resourcePacks:.*$/m,line):text+'\n'+line+'\n');
  send(win,{stage:'modpack',percent:100,text:'Skyblock à jour ✓'});
}

// ============ FABRIC ============
async function ensureFabric(win, gameDir, mcVersion, fabricLoader) {
  const versionId = `fabric-loader-${fabricLoader}-${mcVersion}`;
  const dir = path.join(gameDir, 'versions', versionId);
  const jsonPath = path.join(dir, versionId + '.json');
  if (fs.existsSync(jsonPath)) return versionId;
  send(win, { stage: 'fabric', percent: 50, text: 'Installation de Fabric…' });
  fs.mkdirSync(dir, { recursive: true });
  const url = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${fabricLoader}/profile/json`;
  const res = await axios.get(url);
  fs.writeFileSync(jsonPath, JSON.stringify(res.data));
  return versionId;
}

// ============ LISTE DES SERVEURS (servers.dat) ============
// Écrit une entrée NBT « brute » (servers.dat n'est PAS compressé) pour que
// Nexumons apparaisse déjà dans la liste Multijoueur, en plus de la connexion directe.
function nbtStringTag(name, value) {
  const n = Buffer.from(name, 'utf8');
  const v = Buffer.from(value, 'utf8');
  const b = Buffer.alloc(1 + 2 + n.length + 2 + v.length);
  let o = 0;
  b.writeUInt8(0x08, o); o += 1;                 // TAG_String
  b.writeUInt16BE(n.length, o); o += 2; n.copy(b, o); o += n.length;
  b.writeUInt16BE(v.length, o); o += 2; v.copy(b, o); o += v.length;
  return b;
}
function buildServersDat(servers) {
  const elems = servers.map((s) => {
    const parts = [nbtStringTag('name', s.name), nbtStringTag('ip', s.ip)];
    if (s.icon) parts.push(nbtStringTag('icon', s.icon)); // PNG 64x64 en base64
    parts.push(Buffer.from([0x00])); // TAG_End du compound serveur
    return Buffer.concat(parts);
  });
  const listName = Buffer.from('servers', 'utf8');
  const header = Buffer.alloc(1 + 2 + listName.length + 1 + 4);
  let o = 0;
  header.writeUInt8(0x09, o); o += 1;             // TAG_List
  header.writeUInt16BE(listName.length, o); o += 2; listName.copy(header, o); o += listName.length;
  header.writeUInt8(0x0A, o); o += 1;             // type des éléments = TAG_Compound
  header.writeInt32BE(servers.length, o); o += 4; // nombre de serveurs
  const list = Buffer.concat([header, ...elems]);
  return Buffer.concat([
    Buffer.from([0x0A, 0x00, 0x00]), // TAG_Compound racine (nom vide)
    list,
    Buffer.from([0x00]),             // TAG_End racine
  ]);
}
function ensureServerListed(gameDir) {
  const dat = path.join(gameDir, 'servers.dat');
  try {
    // Déjà présent ? On ne touche pas (préserve d'éventuels serveurs ajoutés par le joueur).
    if (fs.existsSync(dat) && fs.readFileSync(dat).includes(Buffer.from(SERVER_IP, 'utf8'))) return;
    const buf = buildServersDat([{
      name: SERVER_LIST_NAME,
      ip: SERVER_IP,
      icon: SERVER_ICON_B64,
    }]);
    fs.writeFileSync(dat, buf);
  } catch (e) { /* non bloquant */ }
}

// ============ JAVA 21 ============
function findJavaBin(dir) {
  const exe = process.platform === 'win32' ? 'java.exe' : 'java';
  let found = null;
  (function walk(d) {
    if (found || !fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === exe && path.basename(path.dirname(p)) === 'bin') { found = p; return; }
    }
  })(dir);
  return found;
}

async function ensureJava(win) {
  const existing = findJavaBin(JAVA_DIR);
  if (existing) return existing;
  const osMap = { darwin: 'mac', win32: 'windows', linux: 'linux' };
  const archMap = { x64: 'x64', arm64: 'aarch64' };
  const o = osMap[process.platform] || 'linux';
  const a = archMap[process.arch] || 'x64';
  const url = `https://api.adoptium.net/v3/binary/latest/21/ga/${o}/${a}/jre/hotspot/normal/eclipse`;
  const isWin = process.platform === 'win32';
  fs.mkdirSync(JAVA_DIR, { recursive: true });
  const archive = path.join(JAVA_DIR, isWin ? 'java.zip' : 'java.tar.gz');
  send(win, { stage: 'java', percent: 0, text: 'Téléchargement de Java 21…' });
  await withRetry(() => downloadFile(url, archive, win, 'Java 21', { stage: 'java', resume: true }),
    { attempts: 3, label: 'Java 21', win, stage: 'java' });
  send(win, { stage: 'java', percent: 100, text: 'Installation de Java…' });
  if (isWin) {
    await extract(archive, { dir: JAVA_DIR });
  } else {
    await new Promise((resolve, reject) => {
      const p = spawn('tar', ['-xzf', archive, '-C', JAVA_DIR]);
      p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('tar exit ' + c))));
      p.on('error', reject);
    });
  }
  try { fs.unlinkSync(archive); } catch {}
  const bin = findJavaBin(JAVA_DIR);
  if (!bin) throw new Error('Java 21 introuvable après extraction');
  if (!isWin) { try { fs.chmodSync(bin, 0o755); } catch {} }
  return bin;
}

// ============ LANCEMENT ============
const LAUNCH_LOG = path.join(DATA_DIR, 'last-launch.log');

// Une tentative de lancement. Résout {launched:true} dès que Minecraft démarre,
// {launched:false, code} si le process se ferme SANS avoir démarré (plantage
// précoce = fichiers du jeu incomplets / bloqués). Rejette si erreur MCLC.
function launchAttempt(win, opts) {
  return new Promise((resolve, reject) => {
    const launcher = new Client();
    let log; try { log = fs.createWriteStream(LAUNCH_LOG, { flags: 'w' }); } catch {}
    const write = (t) => { try { log && log.write(t + '\n'); } catch {} };
    let launched = false, settled = false;

    launcher.on('progress', (e) => {
      const pct = e.total ? Math.round((e.task / e.total) * 100) : 0;
      send(win, { stage: 'files', percent: pct, text: `Téléchargement ${e.type}… ${pct}%` });
    });
    launcher.on('download-status', (e) => {
      const pct = e.total ? Math.round((e.current / e.total) * 100) : 0;
      send(win, { stage: 'files', percent: pct, text: `Fichiers du jeu… ${pct}%` });
    });
    launcher.on('debug', () => {}); // Ne jamais journaliser les arguments contenant le token.
    launcher.on('data', (line) => {
      write(line);
      if (!launched && /Loading Minecraft|Render thread|LWJGL|Setting user|Backend library|OpenAL/.test(line)) {
        launched = true;
        send(win, { stage: 'launched', percent: 100, text: 'Minecraft se lance ! 🎮' });
        if (!settled) { settled = true; resolve({ launched: true }); }
      }
    });
    launcher.on('close', (code) => {
      write(`\n[launcher] process fermé (code ${code})`);
      try { log && log.end(); } catch {}
      if (launched) {
        send(win, { stage: 'closed', percent: 0, text: `Jeu fermé (code ${code})` });
      } else if (!settled) {
        settled = true;
        resolve({ launched: false, code });
      }
    });

    send(win, { stage: 'launching', percent: 100, text: 'Lancement de Minecraft…' });
    launcher.launch(opts).catch((e) => {
      write('[launcher] erreur MCLC: ' + (e && e.message || e));
      if (!settled) { settled = true; reject(e); }
    });
  });
}

async function launchGame(win, { auth, ram }) {
  try {
    send(win, { stage: 'start', percent: 0, text: 'Préparation…' });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const disk = fs.statfsSync(DATA_DIR);
    const freeGiB = Number(disk.bavail) * Number(disk.bsize) / (1024 ** 3);
    if (freeGiB < 2) throw new Error(`Espace disque insuffisant : ${freeGiB.toFixed(1)} Go disponibles. Libère au moins 2 Go avant de lancer Minecraft.`);

    // Modpack : manifest distant (MAJ sans rebuild du launcher), sinon les valeurs en dur en fallback.
    const cache=path.join(DATA_DIR,'channel.json');
    let channel;
    try {
      channel=(await axios.get(MANIFEST_URL+'?t='+Date.now(),{timeout:15000})).data;
      if(channel.channel!=='skyblock'||!channel.modpackSha256)throw new Error('Manifeste Skyblock invalide');
      fs.writeFileSync(cache,JSON.stringify(channel));
    }catch(e){
      if(!fs.existsSync(cache))throw new Error('Impossible de vérifier la mise à jour Skyblock. Vérifie ta connexion.');
      channel=JSON.parse(fs.readFileSync(cache,'utf8'));
      send(win,{stage:'modpack',percent:0,text:'GitHub indisponible : dernière version vérifiée en cache.'});
    }
    SERVER_IP=channel.serverAddress;
    if(!SERVER_IP)throw new Error('Adresse du serveur manquante');
    const javaPath = await ensureJava(win);
    await syncModpack(win,GAME_DIR,channel.modpackUrl,channel.modpackVersion,channel.modpackSha256);
    const fabricVersion = await ensureFabric(win, GAME_DIR, MC_VERSION, FABRIC_LOADER);
    ensureServerListed(GAME_DIR); // pré-enregistré dans la liste Multijoueur

    const opts = {
      authorization: auth,
      root: GAME_DIR,
      javaPath,
      version: { number: MC_VERSION, type: 'release', custom: fabricVersion },
      memory: { max: `${ram || 4}G`, min: '1G' },
      quickPlay: { type: 'multiplayer', identifier: SERVER_IP },
      overrides: { detached: false, maxSockets: 16 },
    };

    // Jusqu'à 3 tentatives. Chaque essai fait re-vérifier/re-télécharger les
    // fichiers manquants par MCLC → répare un 1er téléchargement coupé.
    const MAX = 3;
    for (let attempt = 1; attempt <= MAX; attempt++) {
      const r = await launchAttempt(win, opts);
      if (r.launched) return { ok: true };
      // Plantage précoce : on réessaie (re-télécharge ce qui manque)
      if (attempt < MAX) {
        send(win, { stage: 'files', percent: 0, text: `Démarrage échoué — nouvelle tentative ${attempt + 1}/${MAX}…` });
        await new Promise((res) => setTimeout(res, 2500));
        continue;
      }
      // Échec final : diagnostic clair selon la présence des fichiers du jeu
      const hasCore = fs.existsSync(path.join(GAME_DIR, 'libraries')) && fs.existsSync(path.join(GAME_DIR, 'assets'));
      const cause = hasCore
        ? 'Minecraft se ferme au démarrage — mets à jour tes pilotes graphiques, ou baisse la RAM.'
        : 'Les fichiers de Minecraft n\'ont pas pu être téléchargés — désactive ton ANTIVIRUS/pare-feu, vérifie ta connexion, puis relance.';
      send(win, { stage: 'error', percent: 0, text: `❌ Le jeu n'a pas démarré (code ${r.code}). ${cause} (détails : last-launch.log)` });
      return { ok: false, error: `startup-failed:${r.code}` };
    }
  } catch (err) {
    send(win, { stage: 'error', percent: 0, text: 'Erreur : ' + (err.message || err) });
    return { ok: false, error: String(err.message || err) };
  }
}

// ============ FENÊTRE ============
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 640,
    frame: false,
    resizable: false,
    backgroundColor: '#080912',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ============ IPC ============
ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window:close', () => mainWindow && mainWindow.close());
ipcMain.on('open-external', (_e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); });
ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:save', (_e, s) => saveSettings(s));
// Détection RAM du PC → conseil d'allocation adapté (surtout pour les petits PC).
ipcMain.handle('system:info', () => {
  const totalGB = Math.max(2, Math.round(os.totalmem() / 1073741824));
  const suggested = Math.min(8, Math.max(2, Math.floor(totalGB / 2))); // ~moitié, plafonné à 8
  const maxRam = Math.min(12, Math.max(3, totalGB - 2)); // jamais + que total-2 (laisse à l'OS)
  return { totalGB, suggested, maxRam };
});
ipcMain.handle('auth:offline', (_e, username) => {
  return {ok:false,error:'Utilise la connexion Microsoft pour rejoindre le serveur public.'};
  if (!username || username.length < 3) return { ok: false, error: 'Pseudo trop court' };
  return { ok: true, profile: { name: username, uuid: offlineUUID(username), type: 'offline' }, auth: offlineAuth(username) };
});
ipcMain.handle('auth:microsoft', async () => {
  try {
    const { Auth } = require('msmc');
    const authManager = new Auth('select_account');
    const xbox = await authManager.launch('electron');
    const mc = await xbox.getMinecraft();
    const auth = mc.mclc();
    return { ok: true, profile: { name: auth.name, uuid: auth.uuid, type: 'premium' }, auth };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});
ipcMain.handle('game:launch', (_e, opts) => launchGame(mainWindow, opts));

// Le bootstrap vérifie le bundle applicatif GitHub avant de charger cette interface.
app.whenReady().then(() => {
  createWindow();

});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
