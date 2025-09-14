"use strict";(()=>{var e={};e.id=280,e.ids=[280,8307],e.modules={21841:e=>{e.exports=require("@aws-sdk/client-s3")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},71267:e=>{e.exports=require("worker_threads")},59796:e=>{e.exports=require("zlib")},33717:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{headerHooks:()=>p,originalPathname:()=>m,patchFetch:()=>l,requestAsyncStorage:()=>d,routeModule:()=>u,serverHooks:()=>E,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>g});var n=r(10884),a=r(16132),s=r(21040),o=r(82413),c=e([o]);o=(c.then?(await c)():c)[0];let u=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/search/route",pathname:"/api/search",filename:"route",bundlePath:"app/api/search/route"},resolvedPagePath:"/workspaces/traceremove-social-bot/src/app/api/search/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:d,staticGenerationAsyncStorage:h,serverHooks:E,headerHooks:p,staticGenerationBailout:g}=u,m="/api/search/route";function l(){return(0,s.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:h})}i()}catch(e){i(e)}})},82413:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{GET:()=>u,dynamic:()=>m,maxDuration:()=>T,runtime:()=>g});var n=r(95798),a=r(88307),s=r(46),o=r(56045),c=r(28977),l=e([a]);a=(l.then?(await l)():l)[0];let g="nodejs",m="force-dynamic",T=30;async function u(e){let t=Date.now();try{let i=e.nextUrl.searchParams.get("q")||"",a=e.nextUrl.searchParams.get("persona")||"public",o=parseInt(e.nextUrl.searchParams.get("limit")||"10");if(!i.trim())throw new c.p8("Query parameter q is required");if(i.length>500)throw new c.p8("Query too long (max 500 characters)");let l=await d(i,a),u=await h(l,o),E=await (0,s.fw)(i,"search",6,a),g=await p(i,E,a),m=Date.now()-t,{recordApiResponse:T,recordModelUsage:y}=await r.e(7356).then(r.bind(r,47356));return T("/api/search",m),g.usage&&y(g.provider,g.usage.totalTokens),n.Z.json({query:i,persona:a,answer:g.content,sources:function(e){let t=[],r=e.match(/Source: ([^(]+) \(([^)]+)\)/g);if(r)for(let e of r){let r=e.match(/Source: ([^(]+) \(([^)]+)\)/);r&&t.push({title:r[1].trim(),table:r[2].trim()})}return t.slice(0,3)}(E),documents:u,model:g.model,provider:g.provider,responseTime:m,usage:g.usage})}catch(o){console.error("Search API error:",o);let e=Date.now()-t,{recordApiResponse:i}=await r.e(7356).then(r.bind(r,47356));i("/api/search",e);let{response:a,status:s}=(0,c.$G)(o);return a.responseTime=e,n.Z.json(a,{status:s})}}async function d(e,t){let r=e.toLowerCase().split(" ").filter(e=>e.length>2);return{visibility:t,status:"public"===t?["published","active"]:void 0,lang:"public"===t?["en"]:void 0,keywords:r}}async function h(e,t){try{let{getCachedSearchResults:i,cacheSearchResults:n}=await r.e(1087).then(r.bind(r,81087)),a=`${JSON.stringify(e)}_${t}`,s=await i(a,e.visibility);if(s)return console.log(`🎯 Cache hit for search: ${a}`),s;let o=await E(e,t);return await n(a,e.visibility,o),o}catch(t){return console.error("❌ SQL search error:",t),console.error("Filter:",e),[]}}async function E(e,t){try{let i="public"===e.visibility?"visibility = 'public'":"visibility IN ('public', 'internal')",n=e.status?`AND status IN (${e.status.map(e=>`'${e}'`).join(", ")})`:"",s=e.lang?`AND lang IN (${e.lang.map(e=>`'${e}'`).join(", ")})`:"",o="",c=[],l="";if(e.keywords&&e.keywords.length>0){let t=e.keywords.join(" & ");l=`AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')) @@ to_tsquery('english', $${c.length+1})`;let r=e.keywords.map((e,t)=>{c.push(`%${e}%`,`%${e}%`,`%${e}%`);let r=3*t;return`(title ILIKE $${r+2} OR summary ILIKE $${r+3} OR content ILIKE $${r+4})`});o=`OR (${r.join(" OR ")})`,c.unshift(t)}let u=`
        WITH ranked_results AS (
          SELECT 'catalog' as table_name, notion_id, title, summary, topic, tags, status, lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
                       setweight(to_tsvector('english', coalesce(content, '')), 'C'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN title ILIKE $2 THEN 2.0
                       WHEN summary ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM catalog 
          WHERE ${i} ${n} ${s} 
            ${e.keywords&&e.keywords.length>0?`AND (${l.replace("AND ","")} ${o})`:""}
          
          UNION ALL
          
          SELECT 'cases' as table_name, notion_id, name as title, terms as summary, status as topic, keys as tags, status, 'en' as lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(terms, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN name ILIKE $2 THEN 2.0
                       WHEN terms ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM cases 
          WHERE ${i} 
            ${e.keywords&&e.keywords.length>0?`AND (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(terms, '')) @@ to_tsquery('english', $1) ${o.replace(/content/g,"terms")})`:""}
          
          UNION ALL
          
          SELECT 'publishing' as table_name, notion_id, title, notes as summary, type as topic, tags, submission_status as status, lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(notes, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN title ILIKE $2 THEN 2.0
                       WHEN notes ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM publishing 
          WHERE ${i} ${s} 
            ${e.keywords&&e.keywords.length>0?`AND (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')) @@ to_tsquery('english', $1) ${o.replace(/content/g,"notes")})`:""}
          
          ${"internal"===e.visibility?`
          UNION ALL
          
          SELECT 'finance' as table_name, notion_id, name as title, notes as summary, 'finance' as topic, ARRAY[]::text[] as tags, 'active' as status, 'en' as lang, null as url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(notes, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN name ILIKE $2 THEN 2.0
                       WHEN notes ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM finance 
          WHERE ${e.keywords&&e.keywords.length>0?`(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(notes, '')) @@ to_tsquery('english', $1) ${o.replace(/content/g,"notes")})`:"TRUE"}
          `:""}
        )
        SELECT * FROM ranked_results 
        WHERE rank > 0.1  -- Filter out very low relevance results
        ORDER BY rank DESC, updated_at DESC
        LIMIT $${c.length+2}
      `,d=e.keywords?e.keywords.join(" & "):"",h=e.keywords?`%${e.keywords[0]}%`:"",E=[d,h,...c.slice(1),t];console.log(`🔍 Executing enhanced search query with ${E.length} parameters`),console.log(`🎯 Search terms: "${d}", Title boost: "${h}"`);let p=Date.now(),g=await (0,a.IO)(u,E),m=Date.now()-p;console.log(`📊 Enhanced search completed: ${g.rows?.length||0} results in ${m}ms`);try{let{cacheQueryResult:i}=await r.e(1087).then(r.bind(r,81087)),n=`search_${Buffer.from(JSON.stringify({filter:e,limit:t})).toString("base64")}`;await i(n,E,g.rows||[],6e5)}catch(e){console.debug("Query caching failed:",e)}try{let{measureQuery:t}=await r.e(1124).then(r.bind(r,41124));await t(async()=>g.rows||[],`search_query_${e.visibility}`)}catch(e){console.debug("Performance tracking failed:",e)}return g.rows||[]}catch(t){throw console.error("❌ Enhanced SQL search execution error:",t),console.error("Filter details:",JSON.stringify(e,null,2)),t}}async function p(e,t,r){let i=(0,o._I)({intent:"qa",length:e.length+t.length,persona:"comprehensive-ai"}),n=[{role:"system",content:"public"===r?"You are Arthur Ziganshine, a comprehensive digital AI system for traceremove.net. Provide thoughtful, well-researched answers with 2-3 relevant citations from the provided context. Focus on technology philosophy, ethics, and practical implementation. Exclude any financial or sensitive internal information. Always include specific source references in your response.":"You are Arthur Ziganshine, a comprehensive AI system for traceremove.net with full access to internal knowledge. Provide detailed, strategic answers with 2-3 relevant citations from the provided context. Include insights from all available data sources including registry, cases, publishing, and financial information. Always include specific source references in your response."},{role:"system",content:`Context from traceremove.net knowledge base:
