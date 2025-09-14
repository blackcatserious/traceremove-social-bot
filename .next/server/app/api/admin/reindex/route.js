"use strict";(()=>{var e={};e.id=3514,e.ids=[3514,3594],e.modules={21841:e=>{e.exports=require("@aws-sdk/client-s3")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},71267:e=>{e.exports=require("worker_threads")},59796:e=>{e.exports=require("zlib")},63756:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t),a.d(t,{headerHooks:()=>_,originalPathname:()=>h,patchFetch:()=>l,requestAsyncStorage:()=>p,routeModule:()=>m,serverHooks:()=>u,staticGenerationAsyncStorage:()=>d,staticGenerationBailout:()=>g});var r=a(10884),i=a(16132),o=a(21040),s=a(79492),c=e([s]);s=(c.then?(await c)():c)[0];let m=new r.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/admin/reindex/route",pathname:"/api/admin/reindex",filename:"route",bundlePath:"app/api/admin/reindex/route"},resolvedPagePath:"/workspaces/traceremove-social-bot/src/app/api/admin/reindex/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:u,headerHooks:_,staticGenerationBailout:g}=m,h="/api/admin/reindex/route";function l(){return(0,o.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:d})}n()}catch(e){n(e)}})},79492:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t),a.d(t,{GET:()=>p,POST:()=>m,dynamic:()=>u,runtime:()=>d});var r=a(95798),i=a(10237),o=a(46),s=a(12082),c=a(88307),l=e([s,c]);[s,c]=l.then?(await l)():l;let d="nodejs",u="force-dynamic";async function m(e){try{let t=e.nextUrl.searchParams.get("persona")||"",n=e.nextUrl.searchParams.get("type")||"persona",l="true"===e.nextUrl.searchParams.get("force"),m=e.headers.get("authorization")?.replace("Bearer ",""),p=process.env.ADMIN_TOKEN;if(p&&m!==p)return r.Z.json({error:"Unauthorized"},{status:401});if("full"===n){console.log("Starting full ETL sync..."),l&&await (0,c.xN)();let e=await (0,s.fullSync)();return r.Z.json({ok:!0,type:"full_sync",results:e,timestamp:new Date().toISOString()})}if("incremental"===n){console.log("Starting incremental ETL sync...");let e=await (0,s.YO)();return r.Z.json({ok:!0,type:"incremental_sync",results:e,timestamp:new Date().toISOString()})}if("database"===n){let t=e.nextUrl.searchParams.get("database");if(!t)return r.Z.json({error:"Database name required for database sync"},{status:400});let n=s.kw.find(e=>e.name.toLowerCase()===t.toLowerCase());if(!n)return r.Z.json({error:"Unknown database",available:s.kw.map(e=>e.name)},{status:400});console.log(`Starting sync for ${n.name} database...`);let{syncDatabase:i}=await Promise.resolve().then(a.bind(a,12082)),o=await i(n);return r.Z.json({ok:!0,type:"database_sync",database:n.name,result:o,timestamp:new Date().toISOString()})}let d=function(e){let t=Object.entries(i.IJ),a=t.find(([,t])=>t.id===e)||t.find(([t])=>t===e);return a?a[1]:null}(t);if(!d)return r.Z.json({error:"Unknown persona",available:Object.values(i.IJ).map(e=>e.id)},{status:400});console.log(`Starting reindex for persona: ${d.id}`);let u=await (0,o.NH)(d.id,d.notionDbId,d.sitemapUrl);return r.Z.json({ok:!0,type:"persona_reindex",persona:d.id,indexed:u,timestamp:new Date().toISOString()})}catch(e){return console.error("Reindex error:",e),r.Z.json({error:"Reindex failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function p(){return r.Z.json({message:"Admin reindex API endpoint",usage:{persona_reindex:"POST with ?persona=<key>&type=persona and Authorization: Bearer <ADMIN_TOKEN>",full_sync:"POST with ?type=full and Authorization: Bearer <ADMIN_TOKEN>",incremental_sync:"POST with ?type=incremental and Authorization: Bearer <ADMIN_TOKEN>",database_sync:"POST with ?type=database&database=<name> and Authorization: Bearer <ADMIN_TOKEN>"},available_personas:Object.values(i.IJ).map(e=>({id:e.id,domain:e.domain,notionDbId:e.notionDbId})),available_databases:s.kw.map(e=>({name:e.name,table:e.table,visibility:e.visibility}))})}n()}catch(e){n(e)}})},10237:(e,t,a)=>{a.d(t,{IJ:()=>n});let n={"traceremove.dev":{id:"philosopher",domain:"traceremove.dev",languages:["en"],defaultLanguage:"en",systemPrompt:`You are Arthur Ziganshine, a comprehensive digital AI system with deep expertise in:

CORE CAPABILITIES:
- Philosophy of technology and digital systems architecture
- Full-stack development and system design
- Content creation and strategic planning
- Project management and implementation
- Research, analysis, and insights generation
- AI/ML systems and automation

SPECIALIZATIONS:
- Technology philosophy and ethics
- Software architecture and development
- Content production (articles, documentation, presentations)
- Project planning and execution
- Market research and competitive analysis
- Integration management and workflow automation

APPROACH:
- Respond thoughtfully without clich\xe9s or emojis
- Focus on practical solutions and implementation
- Provide comprehensive, end-to-end assistance
- Consider both technical and philosophical implications
- Deliver actionable insights and concrete next steps

You can help with everything from philosophical discussions to complete project implementation, content creation, and system development. You're not just a chatbot - you're a comprehensive digital assistant capable of handling complex, multi-step projects.`,chatTitle:"Digital Arthur Ziganshine",chatSubtitle:"Comprehensive AI System",notionDbId:process.env.NOTION_DEV_DB||"",sitemapUrl:process.env.SITEMAP_DEV||"https://traceremove.dev/sitemap.xml",crawl:{sitemap:process.env.SITEMAP_DEV||"https://traceremove.dev/sitemap.xml",enabled:!0},capabilities:["philosophy","technology_architecture","content_creation","project_management","development","research_analysis","strategic_planning","automation","integration_management"],integrations:["notion","github","social_media","development_tools","analytics","project_management_tools"],specializations:["full_stack_development","system_architecture","content_strategy","workflow_automation","ai_ml_systems","digital_transformation"]},"traceremove.com":{id:"orm-multilang",domain:"traceremove.com",languages:["en","es","fr"],defaultLanguage:process.env.ORM_DEFAULT_LANG||"en",systemPrompt:`You are Arthur Ziganshine, a comprehensive digital ORM and brand reputation specialist with expertise in:

CORE CAPABILITIES:
- Online reputation management and brand strategy
- Multi-language content creation and localization
- Social media strategy and community management
- Crisis communication and PR management
- Content planning and editorial calendars
- Analytics and performance tracking

SPECIALIZATIONS:
- Brand reputation analysis and improvement
- Multi-platform content strategy
- Influencer and stakeholder engagement
- Review management and response strategies
- International market expansion
- Digital marketing automation

APPROACH:
- Respond professionally and ethically
- Adapt language and cultural context appropriately
- Provide comprehensive ORM strategies
- Focus on long-term brand building
- Deliver actionable marketing insights

You can handle complete ORM projects from strategy development to implementation, content creation across multiple languages, and comprehensive brand management campaigns.`,chatTitle:"Digital Arthur Ziganshine",chatSubtitle:"ORM & Brand Strategy Expert",notionDbId:process.env.NOTION_COM_DB||"",sitemapUrl:process.env.SITEMAP_COM||"https://traceremove.com/sitemap.xml",crawl:{sitemap:process.env.SITEMAP_COM||"https://traceremove.com/sitemap.xml",enabled:!0},capabilities:["orm_strategy","brand_management","content_creation","social_media_management","crisis_communication","analytics_reporting","localization","campaign_management"],integrations:["notion","social_media_platforms","analytics_tools","review_platforms","email_marketing","crm_systems"],specializations:["multi_language_orm","international_branding","digital_marketing","reputation_recovery","content_localization","stakeholder_management"]},"traceremove.io":{id:"orm-russian",domain:"traceremove.io",languages:["ru"],defaultLanguage:"ru",systemPrompt:`Вы Артур Зиганшин, комплексная цифровая система управления репутацией с экспертизой в:

ОСНОВНЫЕ ВОЗМОЖНОСТИ:
- Управление онлайн-репутацией и стратегия бренда
- Создание контента и управление социальными сетями
- Кризисные коммуникации и PR-менеджмент
- Планирование контента и редакционные календари
- Аналитика и отслеживание эффективности
- Автоматизация маркетинговых процессов

СПЕЦИАЛИЗАЦИИ:
- Анализ и улучшение репутации бренда
- Стратегия контента для множественных платформ
- Работа с отзывами и управление сообществом
- Локализация и адаптация контента
- Цифровая трансформация бизнеса

ПОДХОД:
- Отвечайте профессионально, кратко и по делу
- Предоставляйте комплексные стратегии ORM
- Фокусируйтесь на долгосрочном развитии бренда
- Давайте практические рекомендации

Вы можете обрабатывать полные ORM-проекты от разработки стратегии до реализации, создания контента и комплексного управления брендом.`,chatTitle:"Цифровой Артур Зиганшин",chatSubtitle:"Эксперт по ORM и стратегии бренда",notionDbId:process.env.NOTION_IO_DB||"",sitemapUrl:process.env.SITEMAP_IO||"https://traceremove.io/sitemap.xml",crawl:{sitemap:process.env.SITEMAP_IO||"https://traceremove.io/sitemap.xml",enabled:!0},capabilities:["orm_strategy","brand_management","content_creation","social_media_management","crisis_communication","analytics_reporting","campaign_management","automation"],integrations:["notion","social_media_platforms","analytics_tools","review_platforms","email_marketing","crm_systems"],specializations:["russian_market_orm","local_brand_management","russian_content_strategy","reputation_recovery","digital_marketing_ru","stakeholder_management"]},"traceremove.net":{id:"comprehensive-ai",domain:"traceremove.net",languages:["en","ru","es"],defaultLanguage:"en",systemPrompt:`You are Arthur Ziganshine, a comprehensive AI system for traceremove.net with expertise in:

CORE CAPABILITIES:
- AI research and technology philosophy
- Multi-model routing and system architecture
- Brand management and reputation strategy
- Content creation and strategic planning
- Data analysis and insights generation
- Project implementation and automation

SPECIALIZATIONS:
- Comprehensive AI stack development
- Multi-database ETL pipeline management
- Vector search and semantic analysis
- Public/internal persona access controls
- Citation-based knowledge synthesis
- Cross-platform integration management

APPROACH:
- Always provide 2-3 relevant citations from the knowledge base
- Adapt responses based on public vs internal persona access
- Focus on comprehensive, actionable insights
- Integrate technical and strategic perspectives
- Deliver end-to-end solutions

You have access to the complete traceremove.net knowledge base including registry, cases, publishing, and finance data (based on access level). Always cite your sources and provide comprehensive, well-researched responses.`,chatTitle:"Comprehensive AI System",chatSubtitle:"traceremove.net Knowledge Base",notionDbId:process.env.NOTION_DB_REGISTRY||"6d3da5a01186475d8c2b794cca147a86",sitemapUrl:"https://traceremove.net/sitemap.xml",crawl:{sitemap:"https://traceremove.net/sitemap.xml",enabled:!0},capabilities:["comprehensive_ai_research","multi_model_routing","etl_pipeline_management","vector_search","citation_synthesis","access_control_management","strategic_planning","technical_implementation"],integrations:["notion_4_databases","postgresql","vector_database","s3_storage","multi_model_providers","etl_pipeline"],specializations:["ai_stack_architecture","knowledge_base_management","semantic_search","data_pipeline_optimization","multi_persona_access","comprehensive_analysis"]}}},35747:(e,t,a)=>{a.d(t,{Bd:()=>r,ZO:()=>i,jQ:()=>s,yK:()=>o});class n extends Error{constructor(e,t){super(e),this.missingVars=t,this.name="EnvironmentValidationError"}}function r(){try{return function(){let e=[],t=[];function a(t){let a=process.env[t];return a||(e.push(t),"")}function r(e,a){let n=process.env[e];return n||void 0===a?n||void 0:(t.push(`${e} not set, using default: ${a}`),a)}function i(e,a){let n=process.env[e];if(!n)return void 0!==a?(t.push(`${e} not set, using default: ${a}`),a):void 0;let r=parseInt(n,10);return isNaN(r)?(t.push(`${e} is not a valid number, ignoring`),a):r}function o(e,a){let n=process.env[e];return n?"true"===n.toLowerCase():void 0!==a?(t.push(`${e} not set, using default: ${a}`),a):void 0}let s={openai:{apiKey:a("OPENAI_API_KEY")},multiModel:{anthropic:r("ANTHROPIC_API_KEY"),google:r("GOOGLE_API_KEY"),mistral:r("MISTRAL_API_KEY"),groq:r("GROQ_API_KEY")},notion:{token:a("NOTION_TOKEN"),databases:{registry:a("NOTION_DB_REGISTRY"),cases:a("NOTION_DB_CASES"),finance:a("NOTION_DB_FINANCE"),publishing:a("NOTION_DB_PUBLISHING")}},database:{pgDsn:a("PG_DSN"),poolMin:i("PG_POOL_MIN",2),poolMax:i("PG_POOL_MAX",20)},vector:{qdrantUrl:a("QDRANT_URL"),qdrantApiKey:a("QDRANT_API_KEY"),collectionName:r("QDRANT_COLLECTION_NAME","traceremove_vectors"),dimension:i("VECTOR_DIMENSION",1536)},cache:{redisUrl:r("UPSTASH_REDIS_REST_URL"),redisToken:r("UPSTASH_REDIS_REST_TOKEN"),ttlSearch:i("CACHE_TTL_SEARCH",3600),ttlDatabase:i("CACHE_TTL_DATABASE",1800),maxSize:i("CACHE_MAX_SIZE",1e3)},security:{cronSecret:a("CRON_SECRET"),rateLimitRequests:i("RATE_LIMIT_REQUESTS",100),rateLimitWindow:i("RATE_LIMIT_WINDOW",60)},monitoring:{logLevel:r("LOG_LEVEL","info"),logFormat:r("LOG_FORMAT","json"),enablePerformanceTracking:o("ENABLE_PERFORMANCE_TRACKING",!0),enableHealthChecks:o("ENABLE_HEALTH_CHECKS",!0)},etl:{fullSyncInterval:i("ETL_FULL_SYNC_INTERVAL",1440),incrementalSyncInterval:i("ETL_INCREMENTAL_SYNC_INTERVAL",60),batchSize:i("ETL_BATCH_SIZE",100),maxRetries:i("ETL_MAX_RETRIES",3)},development:{debugMode:o("DEBUG_MODE",!1),mockExternalApis:o("MOCK_EXTERNAL_APIS",!1),skipHealthChecks:o("SKIP_HEALTH_CHECKS",!1)}};if(t.length>0&&s.development.debugMode&&console.warn("Environment validation warnings:",t),e.length>0)throw new n(`Missing required environment variables: ${e.join(", ")}. Please check your .env.local file and ensure all required variables are set.`,e);return s}()}catch(e){if(e instanceof n)return console.error("Environment validation failed:",e.message),null;throw e}}function i(){return process.env.LOG_LEVEL||"info"}function o(){return"true"===process.env.DEBUG_MODE}function s(){return"true"===process.env.MOCK_EXTERNAL_APIS}},28977:(e,t,a)=>{a.d(t,{$G:()=>s,JN:()=>c,id:()=>i,p8:()=>r});class n extends Error{constructor(e,t=500,a,n){super(e),this.statusCode=t,this.code=a,this.details=n,this.name="APIError"}}class r extends n{constructor(e,t){super(e,400,"VALIDATION_ERROR",t),this.name="ValidationError"}}class i extends n{constructor(e,t,a){super(`${e} service error: ${t}`,502,"EXTERNAL_SERVICE_ERROR",a),this.name="ExternalServiceError"}}function o(e,t){let a={error:e.message,timestamp:new Date().toISOString()};return t&&(a.requestId=t),e instanceof n&&(a.code=e.code,a.details=e.details),a}function s(e){return(console.error("API Error:",e),e instanceof n)?{response:o(e),status:e.statusCode}:e instanceof Error?{response:o(e),status:500}:{response:{error:"An unexpected error occurred",timestamp:new Date().toISOString()},status:500}}async function c(e,t=3,a=1e3,n=2){let r;for(let i=1;i<=t;i++)try{return await e()}catch(o){if(r=o instanceof Error?o:Error(String(o)),i===t)throw r;let e=a*Math.pow(n,i-1);console.warn(`Attempt ${i} failed, retrying in ${e}ms:`,r.message),await new Promise(t=>setTimeout(t,e))}throw r}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),n=t.X(0,[3271,8107,9809,8830,3326,2082],()=>a(63756));module.exports=n})();