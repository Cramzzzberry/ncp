if(!self.define){let s,e={};const i=(i,n)=>(i=new URL(i+".js",n).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(n,l)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const o=s=>i(s,r),u={module:{uri:r},exports:t,require:o};e[r]=Promise.all(n.map((s=>u[s]||o(s)))).then((s=>(l(...s),t)))}}define(["./workbox-7cfec069"],(function(s){"use strict";self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/CasesPage-b_rdEQlm.js",revision:null},{url:"assets/DashboardPage-UUmp2xqN.js",revision:null},{url:"assets/EditCasePage-ZApiY7DM.js",revision:null},{url:"assets/HomePage-AY-G119k.css",revision:null},{url:"assets/HomePage-jm00GjRi.js",revision:null},{url:"assets/html2canvas.esm-Ry1SfrtC.js",revision:null},{url:"assets/index-OzBSDO0y.css",revision:null},{url:"assets/index-SBm9v_SE.js",revision:null},{url:"assets/index.es-3kjEvCPO.js",revision:null},{url:"assets/LoginPage-xSl7JObQ.js",revision:null},{url:"assets/purify.es-zHtM-7sw.js",revision:null},{url:"index.html",revision:"7da3f011a5e985502d67685fe973444b"},{url:"registerSW.js",revision:"826d5f592bd66092116d9b74df01bfa5"},{url:"manifest.webmanifest",revision:"10073a7672b9a356159e1c23a8b6440f"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
