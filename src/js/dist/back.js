!function(){"use strict";const e="SRData";function n(e){const n=document.createElement("div");return n.id="set-randomizer--warning",n.innerHTML=e,n.style.cssText="color: firebrick;font-size: 40%; background-color: white; border: 2px solid red; margin: 40px 10px 0px; padding: 15px; text-shadow: 0px 0px; ",n}const t="(?:[a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)",s=":(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))",o={star:!0};function r(e,n){const t=[];for(let s=0;s<e.length;s+=n)t[t.length]=e.slice(s,s+n);return t}function l(e,n,t,s,o,r,l,i){let c;if(t)c=[Number(t)];else if(s){const n=Number(s.slice(1));c=[e.length+n-1]}else if(r){const n=o+Number(r);c=e[n]?[n]:[]}else if(l){const t=n.find(e=>e.name===l),s=t?t.sets:[];if(t&&i){const n=Number(i)>=0?Number(i):e.length+Number(i)-1;c=s[n]>=0?[s[n]]:[]}else c=s}else c=[o];return c}function i(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function c(e,n){if(!n||e.length!==n.length)return!1;for(let t=0,s=e.length;t<s;t++)if(e[t]instanceof Array&&n[t]instanceof Array){if(!c(e[t],n[t]))return!1}else if(e[t]!=n[t])return!1;return!0}function a(e,n){let t,s;const r={},l=function(n=e.cssSelector){if(t=!1,s=!1,r[n])return r[n];try{return r[n]=document.querySelectorAll(n)}catch{return t=!0,r[n]=document.createDocumentFragment().childNodes}},c={},a=function(n=e.cssSelector){if(c[n])return c[n];{const e=l(n);if(!e||0===e.length)return t=!0,c[n]="";const o=[...e].map(e=>e.innerHTML).join("%%sr%%ELEMDELIM%%");return(o.includes("SET RANDOMIZER FRONT TEMPLATE")||o.includes("SET RANDOMIZER BACK TEMPLATE"))&&(s=!0),c[n]=o}},u=(e.isRegex?e.openDelim:i(e.openDelim))+"((?:.|\\n|\\r)*?)"+(e.isRegex?e.closeDelim:i(e.closeDelim)),f={},d=function(n=e.cssSelector){if(f[n])return f[n];{const e=[],s=a(n);let o;try{o=RegExp(u,"gm")}catch{return t=!0,f[n]=[]}let r=o.exec(s);for(;r;)e.push(r[1]),r=o.exec(s);return f[n]=e}},m={},p=function(t=e.cssSelector){if(m[t])return m[t];{const s=[],o=d(t);for(const[t,r]of o.entries()){const o=r.split(e.isRegex?new RegExp(e.fieldSeparator):e.fieldSeparator).map((e,s)=>[n,t,s,e,"n"]);s.push(o)}return m[t]=s}},g=function(n,t,s,r,c,u,f,m=e.cssSelector){const h=function(e,n){const t=e.find(e=>"default"===e.name).stylings;return e.forEach(e=>{["colors","classes"].forEach(t=>{e.stylings[t].randomIndices=n[e.name]?n[e.name][t]:[],e.stylings[t].nextIndex=0})}),{defaultStyle:t,propAccessor:function(n,s=null,o=t){const r=n?e.find(e=>e.name===n).stylings:null,l=s?e.find(e=>e.name===s).stylings:null,i=function(e=null,n=null){return e&&n?l&&l[e]&&void 0!==l[e][n]?l[e][n]:r&&r[e]&&void 0!==r[e][n]?r[e][n]:o[e][n]:e?l&&void 0!==l[e]?l[e]:r&&void 0!==r[e]?r[e]:o[e]:l||r||o};let c;return{getProp:i,getNextIndex:function(e){let n;const t=i(e),s=i(e,"values").length;return void 0===c?t.collectiveIndexing&&t.randomStartIndex?0===t.randomIndices.length?(n=Math.floor(Math.random()*s),t.randomIndices.push(n)):n=0===t.nextIndex?t.randomIndices[0]:t.nextIndex%s:t.collectiveIndexing?n=t.nextIndex%s:t.randomStartIndex?(t.setIndex||(t.setIndex=0),void 0===(n=t.randomIndices[t.setIndex])&&(n=Math.floor(Math.random()*s),t.randomIndices.push(n)),t.setIndex+=1):n=0:n=++c%s,c=n,t.nextIndex=c+1,n}}},exportIndices:function(){const n={};return e.forEach(e=>{n[e.name]={},["colors","classes"].forEach(t=>{n[e.name][t]=e.stylings[t].randomIndices})}),n}}}(t,c),y=function(e,n){const t=new RegExp("%%(.+)%%(\\d+)%%(\\d+)%%");return{pickStyle:function(e){for(let s=e.length-1;s>=0;s--){let r;if(r=e[s].match(t)){const e=r[1],t=Number(r[2]),s=Number(r[3]),l=n.find(n=>!(n[1]!=o&&n[1]!==e||n[2]!=o&&n[2]!==t||n[3]!=o&&n[3]!==s));if(void 0!==l)return l[0]}}return null},pickValue:function(n,s,r){const l=n.match(t);if(!l)return n;const i=l[1],c=Number(l[2]),a=Number(l[3]);let u;try{if(void 0===(u=e[i][c].values[a]))throw"error"}catch{return null}const f=s?s.find(e=>!(e[1]!=o&&e[1]!==i||e[2]!=o&&e[2]!==c||e[3]!=o&&e[3]!==a)):null,d=r?r.find(e=>!(e[1]!=o&&e[1]!==i||e[2]!=o&&e[2]!==c||e[3]!=o&&e[3]!==a)):null;return`<span${f?` style="color: ${f[0]}"`:""}${d?` class="${d[0]}"`:""}>${u}</span>`}}}(u,r);console.log("sd",t);const $=Array(n.length);for(const e of n){const n=[],t=s[e.order],o=h.propAccessor(t,y.pickStyle(e.rendering.map(e=>e[3])));"sort"===o.getProp("display")?e.rendering.sort():"orig"===o.getProp("display")&&(e.rendering=f.find(n=>n.name===e.order).elements);for(const t of e.rendering){const[e,s,r,l,i]=t;if("d"!==i){const e=o.getNextIndex("colors"),t=Number.isNaN(e)?"":` color: ${o.getProp("colors","values")[e]};`,i=`class="set-randomizer--element set-randomizer--element-index-${s}-${r}"`,c=o.getProp("block")?" display: block;":"",a=`style="padding: 0px ${o.getProp("fieldPadding")}px;${t}${c}"`,u=y.pickValue(l,o.getProp("colors","rules"),o.getProp("classes","rules"));if(u){const e=o.getProp("block")?`<record ${i} ${a}><div>${x=l,x.replace(RegExp("</div><div>","g"),"<br>").replace(RegExp("<div>","g"),"<br>")}</div></record>`:`<record ${i} ${a}>${u}</record>`;n.push(e)}}}"none"===o.getProp("display")?$[e.order]="":0===n.length||"empty"===o.getProp("display")?$[e.order]=`${o.getProp("openDelim")}`+`${o.getProp("emptySet")}`+`${o.getProp("closeDelim")}`:$[e.order]=`${o.getProp("openDelim")}`+`${n.join(o.getProp("fieldSeparator"))}`+`${o.getProp("closeDelim")}`}var x;let b=a(m);for(const[n,t]of d(m).entries())b=b.replace(e.isRegex?new RegExp(`${e.openDelim}${i(t)}${e.closeDelim}`):`${e.openDelim}${t}${e.closeDelim}`,`${$[n]}`);const v=l(m);if(b.split("%%sr%%ELEMDELIM%%").forEach((e,n)=>v[n].innerHTML=e),"div#clozed"===m){const e=p("div#original").flat();if(e.length>0){const t=n.map(n=>({rendering:n.rendering.map(n=>[n[0],n[1],e.find(e=>e[0]===n[0]&&e[1]===n[1])[2],n[3]]),order:n.order}));g(t,renderDirectives,c,"div#original")}}return h.exportIndices()};return{getElementsOriginal:p,renderSets:g,isInvalid:function(){return t},isContained:function(){return s}}}function u(e,n){n-=e.length*Math.floor(n/e.length),e.push.apply(e,e.splice(0,n))}function f(e,n){const t=[];for(const s of n){const n=e[s];n&&t.push(n)}if(n.length<e.length)for(const s of Array.from(new Array(e.length-n.length),(e,t)=>t+n.length))t.push(e[s]);return t}function d(e,n){const t=[];let s=0;for(const o of n)t.push(e.slice(s,s+o)),s+=o;return t}function m(e,n){e.sort((e,n)=>e[0]===n[0]?0:"c"===e[0]?-1:"m"===e[0]&&"d"===n[0]?-1:"m"===e[0]&&"c"===n[0]?1:"d"===e[0]?1:void 0).forEach(e=>(function(e,n){const t=e[0],s=e[2],o=e[3],r=e[4],l=e[5];let i;switch(typeof s){case"number":i=n[s];break;case"object":i=s.flatMap(e=>n[e])}if(i.length<=o||o<-i.length)return;u(i,o);const c=[];let a=e[1];for(const e of i){const n=e[4];if("d"!==n&&"c"!==n&&(c.push(e.slice(0)),"d"!==t&&"m"!==t||(e[4]="d"),0==--a))break}if(c.forEach(e=>e.splice(4,1,"c")),("c"===t||"m"===t)&&c.length>0){let e=l,t=0;for(t+=n[r].slice(t).findIndex(e=>"n"===e[4]||"d"===e[4]);e>0;)t+=n[r].slice(t).findIndex(e=>"n"===e[4]||"d"===e[4]),t++,e--;-1===t&&(t=n[r].length),n[r].splice(t,0,...c)}u(i,-o)})(e,n))}function p(e,n,t,s){const o=Math.random()*(n-e)+e;return s?o.toFixed(t||2):(Math.round(o)*(t||1)).toString()}function g(e,n,t){return`%%${e}%%${n}%%${t}%%`}function h(e,n,r,l,i=[]){const[c]=function(e){const n=[],r=new RegExp("^\\$(?:evaluate|eval|e)\\((?:\\s*(\\d+)\\s*,\\s*)?"+`(?:(${t})(?:(?:${s})?${s})?)`+`(?:\\s*,\\s*(${t})\\s*)?`);for(const t of e.flat()){let e;const s=t[3];if(e=s.match(r)){const t=e[1],s=e[2],r=Number(e[3]),l=Number(e[5]),i=e[7];n.push(["*"===s?o:s,Number.isNaN(r)?o:r,Number.isNaN(l)?o:l,null!=t?Number(t):1,i])}}return[n]}(e),[a,u]=function(e,n,s,r){const l={},i=[],c=new RegExp(`^\\$(${t})(!)?(?!\\()(\\W)((?:.|\\n|\\r)*)`);n.reverse();const a=new RegExp("\\\\n","g"),u=new RegExp("\\\\.","g");for(const t of e.flat()){let e;const[f,d,m,p]=t;if(e=p.match(c)){const t=e[1],c="!"===e[2],p=e[4].replace(`\\${e[3]}`,"%%sr%%ESCDELIM%%").replace(a,"<br/>").replace(u,e=>e.slice(1)).split(e[3]).map(n=>n.replace("%%sr%%ESCDELIM%%",e[3])),h=(l[t]||(l[t]=[])).push({name:t,idx:l[t]?l[t].length:0,values:p,iter:f,set:d,pos:m})-1,y=n.find(e=>e[0]===t&&e[1]===h||e[0]===t&&e[1]===o||e[0]===o&&e[1]===h||e[0]===o&&e[1]===o&&(e[2]===o||e[2]<p.length)),$=[];let x;if(y){x=y[2]===o;const e=y[2],n=y[3],l=y[4];let i;if(l&&!s.find(e=>e.name===l)&&s.push({name:l,values:[]}),i=r.find(e=>e[0]===f&&e[1]===d&&e[2]===m))$.push(...i[3]),x=!1;else for(let r=!1,i=0;i<n&&!r;i++){let n=g(t,h,e!==o?e:Math.floor(Math.random()*p.length));if(l){let i=0;const c=100,a=s.find(e=>e.name===l).values;for(;a.includes(n)&&i<c;)n=g(t,h,Math.floor(Math.random()*p.length)),e!==o?i=c:i++;i===c?(n=null,r=!0):s.find(e=>e.name===l).values.push(n)}null!=n&&$.push(n)}}else c&&(x=!1,$.push(...Array.from(l[t][h].values.keys(),e=>g(t,h,e))));$.length>0&&i.push([f,d,m,$,x])}}return[l,i]}(e,c,r,n),[f]=function(e,n,r,l,i,c,a){const u=[],f=new RegExp("^\\$(n|name)!\\(\\)$"),d=new RegExp("^\\$(?:pick|p)\\((?:\\s*(\\d+)\\s*,\\s*)?(?:(\\d+(?:\\.\\d*)?):(\\d+(?:\\.\\d*)?)(?::(\\d+))?|"+`(?:(${t})(?:(?:${s})?${s})?)?)`+`(?:\\s*,\\s*(${t})\\s*)?`),m=new RegExp("^[^\\$]");for(const[t,s]of e.entries()){const e=[];let h=a[t]||!1;for(const t of s){let s;const[c,a,u,y]=t;if(!h&&f.test(y))h=!0;else if(s=r.find(e=>e[1]===a&&e[2]===u)){const n=s[3];s[4]&&i.push([c,a,u,n]),e.push(...n.map(e=>[c,a,u,e]))}else if(s=y.match(d)){const t=void 0!==s[1]?Number(s[1]):1,r=s[10],f=s[2],d=s[3],m=s[4],h=s[5],y=Number(s[6]),$=Number(s[8]),x="*"===h?o:h;console.log("pick:vsn",x);const b=Number.isNaN(y)?s[7]?o:0:y,v=Number.isNaN($)?o:$;r&&!l.find(e=>e.name===r)&&l.push({name:r,values:[]});const E=[],M=l.find(e=>e.name===r);let N;if(N=i.find(e=>e[0]===c&&e[1]===a&&e[2]===u))E.push(...N[3]);else{for(let e=!1,s=0;s<t;s++){let t;if(e)break;if(f&&d){const n=f.includes(".")||d.includes(".");if(t=p(Number(f),Number(d),Number(m),n),M){let s=0;const o=100;for(;M.values.includes(t)&&s<o;)t=p(Number(f),Number(d),Number(m),n),s++;s==o&&(t=null,e=!0)}}else{const s=n[x===o?Object.keys(n)[Math.floor(Math.random()*Object.keys(n).length)]:x],r=b===o?Math.floor(Math.random()*s.length):b,l=s&&s.length>0?s[r]:null;if(l)if(v===o){const e=Math.floor(Math.random()*l.values.length);t=g(l.name,r,e)}else t=g(l.name,r,v);if(t&&M){let n=0;const s=100;for(;M.values.includes(t)&&n<s;){const e=Math.floor(Math.random()*l.values.length);t=g(l.name,r,e),n++}n==s&&(t=null,e=!0)}}null!=t&&(M&&M.values.push(t),E.push(t))}E.length>0&&(x===o||b===o||v===o)&&i.push([c,a,u,E])}e.push(...E.map(e=>[c,a,u,e]))}else(m.test(y)||0===y.length)&&e.push(t)}u.push({iter:c,name:t,elements:e,lastMinute:h})}return[u]}(e,a,u,r,n,l,i);return[f,n,r,a]}const y=`(?:(${t})(?:(?:${s})?${s})?)`;function $(e,n,s){const i=function(e,n){const s=[{name:"default",stylings:n},{name:"none",stylings:{colors:{},classes:{},display:"none"}},{name:"block",stylings:{colors:{},classes:{},openDelim:"",closeDelim:"",fieldPadding:0,block:!0}}],l=new RegExp("^\\$(?:style|s)\\("+`(${t})`+"\\s*,\\s(.*)\\)$");return e.flat().map(e=>[e,e[3].match(l)]).filter(e=>e[1]).forEach(e=>{const[n,t,l]=e[1];let i=s.find(e=>e.name===t);if(!i){const e=s.push({name:t,stylings:{colors:{},classes:{}}});i=s[e-1]}(function(e){const n=[],t=new RegExp("(\\w+):(?:\\[(.*?)\\]|(?:\"(.*?)\"|'(.*?)'|([^,]+)))?","gm");let s=t.exec(e);for(;s;){const o=[s[1],void 0!==s[2]?s[2]:void 0!==s[3]?s[3]:void 0!==s[4]?s[4]:void 0!==s[5]?s[5]:""];n.push(o),s=t.exec(e)}return n})(l).forEach(e=>{const[n,t]=e;if("od"===n||"openDelim"===n)i.stylings.openDelim=t;else if("cd"===n||"closeDelim"===n)i.stylings.closeDelim=t;else if("fs"===n||"fieldSeparator"===n)i.stylings.fieldSeparator=t;else if("fp"===n||"fieldPadding"===n){const e=Number(t);e>=0&&(i.stylings.fieldPadding=e)}else if("es"===n||"emptySet"===n)i.stylings.emptySet=t;else if("clrs"===n||"colors"===n)i.stylings.colors.values=t.split(",").map(e=>e.trim()).filter(e=>e.length>0);else if("clss"===n||"classes"===n)i.stylings.classes.values=t.split(",").map(e=>e.trim()).filter(e=>e.length>0);else if("clrr"===n||"colorRules"===n)i.stylings.colors.rules=r(t.split(",").map(e=>e.trim()),2).map(e=>{if(2!==e.length)return e;const n=e[1].match(`^${y}$`);if(!n)return null;const[t,s,r,l,i,c]=n;return[e[0],"*"===s?o:s,r?Number(r):o,i?Number(i):o]}).filter(e=>e&&4===e.length);else if("clsr"===n||"classRules"===n)i.stylings.classes.rules=r(t.split(",").map(e=>e.trim()),2).map(e=>{if(2!==e.length)return e;const n=e[1].match(`^${y}$`);if(!n)return null;const[t,s,r,l,i,c]=n;return[e[0],"*"===s?o:s,r?Number(r):o,i?Number(i):o]}).filter(e=>e&&4===e.length);else if("clrci"===n||"colorsCollectiveIndexing"===n){const e="true"===t||"yes"===t||"false"!==t&&"no"!==t&&null;"boolean"==typeof e&&(i.stylings.colors.collectiveIndexing=e)}else if("clrrsi"===n||"colorsRandomStartIndex"===n){const e="true"===t||"yes"===t||"false"!==t&&"no"!==t&&null;"boolean"==typeof e&&(i.stylings.colors.randomStartIndex=e)}else if("clsci"===n||"classesCollectiveIndexing"===n){const e="true"===t||"yes"===t||"false"!==t&&"no"!==t&&null;"boolean"==typeof e&&(i.stylings.classes.collectiveIndexing=e)}else if("clsrsi"===n||"classesRandomStartIndex"===n){const e="true"===t||"yes"===t||"false"!==t&&"no"!==t&&null;"boolean"==typeof e&&(i.stylings.classes.randomStartIndex=e)}else if("blk"===n||"block"===n){const e="true"===t||"yes"===t||"false"!==t&&"no"!==t&&null;"boolean"==typeof e&&(i.stylings.block=e)}else"dp"!==n&&"display"!==n||(i.stylings.display=t)})}),s}(e,n),c=function(e,n,s){const o=new RegExp("^\\$(?:apply|app|a)\\("+`(${t})`+"(?:\\s*,\\s(?:(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|"+`(${t})(?::(\\d+|n?-\\d+))?`+"))?\\)$"),r=[];return e.flat().map(e=>[e,e[3].match(o)]).filter(e=>e[1]).forEach(t=>{const[o,i,c,a,u,f,d]=t[1];if(n.find(e=>e.name===i)){l(e,s,c,a,t[0][1],u,f,d).forEach(e=>{r[e]=i})}}),r}(e,i,s),a=function(e,n){const s=new RegExp("^\\$(?:rule|r)\\("+`(${t})`+"(?:\\s*,\\s(?:"+y+"))?\\)$"),r=[];return e.flat().map(e=>[e,e[3].match(s)]).filter(e=>e[1]).forEach(e=>{const[t,s,l,i,c,a,u]=e[1];if(n.find(e=>e.name===s)){const e=Number(i),n=Number(a);r.push([s,"*"===l?o:l,i?e:o,a?n:o])}}),r}(e,i);return[i,c,a]}function x(e,n,t,s,o,r,l){if(e){const n=Number(e);return r<=n?[[],!0]:[[n],!0]}if(n){const e=o+Number(n);return e<0?[[],!0]:r<e?[[],!0]:[[e],!0]}if(t){const e=r+(Number(t)-1);return e<0?[[],!0]:[[e],!0]}if(s){const e=l.find(e=>e.name===s);return e?[e.sets,!0]:[[],!0]}return[[o],!1]}const b=function(e,n,t,s,o,r){return void 0!==e?e:void 0!==n?n:t?0:o.find(e=>e.name===s).elements.reduce((e,n)=>{return n[2]<r?e+1:e},0)};function v(e){for(var n,t,s=e.length;0!==s;)t=Math.floor(Math.random()*s),n=e[s-=1],e[s]=e[t],e[t]=n;return e}function E(e){return e.map(e=>({iter:e.iter,name:e.name,length:e.elements.length,sets:[[e.iter,e.name]],setLengths:[e.elements.length],order:v([...new Array(e.elements.length).keys()]),lastMinute:e.lastMinute}))}function M(e,n){return e.map(e=>{const t=e.sets.map(e=>n.filter(n=>n.name===e)).map(e=>e[0].elements.length),s=t.reduce((e,n)=>e+n,0);return{iter:e.iter,name:e.name,length:s,sets:e.sets.map(n=>[e.iter,n]),setLengths:t,order:v([...new Array(s).keys()]),lastMinute:e.lastMinute}})}function N(e,n){const t=[];for(const n of e)t.push(n);for(const e of n)t.includes(e)||t.push(e);return t}function I(e,n,s){return e.reduce((e,n,o)=>{const[r,i]=function(e,n,s,o,r,i,u,f,d){const m=a(n,e),p=m.getElementsOriginal();if(console.log(m.isInvalid(),m.isContained(),p.length),m.isInvalid()||0!==p.length)return[[o,r,i,u,f,d],!1];{const n=function(e,n){const t=[];for(const s of e){let e;(e=n.find(e=>c(e.map(e=>e[3]),s.map(e=>e[3]))&&!t.find(n=>n.to[0]===e[0][0]&&n.to[1]===e[0][1])))&&(console.log("lala",s,e),t.push({from:s[0].slice(0,2),to:e[0].slice(0,2)}))}return t}(o,p),[a,g,y,v]=h(p,function(e,n){const t=[];for(const s of n){const n=e.find(e=>c(e.from.slice(0,2),s.slice(0,2)));n&&t.push([...n.to,s[2],s[3]])}return n.concat(t)}(n,r),i,e),E=function(e){const n=new RegExp("\\$(?:name|n)(!)?\\("+`(${t})`+"(?:\\s*,\\s*(?:(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|"+`(${t})(?::(n-\\d+|-\\d|\\d+))?`+"))?\\)$"),s=[];return e.flat().map(e=>[e,e[3].match(n)]).filter(e=>e[1]).reduce((e,n)=>(n[1][3]||n[1][4]||n[1][5]||n[1][6]||n[1][7]?e.push(n):e.unshift(n),e),[]).forEach(n=>{const[t,o,r,i,c,a,u,f]=n[1],d=l(e,s,i,c,n[0][1],a,u,f);let m=s.find(e=>e.name===r);if(!m){const e=s.push({iter:n[0][0],name:r,lastMinute:!1,sets:[]});m=s[e-1]}m.sets.push(...d),m.sets.sort(),o&&(m.lastMinute=!0)}),s}(p),M=function(e,n){const s=[],o=new RegExp("\\$(?:order|ord|o)(!)?\\("+`(${t})`+"(?:\\s*,\\s*(?:(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|"+`(${t})(?::(n-\\d+|-\\d|\\d+))?`+"))?\\)$");return e.flat().map(e=>[e,e[3].match(o)]).filter(e=>e[1]).forEach(t=>{const[o,r,i,c,a,u,f,d]=t[1],m=f&&!d?[f]:l(e,n,c,a,t[0][1],u,f,d);let p=s.find(e=>e.name===i);if(!p){const e=s.push({name:i,lastMinute:!1,sets:[],dictator:!1});p=s[e-1]}p.sets.push(...m),p.sets.sort(),r&&(p.lastMinute=!0)}),s}(p,E);!function(e,n,t){const s=[n,t].flat();for(const n of e.filter(e=>e.lastMinute))for(const e of n.sets)s.find(n=>n.name===e).lastMinute=!0}(M,a,E);const N=function(e,n,s){const o=[],r=`(?:(\\d+)|((?:\\+|-)\\d+)|n(-\\d+)|(${t}))`,l=new RegExp("^\\$(?:(c|copy)|(m|move)|(d|del|delete))\\((?:(\\d+)(?:\\s*,\\s*"+`${r}(?::(?:\\+?(\\d+)|n?(-\\d+)))?`+"(?:\\s*,\\s*"+`${r}(?::(?:\\+?(\\d+)|n?(-\\d+)))?`+")?)?)?\\)$");for(const t of e.flat()){const[r,i,c,a]=t,u=a.match(l);if(u){const t=u[1]?"c":u[2]?"m":u[3]?"d":"",r=u[4]?Number(u[4]):999,[l,a]=x(u[11],u[12],u[13],u[14],i,e.length,s),f=b(u[15],u[16],a,l[0]?l[0]:i,n,c),[d,m]=n.filter(e=>l.includes(e.name)).reduce((e,n)=>e[1]-(n.elements.length+1)<0?[e[0]||n.name,e[1]]:[null,e[1]-(n.elements.length+1)],[null,f]),[p,g]=x(u[5],u[6],u[7],u[8],i,e.length,s),h=b(u[9],u[10],!0,i,n,c);null!==p&&null!==d&&r>0&&o.push([t,r,p,h,d,m])}}return o}(p,a,E),[I,R,w]=$(p,s,E),[k,P]=S(a,E,M,N,u,n),[D,A,L,z]=h(P.map(e=>e.filter(e=>"d"!==e[4])),[],[],e,a.map(e=>e.lastMinute)),[T,C]=S(D,E.filter(e=>e.lastMinute),M.filter(e=>e.lastMinute),[],f,n,!0),O=m.renderSets(function(e,n,t){const s=[],o=[];for(const[r,l]of n.map((e,n)=>({rendering:e,order:n})).entries()){console.log("ro",l);const n=e.find(e=>t===e.to[0]&&r===e.to[1]);n?s.splice(n.from[1],0,l):o.push(l)}return console.log("reo1",n),console.log("reo2",s.filter(e=>e).concat(o)),s.filter(e=>e).concat(o)}(n,C,e),I,R,w,d,v,a);return[[o.concat(p.filter(e=>!n.find(n=>n.to[0]===e[0][0]&&n.to[1]===e[0][1]))),g,y,u.concat(k),f.concat(T),O],!0]}}(s?-o-1:o+1,n.inputSyntax,n.defaultStyle,...e[0]);return[r,i||e[1]]},[n,!1])}function S(e,n,t,s,o,r,l=!1){const[i,a]=function(e,n){return[e.map(e=>e.elements),[E(e),M(n,e)].flat()]}(e,n),u=function(e,n,t){const s=[];for(const o of t){let t,r;"string"==typeof o.name&&(t=n.find(e=>o.name===e.name))?s.push({iter:o.iter,name:o.name,length:o.length,sets:o.sets,setLengths:o.setLengths,order:N(t.order,o.order),lastMinute:o.lastMinute}):(t=e.find(e=>o.iter===e.to[0]&&o.name===e.to[1]))&&(r=n.find(e=>e.iter===t.from[0]&&e.name===t.from[1]))?s.push({iter:o.iter,name:o.name,length:o.length,sets:o.sets,setLengths:o.setLengths,order:r.order,lastMinute:o.lastMinute}):s.push(o)}return s}(r,o,l?a.filter(e=>e.lastMinute):a);return function(e,n){e.forEach(e=>(function(e,n){const t=function(e,n){return e.sets.map(e=>({name:e,length:n.find(n=>n.name===e).length})).reduce((e,n)=>e.length<n.length?n:e).name}(e,n);e.dictator=t;const s=n.find(n=>n.name===e.dictator).order;for(const t of e.sets){const o=n.find(e=>e.name===t).order,r=s.filter(e=>e<o.length);n.forEach(n=>{n.name===t&&(n.order=r,e.lastMinute&&(n.lastMinute=!0))})}return n})(e,n))}(t,u),function(e,n){const t=e.slice(0).sort((e,n)=>e.sets.length>n.sets.length?-1:e.sets.length<n.sets.length?1:"string"==typeof e.name?-1:1),s=[];for(const e of t){if(!s.reduce((n,t)=>n||e.sets.every(e=>t.some(n=>c(n,e))),!1)){d(f(e.sets.map(e=>n[e[1]]).flat(),e.order),e.setLengths).forEach((t,s)=>{n[e.sets[s][1]]=t}),s.push(e.sets)}}}(u,i),m(s,i),[u,i]}!function(){const t=$$options;if(window.Persistence)if(Persistence.isAvailable())I(t,function(){const n=Persistence.getItem(e);return n||[[],[],[],[],[],{}]}(),!1);else{const[e,s]=I(t,[[],[],[],[],[],{}],!1);!function(e){e&&!document.querySelector("#set-randomizer--warning")&&document.body.querySelector("#qa").appendChild(n('Set-Randomizer: Anki-Persistence <a href="https://github.com/SimonLammer/anki-persistence">does not work here</a>. Randomization will be inconsistent.'))}(s)}else document.querySelector("#set-randomizer--warning")||document.body.querySelector("#qa").appendChild(n('Set-Randomizer: Anki-Persistence is not defined!\nCheck "Tools > Set Randomizer Options" and make sure you enable "Inject anki-persistence".'))}()}();
