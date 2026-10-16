const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('network',{
 list:()=>ipcRenderer.invoke('network:list'),choose:id=>ipcRenderer.invoke('network:choose',id),website:id=>ipcRenderer.send('network:website',id),minimize:()=>ipcRenderer.send('network:minimize'),close:()=>ipcRenderer.send('network:close'),
 onProgress:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('network:progress',fn);return()=>ipcRenderer.removeListener('network:progress',fn);}
});
