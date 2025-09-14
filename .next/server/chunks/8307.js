"use strict";exports.id=8307,exports.ids=[8307],exports.modules={88307:(t,i,e)=>{e.a(t,async(t,a)=>{try{e.d(i,{IO:()=>n,getPool:()=>s,xN:()=>o});var T=e(8678),E=t([T]);T=(E.then?(await E)():E)[0];let l=null;function s(){if(!l){let t=process.env.PG_DSN;if(!t||t.includes("placeholder")||""===t)throw Error("PG_DSN environment variable is required. Please configure PostgreSQL connection string.");(l=new T.Pool({connectionString:t,max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3,ssl:!t.includes("localhost")&&{rejectUnauthorized:!1}})).on("error",t=>{console.error("PostgreSQL pool error:",t)})}return l}async function n(t,i){let a=s(),T=await a.connect();try{let E=Date.now(),s=await T.query(t,i),n=Date.now()-E;n>1e3?console.warn(`🐌 Slow query detected (${n}ms):`,t.substring(0,100)):n>500&&console.info(`⚠️  Moderate query time (${n}ms):`,t.substring(0,50));try{let{performanceMonitor:i}=await e.e(1124).then(e.bind(e,41124));i.recordQuery({query:t.substring(0,100),duration:n,rows:s.rows?.length||0,timestamp:new Date().toISOString()});let{updateMetric:T}=await e.e(7356).then(e.bind(e,47356));T("databaseConnections",a.totalCount)}catch(t){console.debug("Performance monitoring error:",t)}return s}catch(a){console.error("❌ Database query error:",a),console.error("\uD83D\uDCDD Query:",t.substring(0,200)),console.error("\uD83D\uDCCA Params:",i);try{let{updateHealthCheck:t}=await e.e(7356).then(e.bind(e,47356));t("PostgreSQL","unhealthy",void 0,a instanceof Error?a.message:"Query failed")}catch(t){console.debug("Monitoring update failed:",t)}throw a}finally{T.release()}}let r={catalog:`
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
  `};async function o(){try{await n(r.catalog),await n(r.cases),await n(r.publishing),await n(r.finance),console.log("Database schema initialized successfully")}catch(t){throw console.error("Failed to initialize database schema:",t),t}}a()}catch(t){a(t)}})}};