${t}

Always cite your sources using the format [Source: Title from Table] and provide 2-3 relevant citations in your response. Focus on comprehensive, actionable insights.`},{role:"user",content:e}];return await (0,o.oJ)(n,i)}i()}catch(e){i(e)}})},88307:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.d(t,{IO:()=>o,getPool:()=>s,xN:()=>c});var n=r(8678),a=e([n]);n=(a.then?(await a)():a)[0];let l=null;function s(){if(!l){let e=process.env.PG_DSN;if(!e||e.includes("placeholder")||""===e)throw Error("PG_DSN environment variable is required. Please configure PostgreSQL connection string.");(l=new n.Pool({connectionString:e,max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3,ssl:!e.includes("localhost")&&{rejectUnauthorized:!1}})).on("error",e=>{console.error("PostgreSQL pool error:",e)})}return l}async function o(e,t){let i=s(),n=await i.connect();try{let a=Date.now(),s=await n.query(e,t),o=Date.now()-a;o>1e3?console.warn(`🐌 Slow query detected (${o}ms):`,e.substring(0,100)):o>500&&console.info(`⚠️  Moderate query time (${o}ms):`,e.substring(0,50));try{let{performanceMonitor:t}=await r.e(1124).then(r.bind(r,41124));t.recordQuery({query:e.substring(0,100),duration:o,rows:s.rows?.length||0,timestamp:new Date().toISOString()});let{updateMetric:n}=await r.e(7356).then(r.bind(r,47356));n("databaseConnections",i.totalCount)}catch(e){console.debug("Performance monitoring error:",e)}return s}catch(i){console.error("❌ Database query error:",i),console.error("\uD83D\uDCDD Query:",e.substring(0,200)),console.error("\uD83D\uDCCA Params:",t);try{let{updateHealthCheck:e}=await r.e(7356).then(r.bind(r,47356));e("PostgreSQL","unhealthy",void 0,i instanceof Error?i.message:"Query failed")}catch(e){console.debug("Monitoring update failed:",e)}throw i}finally{n.release()}}let u={catalog:`
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
  `};async function c(){try{await o(u.catalog),await o(u.cases),await o(u.publishing),await o(u.finance),console.log("Database schema initialized successfully")}catch(e){throw console.error("Failed to initialize database schema:",e),e}}i()}catch(e){i(e)}})},46:(e,t,r)=>{r.d(t,{NH:()=>E,OC:()=>u,bp:()=>l,fw:()=>g});var i=r(69809),n=r(28830),a=r(83326);let s=null,o=null,c=null;function l(){if(!c){let e=process.env.UPSTASH_VECTOR_REST_URL,t=process.env.UPSTASH_VECTOR_REST_TOKEN;if(!e||!t)throw Error("Upstash Vector credentials not configured");c=new a.gm({url:e,token:t})}return c}async function u(e){try{let t=function(){if(!s){let e=process.env.OPENAI_API_KEY;if(!e||e.includes("your_")||""===e)throw Error("OpenAI API key not configured");s=new i.ZP({apiKey:e})}return s}(),r=await t.embeddings.create({model:"text-embedding-3-small",input:e});return r.data[0].embedding}catch(e){throw console.error("Error creating embedding:",e),e}}async function d(e){if(!e)return[];try{let t=function(){if(!o){let e=process.env.NOTION_TOKEN;if(!e)throw Error("Notion token not configured");o=new n.KU({auth:e})}return o}(),r=await t.databases.query({database_id:e}),i=[];for(let e of r.results)if("properties"in e){let r="Untitled";for(let[t,i]of Object.entries(e.properties))if("title"===i.type&&i.title.length>0){r=i.title[0].plain_text;break}let n=await t.blocks.children.list({block_id:e.id}),a="";for(let e of n.results)"type"in e&&(a+=function(e){switch(e.type){case"paragraph":return e.paragraph?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_1":return e.heading_1?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_2":return e.heading_2?.rich_text?.map(e=>e.plain_text).join("")||"";case"heading_3":return e.heading_3?.rich_text?.map(e=>e.plain_text).join("")||"";case"bulleted_list_item":return"• "+(e.bulleted_list_item?.rich_text?.map(e=>e.plain_text).join("")||"");case"numbered_list_item":return"1. "+(e.numbered_list_item?.rich_text?.map(e=>e.plain_text).join("")||"");case"quote":return"> "+(e.quote?.rich_text?.map(e=>e.plain_text).join("")||"");case"code":return"```\n"+(e.code?.rich_text?.map(e=>e.plain_text).join("")||"")+"\n```";default:return""}}(e)+"\n");a.trim()&&i.push({id:`notion-${e.id}`,content:a.trim(),metadata:{source:"notion",title:r,url:`https://notion.so/${e.id}`,type:"notion"}})}return i}catch(e){return console.error("Error fetching Notion docs:",e),[]}}async function h(e){try{let t=await fetch(e),r=await t.text(),i=r.match(/<loc>(.*?)<\/loc>/g);if(!i)return[];let n=i.map(e=>e.replace(/<\/?loc>/g,"")),a=[],s=n.slice(0,10);for(let e of s)try{let t=await fetch(e),r=await t.text(),i=r.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();if(i.length>100)for(let t=0;t<i.length;t+=1e3){let n=i.slice(t,t+1e3);a.push({id:`sitemap-${e}-${t}`,content:n,metadata:{source:"sitemap",title:function(e){let t=e.match(/<title[^>]*>(.*?)<\/title>/i);return t?t[1].trim():"Untitled"}(r),url:e,type:"sitemap"}})}}catch(t){console.error(`Error fetching ${e}:`,t)}return a}catch(e){return console.error("Error fetching site docs:",e),[]}}async function E(e,t,r){try{console.log(`Reindexing persona: ${e}`);let[i,n]=await Promise.all([d(t),h(r)]),a=[...i,...n];console.log(`Found ${a.length} documents to index`);let s=l();for(let t of a)try{let r=await u(t.content);await s.upsert({id:`${e}-${t.id}`,vector:r,metadata:{...t.metadata,personaId:e,content:t.content}})}catch(e){console.error(`Error indexing document ${t.id}:`,e)}return console.log(`Reindexing complete for persona: ${e}`),a.length}catch(e){throw console.error("Error reindexing persona:",e),e}}function p(e,t){let r=e.toLowerCase();if("comprehensive-ai"===t||"philosopher"===t){if(r.includes("technology")||r.includes("ai"))return`[Source: AI Systems Architecture from Registry]: The traceremove.net comprehensive AI system integrates multiple model providers (OpenAI, Anthropic, Gemini, Mistral, Groq) with intelligent routing based on query complexity and intent.

