import{r as b,a as re,R as $,B as _,C as W,X as K,Y as I,T as z,L as oe,b as A,P as ie,c as ce,d as de,e as me}from"./charts-B3751tbo.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const x of c.addedNodes)x.tagName==="LINK"&&x.rel==="modulepreload"&&r(x)}).observe(document,{childList:!0,subtree:!0});function m(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(o){if(o.ep)return;o.ep=!0;const c=m(o);fetch(o.href,c)}})();var Z={exports:{}},B={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var pe=b,xe=Symbol.for("react.element"),ue=Symbol.for("react.fragment"),he=Object.prototype.hasOwnProperty,ge=pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,fe={key:!0,ref:!0,__self:!0,__source:!0};function ee(t,a,m){var r,o={},c=null,x=null;m!==void 0&&(c=""+m),a.key!==void 0&&(c=""+a.key),a.ref!==void 0&&(x=a.ref);for(r in a)he.call(a,r)&&!fe.hasOwnProperty(r)&&(o[r]=a[r]);if(t&&t.defaultProps)for(r in a=t.defaultProps,a)o[r]===void 0&&(o[r]=a[r]);return{$$typeof:xe,type:t,key:c,ref:x,props:o,_owner:ge.current}}B.Fragment=ue;B.jsx=ee;B.jsxs=ee;Z.exports=B;var e=Z.exports,P={},H=re;P.createRoot=H.createRoot,P.hydrateRoot=H.hydrateRoot;const J={async get(t){const a=localStorage.getItem(t);return a==null?null:{key:t,value:a}},async set(t,a){return localStorage.setItem(t,a),{key:t,value:a}},async delete(t){return localStorage.removeItem(t),{key:t,deleted:!0}}},E=[{id:"food",label:"식비",emoji:"🍚",color:"#C4554D"},{id:"cafe",label:"카페·간식",emoji:"☕",color:"#D98E48"},{id:"transport",label:"교통",emoji:"🚌",color:"#3F7CAC"},{id:"shopping",label:"쇼핑",emoji:"🛍️",color:"#9A6FB0"},{id:"housing",label:"주거·공과금",emoji:"🏠",color:"#5B8C5A"},{id:"leisure",label:"문화·여가",emoji:"🎬",color:"#E0A526"},{id:"health",label:"의료·건강",emoji:"💊",color:"#4FA3A5"},{id:"etc",label:"기타",emoji:"📦",color:"#8A8F98"}],L=[{id:"salary",label:"급여",emoji:"💼",color:"#1B6E53"},{id:"side",label:"부수입",emoji:"🌱",color:"#3F8F6B"},{id:"allowance",label:"용돈",emoji:"🎁",color:"#6BAF92"},{id:"etc_in",label:"기타수입",emoji:"✨",color:"#8A8F98"}],te=[...E,...L],V=t=>te.find(a=>a.id===t)||{id:t,label:t,emoji:"❓",color:"#999"},be=(t,a)=>(a==="income"?L:E).find(r=>r.id===t||r.label===t)||te.find(r=>r.id===t||r.label===t)||(a==="income"?L[3]:E[7]),u=t=>"₩"+Math.round(Math.abs(t)).toLocaleString("ko-KR"),Y=t=>(t<0?"−":"+")+u(t),D=()=>{const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`},S=t=>t.slice(0,7),je=(t,a)=>new Date(t,a,0).getDate(),se=["일","월","화","수","목","금","토"],X="mind-ledger:v1",R={transactions:[],budget:{total:1e6,perCat:{}},goal:{amount:0}},q=t=>`"${String(t??"").replace(/"/g,'""')}"`;function ve(t){const a="date,type,category,amount,memo",m=[...t].sort((r,o)=>r.date<o.date?-1:1).map(r=>[r.date,r.type,q(V(r.category).label),r.amount,q(r.memo||"")].join(","));return"\uFEFF"+[a,...m].join(`
`)}function ye(t){const a=[];let m="",r=!1;for(let o=0;o<t.length;o++){const c=t[o];r?c==='"'?t[o+1]==='"'?(m+='"',o++):r=!1:m+=c:c==='"'?r=!0:c===","?(a.push(m),m=""):m+=c}return a.push(m),a.map(o=>o.trim())}function Ne(t){const a=t.replace(/^\uFEFF/,"").split(/\r?\n/).filter(r=>r.trim()),m={txs:[],skipped:0};for(const r of a){const o=ye(r);if(o.length<4){m.skipped++;continue}const[c,x,j,p,h=""]=o;if(/date|날짜/i.test(c))continue;const n=c.replace(/[./]/g,"-").slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(n)){m.skipped++;continue}const d=/^(income|수입|입금)$/i.test(x)?"income":/^(expense|지출|출금)$/i.test(x)?"expense":null;if(!d){m.skipped++;continue}const s=Math.abs(parseInt(String(p).replace(/[^\d-]/g,""),10));if(!s){m.skipped++;continue}m.txs.push({id:Date.now()+"-"+Math.random().toString(36).slice(2,8),date:n,type:d,amount:s,category:be(j,d).id,memo:h})}return m}function we(){const[t,a]=b.useState(null),[m,r]=b.useState("home"),[o,c]=b.useState("idle"),[x,j]=b.useState(null),[p,h]=b.useState(!1),n=b.useRef(null);b.useEffect(()=>{(async()=>{try{const g=await J.get(X),y=g?JSON.parse(g.value):R;a({...R,...y,goal:{...R.goal,...y.goal||{}}})}catch{a(R)}})()},[]);const d=async g=>{a(g),c("saving");try{await J.set(X,JSON.stringify(g)),c("saved"),setTimeout(()=>c("idle"),1200)}catch{c("error")}},s=(g,y="expense")=>{clearTimeout(n.current),j({msg:g,tone:y}),n.current=setTimeout(()=>j(null),2600)},i=g=>{const y=S(D()),N=g.transactions.filter(k=>S(k.date)===y),C=N.filter(k=>k.type==="expense").reduce((k,T)=>k+T.amount,0),F=N.filter(k=>k.type==="income").reduce((k,T)=>k+T.amount,0),M=g.budget.total-C,O=new Date,G=je(O.getFullYear(),O.getMonth()+1),le=G-O.getDate()+1;return{txs:N,spent:C,income:F,remaining:M,daysLeft:le,dim:G,mk:y}},l=g=>{const y={...t,transactions:[g,...t.transactions]};d(y);const N=i(y).remaining;s(g.type==="expense"?`−${u(g.amount)} 기록됨 · 이번 달 남은 돈 ${u(Math.max(N,0))}`:`+${u(g.amount)} 들어옴 · 잘 챙겼어요`,g.type)},f=g=>d({...t,transactions:t.transactions.filter(y=>y.id!==g)}),v=g=>d({...t,budget:g}),w=g=>d({...t,goal:g}),ne=()=>{if(t.transactions.length===0){s("내보낼 기록이 없어요");return}const g=new Blob([ve(t.transactions)],{type:"text/csv;charset=utf-8"}),y=URL.createObjectURL(g),N=document.createElement("a");N.href=y,N.download=`마음가계부_${D()}.csv`,document.body.appendChild(N),N.click(),N.remove(),URL.revokeObjectURL(y),s(`${t.transactions.length}건 CSV로 내보냈어요`,"income")},ae=(g,y)=>{const N=new FileReader;N.onload=()=>{const{txs:C,skipped:F}=Ne(String(N.result||""));if(C.length===0){s(`가져올 수 있는 행이 없어요${F?` (${F}행 건너뜀)`:""}`);return}const M=y==="replace"?[]:t.transactions;d({...t,transactions:[...C,...M]}),s(`${C.length}건 가져옴${F?` · ${F}행 건너뜀`:""}${y==="replace"?" (기존 기록 대체)":""}`,"income")},N.onerror=()=>s("파일을 읽지 못했어요"),N.readAsText(g,"utf-8")};if(!t)return e.jsxs("div",{className:"ml-root",children:[e.jsx(Q,{}),e.jsx("div",{className:"ml-loading",children:"장부를 펼치는 중…"})]});const U=i(t);return e.jsxs("div",{className:"ml-root",children:[e.jsx(Q,{}),e.jsxs("header",{className:"ml-header",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"ml-title",children:"마음 가계부"}),e.jsx("p",{className:"ml-sub",children:"덜 쓰게 만드는 건 의지가 아니라 설계예요"})]}),e.jsxs("div",{className:"ml-header-right",children:[e.jsx("span",{className:`ml-save ml-save-${o}`,children:o==="saving"?"저장 중":o==="saved"?"저장됨 ✓":o==="error"?"저장 실패":""}),e.jsx("button",{className:"ml-gear","aria-label":"설정",title:"설정",onClick:()=>h(!0),children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3.2"}),e.jsx("path",{d:"M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01A1.7 1.7 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"})]})})]})]}),x&&e.jsx("div",{className:`ml-flash ml-flash-${x.tone}`,children:x.msg}),e.jsx("nav",{className:"ml-tabs",role:"tablist",children:[["home","오늘"],["history","내역"],["insight","분석"]].map(([g,y])=>e.jsx("button",{role:"tab","aria-selected":m===g,className:`ml-tab ${m===g?"on":""}`,onClick:()=>r(g),children:y},g))}),m==="home"&&e.jsx(ke,{M:U,data:t,addTx:l,setBudget:v,setGoal:w}),m==="history"&&e.jsx(Ee,{data:t,removeTx:f}),m==="insight"&&e.jsx($e,{data:t,M:U}),p&&e.jsx(Fe,{onClose:()=>h(!1),exportCSV:ne,importCSV:ae,txCount:t.transactions.length,clearAll:()=>d({...t,transactions:[]})}),e.jsx("footer",{className:"ml-foot",children:"데이터는 이 기기의 브라우저에만 저장됩니다 · 백업은 ⚙ → CSV 내보내기"})]})}function ke({M:t,data:a,addTx:m,setBudget:r,setGoal:o}){const c=t.remaining>0?Math.floor(t.remaining/t.daysLeft):0,x=Math.min(Math.max(t.remaining/(a.budget.total||1),0),1),j=x<.2,p=t.txs.filter(h=>h.type==="expense"&&h.date===D()).reduce((h,n)=>h+n.amount,0);return e.jsxs("div",{className:"ml-stack",children:[e.jsxs("section",{className:`ml-hero ${j?"danger":""}`,children:[e.jsx("span",{className:"ml-eyebrow",children:"이번 달 남은 돈"}),e.jsx("div",{className:"ml-big",children:t.remaining>=0?u(t.remaining):`−${u(t.remaining)}`}),e.jsx("div",{className:"ml-gauge","aria-hidden":"true",children:e.jsx("div",{className:"ml-gauge-fill",style:{width:`${x*100}%`}})}),e.jsxs("div",{className:"ml-hero-row",children:[e.jsxs("span",{children:["예산 ",u(a.budget.total)]}),e.jsxs("span",{children:["지출 ",u(t.spent)]}),e.jsxs("span",{children:[t.daysLeft,"일 남음"]})]}),e.jsxs("div",{className:"ml-daily",children:[e.jsxs("strong",{children:["하루 ",u(c)]}),"씩 쓸 수 있어요",p>0&&e.jsxs("span",{className:p>c?"over":"ok",children:[" · 오늘 ",u(p),p>c?" (오늘치 초과)":" 사용"]})]}),e.jsxs("p",{className:"ml-why",children:["쓴 돈이 아니라 ",e.jsx("b",{children:"남은 돈"}),"을 먼저 보여주는 이유 — 사람은 같은 금액이라도 잃는 쪽에 약 2배 민감해요(손실 회피). 줄어드는 게 보이면 손이 한 번 멈춥니다."]})]}),e.jsx(De,{addTx:m}),e.jsx(Se,{M:t,data:a,setGoal:o}),e.jsx(Ce,{M:t,data:a,setBudget:r})]})}function Se({M:t,data:a,setGoal:m}){const[r,o]=b.useState(!1),[c,x]=b.useState(a.goal.amount||""),j=a.goal.amount||0,p=t.income-t.spent,h=j>0?Math.min(Math.max(p/j,0),1):0,n=j-p,d=n>0&&t.daysLeft>0?Math.ceil(n/t.daysLeft):0,s=()=>{m({amount:Math.max(parseInt(c,10)||0,0)}),o(!1)};return e.jsxs("section",{className:"ml-card",children:[e.jsxs("div",{className:"ml-card-head",children:[e.jsxs("h2",{children:["이번 달 저축 목표 ",e.jsx("span",{className:"ml-tag",children:"목표 구배"})]}),e.jsx("button",{className:"ml-ghost",onClick:()=>{x(a.goal.amount||""),o(!r)},children:r?"닫기":j>0?"목표 수정":"목표 정하기"})]}),r?e.jsxs("div",{className:"ml-edit",children:[e.jsxs("label",{className:"ml-edit-row",children:[e.jsx("span",{children:"월 저축 목표"}),e.jsx("input",{className:"ml-input",type:"number",inputMode:"numeric",placeholder:"예: 300000",value:c,onChange:i=>x(i.target.value),onKeyDown:i=>i.key==="Enter"&&s()})]}),e.jsx("button",{className:"ml-submit income",onClick:s,children:"목표 저장"})]}):j===0?e.jsxs("p",{className:"ml-empty",children:["목표가 구체적인 숫자가 되면 행동이 따라와요.",e.jsx("br",{}),'"많이 모으자"보다 "이번 달 30만원"이 강합니다.']}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"ml-goal-row",children:[e.jsxs("div",{className:"ml-goal-num",children:[e.jsx("span",{className:"ml-goal-saved",children:p>=0?u(p):`−${u(p)}`}),e.jsxs("span",{className:"ml-goal-of",children:[" / ",u(j)]})]}),e.jsxs("span",{className:"ml-goal-pct",children:[Math.round(h*100),"%"]})]}),e.jsx("div",{className:"ml-bar ml-bar-lg",children:e.jsx("div",{className:"ml-bar-fill",style:{width:`${h*100}%`,background:h>=1?"#1B6E53":h>=.7?"#3F8F6B":"#6BAF92"}})}),e.jsx("p",{className:"ml-goal-msg",children:h>=1?"🎉 목표 달성! 초과분은 다음 달 목표를 올릴 근거가 돼요.":p<0?"이번 달은 아직 지출이 수입보다 많아요. 남은 기간 동안 만회할 수 있습니다.":h>=.7?`목표까지 ${u(n)} — 거의 다 왔어요. 사람은 목표에 가까울수록 속도가 붙어요(목표 구배). 이 구간을 이용하세요.`:`목표까지 ${u(n)} · 남은 ${t.daysLeft}일 동안 하루 ${u(d)}씩 아끼면 닿아요.`})]})]})}function De({addTx:t}){const[a,m]=b.useState("expense"),[r,o]=b.useState(""),[c,x]=b.useState("food"),[j,p]=b.useState(""),[h,n]=b.useState(D()),d=a==="expense"?E:L;b.useEffect(()=>{x(a==="expense"?"food":"salary")},[a]);const s=l=>o(String((parseInt(r||"0",10)||0)+l)),i=()=>{const l=parseInt(r,10);!l||l<=0||(t({id:Date.now()+"-"+Math.random().toString(36).slice(2,7),type:a,amount:l,category:c,memo:j.trim(),date:h}),o(""),p(""))};return e.jsxs("section",{className:"ml-card",children:[e.jsxs("div",{className:"ml-card-head",children:[e.jsx("h2",{children:"빠른 기록"}),e.jsxs("div",{className:"ml-seg",children:[e.jsx("button",{className:a==="expense"?"on exp":"",onClick:()=>m("expense"),children:"지출"}),e.jsx("button",{className:a==="income"?"on inc":"",onClick:()=>m("income"),children:"수입"})]})]}),e.jsxs("div",{className:"ml-amount-row",children:[e.jsx("input",{className:"ml-amount",type:"number",inputMode:"numeric",placeholder:"0",value:r,onChange:l=>o(l.target.value),onKeyDown:l=>l.key==="Enter"&&i(),"aria-label":"금액"}),e.jsx("span",{className:"ml-won",children:"원"})]}),e.jsxs("div",{className:"ml-bumps",children:[[1e3,5e3,1e4,5e4].map(l=>e.jsxs("button",{onClick:()=>s(l),children:["+",l.toLocaleString()]},l)),e.jsx("button",{onClick:()=>o(""),children:"지움"})]}),e.jsx("div",{className:"ml-chips",children:d.map(l=>e.jsxs("button",{className:`ml-chip ${c===l.id?"on":""}`,style:c===l.id?{borderColor:l.color,background:l.color+"1A",color:"#1c2421"}:{},onClick:()=>x(l.id),children:[l.emoji," ",l.label]},l.id))}),e.jsxs("div",{className:"ml-row2",children:[e.jsx("input",{className:"ml-input",placeholder:"메모 (선택)",value:j,onChange:l=>p(l.target.value),onKeyDown:l=>l.key==="Enter"&&i()}),e.jsx("input",{className:"ml-input ml-date",type:"date",value:h,onChange:l=>n(l.target.value)})]}),e.jsx("button",{className:`ml-submit ${a}`,onClick:i,disabled:!r,children:a==="expense"?"지출 기록하기":"수입 기록하기"})]})}function Ce({M:t,data:a,setBudget:m}){const[r,o]=b.useState(!1),[c,x]=b.useState(a.budget.total),[j,p]=b.useState(a.budget.perCat||{}),h={};t.txs.filter(s=>s.type==="expense").forEach(s=>{h[s.category]=(h[s.category]||0)+s.amount});const n=E.map(s=>{var i;return{...s,budget:((i=a.budget.perCat)==null?void 0:i[s.id])||0,spent:h[s.id]||0}}).filter(s=>s.budget>0||s.spent>0),d=()=>{const s={};Object.entries(j).forEach(([i,l])=>{const f=parseInt(l,10);f>0&&(s[i]=f)}),m({total:parseInt(c,10)||0,perCat:s}),o(!1)};return e.jsxs("section",{className:"ml-card",children:[e.jsxs("div",{className:"ml-card-head",children:[e.jsxs("h2",{children:["봉투 예산 ",e.jsx("span",{className:"ml-tag",children:"멘탈 어카운팅"})]}),e.jsx("button",{className:"ml-ghost",onClick:()=>{x(a.budget.total),p(a.budget.perCat||{}),o(!r)},children:r?"닫기":"예산 설정"})]}),e.jsx("p",{className:"ml-hint",children:'돈에 칸막이를 만들면 "전체에서 조금"이 아니라 "이 봉투에서 크게" 나가는 게 보여요.'}),r?e.jsxs("div",{className:"ml-edit",children:[e.jsxs("label",{className:"ml-edit-row",children:[e.jsx("span",{children:"월 전체 예산"}),e.jsx("input",{className:"ml-input",type:"number",value:c,onChange:s=>x(s.target.value)})]}),E.map(s=>e.jsxs("label",{className:"ml-edit-row",children:[e.jsxs("span",{children:[s.emoji," ",s.label]}),e.jsx("input",{className:"ml-input",type:"number",placeholder:"0",value:j[s.id]??"",onChange:i=>p({...j,[s.id]:i.target.value})})]},s.id)),e.jsx("button",{className:"ml-submit expense",onClick:d,children:"예산 저장"})]}):n.length===0?e.jsx("p",{className:"ml-empty",children:'아직 봉투가 비어 있어요. "예산 설정"으로 카테고리별 한도를 정해보세요.'}):e.jsx("div",{className:"ml-envs",children:n.map(s=>{const i=s.budget>0?Math.min(s.spent/s.budget,1):0,l=s.budget>0&&s.spent>s.budget;return e.jsxs("div",{className:"ml-env",children:[e.jsxs("div",{className:"ml-env-top",children:[e.jsxs("span",{children:[s.emoji," ",s.label]}),e.jsxs("span",{className:l?"over":"",children:[u(s.spent),s.budget>0&&` / ${u(s.budget)}`,l&&" 초과!"]})]}),s.budget>0&&e.jsx("div",{className:"ml-bar",children:e.jsx("div",{className:"ml-bar-fill",style:{width:`${i*100}%`,background:l?"#C4554D":i>.8?"#E0A526":s.color}})})]},s.id)})})]})}function Fe({onClose:t,exportCSV:a,importCSV:m,txCount:r,clearAll:o}){const c=b.useRef(null),x=b.useRef("append"),[j,p]=b.useState(!1),h=d=>{var s;x.current=d,(s=c.current)==null||s.click()},n=d=>{var i;const s=(i=d.target.files)==null?void 0:i[0];s&&(m(s,x.current),t()),d.target.value=""};return e.jsx("div",{className:"ml-overlay",onClick:t,children:e.jsxs("div",{className:"ml-sheet",role:"dialog","aria-label":"설정",onClick:d=>d.stopPropagation(),children:[e.jsxs("div",{className:"ml-sheet-head",children:[e.jsx("h2",{children:"설정"}),e.jsx("button",{className:"ml-del ml-sheet-close","aria-label":"닫기",onClick:t,children:"×"})]}),e.jsxs("div",{className:"ml-set-group",children:[e.jsx("h3",{children:"CSV 백업·복원"}),e.jsx("p",{className:"ml-hint",children:"형식: date, type(지출/수입), category, amount, memo — 엑셀에서 바로 열립니다."}),e.jsxs("div",{className:"ml-csv-btns",children:[e.jsxs("button",{className:"ml-csv-btn",onClick:()=>{a()},children:["⬇ CSV 내보내기 ",e.jsxs("span",{className:"ml-cnt",children:["(",r,"건)"]})]}),e.jsx("button",{className:"ml-csv-btn",onClick:()=>h("append"),children:"⬆ 가져오기 (추가)"}),e.jsx("button",{className:"ml-csv-btn warn",onClick:()=>h("replace"),children:"⬆ 가져오기 (전체 교체)"})]}),e.jsx("input",{ref:c,type:"file",accept:".csv,text/csv",style:{display:"none"},onChange:n})]}),e.jsxs("div",{className:"ml-set-group",children:[e.jsx("h3",{children:"데이터 관리"}),e.jsx("p",{className:"ml-hint",children:"삭제 전에 위에서 CSV로 내보내 두는 걸 권장해요."}),j?e.jsxs("div",{className:"ml-csv-btns",children:[e.jsxs("button",{className:"ml-csv-btn warn",onClick:()=>{o(),p(!1),t()},children:["정말 삭제 (",r,"건 모두)"]}),e.jsx("button",{className:"ml-csv-btn",onClick:()=>p(!1),children:"취소"})]}):e.jsx("button",{className:"ml-csv-btn warn",onClick:()=>p(!0),disabled:r===0,children:"기록 전체 삭제"})]})]})})}function Ee({data:t,removeTx:a}){const[m,r]=b.useState(S(D())),[o,c]=m.split("-").map(Number),x=s=>{const i=new Date(o,c-1+s,1);r(`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}`)},j=m===S(D()),p=b.useMemo(()=>t.transactions.filter(s=>S(s.date)===m),[t.transactions,m]),h=p.filter(s=>s.type==="income").reduce((s,i)=>s+i.amount,0),n=p.filter(s=>s.type==="expense").reduce((s,i)=>s+i.amount,0),d=b.useMemo(()=>{const s={};return[...p].sort((i,l)=>i.date<l.date?1:-1).forEach(i=>{(s[i.date]=s[i.date]||[]).push(i)}),Object.entries(s)},[p]);return e.jsxs("div",{className:"ml-stack",children:[e.jsxs("section",{className:"ml-card ml-month-nav-card",children:[e.jsxs("div",{className:"ml-month-nav",children:[e.jsx("button",{className:"ml-nav-btn","aria-label":"이전 달",onClick:()=>x(-1),children:"◀"}),e.jsxs("span",{className:"ml-month-label",children:[o,"년 ",c,"월"]}),e.jsx("button",{className:"ml-nav-btn","aria-label":"다음 달",onClick:()=>x(1),disabled:j,children:"▶"})]}),e.jsxs("div",{className:"ml-month-sum",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ml-sum-label",children:"수입"}),e.jsxs("span",{className:"pos",children:["+",u(h)]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"ml-sum-label",children:"지출"}),e.jsxs("span",{className:"neg",children:["−",u(n)]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"ml-sum-label",children:"순액"}),e.jsx("span",{className:h-n>=0?"pos":"neg",children:Y(h-n)})]})]}),!j&&e.jsx("button",{className:"ml-ghost ml-today-btn",onClick:()=>r(S(D())),children:"이번 달로"})]}),d.length===0?e.jsxs("p",{className:"ml-empty ml-card",children:[o,"년 ",c,"월에는 기록이 없어요.",j&&' "오늘" 탭에서 첫 기록을 남겨보세요.']}):d.map(([s,i])=>{const l=new Date(s+"T00:00:00"),f=i.reduce((v,w)=>v+(w.type==="expense"?-w.amount:w.amount),0);return e.jsxs("section",{className:"ml-card",children:[e.jsxs("div",{className:"ml-day-head",children:[e.jsxs("span",{children:[l.getDate(),"일 (",se[l.getDay()],")"]}),e.jsx("span",{className:f<0?"neg":"pos",children:Y(f)})]}),i.map(v=>{const w=V(v.category);return e.jsxs("div",{className:"ml-tx",children:[e.jsx("span",{className:"ml-tx-emoji",style:{background:w.color+"22"},children:w.emoji}),e.jsxs("div",{className:"ml-tx-mid",children:[e.jsx("span",{className:"ml-tx-cat",children:w.label}),v.memo&&e.jsx("span",{className:"ml-tx-memo",children:v.memo})]}),e.jsxs("span",{className:`ml-tx-amt ${v.type}`,children:[v.type==="expense"?"−":"+",u(v.amount)]}),e.jsx("button",{className:"ml-del","aria-label":"삭제",onClick:()=>a(v.id),children:"×"})]},v.id)})]},s)})]})}function $e({data:t,M:a}){const m=a.txs.filter(n=>n.type==="expense"),r=b.useMemo(()=>{const n={};return m.forEach(d=>n[d.category]=(n[d.category]||0)+d.amount),Object.entries(n).map(([d,s])=>({...V(d),value:s})).sort((d,s)=>s.value-d.value)},[a.txs]),o=b.useMemo(()=>{const n=[],d=new Date;for(let s=5;s>=0;s--){const i=new Date(d.getFullYear(),d.getMonth()-s,1),l=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}`,f=t.transactions.filter(v=>S(v.date)===l);n.push({name:`${i.getMonth()+1}월`,mk:l,지출:f.filter(v=>v.type==="expense").reduce((v,w)=>v+w.amount,0),수입:f.filter(v=>v.type==="income").reduce((v,w)=>v+w.amount,0)})}return n},[t.transactions]),c=b.useMemo(()=>{const n=new Date,d=n.getDate(),s=new Date(n.getFullYear(),n.getMonth()-1,1),i=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}`;return{prevSpent:t.transactions.filter(f=>f.type==="expense"&&S(f.date)===i&&parseInt(f.date.slice(8,10),10)<=d).reduce((f,v)=>f+v.amount,0),day:d,hasPrev:t.transactions.some(f=>S(f.date)===i)}},[t.transactions]),x=b.useMemo(()=>{const n=[];for(let d=13;d>=0;d--){const s=new Date;s.setDate(s.getDate()-d);const i=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,l=t.transactions.filter(f=>f.type==="expense"&&f.date===i).reduce((f,v)=>f+v.amount,0);n.push({name:`${s.getDate()}일`,지출:l})}return n},[t.transactions]),j=b.useMemo(()=>{const n=Array(7).fill(0),d=Array(7).fill(0),s=new Set;return t.transactions.filter(i=>i.type==="expense").forEach(i=>{const l=new Date(i.date+"T00:00:00").getDay();n[l]+=i.amount,s.has(i.date)||(s.add(i.date),d[l]++)}),se.map((i,l)=>({name:i,평균:d[l]?Math.round(n[l]/d[l]):0}))},[t.transactions]),p=[];if(m.length>0){const n=m.reduce((l,f)=>l+f.amount,0),d=r[0];if(p.push(`이번 달 지출의 ${Math.round(d.value/n*100)}%가 ${d.emoji} ${d.label}예요. 줄일 곳을 하나만 고른다면 여기부터.`),c.hasPrev){const l=a.spent-c.prevSpent;(c.prevSpent>0||a.spent>0)&&p.push(l<=0?`지난달 ${c.day}일까지보다 ${u(l)} 덜 썼어요. 월말 합계가 아니라 같은 시점끼리 비교해야 공정한 비교예요.`:`지난달 ${c.day}일까지보다 ${u(l)} 더 썼어요. 아직 ${a.daysLeft}일 남았으니 방향을 바꿀 시간은 충분해요.`)}const s=j.reduce((l,f)=>f.평균>l.평균?f:l);s.평균>0&&p.push(`${s.name}요일에 평균 ${u(s.평균)}로 가장 많이 써요. 그날만 미리 한도를 정해두면 효과가 커요.`);const i=m.filter(l=>l.amount<=1e4);if(i.length>=5){const l=i.reduce((f,v)=>f+v.amount,0);p.push(`1만원 이하 소액 지출이 ${i.length}건, 합치면 ${u(l)}. 작아서 안 보이던 돈이 모이면 이만큼이에요.`)}a.remaining<0&&p.push(`예산을 ${u(a.remaining)} 넘었어요. 자책보다 다음 달 예산을 현실에 맞게 조정하는 게 지속에 유리해요.`)}if(t.transactions.length===0)return e.jsx("p",{className:"ml-empty ml-card",children:"기록이 쌓이면 여기서 소비 패턴을 보여드릴게요."});const h=o.filter(n=>n.지출>0||n.수입>0).length>=2;return e.jsxs("div",{className:"ml-stack",children:[p.length>0&&e.jsxs("section",{className:"ml-card",children:[e.jsxs("h2",{children:["이번 달 핵심 한 줄 ",e.jsx("span",{className:"ml-tag",children:"청킹"})]}),e.jsx("ul",{className:"ml-insights",children:p.map((n,d)=>e.jsx("li",{children:n},d))})]}),e.jsxs("section",{className:"ml-card",children:[e.jsx("h2",{children:"월별 비교 (최근 6개월)"}),!h&&e.jsx("p",{className:"ml-hint",children:"두 달 이상 기록이 쌓이면 추세가 보이기 시작해요."}),e.jsx("div",{className:"ml-chart",children:e.jsx($,{width:"100%",height:200,children:e.jsxs(_,{data:o,children:[e.jsx(W,{strokeDasharray:"3 3",stroke:"#e3e7e4"}),e.jsx(K,{dataKey:"name",tick:{fontSize:12}}),e.jsx(I,{tick:{fontSize:10},width:50,tickFormatter:n=>n>=1e4?`${Math.round(n/1e4)}만`:n}),e.jsx(z,{formatter:n=>u(n)}),e.jsx(oe,{wrapperStyle:{fontSize:12}}),e.jsx(A,{dataKey:"수입",fill:"#1B6E53",radius:[4,4,0,0]}),e.jsx(A,{dataKey:"지출",fill:"#C4554D",radius:[4,4,0,0]})]})})}),e.jsx("div",{className:"ml-month-table",children:o.filter(n=>n.지출>0||n.수입>0).map(n=>e.jsxs("div",{className:"ml-month-row",children:[e.jsx("span",{children:n.name}),e.jsxs("span",{className:"pos",children:["+",u(n.수입)]}),e.jsxs("span",{className:"neg",children:["−",u(n.지출)]}),e.jsxs("span",{className:n.수입-n.지출>=0?"pos":"neg",children:["순 ",Y(n.수입-n.지출)]})]},n.mk))})]}),r.length>0&&e.jsxs("section",{className:"ml-card",children:[e.jsx("h2",{children:"어디에 쓰고 있나"}),e.jsx("div",{className:"ml-chart",children:e.jsx($,{width:"100%",height:220,children:e.jsxs(ie,{children:[e.jsx(ce,{data:r,dataKey:"value",nameKey:"label",innerRadius:55,outerRadius:85,paddingAngle:2,children:r.map(n=>e.jsx(de,{fill:n.color},n.id))}),e.jsx(z,{formatter:n=>u(n)})]})})}),e.jsx("div",{className:"ml-legend",children:r.map(n=>e.jsxs("span",{children:[e.jsx("i",{style:{background:n.color}})," ",n.label," ",u(n.value)]},n.id))})]}),e.jsxs("section",{className:"ml-card",children:[e.jsx("h2",{children:"최근 14일 흐름"}),e.jsx("div",{className:"ml-chart",children:e.jsx($,{width:"100%",height:180,children:e.jsxs(_,{data:x,children:[e.jsx(W,{strokeDasharray:"3 3",stroke:"#e3e7e4"}),e.jsx(K,{dataKey:"name",tick:{fontSize:11},interval:1}),e.jsx(I,{tick:{fontSize:10},width:50,tickFormatter:n=>n>=1e4?`${n/1e4}만`:n}),e.jsx(z,{formatter:n=>u(n)}),e.jsx(A,{dataKey:"지출",fill:"#1B4D3E",radius:[4,4,0,0]})]})})})]}),e.jsxs("section",{className:"ml-card",children:[e.jsx("h2",{children:"요일별 평균 지출"}),e.jsx("p",{className:"ml-hint",children:'패턴이 보이면 의지 대신 "그 요일의 규칙"으로 대응할 수 있어요.'}),e.jsx("div",{className:"ml-chart",children:e.jsx($,{width:"100%",height:160,children:e.jsxs(_,{data:j,children:[e.jsx(K,{dataKey:"name",tick:{fontSize:12}}),e.jsx(I,{hide:!0}),e.jsx(z,{formatter:n=>u(n)}),e.jsx(A,{dataKey:"평균",fill:"#3F7CAC",radius:[4,4,0,0]})]})})})]})]})}function Q(){return e.jsx("style",{children:`
      .ml-root {
        --ink:#1C2421; --paper:#F2F5F3; --card:#FFFFFF;
        --green:#1B4D3E; --red:#C4554D; --amber:#E0A526; --mut:#6B7570;
        max-width:560px; margin:0 auto; padding:20px 16px 40px;
        font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif;
        color:var(--ink); background:var(--paper); min-height:100vh;
        box-sizing:border-box;
      }
      .ml-root *{box-sizing:border-box}
      .ml-loading{padding:80px 0;text-align:center;color:var(--mut)}
      .ml-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
      .ml-title{font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px}
      .ml-sub{margin:2px 0 0;font-size:12px;color:var(--mut)}
      .ml-save{font-size:11px;color:var(--mut);min-height:14px}
      .ml-save-error{color:var(--red)}

      .ml-flash{position:sticky;top:8px;z-index:10;margin-bottom:10px;
        padding:10px 14px;border-radius:12px;font-size:13px;font-weight:600;
        animation:mlPop .25s ease;box-shadow:0 6px 18px rgba(0,0,0,.12)}
      .ml-flash-expense{background:var(--ink);color:#fff}
      .ml-flash-income{background:var(--green);color:#fff}
      @keyframes mlPop{from{transform:translateY(-6px);opacity:0}to{transform:none;opacity:1}}
      @media (prefers-reduced-motion: reduce){.ml-flash{animation:none}}

      .ml-tabs{display:flex;gap:6px;margin-bottom:14px}
      .ml-tab{flex:1;padding:9px 0;border:1px solid #DDE3DF;border-radius:999px;
        background:var(--card);font-size:14px;font-weight:600;color:var(--mut);cursor:pointer}
      .ml-tab.on{background:var(--ink);color:#fff;border-color:var(--ink)}
      .ml-tab:focus-visible,.ml-root button:focus-visible{outline:2px solid var(--green);outline-offset:2px}

      .ml-stack{display:flex;flex-direction:column;gap:14px}
      .ml-card{background:var(--card);border-radius:16px;padding:16px;border:1px solid #E5EAE7}
      .ml-card h2{font-size:15px;margin:0 0 6px;font-weight:700}
      .ml-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
      .ml-tag{font-size:10px;font-weight:600;color:var(--green);background:#1B4D3E14;
        padding:2px 7px;border-radius:999px;vertical-align:2px}
      .ml-hint{font-size:12px;color:var(--mut);margin:0 0 10px;line-height:1.5}
      .ml-empty{font-size:13px;color:var(--mut);text-align:center;padding:18px 8px;line-height:1.6}
      .ml-ghost{border:1px solid #DDE3DF;background:none;border-radius:999px;
        padding:5px 12px;font-size:12px;cursor:pointer;color:var(--ink);flex-shrink:0}

      /* 히어로 */
      .ml-hero{background:linear-gradient(160deg,#1B4D3E,#143A30);color:#fff;
        border-radius:20px;padding:20px 18px}
      .ml-hero.danger{background:linear-gradient(160deg,#7C3A34,#5E2B26)}
      .ml-eyebrow{font-size:12px;opacity:.8;letter-spacing:.5px}
      .ml-big{font-size:38px;font-weight:800;letter-spacing:-1px;margin:4px 0 10px;
        font-variant-numeric:tabular-nums}
      .ml-gauge{height:10px;background:rgba(255,255,255,.18);border-radius:999px;overflow:hidden}
      .ml-gauge-fill{height:100%;background:#fff;border-radius:999px;transition:width .5s ease}
      .ml-hero-row{display:flex;justify-content:space-between;font-size:12px;opacity:.85;margin-top:8px}
      .ml-daily{margin-top:12px;font-size:14px}
      .ml-daily strong{font-size:16px}
      .ml-daily .over{color:#FFD2CC;font-weight:600}
      .ml-daily .ok{opacity:.85}
      .ml-why{margin:12px 0 0;font-size:11.5px;line-height:1.6;opacity:.75;
        border-top:1px solid rgba(255,255,255,.15);padding-top:10px}

      /* 저축 목표 */
      .ml-goal-row{display:flex;justify-content:space-between;align-items:baseline;margin:6px 0 8px}
      .ml-goal-saved{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}
      .ml-goal-of{font-size:14px;color:var(--mut)}
      .ml-goal-pct{font-size:18px;font-weight:800;color:var(--green)}
      .ml-bar-lg{height:14px}
      .ml-goal-msg{margin:10px 0 0;font-size:13px;line-height:1.6;color:var(--ink)}

      /* 빠른 입력 */
      .ml-seg{display:flex;border:1px solid #DDE3DF;border-radius:999px;overflow:hidden}
      .ml-seg button{border:none;background:none;padding:6px 14px;font-size:13px;
        font-weight:600;color:var(--mut);cursor:pointer}
      .ml-seg button.on.exp{background:var(--red);color:#fff}
      .ml-seg button.on.inc{background:var(--green);color:#fff}
      .ml-amount-row{display:flex;align-items:baseline;gap:6px;margin:10px 0 6px}
      .ml-amount{flex:1;border:none;border-bottom:2px solid #DDE3DF;background:none;
        font-size:32px;font-weight:800;width:100%;padding:4px 2px;color:var(--ink);
        font-variant-numeric:tabular-nums}
      .ml-amount:focus{outline:none;border-bottom-color:var(--green)}
      .ml-won{font-size:16px;color:var(--mut)}
      .ml-bumps{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
      .ml-bumps button{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:8px;
        padding:6px 10px;font-size:12px;cursor:pointer;color:var(--ink)}
      .ml-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
      .ml-chip{border:1px solid #DDE3DF;background:#fff;border-radius:999px;
        padding:7px 12px;font-size:13px;cursor:pointer;color:var(--mut)}
      .ml-chip.on{font-weight:700}
      .ml-row2{display:flex;gap:8px;margin-bottom:12px}
      .ml-input{flex:1;border:1px solid #DDE3DF;border-radius:10px;padding:9px 12px;
        font-size:14px;background:#fff;color:var(--ink);min-width:0}
      .ml-date{flex:0 0 150px}
      .ml-submit{width:100%;border:none;border-radius:12px;padding:13px 0;
        font-size:15px;font-weight:700;color:#fff;cursor:pointer}
      .ml-submit.expense{background:var(--ink)}
      .ml-submit.income{background:var(--green)}
      .ml-submit:disabled{opacity:.4;cursor:default}

      /* 봉투 */
      .ml-envs{display:flex;flex-direction:column;gap:12px}
      .ml-env-top{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
      .ml-env-top .over{color:var(--red);font-weight:700}
      .ml-bar{height:8px;background:#EDF1EE;border-radius:999px;overflow:hidden}
      .ml-bar-fill{height:100%;border-radius:999px;transition:width .4s ease}
      .ml-edit{display:flex;flex-direction:column;gap:8px}
      .ml-edit-row{display:flex;align-items:center;gap:10px;font-size:13px}
      .ml-edit-row span{flex:0 0 120px}

      /* CSV */
      .ml-csv-btns{display:flex;gap:8px;flex-wrap:wrap}
      .ml-csv-btn{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:10px;
        padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
      .ml-csv-btn.warn{color:var(--red);border-color:#E8CFCC}
      .ml-csv-btn:disabled{opacity:.4;cursor:default}
      .ml-cnt{font-weight:400;color:var(--mut)}

      /* 헤더 우측 + 톱니바퀴 */
      .ml-header-right{display:flex;align-items:center;gap:8px}
      .ml-gear{border:1px solid #DDE3DF;background:var(--card);border-radius:10px;
        width:36px;height:36px;display:flex;align-items:center;justify-content:center;
        cursor:pointer;color:var(--ink);flex-shrink:0}
      .ml-gear:hover{background:#EDF1EE}

      /* 설정 시트 */
      .ml-overlay{position:fixed;inset:0;background:rgba(20,30,26,.45);z-index:50;
        display:flex;align-items:flex-end;justify-content:center}
      .ml-sheet{background:var(--card);width:100%;max-width:560px;
        border-radius:20px 20px 0 0;padding:18px 18px 28px;
        max-height:80vh;overflow-y:auto;animation:mlUp .25s ease}
      @keyframes mlUp{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
      @media (prefers-reduced-motion: reduce){.ml-sheet{animation:none}}
      .ml-sheet-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
      .ml-sheet-head h2{font-size:17px;margin:0;font-weight:800}
      .ml-sheet-close{font-size:24px}
      .ml-set-group{padding:14px 0;border-top:1px solid #EDF1EE}
      .ml-set-group h3{font-size:14px;margin:0 0 6px;font-weight:700}

      /* 내역: 월 네비게이션 */
      .ml-month-nav-card{position:relative}
      .ml-month-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:12px}
      .ml-month-label{font-size:17px;font-weight:800;min-width:110px;text-align:center}
      .ml-nav-btn{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:10px;
        width:34px;height:34px;font-size:12px;cursor:pointer;color:var(--ink)}
      .ml-nav-btn:disabled{opacity:.3;cursor:default}
      .ml-month-sum{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center}
      .ml-month-sum>div{display:flex;flex-direction:column;gap:2px;background:#F7FAF8;
        border-radius:12px;padding:10px 4px}
      .ml-sum-label{font-size:11px;color:var(--mut)}
      .ml-month-sum span:not(.ml-sum-label){font-size:14px;font-weight:700;
        font-variant-numeric:tabular-nums}
      .ml-today-btn{position:absolute;top:14px;right:14px}

      /* 내역 */
      .ml-day-head{display:flex;justify-content:space-between;font-size:13px;
        font-weight:700;padding-bottom:8px;border-bottom:1px solid #EDF1EE;margin-bottom:4px}
      .neg{color:var(--red)} .pos{color:var(--green)}
      .ml-tx{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F2F5F3}
      .ml-tx:last-child{border-bottom:none}
      .ml-tx-emoji{width:34px;height:34px;border-radius:10px;display:flex;
        align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
      .ml-tx-mid{flex:1;display:flex;flex-direction:column;min-width:0}
      .ml-tx-cat{font-size:14px;font-weight:600}
      .ml-tx-memo{font-size:12px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ml-tx-amt{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
      .ml-tx-amt.expense{color:var(--ink)} .ml-tx-amt.income{color:var(--green)}
      .ml-del{border:none;background:none;color:#B8C0BB;font-size:18px;
        cursor:pointer;padding:2px 6px;line-height:1}
      .ml-del:hover{color:var(--red)}

      /* 분석 */
      .ml-insights{margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:8px}
      .ml-insights li{font-size:13.5px;line-height:1.6}
      .ml-chart{margin-top:6px}
      .ml-legend{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12px;margin-top:8px;color:var(--mut)}
      .ml-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:4px}
      .ml-month-table{margin-top:10px;display:flex;flex-direction:column;gap:6px}
      .ml-month-row{display:grid;grid-template-columns:40px 1fr 1fr 1.2fr;gap:4px;
        font-size:12px;font-variant-numeric:tabular-nums;align-items:center}
      .ml-month-row span:first-child{font-weight:700}
      .ml-month-row span:not(:first-child){text-align:right}

      .ml-foot{text-align:center;font-size:11px;color:#A6AFAA;margin-top:24px}
    `})}P.createRoot(document.getElementById("root")).render(e.jsx(me.StrictMode,{children:e.jsx(we,{})}));
