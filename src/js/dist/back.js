!function(){"use strict";function e(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}const n="[a-zA-Z_]\\w*";function t(e,n,t,s){const o=Math.random()*(n-e)+e;return s?o.toFixed(t||2):(Math.round(o)*(t||1)).toString()}function s(e,s){const o=[],r=[],i=new RegExp(`^\\^(${n})\\[(.*)\\]$`),a=[];for(const[n,t]of e.entries())for(const e of t){let n;(n=e[2].match(i))&&a.push({name:n[1],elements:n[2].substr(1,n[2].length-2).split(new RegExp("['\"],[\"']"))})}const l=new RegExp(`^\\^!!(?:${n}\\?\\??)?`),c=new RegExp(`^\\^${`(?:(${n})\\$)?`}`+"(?:(\\d+(?:\\.\\d*)?),(\\d+(?:\\.\\d*)?)(?:,(\\d+))?|"+`(${n})(?::(n(?:-\\d+)?|-\\d|\\d+))?)#$`),f=new RegExp("^[^\\^]"),u=[];for(const[n,i]of e.entries()){const e=[];let m=!1;for(const n of i){let o;if(l.test(n[2]))m=!0;else if(o=n[2].match(c)){const i=o[1],l=o[2],c=o[3],f=o[4],m=o[5],d=Number(o[6]);i&&!u.find(e=>e.name===i)&&u.push({name:i,values:[]});const p=n[0],h=n[1];let g,$;if($=s.find(e=>e[0]===p&&e[1]===h))g=$[2];else if(l&&c){const e=l.includes(".")||c.includes(".");if(g=t(Number(l),Number(c),Number(f),e),i){let n=0;const s=1e3;for(;u.find(e=>e.name===i).values.includes(g)&&n<s;)g=t(Number(l),Number(c),Number(f),e),n++;n==s&&(g=null)}}else{const e=a.find(e=>e.name===m);if(e&&(g="number"!=typeof d||Number.isNaN(d)?e.elements[Math.floor(Math.random()*e.elements.length)]:d>=0?e.elements[e.elements.length<=d?null:d]:e.elements[e.elements.length+d<0?null:e.elements.length+d],i)){let n=0;const t=1e3;for(;u.find(e=>e.name===i).values.includes(g)&&n<t;){const t=Math.floor(Math.random()*e.elements.length);g=e.elements[t],n++}n==t&&(g=null)}}if(g){const n=[p,h,g];i&&u.find(e=>e.name===i).values.push(n),r.push(n),e.push(n)}}else f.test(n[2])&&e.push(n)}o.push({name:n,elements:e,lastMinute:m})}return[o,r]}function o(e){const n=new RegExp("^\\d+$"),t=new RegExp("^n(-\\d+)?$"),s=new RegExp("^((?:\\+|-)\\d+)$");return{processSetIndex:function(o,r,i){let a;if(a=o.toString().match(s)){const e=r+Number(a[1]);return e<0?null:i<e?null:[e]}if(a=o.toString().match(t)){const e=i-(Number(a[1])||0)-1;return e<0?null:[e]}if(a=o.toString().match(n)){const e=Number(o);return i<e?null:[e]}{const n=e.find(e=>e.name===o);return n?n.sets:[]}},processPositionIndex:function(e){let o;return e?(o=e.toString().match(s))?Number(o[1]):(o=e.toString().match(t))?Number(o[1]):(o=e.toString().match(n))?Number(e):void 0:null}}}function r(e){for(var n,t,s=e.length;0!==s;)t=Math.floor(Math.random()*s),n=e[s-=1],e[s]=e[t],e[t]=n;return e}function i(e){return e.map(e=>({name:e.name,length:e.elements.length,order:r([...new Array(e.elements.length).keys()]),lastMinute:e.lastMinute}))}function a(e,n){return e.map(e=>{const t=e.sets.map(e=>n.filter(n=>n.name===e)).map(e=>e[0].elements.length),s=t.reduce((e,n)=>e+n,0);return{name:e.name,length:s,sets:e.sets,setLengths:t,order:r([...new Array(s).keys()]),lastMinute:e.lastMinute}})}function l(e,n){const t=function(e,n){return e.sets.map(e=>({name:e,length:n.find(n=>n.name===e).length})).reduce((e,n)=>e.length<n.length?n:e).name}(e,n),s=n.find(e=>e.name===t).order;for(const t of e.sets){const o=n.find(e=>e.name===t).order,r=s.filter(e=>e<o.length);n.forEach(n=>{n.name===t&&(n.order=r,e.lastMinute&&(n.lastMinute=!0))})}return n}function c(e,n,t){const s=function(e){return e.map(e=>e.elements).map(e=>e.map(e=>[e[0],e[1],e[2],"n"]))}(e),o=JSON.parse(JSON.stringify(s)),r=[i(e),a(n,e)].flat();return t.forEach(e=>l(e,r)),[s,o,r]}function f(e,n){if(!n||e.length!==n.length)return!1;for(let t=0,s=e.length;t<s;t++)if(e[t]instanceof Array&&n[t]instanceof Array){if(!f(e[t],n[t]))return!1}else if(e[t]!=n[t])return!1;return!0}function u(e,n){n-=e.length*Math.floor(n/e.length),e.push.apply(e,e.splice(0,n))}function m(e,n){const t=[];for(const n of e)t.push(n);for(const e of n)t.includes(e)||t.push(e);return t}function d(e,n){const t=[];for(const s of n){const n=e[s];n&&t.push(n)}if(n.length<e.length)for(const s of Array.from(new Array(e.length-n.length),(e,t)=>t+n.length))t.push(e[s]);return t}function p(e,n,t){switch(typeof e.name){case"number":const s=t[e.name];n[e.name]=d(s,e.order);break;case"string":(function(e,n){const t=[];let s=0;for(const o of n)t.push(e.slice(s,s+o)),s+=o;return t})(d(e.sets.map(e=>t[e]).flat(),e.order),e.setLengths).forEach((t,s)=>{n[e.sets[s]]=t})}}function h(e,n,t){const s=[];for(const o of e){let e;"string"==typeof o.name?(e=n.find(e=>o.name===e.name))?s.push({name:o.name,length:o.length,sets:o.sets,setLengths:o.setLengths,order:m(e.order,o.order),lastMinute:o.lastMinute}):s.push(o):(e=t.find(e=>o.name===e.to))?s.push(n.find(n=>n.name===e.from)):s.push(o)}return s}window.Persistence&&Persistence.isAvailable()&&function(){const t=Persistence.getItem("AnkiSetRandomizerOriginalStructure"),r=Persistence.getItem("AnkiSetRandomizerOptions"),i=Persistence.getItem("AnkiSetRandomizerGeneratorValues"),a=Persistence.getItem("AnkiSetRandomizerNewReorders"),m=Persistence.getItem("AnkiSetRandomizerLastMinuteReorders"),d=Persistence.getItem("AnkiSetRandomizerRandomIndices");if(!(t&&r&&i&&a&&m&&d))return;const g=function(n){let t={};const s=`${e(n.inputSyntax.openDelim)}(?:::)?(.*?)(?:::)?${e(n.inputSyntax.closeDelim)}`,o=function(e=n.query){if(t[e])return t[e];{const n=document.querySelector(e),o=n?n.innerHTML:"",r=[],i=RegExp(s,"gm");let a=i.exec(o);for(;a;)r.push(a[1]),a=i.exec(o);return t[e]=r}},r=function(e=n.query){const t=[];for(const[s,r]of o(e).entries()){const e=r.split(n.inputSyntax.fieldSeparator).map((e,n)=>[s,n,e]);t.push(e)}return t},i=function(e,t,s,a,l=n.query){let c=0+(n.colors_random_start_index?Math.floor((s[0]||Math.random())*n.colors.length):0),f=0;const u=Array(e.length);for(const[o,r]of e.entries()){const e=t.find(e=>e.name===o).directives;let i;void 0===e.colors?i=n.colors:(i=e.colors,f=c,c=0);const l=void 0===e.fieldSeparator?n.outputSyntax.fieldSeparator:e.fieldSeparator,m=void 0===e.fieldPadding?n.fieldPadding:e.fieldPadding,d=void 0===e.closeDelim?n.outputSyntax.closeDelim:e.closeDelim,p=void 0===e.openDelim?n.outputSyntax.openDelim:e.openDelim,h=[],g=n.colors_random_start_index?Math.floor((s[o]||Math.random())*i.length):0;"sort"===e.display?r.rendering.sort():"orig"===e.display&&(r.rendering=a.find(e=>e.name===o).elements);for(const[e,t]of r.rendering.entries())if("d"!==t[3]){const s=(n.colors_collective_indexing?c++:g+e)%i.length,o=`class="set-randomizer--element set-randomizer--element-index-${t[0]}-${t[1]}"`,r=`style="padding: 0px ${m}px;${i[s]?` color: ${i[s]};`:""}"`;h.push(`<span ${o} ${r}>${t[2]}</span>`)}"none"===e.display?u[r.order]="":0===h.length||"empty"===e.display?u[r.order]=`${p}${n.outputSyntax.emptySet}${d}`:u[r.order]=`${p}${h.join(l)}${d}`,void 0!==e.colors&&(c=f)}const m=document.querySelector(l);let d=m?m.innerHTML:"";for(const[e,t]of o(l).entries()){const s=u[e];d=d.replace(`${n.inputSyntax.openDelim}${t}${n.inputSyntax.closeDelim}`,`${s}`)}if(document.querySelector(l).innerHTML=d,"div#clozed"===l){const n=r("div#original").flat();if(n.length>0){const o=e.map(e=>({rendering:e.rendering.map(e=>[e[0],e[1],n.find(n=>n[0]===e[0]&&n[1]===e[1])[2],e[3]]),order:e.order}));i(o,t,s,"div#original")}}};return{getOriginalStructure:r,renderSets:i}}(r),$=g.getOriginalStructure();if($){const e=function(e,n){const t=[];for(const s of e)for(const e of n)!f(s.map(e=>e[2]),e.map(e=>e[2]))||t.find(n=>n.from===e[0][0])||t.find(e=>e.to===s[0][0])||t.push({from:e[0][0],to:s[0][0]});return t}($,t),[r,S]=s($,function(e,n){const t=[];for(const s of n){const n=e.find(e=>e.from===s[0]);n&&t.push([n.to,s[1],s[2]])}return t}(e,i)),y=function(e){const t=[],s=new RegExp(`^\\^(${n})!!?(?:${`${n}\\?\\??`}|${`(?:${n}\\+)?(?:(?:([a-zA-Z]+),.*?)?@)*$`})?$`),o=new RegExp("^\\^.*!!");for(const n of e.flat()){let e;if(e=n[2].match(s)){const s=n[0];t.find(n=>n.name===e[1])?t.find(n=>n.name===e[1]).sets.push(s):t.push({name:e[1],lastMinute:!1,sets:[s]}),o.test(n[2])&&(t.find(n=>n.name===e[1]).lastMinute=!0)}}return t}($),x=function(e){const t=[],s=`^\\^${`(?:(${n})!!?|!!?)?`}(${n})\\?\\??$`,o=new RegExp("\\?\\?$");for(const n of e.flat()){let e;if(e=new RegExp(s).exec(n[2])){const s=e[1]||n[0],r=e[2];t.find(e=>e.name===r)?t.find(e=>e.name===r).sets.push(s):t.push({name:r,sets:[s]}),o.test(n[2])&&(t.find(e=>e.name===r).lastMinute=!0)}}return t}($),b=function(e,t){const s=[],o=`^\\^(?:(?:(${n})!)?(${n})\\+)?((?:(?:[a-zA-Z]+,.*?)?@)*)$`,r=[],i=[];for(const[n,a]of e.entries()){s.push({name:n,directives:{}});for(const e of a){let s;if(s=e[2].match(o)){const e=s[1],o=s[2];o&&(r.find(e=>e.name===o)||r.push({name:o,sets:[]}),e?r.find(e=>e.name===o).sets.push(...t.find(n=>n.name===e).sets):r.find(e=>e.name===o).sets.push(n));const a=s[3].split("@").slice(0,-1);a.length>0&&i.push({name:o||n,assignments:a.map(e=>e.length>0?[e.split(",",1)[0],e.split(/^.*?,/)[1]]:["display","none"])})}}}for(const e of i.sort((e,n)=>"number"==typeof e.name?1:-1)){const n=[];for(const t of e.assignments)switch(t[0]){case"openDelim":case"od":n.push({name:"openDelim",value:t[1]});break;case"closeDelim":case"cd":n.push({name:"closeDelim",value:t[1]});break;case"fieldSeparator":case"fs":n.push({name:"fieldSeparator",value:t[1]});break;case"fieldPadding":case"fp":const e=Number(t[1]);Number.isNaN(e)||n.push({name:"fieldPadding",value:e});break;case"colors":case"clrs":n.push({name:"colors",value:t[1].split(",")});break;case"display":n.push({name:"display",value:t[1]})}const t=function(e,n){switch(typeof e){case"number":for(const t of n)s.find(n=>n.name===e).directives[t.name]=t.value;break;case"string":for(const s of r.find(n=>n.name===e).sets)t(s,n)}};t(e.name,n)}return s}($,y),[M,v,w]=c(r,y,x),N=h(w,a,e);x.forEach(e=>l(e,N)),N.forEach(e=>p(e,M,v));const E=function(e,t,s){const r=[],i=`(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|${n})`,a=new RegExp("^\\^(?:"+`${i}(?::(n(?:-\\d+)?|-\\d|\\d+))?`+"(?:,(\\d+)(?:"+`,${i}(?::(n(?:-\\d+)?|-\\d|\\d+))?`+")?)?)?(?:(=)|(\\~)|(\\%))$");for(const n of e)for(const i of n){let n;if(n=i[2].match(a)){const a=n[6]?"c":n[7]?"m":n[8]?"d":"",l=o(s),c=l.processSetIndex(n[4]||i[0],i[0],e.length),f=n[5]?l.processSetIndex(n[5]):n[4]?0:t.find(e=>e.name===c[0]).elements.reduce((e,n)=>n[1]<i[1]?e+1:e,0),[u,m]=t.filter(e=>c.includes(e.name)).reduce((e,n,t,s)=>e[1]-(n.elements.length+1)<0?[e[0]||n.name,e[1]]:[null,e[1]-(n.elements.length+1)],[null,f]),d=l.processSetIndex(n[1]||c,i[0],e.length),p=l.processPositionIndex(n[2])||0,h=/\d/.test(n[3])?Number(n[3]):999;null!==d&&null!==u&&h>0&&r.push([d,p,h,a,u,m])}}return r}($,r,y).sort((e,n)=>e[3]===n[3]?0:"c"===e[3]?-1:"m"===e[3]&&"d"===n[3]?-1:"m"===e[3]&&"c"===n[3]?1:"d"===e[3]?1:void 0);E.forEach(e=>(function(e,n){const t=e[0],s=e[1],o=e[3],r=e[4],i=e[5];let a;switch(typeof t){case"number":a=n[t];break;case"object":a=t.flatMap(e=>n[e])}if(a.length<=s||s<-a.length)return;u(a,s);const l=[];let c=e[2];for(const e of a){const n=e[3];if("d"!==n&&"c"!==n&&(l.push(e.slice(0)),"d"!==o&&"m"!==o||(e[3]="d"),0==--c))break}if(l.forEach(e=>e.splice(3,1,"c")),("c"===o||"m"===o)&&l.length>0){let e=i,t=0;for(;e>0;)t+=n[r].slice(t).findIndex(e=>"n"===e[3]||"d"===e[3]),t++,e--;n[r].splice(t,0,...l)}u(a,-s)})(e,M));const R=M.map(e=>e.filter(e=>"d"!==e[3])),k=s(R,[])[0].map((e,n)=>({name:e.name,elements:e.elements,lastMinute:r[n].lastMinute})),A=x.filter(e=>e.lastMinute),[P,D,I]=c(k,y,A),z=h(I,m,e);A.forEach(e=>l(e,z)),z.filter(e=>e.lastMinute).forEach(e=>p(e,P,D)),g.renderSets(P.map((e,n)=>({rendering:e,order:n})),b,function(e,n){const t=[];let s;for(const[o,r]of n.entries())(s=e.find(e=>e.from===o))&&(t[s.to]=r);return t}(e,d),r)}}()}();
