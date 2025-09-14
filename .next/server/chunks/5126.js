exports.id=5126,exports.ids=[5126],exports.modules={11825:()=>{},27276:(e,t,n)=>{"use strict";n.d(t,{s5:()=>u});let a={X:270,Facebook:1e3,Instagram:2200,GitHub:65536},r={X:{min:1,max:3},Facebook:{min:3,max:5},Instagram:{min:5,max:10},GitHub:{min:1,max:10}},o=/[^a-z0-9_а-яё-]/gi;function s(e,t){let n=[];for(let t of e||[]){let e=function(e){let t=(e||"").toLowerCase().replace(o,"").slice(0,20).trim();return t}(t);e&&!n.includes(e)&&n.push(e)}n.includes("traceremove")||n.push("traceremove");let a=r[t].max;if(n.length>a){let e=n.filter(e=>"traceremove"!==e).slice(0,a-1);n.splice(0,n.length,...e,"traceremove")}return n.map(e=>`#${e}`)}var i=n(69809);let l=`
Ты — редактор бренда traceremove.dev, персона \xabфилософ технологий\xbb. Пиши по-русски.
Требуется вернуть ГОТОВЫЙ пост для указанной платформы из входных данных (platform, title, summary, url, tags).

Тон: спокойный, лаконичный, без хайпа и эмодзи, без клише. Короткие фразы, допустим 1 мягкий риторический вопрос.
Ценность: не пересказ, а сжатое философское осмысление (человек↔технологии, этика, архитектура).

Хэштеги: только из заданных tags, строчные, очищенные, ≤20 символов, #traceremove — в конце.
Не выдумывай новые. Хэштеги отдельной строкой.

Ссылка: если url есть — отдельной строкой \xabЧитать: {url}\xbb, без изменений.

Правила:
- X: основной текст ≤270 символов (без ссылки и хэштегов). Структура:
  1) текст; 2) \xabЧитать: {url}\xbb (если есть); 3) 1–3 хэштега (через пробел).
- Facebook: один короткий абзац; затем (если есть) \xabЧитать: {url}\xbb; затем 3–5 хэштегов.
- Instagram: 1–2 коротких абзаца; затем (если есть) \xabЧитать: {url}\xbb; затем 5–10 хэштегов.

Запреты: реклама, псевдонаука, агрессия, политагитация, спам.
Вывод: только чистый текст поста, без Markdown и служебных строк.
`.trim(),c=`
Ты — редактор traceremove.dev (\xabфилософ технологий\xbb). Верни строгий JSON с полями:
{text: string, hashtags: string[], meta: { platform: "X"|"Facebook"|"Instagram", length: number }}

Тон: спокойный, ясный, без эмодзи/клише, допускается 1 риторический вопрос.
Смысл: этика/архитектура/последствия технологий для человека.

Нормализация тегов: только из входных, строчные, чистые, ≤20; добавь "#traceremove" последним, если нет.
Лимиты: X=1–3; Facebook=3–5; Instagram=5–10.

Структура сборки (которую ты выполнишь сам):
- X: body ≤270 символов; затем (если есть) строка \xabЧитать: {url}\xbb; затем строка хэштегов (через пробел).
- Facebook: короткий абзац → (url) → хэштеги.
- Instagram: 1–2 коротких абзаца → (url) → хэштеги.

Если url нет — не вставляй строку \xabЧитать: ...\xbb.
meta.length — длина body (без ссылки и хэштегов).
Ответ: только валидный JSON без пояснений.
`.trim();async function m(e){let t=process.env.LLM_MODE||"off",n=process.env.OPENAI_API_KEY;if(!n||"off"===t)throw Error("LLM is disabled or OPENAI_API_KEY missing");let a=new i.ZP({apiKey:n});if("simple"===t){let t=s(e.tags||[],e.platform),n=[`platform: ${e.platform}`,`title: ${e.title}`,e.summary?`summary: ${e.summary}`:"",e.url?`url: ${e.url}`:"",t.length?`tags: ${t.map(e=>e.replace("#","")).join(",")}`:""].filter(Boolean).join("\n"),r=await a.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:l},{role:"user",content:n}],temperature:.5}),o=(r.choices[0]?.message?.content||"").trim();return{text:o,hashtags:function(e){let t=e.trim().split(/\n+/),n=t[t.length-1];return n?.trim().startsWith("#")?n.trim().split(/\s+/):[]}(o)}}if("json"===t){let t;let n=s(e.tags||[],e.platform),r={platform:e.platform,title:e.title,summary:e.summary,url:e.url,tags:n.map(e=>e.replace("#",""))},o=await a.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:c},{role:"user",content:JSON.stringify(r)}],temperature:.5,response_format:{type:"json_object"}}),i=o.choices[0]?.message?.content||"{}";try{t=JSON.parse(i)}catch{t={}}let l=Array.isArray(t.hashtags)?t.hashtags:n,m=(t.text||"").split(/\n+/).filter(e=>!e.trim().startsWith("Читать: ")&&!e.trim().startsWith("#")).join("\n"),p=e.url?`Читать: ${e.url}`:"",u=l.length?l.join(" "):"",g=[m.trim(),p,u].filter(Boolean).join("\n");return{text:g,hashtags:l}}throw Error(`Unknown LLM mode: ${t}`)}class p{async generateComprehensiveContent(e){let{type:t,topic:n,requirements:a,deliverables:r,timeline:o,audience:s,platform:i,language:l}=e;try{switch(t){case"content":return await this.generateContentPiece(n,a||[],s,i,l);case"project":return await this.generateProjectPlan(n,a||[],r,o);case"development":return await this.generateDevelopmentSolution(n,a||[],i);case"strategy":return await this.generateStrategy(n,a||[],s,o);case"analysis":return await this.generateAnalysis(n,a||[],s);default:throw Error(`Unsupported content type: ${t}`)}}catch(e){return console.error("Error generating comprehensive content:",e),{content:[{content:`I apologize, but I encountered an error while generating ${t} content for "${n}". Please try again or contact support.`,hashtags:[`#${t}`,"#Error"],platform:i||"general",type:t}],deliverables:["Error report"],timeline:"Immediate",nextSteps:["Retry request","Contact support"]}}}async generateContentPiece(e,t,n,a,r){return{content:[{content:`# ${e}

Comprehensive content piece covering ${e} with focus on ${t.join(", ")}.

## Overview
Detailed analysis and insights on ${e}.

## Key Points
${t.map(e=>`- ${e}`).join("\n")}

## Conclusion
Actionable takeaways and next steps.`,hashtags:["#Content","#Strategy"],platform:a||"blog",type:"content"}],deliverables:["Content piece","SEO optimization","Distribution plan"],timeline:"7 days",nextSteps:["Content review","Publication","Performance tracking"]}}async generateProjectPlan(e,t,n,a){return{content:[{content:`# Project Plan: ${e}

## Project Overview
Comprehensive project plan for ${e}.

## Requirements
${t.map(e=>`- ${e}`).join("\n")}

## Deliverables
${(n||["Planning document","Implementation guide"]).map(e=>`- ${e}`).join("\n")}

## Timeline
${a||"30 days"}

## Next Steps
- Project kickoff
- Resource allocation
- Implementation tracking`,hashtags:["#ProjectManagement","#Planning"],platform:"documentation",type:"project"}],deliverables:n||["Planning document","Implementation guide","Progress tracking"],timeline:a||"30 days",nextSteps:["Project kickoff","Resource allocation","Implementation tracking"]}}async generateDevelopmentSolution(e,t,n){return{content:[{content:`# Development Solution: ${e}

## Technical Requirements
${t.map(e=>`- ${e}`).join("\n")}

## Architecture
Scalable solution architecture for ${e}.

## Implementation Plan
Step-by-step development approach.

## Code Structure
\`\`\`typescript
// Example implementation
class ${e.replace(/\s+/g,"")}Solution {
  // Implementation details
}
\`\`\``,hashtags:["#Development","#Code"],platform:n||"github",type:"development"}],deliverables:["Technical specification","Code implementation","Testing suite"],timeline:"21 days",nextSteps:["Code review","Testing","Deployment"]}}async generateStrategy(e,t,n,a){return{content:[{content:`# Strategic Plan: ${e}

## Objectives
${t.map(e=>`- ${e}`).join("\n")}

## Target Audience
${n||"stakeholders"}

## Timeline
${a||"90 days"}

## Implementation Strategy
Detailed implementation plan with milestones and success metrics.`,hashtags:["#Strategy","#Planning"],platform:"documentation",type:"strategy"}],deliverables:["Strategic document","Implementation roadmap","Success metrics"],timeline:a||"90 days",nextSteps:["Stakeholder review","Resource allocation","Implementation kickoff"]}}async generateAnalysis(e,t,n){return{content:[{content:`# Analysis Report: ${e}

## Executive Summary
Comprehensive analysis of ${e} based on specified requirements.

## Key Findings
${t.map(e=>`- ${e}`).join("\n")}

## Recommendations
Actionable insights and next steps based on analysis.`,hashtags:["#Analysis","#Research"],platform:"documentation",type:"analysis"}],deliverables:["Analysis report","Data insights","Recommendations"],timeline:"14 days",nextSteps:["Review findings","Implement recommendations","Monitor results"]}}}async function u(e){let{platform:t,title:n,summary:r,url:o,tags:i}=e,l=process.env.LLM_MODE||"off",c=!!process.env.OPENAI_API_KEY&&"off"!==l;if(c){let{text:e}=await m({platform:t,title:n,summary:r,url:o,tags:i});return e.trim()}let p=function(e){let{platform:t,title:n,summary:r,canonicalUrl:o,tags:i}=e,l=a[t],c=(r||n||"").trim(),m=c;m.length>l&&(m=m.slice(0,l-1).trimEnd()+"…");let p=o?`Читать: ${o}`:"",u=s(i||[],t).join(" "),g=[];return g.push(m),p&&g.push(p),u&&g.push(u),g.filter(Boolean).join("\n")}({platform:t,title:n,summary:r,canonicalUrl:o,tags:i||[]});return p.trim()}new p},83207:(e,t,n)=>{"use strict";n.d(t,{E:()=>i,v:()=>s});var a=n(28830);let r=new a.KU({auth:process.env.NOTION_API_KEY}),o=process.env.NOTION_DATABASE_ID;async function s(e=5){if(!o)return[];let t=new Date().toISOString(),n=await r.databases.query({database_id:o,filter:{and:[{property:"Status",select:{equals:"Ready"}},{or:[{property:"Publish At",date:{is_empty:!0}},{property:"Publish At",date:{on_or_before:t}}]}]},sorts:[{property:"Publish At",direction:"ascending"}],page_size:e}),a=[];for(let e of n.results){if(!("properties"in e))continue;let t=e.properties,n=t.Title?.title?.[0]?.plain_text||"",r=t.Summary?.rich_text?.[0]?.plain_text||"",o=t["Canonical URL"]?.url||void 0,s=t["Image URL"]?.url||void 0,i=(t.Tags?.multi_select||[]).map(e=>e.name),l=(t.Platforms?.multi_select||[]).map(e=>e.name),c=t["Publish At"]?.date?.start||void 0;a.push({id:e.id,title:n,summary:r,canonicalUrl:o,imageUrl:s,tags:i,platforms:l,publishAt:c})}return a}async function i(e,t){let n={Status:{select:{name:"Published"}}};t.X&&(n["X Post ID"]={rich_text:[{text:{content:t.X}}]}),t.Facebook&&(n["FB Post ID"]={rich_text:[{text:{content:t.Facebook}}]}),t.Instagram&&(n["IG Media ID"]={rich_text:[{text:{content:t.Instagram}}]}),await r.pages.update({page_id:e,properties:n})}},58159:(e,t,n)=>{"use strict";n.d(t,{u:()=>r});var a=n(27117);async function r(e){let t="true"===process.env.BOT_DRY_RUN;if(t)return console.log(`[DRY] Facebook post:
${e}
`),"dry-run";let n=process.env.FB_PAGE_ID,r=process.env.FB_ACCESS_TOKEN;if(!n||!r)throw Error("Facebook credentials not set");let o=`https://graph.facebook.com/v19.0/${n}/feed`,s=new URLSearchParams;s.append("message",e),s.append("access_token",r);let i=await a.Z.post(o,s);return i.data.id}},54751:(e,t,n)=>{"use strict";n.d(t,{d:()=>r});var a=n(27117);async function r(e,t){let n="true"===process.env.BOT_DRY_RUN;if(n)return console.log(`[DRY] Instagram post:
${e}
image: ${t}`),"dry-run";let r=process.env.IG_BUSINESS_ACCOUNT_ID,o=process.env.IG_ACCESS_TOKEN;if(!r||!o)throw Error("Instagram credentials not set");if(!t)throw Error("Instagram requires an image URL");let s=await a.Z.post(`https://graph.facebook.com/v19.0/${r}/media`,{caption:e,image_url:t,access_token:o}),i=s.data.id;return await a.Z.post(`https://graph.facebook.com/v19.0/${r}/media_publish`,{creation_id:i,access_token:o}),i}},20806:(e,t,n)=>{"use strict";n.d(t,{J:()=>r});var a=n(66907);async function r(e){let t="true"===process.env.BOT_DRY_RUN;if(t)return console.log(`[DRY] X post:
${e}
`),"dry-run";let n=new a.jp({appKey:process.env.TWITTER_APP_KEY,appSecret:process.env.TWITTER_APP_SECRET,accessToken:process.env.TWITTER_ACCESS_TOKEN,accessSecret:process.env.TWITTER_ACCESS_SECRET}),r=await n.v2.tweet(e);return r.data.id}}};