const { app, BrowserWindow, ipcMain, shell } = require('electron');
app.setName('Cobbloria');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const axios = require('axios');
const extract = require('extract-zip');
const { Client } = require('minecraft-launcher-core');


// ============ CONFIG COBBLORIA ============
let SERVER_IP = '172.241.3.147:25585';
const SERVER_LIST_NAME = '§d§lCOBBLORIA §r§7· Cobblemon Skyblock';
const MC_VERSION = '1.21.1';
const FABRIC_LOADER = '0.19.5';
// Source du modpack (zip Dropbox en dl=1). À mettre à jour à chaque nouvelle version du pack.
const MODPACK_URL = 'https://github.com/Snlex/nexumons-launcher/releases/download/cobbloria-1.0.21/Cobbloria-client-players-1.0.21.zip';
const MODPACK_VERSION = 'players-1.0.21';
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
  await syncArchive({root:gameDir,url,version,sha256,dirs:['mods','resourcepacks'],optionalDirs:['defaults'],
    download:async (u,p)=>downloadFile(u,p,win,'Modpack',{stage:'modpack',resume:false})});
  require('./defaults').applyClientDefaults(gameDir);
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
    if (fs.existsSync(dat)) {
      const before=fs.readFileSync(dat);
      const {updateServerList}=require('./server-list');
      const entry=Buffer.concat([nbtStringTag('name',SERVER_LIST_NAME),nbtStringTag('ip',SERVER_IP),nbtStringTag('icon',SERVER_ICON_B64),Buffer.from([0])]);
      const after=updateServerList(before,SERVER_IP,SERVER_LIST_NAME,entry);
      if(!before.equals(after)){fs.copyFileSync(dat,dat+'.pokesky-backup');fs.writeFileSync(dat+'.pending',after);fs.renameSync(dat+'.pending',dat);}
      return;
    }
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
    const fabricVersion = await ensureFabric(win, GAME_DIR, MC_VERSION, channel.fabricLoader || FABRIC_LOADER);
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
  if (process.platform === 'darwin' && app.dock) app.dock.setIcon(path.join(__dirname, '..', 'build', 'icon.png'));
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 640,
    title: 'Cobbloria',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    frame: false,
    resizable: false,
    backgroundColor: '#080912',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  if(process.argv.includes('--smoke-test')){mainWindow.webContents.once('did-finish-load',()=>{setTimeout(async()=>{try{const ok=await mainWindow.webContents.executeJavaScript("document.body.innerText.includes('COBBLORIA') && !!window.nexumons");if(!ok)throw Error('Interface ou preload absent');fs.writeFileSync(process.env.COBBLORIA_SMOKE_FILE,JSON.stringify({ok:true,version:app.getVersion(),platform:process.platform}));app.exit(0);}catch(e){console.error(e);app.exit(1);}},1500);});}
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }
  mainWindow.webContents.on('did-fail-load',(_event,code,description)=>{require('electron').dialog.showErrorBox('Cobbloria — interface indisponible',description+' ('+code+')');});
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ============ IPC ============
ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window:close', () => mainWindow && mainWindow.close());
ipcMain.on('open-external', (_e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); });
let statusCache=null,statusAt=0,statusPending=null;
ipcMain.handle('server:status',async()=>{
 if(statusCache&&Date.now()-statusAt<15000)return statusCache;
 if(!statusPending)statusPending=require('./server-status').queryStatus(SERVER_IP).then(value=>{statusCache=value;statusAt=Date.now();return value;}).finally(()=>{statusPending=null;});
 return statusPending;
});
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