[Source: Technology Philosophy from Cases]: Technology is not merely a tool but a fundamental extension of human consciousness. When we create digital systems, we externalize our cognitive processes and embed our values into code.

[Source: Multi-Model Integration from Publishing]: Our ETL pipeline processes 4 Notion databases with 15-minute incremental updates and nightly full synchronization, ensuring knowledge base freshness ≤ 30 days.`;if(r.includes("database")||r.includes("etl"))return`[Source: ETL Pipeline Architecture from Registry]: The system processes Registry (6d3da5a01186475d8c2b794cca147a86), Cases (25cef6a76fa5800b8241f8ed4cd3be33), Finance (25cef6a76fa580eb912ff8cfca54155e), and Publishing (402cc41633384d35b30ec1ab7c3185da) databases.

[Source: Vector Search Implementation from Cases]: PostgreSQL schema with vector indexing enables semantic search across all knowledge sources with public/internal access control policies.

[Source: Data Freshness Strategy from Publishing]: Automated synchronization ensures content freshness with incremental updates every 15 minutes and comprehensive nightly rebuilds.`;if(r.includes("search")||r.includes("rag"))return`[Source: RAG System Design from Registry]: The retrieval-augmented generation system provides 2-3 relevant citations from integrated knowledge sources with persona-based access filtering.

