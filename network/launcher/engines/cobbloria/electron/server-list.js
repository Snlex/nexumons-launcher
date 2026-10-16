// Preserve unrelated servers and tags while renaming the matching saved entry.
const zlib = require('zlib');
function updateServerList(input, address, name, entry) {
 const compressed=input[0]===0x1f&&input[1]===0x8b;
 const b=compressed?zlib.gunzipSync(input):input;
 const need=(p,n)=>{if(p<0||n<0||p+n>b.length)throw Error('Invalid servers.dat');};
 const str=p=>{need(p,2);const n=b.readUInt16BE(p);need(p+2,n);return {value:b.toString('utf8',p+2,p+2+n),end:p+2+n};};
 function skip(type,p,depth=0){if(depth>64)throw Error('Invalid NBT depth');const sizes={1:1,2:2,3:4,4:8,5:4,6:8};if(sizes[type]){need(p,sizes[type]);return p+sizes[type];}if(type===8)return str(p).end;if(type===7||type===11||type===12){need(p,4);const n=b.readInt32BE(p)*(type===7?1:type===11?4:8);need(p+4,n);return p+4+n;}if(type===9){need(p,5);const t=b[p],n=b.readInt32BE(p+1);if(n<0||n>100000)throw Error('Invalid list');p+=5;for(let i=0;i<n;i++)p=skip(t,p,depth+1);return p;}if(type===10){while(true){need(p,1);const t=b[p++];if(!t)return p;p=str(p).end;p=skip(t,p,depth+1);}}throw Error('Unsupported NBT type');}
 need(0,3);if(b[0]!==10)throw Error('Invalid root');let p=str(1).end,edits=[],found=false;
 while(p<b.length){const type=b[p++];if(!type)break;const tag=str(p);p=tag.end;if(type!==9||tag.value!=='servers'){p=skip(type,p);continue;}need(p,5);if(b[p]!==10)throw Error('Invalid server list');const countPos=p+1,n=b.readInt32BE(countPos);if(n<0||n>100000)throw Error('Invalid server count');p+=5;
 for(let i=0;i<n;i++){let ip='',nameRange=null;const start=p;while(true){need(p,1);const tagStart=p,t=b[p++];if(!t)break;const key=str(p);p=key.end;const end=skip(t,p);if(t===8&&key.value==='ip')ip=str(p).value;if(t===8&&key.value==='name')nameRange=[tagStart,end];p=end;}if(ip===address){found=true;if(nameRange)edits.push({start:nameRange[0],end:nameRange[1],data:stringTag('name',name)});else edits.push({start:p-1,end:p-1,data:stringTag('name',name)});}}
 if(!found){const count=Buffer.alloc(4);count.writeInt32BE(n+1);edits.push({start:countPos,end:countPos+4,data:count},{start:p,end:p,data:entry});}break;}
 if(!edits.length&&!found)throw Error('Missing servers list');let out=b;for(const e of edits.sort((a,c)=>c.start-a.start))out=Buffer.concat([out.subarray(0,e.start),e.data,out.subarray(e.end)]);return compressed?zlib.gzipSync(out):out;
}
function stringTag(key,value){const k=Buffer.from(key),v=Buffer.from(value);const b=Buffer.alloc(5+k.length+v.length);b[0]=8;b.writeUInt16BE(k.length,1);k.copy(b,3);b.writeUInt16BE(v.length,3+k.length);v.copy(b,5+k.length);return b;}
module.exports={updateServerList,stringTag};
