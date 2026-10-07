const { contextBridge, ipcRenderer } = require('electron');

// Pont sécurisé entre l'UI React et le moteur Electron
contextBridge.exposeInMainWorld('nexumons', {
  // contrôles fenêtre
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  // authentification
  loginMicrosoft: () => ipcRenderer.invoke('auth:microsoft'),
  loginOffline: (username) => ipcRenderer.invoke('auth:offline', username),
  // jeu
  launch: (opts) => ipcRenderer.invoke('game:launch', opts),
  // liens externes (site, discord)
  openExternal: (url) => ipcRenderer.send('open-external', url),
  // réglages
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s) => ipcRenderer.invoke('settings:save', s),
  // infos système (RAM du PC) pour conseiller l'allocation
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
  // événements de progression (téléchargement / lancement)
  onStatus: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('launch:status', handler);
    return () => ipcRenderer.removeListener('launch:status', handler);
  },
});

window.addEventListener('DOMContentLoaded', () => {
  const bar=document.createElement('div');
  bar.style.cssText='position:fixed;bottom:8px;left:16px;right:16px;z-index:9999;display:flex;gap:10px;align-items:center;background:#101323;padding:8px 12px;border-radius:8px;color:#aeb8d1;font:12px sans-serif';
  const label=document.createElement('span');label.textContent='SKYBLOCK · Serveur';
  const input=document.createElement('input');input.placeholder='127.0.0.1:25598 (test sur ce Mac)';input.style.cssText='flex:1;background:#070b14;color:#fff;border:1px solid #465377;border-radius:5px;padding:5px';
  ipcRenderer.invoke('settings:get').then(s=>input.value=s.serverAddress||'');
  input.addEventListener('change',()=>{const v=input.value.trim();if(!v||/^[a-zA-Z0-9.\-]+(:[0-9]{1,5})?$/.test(v))ipcRenderer.invoke('settings:save',{serverAddress:v});});
  bar.append(label,input);document.body.append(bar);
});
