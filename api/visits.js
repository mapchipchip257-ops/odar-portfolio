const TOTAL_KEY='odar:portfolio:visits:total';
const INCREMENT_SCRIPT=`if redis.call('SET',KEYS[2],'1','NX','EX',86400) then return redis.call('INCR',KEYS[1]) else return tonumber(redis.call('GET',KEYS[1]) or '0') end`;

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token)return res.status(503).json({configured:false,error:'Visit counter is not yet enabled'});
 let command=['GET',TOTAL_KEY];
 if(req.method==='POST'){
  if(req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Forbidden'});
  let body=req.body;
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return res.status(400).json({error:'Invalid request'});}}
  if(!body||typeof body.pageviewId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.pageviewId))return res.status(400).json({error:'Invalid page view'});
  command=['EVAL',INCREMENT_SCRIPT,'2',TOTAL_KEY,'odar:portfolio:pageview:'+body.pageviewId];
 }
 try{
  const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('Storage request failed');
  const data=await r.json();if(data.error)throw Error('Storage command failed');
  const visits=Number(data.result??0);if(!Number.isSafeInteger(visits)||visits<0)throw Error('Invalid count');
  return res.status(200).json({configured:true,visits});
 }catch{return res.status(503).json({configured:true,error:'Visit count temporarily unavailable'});}
}