[Source: Public Access Policies from Cases]: Public persona access excludes financial data and Russian content while providing comprehensive technology and philosophy insights.

[Source: Citation Framework from Publishing]: All responses include specific source references in the format [Source: Title from Table] to ensure transparency and verifiability.`}return("orm-multilang"===t||"orm-russian"===t)&&(r.includes("reputation")||r.includes("brand"))?`[Source: Brand Management Strategy from Cases]: Effective online reputation management requires a proactive approach combining monitoring, content creation, and strategic response protocols.

[Source: Crisis Communication from Publishing]: When facing negative publicity, the key is swift, transparent, and authentic communication that addresses concerns while protecting brand integrity.

[Source: Multi-Platform Approach from Registry]: Modern ORM requires coordinated efforts across all digital touchpoints - social media, review platforms, search results, and owned media channels.`:`[Source: Comprehensive AI Knowledge from Registry]: The traceremove.net system provides access to integrated knowledge across technology philosophy, AI systems architecture, and strategic implementation.

[Source: Multi-Domain Expertise from Cases]: Capabilities span from philosophical discussions about technology to practical implementation of AI systems and comprehensive project management.

[Source: Citation-Based Responses from Publishing]: All responses include 2-3 relevant citations from the knowledge base to ensure accuracy and provide verifiable sources for further research.`}async function g(e,t,r=5,i="public"){try{let r;if(console.log(`Getting context for query: "${e}" with persona: ${t}`),!process.env.UPSTASH_VECTOR_REST_URL||!process.env.UPSTASH_VECTOR_REST_TOKEN)return console.log("Upstash Vector not configured, using mock context"),p(e,t);let i=await u(e),n=new a.gm({url:process.env.UPSTASH_VECTOR_REST_URL,token:process.env.UPSTASH_VECTOR_REST_TOKEN});"philosopher"===t?r='persona = "philosopher"':"comprehensive-ai"===t&&(r='persona = "comprehensive-ai" OR persona = "public"');let s=await n.query({vector:i,topK:6,includeMetadata:!0,filter:r});if(!s||0===s.length)return console.log("No vector results found, using mock context"),p(e,t);let o=s.filter(e=>e.score&&e.score>.7).map(e=>{let t=e.metadata,r=t?.table?`${t.table}`:"Knowledge Base";return`[Source: ${t?.title||"Unknown"} from ${r}]: ${t?.content||e.id}`});if(0===o.length)return console.log("No high-quality matches found, using mock context"),p(e,t);return o.slice(0,3).join("\n\n")}catch(r){return console.error("Error getting context:",r),p(e,t)}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[3271,8107,9809,8830,3326,6849,6045],()=>r(33717));module.exports=i})();