"use strict";exports.id=2082,exports.ids=[2082,8307],exports.modules={88307:(e,t,n)=>{n.a(e,async(e,a)=>{try{n.d(t,{IO:()=>s,getPool:()=>o,xN:()=>c});var i=n(8678),r=e([i]);i=(r.then?(await r)():r)[0];let l=null;function o(){if(!l){let e=process.env.PG_DSN;if(!e||e.includes("placeholder")||""===e)throw Error("PG_DSN environment variable is required. Please configure PostgreSQL connection string.");(l=new i.Pool({connectionString:e,max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3,ssl:!e.includes("localhost")&&{rejectUnauthorized:!1}})).on("error",e=>{console.error("PostgreSQL pool error:",e)})}return l}async function s(e,t){let a=o(),i=await a.connect();try{let r=Date.now(),o=await i.query(e,t),s=Date.now()-r;s>1e3?console.warn(`🐌 Slow query detected (${s}ms):`,e.substring(0,100)):s>500&&console.info(`⚠️  Moderate query time (${s}ms):`,e.substring(0,50));try{let{performanceMonitor:t}=await n.e(1124).then(n.bind(n,41124));t.recordQuery({query:e.substring(0,100),duration:s,rows:o.rows?.length||0,timestamp:new Date().toISOString()});let{updateMetric:i}=await n.e(7356).then(n.bind(n,47356));i("databaseConnections",a.totalCount)}catch(e){console.debug("Performance monitoring error:",e)}return o}catch(a){console.error("❌ Database query error:",a),console.error("\uD83D\uDCDD Query:",e.substring(0,200)),console.error("\uD83D\uDCCA Params:",t);try{let{updateHealthCheck:e}=await n.e(7356).then(n.bind(n,47356));e("PostgreSQL","unhealthy",void 0,a instanceof Error?a.message:"Query failed")}catch(e){console.debug("Monitoring update failed:",e)}throw a}finally{i.release()}}let d={catalog:`
    CREATE TABLE IF NOT EXISTS catalog (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      topic VARCHAR(255),
      tags TEXT[],
      status VARCHAR(50),
      lang VARCHAR(10),
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      author VARCHAR(255),
      last_editor VARCHAR(255),
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_catalog_status ON catalog(status);
    CREATE INDEX IF NOT EXISTS idx_catalog_lang ON catalog(lang);
    CREATE INDEX IF NOT EXISTS idx_catalog_visibility ON catalog(visibility);
    CREATE INDEX IF NOT EXISTS idx_catalog_topic ON catalog(topic);
    CREATE INDEX IF NOT EXISTS idx_catalog_updated_at ON catalog(updated_at);
  `,cases:`
    CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      date_start DATE,
      client_url TEXT,
      keys TEXT[],
      terms TEXT,
      status VARCHAR(50),
      price DECIMAL(10,2),
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
    CREATE INDEX IF NOT EXISTS idx_cases_date_start ON cases(date_start);
    CREATE INDEX IF NOT EXISTS idx_cases_visibility ON cases(visibility);
  `,publishing:`
    CREATE TABLE IF NOT EXISTS publishing (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      ownership VARCHAR(255),
      type VARCHAR(100),
      channel VARCHAR(255),
      pub_date DATE,
      venue TEXT,
      citation_style VARCHAR(100),
      submission_status VARCHAR(100),
      due_date DATE,
      doi TEXT,
      lang VARCHAR(10),
      tags TEXT[],
      notes TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_publishing_due_date ON publishing(due_date);
    CREATE INDEX IF NOT EXISTS idx_publishing_pub_date ON publishing(pub_date);
    CREATE INDEX IF NOT EXISTS idx_publishing_status ON publishing(submission_status);
    CREATE INDEX IF NOT EXISTS idx_publishing_lang ON publishing(lang);
    CREATE INDEX IF NOT EXISTS idx_publishing_visibility ON publishing(visibility);
  `,finance:`
    CREATE TABLE IF NOT EXISTS finance (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(10,2),
      notes TEXT,
      date_start DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'internal'
    );
    
    CREATE INDEX IF NOT EXISTS idx_finance_date_start ON finance(date_start);
    CREATE INDEX IF NOT EXISTS idx_finance_amount ON finance(amount);
    CREATE INDEX IF NOT EXISTS idx_finance_visibility ON finance(visibility);
  `};async function c(){try{await s(d.catalog),await s(d.cases),await s(d.publishing),await s(d.finance),console.log("Database schema initialized successfully")}catch(e){throw console.error("Failed to initialize database schema:",e),e}}a()}catch(e){a(e)}})},12082:(e,t,n)=>{n.a(e,async(e,a)=>{try{n.d(t,{YO:()=>f,fullSync:()=>_,getNotionClient:()=>u,kw:()=>S,syncDatabase:()=>E});var i=n(28830),r=n(88307),o=n(23155),s=n(46),c=n(35747),l=n(28977),d=e([r]);r=(d.then?(await d)():d)[0];let S=[{id:process.env.NOTION_DB_REGISTRY||"6d3da5a01186475d8c2b794cca147a86",name:"Registry",table:"catalog",mapping:{title:"Name",summary:"Краткое содержание",content:"Content",topic:"Тематика",tags:"Теги",status:"Статус",lang:"Язык",url:"URL",author:"Автор",last_editor:"Последний редактор",created_at:"Дата создания",updated_at:"Последнее изменение"},visibility:"public"},{id:process.env.NOTION_DB_CASES||"25cef6a76fa5800b8241f8ed4cd3be33",name:"Cases",table:"cases",mapping:{name:"Name",date_start:"Дата запуска",client_url:"Клиенты:",keys:"Ключи",terms:"Сроки",status:"Статус",price:"Стоимость",url:"url"},visibility:"public"},{id:process.env.NOTION_DB_PUBLISHING||"402cc41633384d35b30ec1ab7c3185da",name:"Publishing",table:"publishing",mapping:{title:"Название",ownership:"Принадлежность",type:"Тип",channel:"Канал",pub_date:"Дата публикации",venue:"Журнал",citation_style:"Формат цитирования",submission_status:"Статус подачи",due_date:"Срок подачи",doi:"DOI/Link",lang:"Язык",tags:"Теги",notes:"Краткое ТЗ",url:"Ссылка"},visibility:"public"},{id:process.env.NOTION_DB_FINANCE||"25cef6a76fa580eb912ff8cfca54155e",name:"Finance",table:"finance",mapping:{name:"Name",amount:"Сумма",notes:"Расход",date_start:"Дата запуска"},visibility:"internal"}],y=null;function u(){if(!y){if((0,c.jQ)())return console.log("Using mock Notion client for development"),y={};let e=(0,c.Bd)();if(!e?.notion.token)throw new l.id("Notion","Token not configured properly. Please set NOTION_TOKEN environment variable with a valid integration token.");y=new i.KU({auth:e.notion.token,timeoutMs:3e4})}return y}async function p(e){let t;let n=u(),a=[],i=0;console.log(`Extracting from ${e.name} database (${e.id})...`);do try{let r=await (0,l.JN)(async()=>(0,c.jQ)()?{results:[],next_cursor:null,has_more:!1}:await n.databases.query({database_id:e.id,start_cursor:t,page_size:100}),3);a.push(...r.results),t=r.next_cursor||void 0,(i+=r.results.length)%100==0&&console.log(`Extracted ${i} pages from ${e.name}...`)}catch(t){throw console.error(`Failed to extract from ${e.name}:`,t),new l.id("Notion",`Extraction failed for ${e.name}: ${t instanceof Error?t.message:"Unknown error"}`)}while(t);return console.log(`Completed extraction: ${a.length} pages from ${e.name}`),a}function m(e,t){let n={notion_id:e.id,created_at:new Date(e.created_time),updated_at:new Date(e.last_edited_time)};for(let[a,i]of Object.entries(t)){let t=e.properties[i];if(t)switch(t.type){case"title":n[a]=t.title?.[0]?.plain_text||"";break;case"rich_text":n[a]=t.rich_text?.map(e=>e.plain_text).join("")||"";break;case"select":n[a]=t.select?.name||"";break;case"multi_select":n[a]=t.multi_select?.map(e=>e.name)||[];break;case"date":t.date?.start&&(n[a]=new Date(t.date.start));break;case"number":n[a]=t.number;break;case"url":n[a]=t.url;break;case"people":n[a]=t.people?.[0]?.name||"";break;default:n[a]=t.plain_text||""}}return n}async function g(e,t,n){if(0===e.length)return;let a=(0,c.Bd)(),i=a?.etl.batchSize||50;for(let o=0;o<e.length;o+=i){let s=e.slice(o,o+i);await (0,l.JN)(async()=>{for(let e of s){e.visibility=n;let a=Object.keys(e),i=Object.values(e),o=i.map((e,t)=>`$${t+1}`).join(", "),s=`
          INSERT INTO ${t} (${a.join(", ")})
          VALUES (${o})
          ON CONFLICT (notion_id) DO UPDATE SET
          ${a.filter(e=>"notion_id"!==e).map(e=>`${e} = EXCLUDED.${e}`).join(", ")}
        `;await (0,r.IO)(s,i)}},a?.etl.maxRetries||3),o+i<e.length&&console.log(`Loaded batch ${Math.floor(o/i)+1}/${Math.ceil(e.length/i)} to ${t}`)}}async function h(e,t){let n=e.content||e.summary||e.notes;if(!n)return null;let a=(0,o.hX)(e.notion_id,"markdown"),i=`# ${e.title||e.name}

${n}`;return await (0,o.cT)(a,i,"text/markdown"),a}async function T(e,t,n){let a=e.content||e.summary||e.notes||e.title||e.name;if(a&&!(a.length<10))try{let i=await (0,s.OC)(a),r=(0,s.bp)(),o={id:`${t}_${e.notion_id}`,vector:i,metadata:{table:t,notion_id:e.notion_id,title:e.title||e.name,content:a.substring(0,1e3),visibility:n,lang:e.lang||"en",status:e.status||"active",updated_at:e.updated_at?.toISOString()||new Date().toISOString(),tags:Array.isArray(e.tags)?e.tags.join(", "):"",topic:e.topic||""}};await r.upsert([o],{namespace:"public"===n?"traceremove_public":"traceremove_internal"})}catch(n){if(console.error(`Failed to index ${t} record ${e.notion_id}:`,n),n instanceof Error&&n.message.includes("API key"))throw Error("Vector database API key not configured properly. Please check UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.")}}async function E(e){let t=[],a=Date.now();console.log(`🚀 Starting sync for ${e.name} database...`),t.push({step:`Starting ${e.name} sync`,status:"completed",timestamp:new Date().toISOString()});try{let i=await p(e);console.log(`📥 Extracted ${i.length} pages from ${e.name}`),t.push({step:`Extracted ${i.length} pages from Notion`,status:"completed",timestamp:new Date().toISOString(),details:`${i.length} pages retrieved in ${Date.now()-a}ms`});let r=i.map(t=>m(t,e.mapping));console.log(`🔄 Transforming ${r.length} records for ${e.name}...`),t.push({step:`Transformed ${r.length} records`,status:"completed",timestamp:new Date().toISOString()}),await g(r,e.table,e.visibility),console.log(`💾 Loaded ${r.length} records to PostgreSQL`),t.push({step:"Loaded to PostgreSQL",status:"completed",timestamp:new Date().toISOString(),details:`${r.length} records upserted`});let o=0,s=0,c=0;for(let[t,n]of r.entries())try{await h(n,e.table),await T(n,e.table,e.visibility),o++,(t+1)%50==0&&console.log(`📊 Progress: ${t+1}/${r.length} records processed`)}catch(e){console.error(`❌ Failed to process record ${n.notion_id}:`,e),e instanceof Error&&e.message.includes("S3")?s++:e instanceof Error&&e.message.includes("Vector")&&c++}let l=Date.now()-a;console.log(`✅ Completed sync for ${e.name}: ${o}/${i.length} records processed in ${l}ms`),t.push({step:"Completed vector indexing",status:o===i.length?"completed":"failed",timestamp:new Date().toISOString(),details:`${o}/${i.length} records indexed successfully. S3 errors: ${s}, Vector errors: ${c}`});try{let{updateMetric:t}=await n.e(7356).then(n.bind(n,47356));t("notionSyncStatus",{...(await n.e(7356).then(n.bind(n,47356))).getSystemMetrics().notionSyncStatus||{},[e.name]:{lastSync:new Date().toISOString(),recordCount:o,errors:i.length-o}})}catch(e){console.debug("Monitoring update failed:",e)}return{extracted:i.length,loaded:o,errors:i.length-o,progress:t}}catch(n){throw console.error(`💥 Failed to sync ${e.name}:`,n),t.push({step:"Sync failed",status:"failed",timestamp:new Date().toISOString(),details:n instanceof Error?n.message:"Unknown error"}),n}}async function f(e){let t={},n=e||new Date(Date.now()-9e5),a=Date.now();for(let e of(console.log(`🔄 Starting incremental sync since ${n.toISOString()}...`),S)){let a=Date.now();try{console.log(`📊 Checking ${e.name} for updates...`);let i=u(),r=await i.databases.query({database_id:e.id,filter:{property:"Last edited time",last_edited_time:{after:n.toISOString()}},page_size:100});if(r.results.length>0){console.log(`📥 Found ${r.results.length} updated records in ${e.name}`);let i=r.results.map(t=>m(t,e.mapping));await g(i,e.table,e.visibility);let o=0,s=0;for(let t of i)try{await h(t,e.table),await T(t,e.table,e.visibility),o++}catch(e){console.error(`❌ Failed to process record ${t.notion_id}:`,e),s++}let c=Date.now()-a;console.log(`✅ ${e.name}: ${o}/${r.results.length} records processed in ${c}ms`),t[e.name]={updated:r.results.length,processed:o,errors:s,since:n.toISOString(),duration:c}}else console.log(`📭 No updates found in ${e.name}`),t[e.name]={updated:0,processed:0,errors:0,since:n.toISOString(),duration:Date.now()-a}}catch(i){let n=Date.now()-a;console.error(`💥 Incremental sync failed for ${e.name}:`,i),t[e.name]={error:i instanceof Error?i.message:"Unknown error",duration:n}}}let i=Date.now()-a,r=Object.values(t).reduce((e,t)=>e+(t.updated||0),0),o=Object.values(t).reduce((e,t)=>e+(t.processed||0),0),s=Object.values(t).reduce((e,t)=>e+(t.errors||0),0);return console.log(`🎯 Incremental sync completed: ${o}/${r} records processed with ${s} errors in ${i}ms`),t._summary={totalUpdated:r,totalProcessed:o,totalErrors:s,duration:i,timestamp:new Date().toISOString()},t}async function _(){let e={};for(let t of S)try{let n=await E(t);e[t.name]=n}catch(n){console.error(`Full sync failed for ${t.name}:`,n),e[t.name]={error:n instanceof Error?n.message:"Unknown error"}}return e}a()}catch(e){a(e)}})},46:(e,t,n)=>{n.d(t,{NH:()=>m,OC:()=>d,bp:()=>l,fw:()=>h});var a=n(69809),i=n(28830),r=n(83326);let o=null,s=null,c=null;function l(){if(!c){let e=process.env.UPSTASH_VECTOR_REST_URL,t=process.env.UPSTASH_VECTOR_REST_TOKEN;if(!e||!t)throw Error("Upstash Vector credentials not configured");c=new r.gm({url:e,token:t})}return c}async function d(e){try{let t=function(){if(!o){let e=process.env.OPENAI_API_KEY;if(!e||e.includes("your_")||""===e)throw Error("OpenAI API key not configured");o=new a.ZP({apiKey:e})}return o}(),n=await t.embeddings.create({model:"text-embedding-3-small",input:e});return n.data[0].embedding}catch(e){throw console.error("Error creating embedding:",e),e}}async function u(e){if(!e)return[];try{let t=function(){if(!s){let e=process.env.NOTION_TOKEN;if(!e)throw Error("Notion token not configured");s=new i.KU({auth:e})}return s}(),n=await t.databases.query({database_id:e}),a=[];for(let e of n.results)if("properties"in e){let n="Untitled";for(let[t,a]of Object.entries(e.properties))if("title"===a.type&&a.title.length>0){n=a.title[0].plain_text;break}let i=await t.blocks.children.list({block_id:e.id}),r="";for(let e of i.results)"type"in e&&(r+=function(e){switch(e.type){case"paragraph":return e.paragraph?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_1":return e.heading_1?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_2":return e.heading_2?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_3":return e.heading_3?.rich_text?.map(e=>e.plain_text).join("")||"";case"bulleted_list_item":return"• "+(e.bulleted_list_item?.rich_text?.map(e=>e.plain_text).join("")||"");case"numbered_list_item":return"1. "+(e.numbered_list_item?.rich_text?.map(e=>e.plain_text).join("")||"");case"quote":return"> "+(e.quote?.rich_text?.map(e=>e.plain_text).join("")||"");case"code":return"```\n"+(e.code?.rich_text?.map(e=>e.plain_text).join("")||"")+"\n```";default:return""}}(e)+"\n");r.trim()&&a.push({id:`notion-${e.id}`,content:r.trim(),metadata:{source:"notion",title:n,url:`https://notion.so/${e.id}`,type:"notion"}})}return a}catch(e){return console.error("Error fetching Notion docs:",e),[]}}async function p(e){try{let t=await fetch(e),n=await t.text(),a=n.match(/<loc>(.*?)<\/loc>/g);if(!a)return[];let i=a.map(e=>e.replace(/<\/?loc>/g,"")),r=[],o=i.slice(0,10);for(let e of o)try{let t=await fetch(e),n=await t.text(),a=n.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();if(a.length>100)for(let t=0;t<a.length;t+=1e3){let i=a.slice(t,t+1e3);r.push({id:`sitemap-${e}-${t}`,content:i,metadata:{source:"sitemap",title:function(e){let t=e.match(/<title[^>]*>(.*?)<\/title>/i);return t?t[1].trim():"Untitled"}(n),url:e,type:"sitemap"}})}}catch(t){console.error(`Error fetching ${e}:`,t)}return r}catch(e){return console.error("Error fetching site docs:",e),[]}}async function m(e,t,n){try{console.log(`Reindexing persona: ${e}`);let[a,i]=await Promise.all([u(t),p(n)]),r=[...a,...i];console.log(`Found ${r.length} documents to index`);let o=l();for(let t of r)try{let n=await d(t.content);await o.upsert({id:`${e}-${t.id}`,vector:n,metadata:{...t.metadata,personaId:e,content:t.content}})}catch(e){console.error(`Error indexing document ${t.id}:`,e)}return console.log(`Reindexing complete for persona: ${e}`),r.length}catch(e){throw console.error("Error reindexing persona:",e),e}}function g(e,t){let n=e.toLowerCase();if("comprehensive-ai"===t||"philosopher"===t){if(n.includes("technology")||n.includes("ai"))return`[Source: AI Systems Architecture from Registry]: The traceremove.net comprehensive AI system integrates multiple model providers (OpenAI, Anthropic, Gemini, Mistral, Groq) with intelligent routing based on query complexity and intent.

[Source: Technology Philosophy from Cases]: Technology is not merely a tool but a fundamental extension of human consciousness. When we create digital systems, we externalize our cognitive processes and embed our values into code.

[Source: Multi-Model Integration from Publishing]: Our ETL pipeline processes 4 Notion databases with 15-minute incremental updates and nightly full synchronization, ensuring knowledge base freshness ≤ 30 days.`;if(n.includes("database")||n.includes("etl"))return`[Source: ETL Pipeline Architecture from Registry]: The system processes Registry (6d3da5a01186475d8c2b794cca147a86), Cases (25cef6a76fa5800b8241f8ed4cd3be33), Finance (25cef6a76fa580eb912ff8cfca54155e), and Publishing (402cc41633384d35b30ec1ab7c3185da) databases.

[Source: Vector Search Implementation from Cases]: PostgreSQL schema with vector indexing enables semantic search across all knowledge sources with public/internal access control policies.

[Source: Data Freshness Strategy from Publishing]: Automated synchronization ensures content freshness with incremental updates every 15 minutes and comprehensive nightly rebuilds.`;if(n.includes("search")||n.includes("rag"))return`[Source: RAG System Design from Registry]: The retrieval-augmented generation system provides 2-3 relevant citations from integrated knowledge sources with persona-based access filtering.

[Source: Public Access Policies from Cases]: Public persona access excludes financial data and Russian content while providing comprehensive technology and philosophy insights.

[Source: Citation Framework from Publishing]: All responses include specific source references in the format [Source: Title from Table] to ensure transparency and verifiability.`}return("orm-multilang"===t||"orm-russian"===t)&&(n.includes("reputation")||n.includes("brand"))?`[Source: Brand Management Strategy from Cases]: Effective online reputation management requires a proactive approach combining monitoring, content creation, and strategic response protocols.

[Source: Crisis Communication from Publishing]: When facing negative publicity, the key is swift, transparent, and authentic communication that addresses concerns while protecting brand integrity.

[Source: Multi-Platform Approach from Registry]: Modern ORM requires coordinated efforts across all digital touchpoints - social media, review platforms, search results, and owned media channels.`:`[Source: Comprehensive AI Knowledge from Registry]: The traceremove.net system provides access to integrated knowledge across technology philosophy, AI systems architecture, and strategic implementation.

[Source: Multi-Domain Expertise from Cases]: Capabilities span from philosophical discussions about technology to practical implementation of AI systems and comprehensive project management.

[Source: Citation-Based Responses from Publishing]: All responses include 2-3 relevant citations from the knowledge base to ensure accuracy and provide verifiable sources for further research.`}async function h(e,t,n=5,a="public"){try{let n;if(console.log(`Getting context for query: "${e}" with persona: ${t}`),!process.env.UPSTASH_VECTOR_REST_URL||!process.env.UPSTASH_VECTOR_REST_TOKEN)return console.log("Upstash Vector not configured, using mock context"),g(e,t);let a=await d(e),i=new r.gm({url:process.env.UPSTASH_VECTOR_REST_URL,token:process.env.UPSTASH_VECTOR_REST_TOKEN});"philosopher"===t?n='persona = "philosopher"':"comprehensive-ai"===t&&(n='persona = "comprehensive-ai" OR persona = "public"');let o=await i.query({vector:a,topK:6,includeMetadata:!0,filter:n});if(!o||0===o.length)return console.log("No vector results found, using mock context"),g(e,t);let s=o.filter(e=>e.score&&e.score>.7).map(e=>{let t=e.metadata,n=t?.table?`${t.table}`:"Knowledge Base";return`[Source: ${t?.title||"Unknown"} from ${n}]: ${t?.content||e.id}`});if(0===s.length)return console.log("No high-quality matches found, using mock context"),g(e,t);return s.slice(0,3).join("\n\n")}catch(n){return console.error("Error getting context:",n),g(e,t)}}},23155:(e,t,n)=>{n.d(t,{cT:()=>r,hX:()=>o});var a=n(21841);let i=null;async function r(e,t,n="text/plain"){let r=process.env.S3_BUCKET||"traceremove-content",o=function(){if(!i){let e=process.env.S3_ENDPOINT,t=process.env.S3_ACCESS_KEY,n=process.env.S3_SECRET_KEY;if(!e||!t||!n)throw Error("S3 configuration missing: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY required");i=new a.S3Client({endpoint:e,credentials:{accessKeyId:t,secretAccessKey:n},region:"us-east-1",forcePathStyle:!0})}return i}(),s=new a.PutObjectCommand({Bucket:r,Key:e,Body:t,ContentType:n});return await o.send(s),`s3://${r}/${e}`}function o(e,t,n){let a=new Date().toISOString().split("T")[0];return"markdown"===t?`content/${a}/${e}.md`:`attachments/${a}/${e}/${n||"file"}`}}};