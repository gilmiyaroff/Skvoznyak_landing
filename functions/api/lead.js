/**
 * SKVOZNYAK public lead endpoint — no Telegram or client-side CRM credentials.
 * Proxies validated, consented submissions to the KZ-hosted CRM over HTTPS.
 * Secrets in Cloudflare Pages production settings:
 * CRM_INGEST_TOKEN (shared only with CRM backend)
 * CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET (Cloudflare Access service token)
 * CRM_INGEST_URL (optional; defaults to the protected CRM endpoint)
 */
const response=(body,status=200)=>new Response(JSON.stringify(body),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});
const str=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export async function onRequestPost({request,env}){
 const origin=request.headers.get('Origin');
 if(origin){
  try{if(new URL(origin).host!==new URL(request.url).host)return response({ok:false},403);}
  catch{return response({ok:false},403);}
 }
 if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return response({ok:false},415);
 if(Number(request.headers.get('Content-Length')||0)>8192)return response({ok:false},413);
 let body;
 try{const raw=await request.text();if(raw.length>8192)return response({ok:false},413);body=JSON.parse(raw);}
 catch{return response({ok:false},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return response({ok:false},400);
 if(str(body.website,150))return response({ok:true}); // passive honeypot; no data stored
 if(body.consent!==true)return response({ok:false,error:'Consent required'},400);
 const name=str(body.name,120),phone=str(body.phone,25),interest=str(body.interest,40);
 if(name.length<2||!/^\+?[\d\s()+-]{8,25}$/.test(phone)||
  !['demo','pilot','consultation','gptads','integration'].includes(interest))
  return response({ok:false,error:'Invalid details'},400);
 const submissionId=str(body.submissionId,36);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId))
  return response({ok:false,error:'Invalid request id'},400);
 const token=env.CRM_INGEST_TOKEN;
 const clientId=env.CF_ACCESS_CLIENT_ID;
 const clientSecret=env.CF_ACCESS_CLIENT_SECRET;
 if(!token||token.length<32||!clientId||!clientSecret)
  return response({ok:false,error:'CRM delivery not configured'},503);
 const url=env.CRM_INGEST_URL||'https://crm.skvoznyak.kz/api/leads/ingest';
 // Allow only the intended app host; do not turn this into a user-controlled open proxy.
 let upstream;
 try{upstream=new URL(url);if(upstream.protocol!=='https:'||upstream.hostname!=='crm.skvoznyak.kz'||upstream.pathname!=='/api/leads/ingest')throw Error('Invalid endpoint');}
 catch{return response({ok:false,error:'CRM endpoint is invalid'},503);}
 const payload={
  name,phone,interest,consent:true,submissionId,
  company:str(body.company,120),service:str(body.service,120),locale:str(body.locale,8),
  page:str(body.page,1000),referrer:str(body.referrer,500),
  utmSource:str(body.utmSource,100),utmMedium:str(body.utmMedium,100),
  utmCampaign:str(body.utmCampaign,150),utmContent:str(body.utmContent,150),
  utmTerm:str(body.utmTerm,150)
 };
 try{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  let res;
  try{res=await fetch(upstream.href,{method:'POST',
    headers:{'Content-Type':'application/json',
      'X-SKVOZNYAK-Ingest':token,
      'CF-Access-Client-Id':clientId,
      'CF-Access-Client-Secret':clientSecret},
    body:JSON.stringify(payload),signal:controller.signal});}
  finally{clearTimeout(timer);}
  if(!res.ok)return response({ok:false,error:'CRM delivery failed'},503);
  const result=await res.json();
  if(!result||result.ok!==true)return response({ok:false,error:'CRM did not confirm storage'},503);
  return response({ok:true});
 }catch{return response({ok:false,error:'CRM temporarily unavailable'},503);}
}
export async function onRequestGet(){return response({ok:false,error:'Method not allowed'},405);}
