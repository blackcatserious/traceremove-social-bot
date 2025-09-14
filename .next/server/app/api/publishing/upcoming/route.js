"use strict";(()=>{var t={};t.id=2274,t.ids=[2274,8307],t.modules={21841:t=>{t.exports=require("@aws-sdk/client-s3")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:t=>{t.exports=import("pg")},57147:t=>{t.exports=require("fs")},13685:t=>{t.exports=require("http")},95687:t=>{t.exports=require("https")},87561:t=>{t.exports=require("node:fs")},84492:t=>{t.exports=require("node:stream")},72477:t=>{t.exports=require("node:stream/web")},71017:t=>{t.exports=require("path")},85477:t=>{t.exports=require("punycode")},12781:t=>{t.exports=require("stream")},57310:t=>{t.exports=require("url")},73837:t=>{t.exports=require("util")},71267:t=>{t.exports=require("worker_threads")},59796:t=>{t.exports=require("zlib")},79964:(t,e,i)=>{i.a(t,async(t,a)=>{try{i.r(e),i.d(e,{headerHooks:()=>p,originalPathname:()=>N,patchFetch:()=>E,requestAsyncStorage:()=>l,routeModule:()=>T,serverHooks:()=>c,staticGenerationAsyncStorage:()=>d,staticGenerationBailout:()=>A});var s=i(10884),n=i(16132),r=i(21040),o=i(35026),u=t([o]);o=(u.then?(await u)():u)[0];let T=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/publishing/upcoming/route",pathname:"/api/publishing/upcoming",filename:"route",bundlePath:"app/api/publishing/upcoming/route"},resolvedPagePath:"/workspaces/traceremove-social-bot/src/app/api/publishing/upcoming/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:l,staticGenerationAsyncStorage:d,serverHooks:c,headerHooks:p,staticGenerationBailout:A}=T,N="/api/publishing/upcoming/route";function E(){return(0,r.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:d})}a()}catch(t){a(t)}})},35026:(t,e,i)=>{i.a(t,async(t,a)=>{try{i.r(e),i.d(e,{GET:()=>o,dynamic:()=>T,maxDuration:()=>l,runtime:()=>E});var s=i(95798),n=i(88307),r=t([n]);n=(r.then?(await r)():r)[0];let E="nodejs",T="force-dynamic",l=30;async function o(t){let e=Date.now();try{let a=parseInt(t.nextUrl.searchParams.get("limit")||"10"),r=t.nextUrl.searchParams.get("persona")||"public",o=parseInt(t.nextUrl.searchParams.get("days")||"30"),E="public"===r?"visibility = 'public'":"visibility IN ('public', 'internal')",T=`
      SELECT 
        notion_id,
        title,
        ownership,
        type,
        channel,
        pub_date,
        venue,
        citation_style,
        submission_status,
        due_date,
        doi,
        lang,
        tags,
        notes,
        url,
        updated_at,
        CASE 
          WHEN due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
          WHEN due_date <= CURRENT_DATE + INTERVAL '14 days' THEN 'soon'
          ELSE 'upcoming'
        END as priority
      FROM publishing 
      WHERE ${E}
        AND due_date IS NOT NULL 
        AND due_date >= CURRENT_DATE
        AND due_date <= CURRENT_DATE + INTERVAL '${o} days'
        AND submission_status NOT IN ('published', 'rejected', 'withdrawn')
      ORDER BY due_date ASC, updated_at DESC
      LIMIT $1
    `,l=await (0,n.IO)(T,[a]),d=Date.now()-e,{recordApiResponse:c}=await i.e(7356).then(i.bind(i,47356));c("/api/publishing/upcoming",d);let p=l.rows.map(t=>({id:t.notion_id,title:t.title,ownership:t.ownership,type:t.type,channel:t.channel,pubDate:t.pub_date,venue:t.venue,citationStyle:t.citation_style,submissionStatus:t.submission_status,dueDate:t.due_date,doi:t.doi,lang:t.lang,tags:t.tags||[],notes:t.notes,url:t.url,updatedAt:t.updated_at,priority:t.priority,daysUntilDue:Math.ceil((new Date(t.due_date).getTime()-new Date().getTime())/864e5)})),A=await u(r),N=p.filter(t=>"urgent"===t.priority).length,I=p.filter(t=>"soon"===t.priority).length;return s.Z.json({upcoming:p,total:p.length,summary:{urgent:N,soon:I,total:p.length},stats:A,persona:r,responseTime:d,generatedAt:new Date().toISOString()})}catch(n){console.error("Publishing upcoming API error:",n);let t=Date.now()-e,{recordApiResponse:a}=await i.e(7356).then(i.bind(i,47356));return a("/api/publishing/upcoming",t),s.Z.json({error:"Failed to fetch upcoming publications",details:n instanceof Error?n.message:"Unknown error",responseTime:t},{status:500})}}async function u(t){try{let e=`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN due_date IS NOT NULL AND due_date >= CURRENT_DATE THEN 1 END) as upcoming,
        COUNT(CASE WHEN submission_status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN submission_status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN submission_status = 'draft' THEN 1 END) as drafts,
        COUNT(CASE WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE AND submission_status NOT IN ('published', 'rejected', 'withdrawn') THEN 1 END) as overdue
      FROM publishing 
      WHERE ${"public"===t?"visibility = 'public'":"visibility IN ('public', 'internal')"}
    `,i=await (0,n.IO)(e),a=i.rows[0];return{total:parseInt(a.total),upcoming:parseInt(a.upcoming),published:parseInt(a.published),submitted:parseInt(a.submitted),drafts:parseInt(a.drafts),overdue:parseInt(a.overdue)}}catch(t){return console.error("Error getting publishing stats:",t),{total:0,upcoming:0,published:0,submitted:0,drafts:0,overdue:0}}}a()}catch(t){a(t)}})},88307:(t,e,i)=>{i.a(t,async(t,a)=>{try{i.d(e,{IO:()=>o,getPool:()=>r,xN:()=>u});var s=i(8678),n=t([s]);s=(n.then?(await n)():n)[0];let E=null;function r(){if(!E){let t=process.env.PG_DSN;if(!t||t.includes("placeholder")||""===t)throw Error("PG_DSN environment variable is required. Please configure PostgreSQL connection string.");(E=new s.Pool({connectionString:t,max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3,ssl:!t.includes("localhost")&&{rejectUnauthorized:!1}})).on("error",t=>{console.error("PostgreSQL pool error:",t)})}return E}async function o(t,e){let a=r(),s=await a.connect();try{let n=Date.now(),r=await s.query(t,e),o=Date.now()-n;o>1e3?console.warn(`🐌 Slow query detected (${o}ms):`,t.substring(0,100)):o>500&&console.info(`⚠️  Moderate query time (${o}ms):`,t.substring(0,50));try{let{performanceMonitor:e}=await i.e(1124).then(i.bind(i,41124));e.recordQuery({query:t.substring(0,100),duration:o,rows:r.rows?.length||0,timestamp:new Date().toISOString()});let{updateMetric:s}=await i.e(7356).then(i.bind(i,47356));s("databaseConnections",a.totalCount)}catch(t){console.debug("Performance monitoring error:",t)}return r}catch(a){console.error("❌ Database query error:",a),console.error("\uD83D\uDCDD Query:",t.substring(0,200)),console.error("\uD83D\uDCCA Params:",e);try{let{updateHealthCheck:t}=await i.e(7356).then(i.bind(i,47356));t("PostgreSQL","unhealthy",void 0,a instanceof Error?a.message:"Query failed")}catch(t){console.debug("Monitoring update failed:",t)}throw a}finally{s.release()}}let T={catalog:`
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
  `};async function u(){try{await o(T.catalog),await o(T.cases),await o(T.publishing),await o(T.finance),console.log("Database schema initialized successfully")}catch(t){throw console.error("Failed to initialize database schema:",t),t}}a()}catch(t){a(t)}})}};var e=require("../../../../webpack-runtime.js");e.C(t);var i=t=>e(e.s=t),a=e.X(0,[3271,8107],()=>i(79964));module.exports=a})();