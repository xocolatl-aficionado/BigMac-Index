var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function c(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}let r,a;function l(e,t){return r||(r=document.createElement("a")),r.href=t,e===r.href}function i(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function u(e){e.parentNode&&e.parentNode.removeChild(e)}function f(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function h(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function m(){return p(" ")}function g(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function v(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function y(e,t){t=""+t,e.data!==t&&(e.data=t)}function $(e,t,n){for(let n=0;n<e.options.length;n+=1){const o=e.options[n];if(o.__value===t)return void(o.selected=!0)}n&&void 0===t||(e.selectedIndex=-1)}function _(e){const t=e.querySelector(":checked");return t&&t.__value}function x(e){a=e}function b(e){(function(){if(!a)throw new Error("Function called outside component initialization");return a})().$$.on_mount.push(e)}const C=[],w=[];let E=[];const k=[],M=Promise.resolve();let N=!1;function B(e){E.push(e)}const D=new Set;let A=0;function L(){if(0!==A)return;const e=a;do{try{for(;A<C.length;){const e=C[A];A++,x(e),S(e.$$)}}catch(e){throw C.length=0,A=0,e}for(x(null),C.length=0,A=0;w.length;)w.pop()();for(let e=0;e<E.length;e+=1){const t=E[e];D.has(t)||(D.add(t),t())}E.length=0}while(C.length);for(;k.length;)k.pop()();N=!1,D.clear(),x(e)}function S(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(B)}}const I=new Set;let R;function U(e,t){e&&e.i&&(I.delete(e),e.i(t))}function j(e,n,s,r){const{fragment:a,after_update:l}=e.$$;a&&a.m(n,s),r||B(()=>{const n=e.$$.on_mount.map(t).filter(c);e.$$.on_destroy?e.$$.on_destroy.push(...n):o(n),e.$$.on_mount=[]}),l.forEach(B)}function F(e,t){const n=e.$$;null!==n.fragment&&(!function(e){const t=[],n=[];E.forEach(o=>-1===e.indexOf(o)?t.push(o):n.push(o)),n.forEach(e=>e()),E=t}(n.after_update),o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function H(e,t){-1===e.$$.dirty[0]&&(C.push(e),N||(N=!0,M.then(L)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function O(t,c,s,r,l,i,d,f=[-1]){const h=a;x(t);const p=t.$$={fragment:null,ctx:[],props:i,update:e,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(h?h.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:c.target||h.$$.root};d&&d(p.root);let m=!1;if(p.ctx=s?s(t,c.props||{},(e,n,...o)=>{const c=o.length?o[0]:n;return p.ctx&&l(p.ctx[e],p.ctx[e]=c)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](c),m&&H(t,e)),n}):[],p.update(),m=!0,o(p.before_update),p.fragment=!!r&&r(p.ctx),c.target){if(c.hydrate){const e=(g=c.target,Array.from(g.childNodes));p.fragment&&p.fragment.l(e),e.forEach(u)}else p.fragment&&p.fragment.c();c.intro&&U(t.$$.fragment),j(t,c.target,c.anchor,c.customElement),L()}var g;x(h)}class z{$destroy(){F(this,1),this.$destroy=e}$on(t,n){if(!c(n))return e;const o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{const e=o.indexOf(n);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function q(e,t,n){const o=e.slice();return o[12]=t[n],o}function T(e,t,n){const o=e.slice();return o[12]=t[n],o}function Y(e){let t,n,o,c=e[12].name+"";return{c(){t=h("option"),n=p(c),t.__value=o=e[12],t.value=t.__value},m(e,o){d(e,t,o),i(t,n)},p(e,s){4&s&&c!==(c=e[12].name+"")&&y(n,c),4&s&&o!==(o=e[12])&&(t.__value=o,t.value=t.__value)},d(e){e&&u(t)}}}function P(e){let t,n,o,c=e[12].name+"";return{c(){t=h("option"),n=p(c),t.__value=o=e[12],t.value=t.__value},m(e,o){d(e,t,o),i(t,n)},p(e,s){4&s&&c!==(c=e[12].name+"")&&y(n,c),4&s&&o!==(o=e[12])&&(t.__value=o,t.value=t.__value)},d(e){e&&u(t)}}}function G(e){let t,n=(e[0],e[1]),o=J(e);return{c(){o.c(),t=p("")},m(e,n){o.m(e,n),d(e,t,n)},p(e,c){3&c&&s(n,(e[0],n=e[1]))?(o.d(1),(o=J(e)).c(),o.m(t.parentNode,t)):o.p(e,c)},d(e){e&&u(t),o.d(e)}}}function J(e){let t,n,o,c,s,r,a,f,g,$,_,x,b,C,w,E,k,M,N,B,D,A,L,S,I,R,U,j,F,H,O,z,q,T,Y,P,G,J,K,V,W,X,Z,ee,te,ne,oe,ce,se,re,ae,le,ie,de,ue,fe,he=Q(e[3])+"",pe=Q(e[6][e[1].code]/e[6][e[0].code])+"",me=e[0].name+"",ge=Q(e[6][e[0].code])+"",ve=e[0].code+"",ye=Q(e[6][e[1].code]/e[3])+"",$e=e[0].code+"",_e=e[1].name+"",xe=Q(e[6][e[0].code])+"",be=e[0].code+"",Ce=Q(e[6][e[1].code]/e[3])+"",we=e[0].code+"";return{c(){t=h("div"),n=h("p"),o=p(e[4]),c=m(),s=h("br"),r=p("\n      Exchange Rate: "),a=h("span"),f=p(he),g=p(" Implied Exchange Rate: "),$=h("span"),_=p(pe),x=m(),b=h("br"),C=p("\n      A Big Mac bought in "),w=p(me),E=p(" for "),k=h("span"),M=p(ge),N=m(),B=p(ve),D=m(),A=h("br"),L=p(" would be valued at "),S=h("span"),I=p(ye),R=m(),U=p($e),j=p(" in "),F=p(_e),H=m(),O=h("div"),z=h("div"),q=h("div"),T=h("img"),P=m(),G=h("p"),J=h("span"),V=m(),W=p(xe),X=m(),Z=p(be),ee=m(),te=h("div"),ne=h("img"),ce=m(),se=h("p"),re=h("span"),le=m(),ie=p(Ce),de=m(),ue=p(we),v(a,"class","bold-number svelte-t6hexy"),v($,"class","bold-number svelte-t6hexy"),v(k,"class","bold-number svelte-t6hexy"),v(S,"class","bold-number svelte-t6hexy"),v(n,"class","valuation svelte-t6hexy"),v(t,"class","result-container svelte-t6hexy"),v(T,"class","big-mac-image svelte-t6hexy"),l(T.src,Y="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")||v(T,"src","https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off"),v(T,"alt","Big Mac"),v(J,"class",K="flag-icon flag-icon-"+e[0].code.toLowerCase()+" svelte-t6hexy"),v(G,"class","label svelte-t6hexy"),v(q,"class","svelte-t6hexy"),v(ne,"class","big-mac-image svelte-t6hexy"),l(ne.src,oe="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")||v(ne,"src","https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off"),v(ne,"alt","Big Mac"),v(re,"class",ae="flag-icon flag-icon-"+e[1].code.toLowerCase()+" svelte-t6hexy"),v(se,"class","label svelte-t6hexy"),v(te,"class","svelte-t6hexy"),v(z,"class","image-container svelte-t6hexy"),v(O,"class",fe="big-mac-container "+(e[5]?"show":"")+" svelte-t6hexy")},m(e,l){d(e,t,l),i(t,n),i(n,o),i(n,c),i(n,s),i(n,r),i(n,a),i(a,f),i(n,g),i(n,$),i($,_),i(n,x),i(n,b),i(n,C),i(n,w),i(n,E),i(n,k),i(k,M),i(k,N),i(k,B),i(n,D),i(n,A),i(n,L),i(n,S),i(S,I),i(S,R),i(S,U),i(n,j),i(n,F),d(e,H,l),d(e,O,l),i(O,z),i(z,q),i(q,T),i(q,P),i(q,G),i(G,J),i(G,V),i(G,W),i(G,X),i(G,Z),i(z,ee),i(z,te),i(te,ne),i(te,ce),i(te,se),i(se,re),i(se,le),i(se,ie),i(se,de),i(se,ue)},p(e,t){16&t&&y(o,e[4]),8&t&&he!==(he=Q(e[3])+"")&&y(f,he),3&t&&pe!==(pe=Q(e[6][e[1].code]/e[6][e[0].code])+"")&&y(_,pe),1&t&&me!==(me=e[0].name+"")&&y(w,me),1&t&&ge!==(ge=Q(e[6][e[0].code])+"")&&y(M,ge),1&t&&ve!==(ve=e[0].code+"")&&y(B,ve),10&t&&ye!==(ye=Q(e[6][e[1].code]/e[3])+"")&&y(I,ye),1&t&&$e!==($e=e[0].code+"")&&y(U,$e),2&t&&_e!==(_e=e[1].name+"")&&y(F,_e),5&t&&K!==(K="flag-icon flag-icon-"+e[0].code.toLowerCase()+" svelte-t6hexy")&&v(J,"class",K),1&t&&xe!==(xe=Q(e[6][e[0].code])+"")&&y(W,xe),1&t&&be!==(be=e[0].code+"")&&y(Z,be),6&t&&ae!==(ae="flag-icon flag-icon-"+e[1].code.toLowerCase()+" svelte-t6hexy")&&v(re,"class",ae),10&t&&Ce!==(Ce=Q(e[6][e[1].code]/e[3])+"")&&y(ie,Ce),1&t&&we!==(we=e[0].code+"")&&y(ue,we),32&t&&fe!==(fe="big-mac-container "+(e[5]?"show":"")+" svelte-t6hexy")&&v(O,"class",fe)},d(e){e&&u(t),e&&u(H),e&&u(O)}}}function K(t){let n,c,s,r,a,l,p,y,_,x,b,C=t[2],w=[];for(let e=0;e<C.length;e+=1)w[e]=Y(T(t,C,e));let E=t[2],k=[];for(let e=0;e<E.length;e+=1)k[e]=P(q(t,E,e));let M=t[4]&&G(t);return{c(){n=h("main"),(c=h("h1")).textContent="Big Mac Index",s=m(),(r=h("h1")).innerHTML='How valuable is <span class="different-color svelte-t6hexy">your</span>  currency?',a=m(),l=h("select");for(let e=0;e<w.length;e+=1)w[e].c();p=m(),y=h("select");for(let e=0;e<k.length;e+=1)k[e].c();_=m(),M&&M.c(),v(c,"class","svelte-t6hexy"),v(r,"class","svelte-t6hexy"),v(l,"id","country1-dropdown"),v(l,"class","svelte-t6hexy"),void 0===t[0]&&B(()=>t[8].call(l)),v(y,"id","country2-dropdown"),v(y,"class","svelte-t6hexy"),void 0===t[1]&&B(()=>t[9].call(y)),v(n,"class","svelte-t6hexy")},m(e,o){d(e,n,o),i(n,c),i(n,s),i(n,r),i(n,a),i(n,l);for(let e=0;e<w.length;e+=1)w[e]&&w[e].m(l,null);$(l,t[0],!0),i(n,p),i(n,y);for(let e=0;e<k.length;e+=1)k[e]&&k[e].m(y,null);$(y,t[1],!0),i(n,_),M&&M.m(n,null),x||(b=[g(l,"change",t[8]),g(l,"change",t[7]),g(y,"change",t[9]),g(y,"change",t[7])],x=!0)},p(e,[t]){if(4&t){let n;for(C=e[2],n=0;n<C.length;n+=1){const o=T(e,C,n);w[n]?w[n].p(o,t):(w[n]=Y(o),w[n].c(),w[n].m(l,null))}for(;n<w.length;n+=1)w[n].d(1);w.length=C.length}if(5&t&&$(l,e[0]),4&t){let n;for(E=e[2],n=0;n<E.length;n+=1){const o=q(e,E,n);k[n]?k[n].p(o,t):(k[n]=P(o),k[n].c(),k[n].m(y,null))}for(;n<k.length;n+=1)k[n].d(1);k.length=E.length}6&t&&$(y,e[1]),e[4]?M?M.p(e,t):((M=G(e)).c(),M.m(n,null)):M&&(M.d(1),M=null)},i:e,o:e,d(e){e&&u(n),f(w,e),f(k,e),M&&M.d(),x=!1,o(b)}}}function Q(e){return Number(e).toFixed(2)}function V(e,t,n){let o,c,{countries:s}=t,{selectedCountry1:r}=t,{selectedCountry2:a}=t;const l={CAD:6.77,CNY:24,INR:191,USD:5.15,EUR:4.65,CHF:6.5};let i=!1;function d(){const e=l[r.code],t=l[a.code]/e;return t>o?`${a.code} is overvalued relative to ${r.code}`:t<o?`${a.code} is undervalued relative to ${r.code}`:`${a.code} is fairly valued relative to ${r.code}`}async function u(){n(3,o=await async function(e){const t=await fetch(`https://api.exchangerate-api.com/v4/latest/${r.code}`);return(await t.json()).rates[e]}(a.code)),n(4,c=d()),n(5,i=!0)}return b(async()=>{await u(),n(4,c=d())}),e.$$set=(e=>{"countries"in e&&n(2,s=e.countries),"selectedCountry1"in e&&n(0,r=e.selectedCountry1),"selectedCountry2"in e&&n(1,a=e.selectedCountry2)}),[r,a,s,o,c,i,l,u,function(){r=_(this),n(0,r),n(2,s)},function(){a=_(this),n(1,a),n(2,s)}]}class W extends z{constructor(e){super(),O(this,e,V,K,s,{countries:2,selectedCountry1:0,selectedCountry2:1})}}function X(t){let n,o;return n=new W({props:{countries:t[0],selectedCountry1:void 0,selectedCountry2:void 0}}),{c(){var e;(e=n.$$.fragment)&&e.c()},m(e,t){j(n,e,t),o=!0},p:e,i(e){o||(U(n.$$.fragment,e),o=!0)},o(e){!function(e,t,n,o){if(e&&e.o){if(I.has(e))return;I.add(e),R.c.push(()=>{I.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}else o&&o()}(n.$$.fragment,e),o=!1},d(e){F(n,e)}}}function Z(e){return[[{name:"United States",code:"USD"},{name:"Eurozone",code:"EUR"},{name:"India",code:"INR"},{name:"China",code:"CNY"},{name:"Canada",code:"CAD"},{name:"Switzerland",code:"CHF"}]]}return new class extends z{constructor(e){super(),O(this,e,Z,X,s,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
