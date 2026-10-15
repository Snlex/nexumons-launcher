const fs=require('fs'),path=require('path'),crypto=require('crypto');
// Metadata is a warm-cache hint, not a substitute for the trusted expected digest.
class VerifiedFiles {
 constructor(file,{ttl=7*86400000,now=Date.now}={}){this.file=file;this.ttl=ttl;this.now=now;this.entries={};this.hits=0;this.reads=0;this.active=0;this.waiters=[];try{const d=JSON.parse(fs.readFileSync(file,'utf8'));if(d.schema===1&&d.entries&&typeof d.entries==='object')this.entries=d.entries;}catch{}}
 signature(s){return [s.size,s.mtimeMs,s.ctimeMs,s.ino].join(':');}
 async permit(){if(this.active>=8)await new Promise(resolve=>this.waiters.push(resolve));this.active++;return ()=>{this.active--;this.waiters.shift()?.();};}
 async check(file,expected,algorithm='sha256'){if(!((algorithm==='sha256'&&/^[a-f0-9]{64}$/.test(expected))||(algorithm==='sha1'&&/^[a-f0-9]{40}$/.test(expected))))return false;const key=path.resolve(file);let st;try{st=await fs.promises.lstat(key);if(!st.isFile()||st.isSymbolicLink())return false;}catch{return false;}const signature=this.signature(st),old=this.entries[key],now=this.now();if(old?.digest===expected&&old.algorithm===algorithm&&old.signature===signature&&now>=old.at&&now-old.at<this.ttl){this.hits++;return true;}const release=await this.permit();try{this.reads++;const h=crypto.createHash(algorithm);for await(const chunk of fs.createReadStream(key))h.update(chunk);const matches=h.digest('hex')===expected;const after=await fs.promises.lstat(key);if(!matches||this.signature(after)!==signature){delete this.entries[key];return false;}this.entries[key]={digest:expected,algorithm,signature,at:now};return true;}catch{delete this.entries[key];return false;}finally{release();}}
 remember(file,digest){const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink())throw Error('Fichier vérifié invalide');this.entries[path.resolve(file)]={digest,algorithm:'sha256',signature:this.signature(st),at:this.now()};}
 save(){fs.mkdirSync(path.dirname(this.file),{recursive:true});const temp=this.file+'.new';fs.writeFileSync(temp,JSON.stringify({schema:1,entries:this.entries}));fs.renameSync(temp,this.file);}
 clear(){this.entries={};fs.rmSync(this.file,{force:true});}
}
function installNativeVerification(cache){const Handler=require('minecraft-launcher-core/components/handler');if(Handler.prototype.nexumonsVerified)return;Handler.prototype.checkSum=function(expected,file){return cache.check(file,expected,'sha1');};Handler.prototype.nexumonsVerified=true;}
module.exports={VerifiedFiles,installNativeVerification};
