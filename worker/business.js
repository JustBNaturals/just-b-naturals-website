// Additive business tables. No existing stock or order rows are migrated or deleted.
const initialized=new WeakSet();
export async function ensureBusiness(db){
 if(!db)throw new Error('Inventory database is unavailable.');
 if(initialized.has(db))return;
 await db.exec(`CREATE TABLE IF NOT EXISTS campaign_orders (order_id TEXT PRIMARY KEY, created_at TEXT NOT NULL, order_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', retained_pairs INTEGER NOT NULL, email_status TEXT NOT NULL DEFAULT 'pending', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS business_details(product_id TEXT PRIMARY KEY,size_label TEXT NOT NULL DEFAULT '',low_stock INTEGER NOT NULL DEFAULT 3);
 CREATE TABLE IF NOT EXISTS business_reviews(id INTEGER PRIMARY KEY AUTOINCREMENT,author TEXT NOT NULL,quote_en TEXT NOT NULL,quote_fr TEXT NOT NULL DEFAULT '',permission INTEGER NOT NULL DEFAULT 0,published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS business_metrics(day TEXT NOT NULL,event TEXT NOT NULL,product_id TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT 'direct',count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,product_id,source));
 CREATE TABLE IF NOT EXISTS order_delivery(order_id TEXT PRIMARY KEY,request_key TEXT UNIQUE,order_json TEXT NOT NULL,business_sent INTEGER NOT NULL DEFAULT 0,customer_sent INTEGER NOT NULL DEFAULT 0,business_attempt_at TEXT,customer_attempt_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE INDEX IF NOT EXISTS campaign_orders_created ON campaign_orders(created_at);
 CREATE INDEX IF NOT EXISTS order_delivery_created ON order_delivery(created_at);
 CREATE INDEX IF NOT EXISTS reviews_public ON business_reviews(published,permission,id);
 CREATE TABLE IF NOT EXISTS order_stock(order_id TEXT NOT NULL,product_id TEXT NOT NULL,quantity INTEGER NOT NULL,PRIMARY KEY(order_id,product_id));
`);
 await db.prepare(` CREATE TRIGGER IF NOT EXISTS reserve_order_stock BEFORE INSERT ON order_stock WHEN NOT EXISTS(SELECT 1 FROM order_stock WHERE order_id=NEW.order_id AND product_id=NEW.product_id) BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM inventory WHERE product_id=NEW.product_id AND is_active=1 AND (stock_count IS NULL OR stock_count>=NEW.quantity)) THEN RAISE(ABORT,'Insufficient stock') END;
 UPDATE inventory SET stock_count=stock_count-NEW.quantity,updated_at=CURRENT_TIMESTAMP WHERE product_id=NEW.product_id AND stock_count IS NOT NULL;
 END;`).run();
 await db.prepare(`CREATE TRIGGER IF NOT EXISTS restore_order_stock AFTER DELETE ON order_stock BEGIN
 UPDATE inventory SET stock_count=stock_count+OLD.quantity,updated_at=CURRENT_TIMESTAMP WHERE product_id=OLD.product_id AND stock_count IS NOT NULL;
 END;`).run();
 initialized.add(db);
}
export async function recordMetric(db,event,productId='',source='direct'){
 await ensureBusiness(db);
 await db.prepare("INSERT INTO business_metrics(day,event,product_id,source,count) VALUES(date('now'),?,?,?,1) ON CONFLICT(day,event,product_id,source) DO UPDATE SET count=count+1").bind(event,productId,source).run();
}
export async function reserveStock(db,orderId,items){
 const operations=[];
 for(const item of items){
  const inventory=await db.prepare('SELECT availability_status FROM inventory WHERE product_id=?').bind(item.id).first();
  if(inventory?.availability_status==='preorder')continue;
  operations.push(db.prepare('INSERT OR IGNORE INTO order_stock(order_id,product_id,quantity) VALUES(?,?,?)').bind(orderId,item.id,item.quantity));
 }
 return operations;
}
export async function changeOrderStatus(db,{orderId,status,retainedPairs,restock=false}){
 await ensureBusiness(db);
 const row=await db.prepare('SELECT * FROM campaign_orders WHERE order_id=?').bind(orderId).first();
 if(!row)throw new Error('Order not found.');
 const allowed=['pending','confirmed','paid','completed','cancelled','refunded','partial_refund'];
 if(!allowed.includes(status))throw new Error('Choose a valid order status.');
 if(['cancelled','refunded'].includes(row.status)&&!['cancelled','refunded'].includes(status))throw new Error('A cancelled or refunded order cannot be reopened. Create a new order instead.');
 if(['paid','completed','partial_refund'].includes(row.status)&&['pending','confirmed'].includes(status))throw new Error('Use a refund status for an order that has already been paid.');
 const order=JSON.parse(row.order_json);
 const pairs=['cancelled','refunded'].includes(status)?0:status==='partial_refund'?Number(retainedPairs):order.qualifyingPairs;
 if(!Number.isInteger(pairs)||pairs<0||pairs>order.qualifyingPairs)throw new Error('Retained pairs must be between zero and the original number.');
 const statements=[];
 const modern=await db.prepare('SELECT order_id FROM order_delivery WHERE order_id=?').bind(orderId).first();
 if(modern&&status==='completed'){for(const item of order.items){const stock=await db.prepare('SELECT availability_status FROM inventory WHERE product_id=?').bind(item.id).first();if(stock?.availability_status==='preorder')throw new Error('Mark the products available before completing this preorder.');}}
 if(modern&&['confirmed','paid','completed'].includes(status))statements.push(...await reserveStock(db,orderId,order.items));
 if(restock&&['cancelled','refunded'].includes(status))statements.push(db.prepare('DELETE FROM order_stock WHERE order_id=?').bind(orderId));
 statements.push(db.prepare('UPDATE campaign_orders SET status=?,retained_pairs=?,updated_at=CURRENT_TIMESTAMP WHERE order_id=?').bind(status,pairs,orderId));
 // D1 batches are atomic: all stock reservations and the status change succeed together.
 await db.batch(statements);
 return {ok:true};
}
export function sameOrigin(request){const origin=request.headers.get('Origin');return !origin||origin===new URL(request.url).origin;}
export async function businessRoute(request,env,h){
 const path=new URL(request.url).pathname;const db=env.INVENTORY_DB;
 const publicRoute=['/api/storefront','/api/metrics'].includes(path);
 if(!publicRoute&&!path.startsWith('/api/business/'))return null;
 if(!sameOrigin(request))return h.json({error:'Request not allowed.'},403);
 if(!publicRoute&&!await h.auth(request,env))return h.json({error:'Open the private stock manager first.'},401);
 try{
  await ensureBusiness(db);
  if(path==='/api/storefront'&&request.method==='GET'){
   const details=await db.prepare('SELECT product_id,size_label FROM business_details').all();
   const reviews=await db.prepare('SELECT id,author,quote_en,quote_fr FROM business_reviews WHERE published=1 AND permission=1 ORDER BY id DESC LIMIT 6').all();
   return h.json({details:details.results||[],reviews:reviews.results||[]});
  }
  if(path==='/api/metrics'&&request.method==='POST'){
   if(request.headers.get('DNT')==='1'||request.headers.get('Sec-GPC')==='1')return h.json({ok:true});
   if(Number(request.headers.get('Content-Length')||0)>1000)return h.json({error:'Request too large.'},413);
   const data=await request.json();if(!['page_view','product_view','add_to_cart','checkout_start','gift_added','recommendation_added','signup'].includes(data.event))return h.json({error:'Invalid event.'},400);
   const productId=h.names[data.productId]?data.productId:'';
   const source=['instagram','email','google','direct','other'].includes(data.source)?data.source:'direct';
   await recordMetric(db,data.event,productId,source);return h.json({ok:true});
  }
  if(path==='/api/business/summary'&&request.method==='GET'){
   const days=new URL(request.url).searchParams.get('days')==='7'?7:30;
   const metrics=await db.prepare("SELECT event,product_id,source,SUM(count) AS count FROM business_metrics WHERE day>=date('now',?) GROUP BY event,product_id,source").bind(`-${days-1} days`).all();
   const [orderStats,daily,inventory,stockOverview]=await Promise.all([
    db.prepare("SELECT COUNT(*) AS request_count,COALESCE(SUM(CASE WHEN status IN ('paid','completed') THEN 1 ELSE 0 END),0) AS paid_count,COALESCE(SUM(CASE WHEN status IN ('paid','completed') THEN CAST(json_extract(order_json,'$.estimatedTotalCents') AS INTEGER) ELSE 0 END),0) AS paid_value_cents FROM campaign_orders WHERE created_at>=date('now',?)").bind(`-${days-1} days`).first(),
    db.prepare("SELECT day,SUM(count) AS views FROM business_metrics WHERE event='page_view' AND day>=date('now',?) GROUP BY day ORDER BY day").bind(`-${days-1} days`).all(),
    db.prepare("SELECT i.product_id,i.stock_count,COALESCE(d.low_stock,3) AS low_stock FROM inventory i LEFT JOIN business_details d ON d.product_id=i.product_id WHERE i.is_active=1 AND i.availability_status<>'preorder' AND i.stock_count<=COALESCE(d.low_stock,3) ORDER BY i.stock_count,i.product_id").all(),
    db.prepare("SELECT COALESCE(SUM(CASE WHEN availability_status='preorder' THEN 1 ELSE 0 END),0) AS preorder,COALESCE(SUM(CASE WHEN availability_status<>'preorder' AND stock_count=0 THEN 1 ELSE 0 END),0) AS sold_out,COALESCE(SUM(CASE WHEN availability_status='available' AND (stock_count IS NULL OR stock_count>0) THEN 1 ELSE 0 END),0) AS available FROM inventory WHERE is_active=1").first()
   ]);
   return h.json({days,metrics:metrics.results||[],orderStats,daily:daily.results||[],stockOverview,lowStock:inventory.results||[]});
  }
  if(path==='/api/business/details'){
   if(request.method==='GET'){const result=await db.prepare('SELECT * FROM business_details').all();return h.json({details:result.results||[]});}
   if(request.method==='POST'){
    const data=await request.json();if(!h.names[data.productId])return h.json({error:'Unknown product.'},400);
    const size=String(data.sizeLabel||'').trim().slice(0,80);const low=Number(data.lowStock);
    if(!Number.isInteger(low)||low<0||low>999)return h.json({error:'Choose a low-stock threshold from 0 to 999.'},400);
    await db.prepare('INSERT INTO business_details(product_id,size_label,low_stock) VALUES(?,?,?) ON CONFLICT(product_id) DO UPDATE SET size_label=excluded.size_label,low_stock=excluded.low_stock').bind(data.productId,size,low).run();return h.json({ok:true});
   }
  }
  if(path==='/api/business/reviews'){
   if(request.method==='GET'){const result=await db.prepare('SELECT * FROM business_reviews ORDER BY id DESC LIMIT 100').all();return h.json({reviews:result.results||[]});}
   if(request.method==='POST'){
    const d=await request.json();if(d.action==='delete'){await db.prepare('DELETE FROM business_reviews WHERE id=?').bind(Number(d.id)).run();return h.json({ok:true});}
    const author=String(d.author||'').trim().slice(0,60),quote=String(d.quoteEn||'').trim().slice(0,600),fr=String(d.quoteFr||'').trim().slice(0,600);
    if(!author||!quote||d.permission!==true)return h.json({error:'Add a real name, quote and permission to display it.'},400);
    await db.prepare('INSERT INTO business_reviews(author,quote_en,quote_fr,permission,published) VALUES(?,?,?,?,?)').bind(author,quote,fr,1,d.published===true?1:0).run();return h.json({ok:true});
   }
  }
  if(path==='/api/business/order'&&request.method==='GET'){
   const id=new URL(request.url).searchParams.get('id');
   const ledger=await db.prepare('SELECT * FROM campaign_orders WHERE order_id=?').bind(id).first();if(!ledger)return h.json({error:'Order not found.'},404);
   const delivery=await db.prepare("SELECT order_json,business_sent,customer_sent FROM order_delivery WHERE order_id=? AND created_at>=datetime('now','-90 days')").bind(id).first();
   return h.json({orderId:id,status:ledger.status,order:delivery?JSON.parse(delivery.order_json):JSON.parse(ledger.order_json),contactAvailable:!!delivery});
  }
  if(path==='/api/business/order'&&request.method==='POST'){
   const data=await request.json();return h.json(await changeOrderStatus(db,data));
  }
  return h.json({error:'Method not allowed.'},405);
 }catch(error){return h.json({error:publicRoute?'The shop information is temporarily unavailable.':error.message||'The business tools are temporarily unavailable.'},400);}
}
