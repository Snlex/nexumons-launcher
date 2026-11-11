const fs=require('fs'),path=require('path'),axios=require('axios');const {pipeline}=require('stream/promises');const {hash}=require('./updates');
async function download(url,target,{sha256,size,onProgress=()=>{},attempts=3}={}){
 fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target)&&(!size||fs.statSync(target).size===size)&&sha256&&await hash(target)===sha256)return target;
 let error;
 for(let attempt=0;attempt<attempts;attempt++){
  const part=target+'.part';fs.rmSync(part,{force:true});
  try{
   const response=await axios.get(url,{responseType:'stream',timeout:120000,maxRedirects:10,headers:{'User-Agent':'Nexumons-Academy-Launcher/1.0'}});let got=0;const total=Number(response.headers['content-length'])||size||0;
   response.data.on('data',chunk=>{got+=chunk.length;onProgress(got,total);});
   await pipeline(response.data,fs.createWriteStream(part));
   if(size&&got!==size)throw Error('Téléchargement incomplet');
   if(sha256&&await hash(part)!==sha256)throw Error('Empreinte incorrecte : téléchargement refusé');
   fs.rmSync(target,{force:true});fs.renameSync(part,target);return target;
  }catch(e){error=e;fs.rmSync(part,{force:true});if(/CERT_|certificate|self.signed/i.test(String(e.message)))break;if(attempt+1<attempts)await new Promise(r=>setTimeout(r,1500*(attempt+1)));}
 }
 throw error;
}
module.exports={download};
