export const SECURITY_HEADERS={
 'X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'DENY',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Strict-Transport-Security':'max-age=15552000',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
};
export function secureResponse(response){const headers=new Headers(response.headers);for(const [key,value]of Object.entries(SECURITY_HEADERS))headers.set(key,value);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
export async function boundedJsonRequest(request,limit=65536){
 if(request.method!=='POST'||!new URL(request.url).pathname.startsWith('/api/'))return request;
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return new Response(JSON.stringify({error:'Use a JSON request.'}),{status:415,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(Number(request.headers.get('Content-Length')||0)>limit)return tooLarge();
 if(!request.body)return request;
 const reader=request.body.getReader(),chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return tooLarge();}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return new Request(request,{body:bytes});
}
function tooLarge(){return new Response(JSON.stringify({error:'This request is too large.'}),{status:413,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
