!function(){"use strict";function e(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}if(window.Persistence&&Persistence.isAvailable()&&Persistence.getItem("AnkiSetRandomizerOptions")){const t=Persistence.getItem("AnkiSetRandomizerOptions");console.log(t);const n=function(t){let n;const o=function(){if(n)return n;{const o=RegExp(`(?:${e(t.inputSyntax.openDelim)})(.*?)(?:${e(t.inputSyntax.closeDelim)})`,"gm"),r=document.querySelector(t.query),i=r?r.innerHTML:"",s=[];let c=o.exec(i);for(;c;)s.push(c[1]),c=o.exec(i);return n=s}};return{getRawStructure:o,getOriginalStructure:function(){const e=[];for(const[n,r]of o().entries())e.push(r.split(t.inputSyntax.fieldSeparator).map((e,t)=>[n,t,e]));return e},renderSets:function(e){const n=[];for(const o of e){const e=[],r=0;for(const[n,i]of o.entries())if("d"!==i[3]){const o=(r+n)%t.colors.length,s=`style="color: ${t.colors[o]}; padding: 0px ${t.fieldPadding};"`;e.push(`<span ${s}> ${i[2]}</span>`)}n.push(e.join(t.outputSyntax.fieldSeparator))}const r=document.querySelector(t.query);let i=r?r.innerHTML:"";for(const[e,r]of o().entries())i=i.replace(`${t.inputSyntax.openDelim}${r}${t.inputSyntax.closeDelim}`,`${t.outputSyntax.openDelim}${n[e]}${t.outputSyntax.closeDelim}`);document.querySelector(t.query).innerHTML=i}}}(t);console.log(n.getOriginalStructure()),Persistence.removeItem("AnkiSetRandomizerOptions")}}();
