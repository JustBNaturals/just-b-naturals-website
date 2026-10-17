// Conservative CSS compaction: keep selector order, values and all quoted text.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const input=readFileSync('styles.css','utf8');let output='',quote='',space=false;
for(let i=0;i<input.length;i++){
 const c=input[i];
 if(quote){output+=c;if(c==='\\'&&i+1<input.length)output+=input[++i];else if(c===quote)quote='';continue;}
 if(c==='/'&&input[i+1]==='*'){const end=input.indexOf('*/',i+2);if(end<0)throw new Error('Unclosed CSS comment');i=end+1;space=true;continue;}
 if(/\s/.test(c)){space=true;continue;}
 if(c==='"'||c==="'"){if(space&&output&&!/[{;,}]$/.test(output))output+=' ';quote=c;output+=c;space=false;continue;}
 if(/[{};,]/.test(c)){output=output.trimEnd();output+=c;space=false;continue;}
 if(space&&output&&!/[{;,}]$/.test(output))output+=' ';output+=c;space=false;
}
if(quote)throw new Error('Unclosed CSS string');
writeFileSync('styles.min.css',output.trim()+'\n');
for(const file of readdirSync('.').filter(f=>f.endsWith('.html'))){
 const old=readFileSync(file,'utf8');const updated=old.replace(/styles(?:\.min)?\.css\?v=[^"']*/g,'styles.min.css?v=20261017-mobile-reels').replace(/script\.js\?v=[^"']*/g,'script.js?v=20261017-mobile-reels');if(updated!==old)writeFileSync(file,updated);
}
console.log(`CSS: ${Buffer.byteLength(input)} → ${Buffer.byteLength(output)} bytes`);
