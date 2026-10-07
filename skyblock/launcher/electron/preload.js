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

