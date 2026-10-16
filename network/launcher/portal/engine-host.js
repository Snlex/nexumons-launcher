const path=require('path'),fs=require('fs');const {app,BrowserWindow,ipcMain,Menu,dialog}=require('electron');const {server,engineRoot}=require('./catalog');const {valid}=require('./engine-store');const {hash,checkedRelative}=require('./updates');
async function shipped(root){const listing=JSON.parse(fs.readFileSync(path.join(root,'files.json'),'utf8'));for(const [name,sha] of Object.entries(listing.files)){checkedRelative(name);if(!/^(electron|build)\//.test(name)||await hash(path.join(root,name))!==sha)throw Error('Moteur fourni endommagé');}return root;}
function start(id){let s;try{s=server(id);}catch{app.exit(2);return;}app.setName(s.name);const data=path.join(app.getPath('appData'),s.userData);fs.mkdirSync(data,{recursive:true});app.setPath('userData',data);if(!app.requestSingleInstanceLock()){app.exit(10);return;}let preparing=false,game=null;
 const busy=()=>preparing||(game&&game.exitCode==null&&!game.killed);
 const original=ipcMain.handle.bind(ipcMain);ipcMain.handle=(name,fn)=>original(name,name==='game:launch'?async(...args)=>{preparing=true;try{return await fn(...args);}finally{preparing=false;if(!busy()&&!BrowserWindow.getAllWindows().length)app.quit();}}:fn);
 const {Client}=require('minecraft-launcher-core');const launch=Client.prototype.launch;Client.prototype.launch=async function(...args){const child=await launch.apply(this,args);if(child){game=child;child.once('close',()=>{game=null;if(!BrowserWindow.getAllWindows().length)app.quit();});}return child;};
 app.on('before-quit',event=>{if(busy()){event.preventDefault();for(const w of BrowserWindow.getAllWindows())w.hide();}});app.on('window-all-closed',()=>{if(!busy())app.quit();});
 app.whenReady().then(async()=>{const root=path.join(app.getPath('appData'),'nexumons-network-launcher');const cached=engineRoot(root,id);const entry=await valid(cached)?cached:await shipped(path.join(app.getAppPath(),'engines',id));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:s.name,submenu:[{label:'Choisir un autre serveur',click:()=>{if(busy()){dialog.showMessageBox({type:'info',message:'Ferme Minecraft avant de changer de serveur.',detail:'Chaque serveur utilise son propre pack.'});return;}app.quit();}},{type:'separator'},{role:'quit'}]},{role:'editMenu'},{role:'windowMenu'}]));
  require(path.join(entry,'electron/main.js'));
 }).catch(()=>{dialog.showErrorBox(s.name,'Impossible de charger ce serveur. Ferme son autre launcher ou réinstalle le launcher commun.');app.exit(1);});
}
module.exports={start};
