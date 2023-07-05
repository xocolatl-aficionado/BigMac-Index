var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function c(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}let r,l;function a(e,t){return r||(r=document.createElement("a")),r.href=t,e===r.href}function i(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function u(e){e.parentNode&&e.parentNode.removeChild(e)}function f(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function m(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function h(){return p(" ")}function g(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function v(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function $(e,t){t=""+t,e.data!==t&&(e.data=t)}function _(e,t,n){for(let n=0;n<e.options.length;n+=1){const o=e.options[n];if(o.__value===t)return void(o.selected=!0)}n&&void 0===t||(e.selectedIndex=-1)}function b(e){const t=e.querySelector(":checked");return t&&t.__value}function y(e){l=e}function k(e){(function(){if(!l)throw new Error("Function called outside component initialization");return l})().$$.on_mount.push(e)}const w=[],C=[];let x=[];const E=[],N=Promise.resolve();let M=!1;function B(e){x.push(e)}const D=new Set;let A=0;function I(){if(0!==A)return;const e=l;do{try{for(;A<w.length;){const e=w[A];A++,y(e),L(e.$$)}}catch(e){throw w.length=0,A=0,e}for(y(null),w.length=0,A=0;C.length;)C.pop()();for(let e=0;e<x.length;e+=1){const t=x[e];D.has(t)||(D.add(t),t())}x.length=0}while(w.length);for(;E.length;)E.pop()();M=!1,D.clear(),y(e)}function L(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(B)}}const S=new Set;let R;function F(e,t){e&&e.i&&(S.delete(e),e.i(t))}function U(e,n,s,r){const{fragment:l,after_update:a}=e.$$;l&&l.m(n,s),r||B(()=>{const n=e.$$.on_mount.map(t).filter(c);e.$$.on_destroy?e.$$.on_destroy.push(...n):o(n),e.$$.on_mount=[]}),a.forEach(B)}function j(e,t){const n=e.$$;null!==n.fragment&&(!function(e){const t=[],n=[];x.forEach(o=>-1===e.indexOf(o)?t.push(o):n.push(o)),n.forEach(e=>e()),x=t}(n.after_update),o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function H(e,t){-1===e.$$.dirty[0]&&(w.push(e),M||(M=!0,N.then(I)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function O(t,c,s,r,a,i,d,f=[-1]){const m=l;y(t);const p=t.$$={fragment:null,ctx:[],props:i,update:e,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(m?m.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:c.target||m.$$.root};d&&d(p.root);let h=!1;if(p.ctx=s?s(t,c.props||{},(e,n,...o)=>{const c=o.length?o[0]:n;return p.ctx&&a(p.ctx[e],p.ctx[e]=c)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](c),h&&H(t,e)),n}):[],p.update(),h=!0,o(p.before_update),p.fragment=!!r&&r(p.ctx),c.target){if(c.hydrate){const e=(g=c.target,Array.from(g.childNodes));p.fragment&&p.fragment.l(e),e.forEach(u)}else p.fragment&&p.fragment.c();c.intro&&F(t.$$.fragment),U(t,c.target,c.anchor,c.customElement),I()}var g;y(m)}class z{$destroy(){j(this,1),this.$destroy=e}$on(t,n){if(!c(n))return e;const o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{const e=o.indexOf(n);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function q(e,t,n){const o=e.slice();return o[13]=t[n],o}function T(e,t,n){const o=e.slice();return o[13]=t[n],o}function X(e){let t,n,o,c=e[13].name+"";return{c(){t=m("option"),n=p(c),t.__value=o=e[13],t.value=t.__value},m(e,o){d(e,t,o),i(t,n)},p(e,s){4&s&&c!==(c=e[13].name+"")&&$(n,c),4&s&&o!==(o=e[13])&&(t.__value=o,t.value=t.__value)},d(e){e&&u(t)}}}function Y(e){let t,n,o,c=e[13].name+"";return{c(){t=m("option"),n=p(c),t.__value=o=e[13],t.value=t.__value},m(e,o){d(e,t,o),i(t,n)},p(e,s){4&s&&c!==(c=e[13].name+"")&&$(n,c),4&s&&o!==(o=e[13])&&(t.__value=o,t.value=t.__value)},d(e){e&&u(t)}}}function P(e){let t,n=(e[0],e[1]),o=G(e);return{c(){o.c(),t=p("")},m(e,n){o.m(e,n),d(e,t,n)},p(e,c){3&c&&s(n,(e[0],n=e[1]))?(o.d(1),(o=G(e)).c(),o.m(t.parentNode,t)):o.p(e,c)},d(e){e&&u(t),o.d(e)}}}function G(e){let t,n,o,c,s,r,l,f,g,_,b,y,k,w,C,x,E,N,M,B,D,A,I,L,S,R,F,U,j,H,O,z,q,T,X,Y,P,G,J,K,Q,V,W,Z,ee,te,ne,oe,ce,se,re,le,ae,ie,de,ue,fe,me,pe=e[8](1,e[0].code)+"",he=e[8](e[3],e[1].code)+"",ge=e[8](1,e[0].code)+"",ve=e[8](e[6][e[1].code]/e[6][e[0].code],e[1].code)+"",$e=e[0].name+"",_e=e[8](e[6][e[0].code],e[0].code)+"",be=e[8](e[6][e[1].code]/e[3],e[0].code)+"",ye=e[1].name+"",ke=e[8](e[6][e[0].code])+"",we=e[0].code+"",Ce=e[8](e[6][e[1].code]/e[3])+"",xe=e[0].code+"";return{c(){t=m("div"),n=m("p"),o=p(e[4]),c=h(),s=m("br"),r=p("\n      EX Rate: "),l=p(pe),f=p(" = "),g=m("span"),_=p(he),b=h(),y=m("br"),k=p("Implied EX Rate: "),w=p(ge),C=p(" = "),x=m("span"),E=p(ve),N=h(),M=m("br"),B=p("\n      A Big Mac™ bought in "),D=p($e),A=p(" for "),I=m("span"),L=p(_e),S=h(),R=m("br"),F=p(" would be valued at "),U=m("span"),j=p(be),H=p(" in "),O=p(ye),z=h(),q=m("div"),T=m("div"),X=m("div"),Y=m("img"),G=h(),J=m("p"),K=m("span"),V=h(),W=p(ke),Z=h(),ee=p(we),te=h(),ne=m("div"),oe=m("img"),se=h(),re=m("p"),le=m("span"),ie=h(),de=p(Ce),ue=h(),fe=p(xe),v(g,"class","bold-number svelte-1fsck49"),v(x,"class","bold-number svelte-1fsck49"),v(I,"class","bold-number svelte-1fsck49"),v(U,"class","bold-number svelte-1fsck49"),v(n,"class","valuation svelte-1fsck49"),v(t,"class","result-container svelte-1fsck49"),v(Y,"class","big-mac-image svelte-1fsck49"),a(Y.src,P="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")||v(Y,"src","https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off"),v(Y,"alt","Big Mac"),v(K,"class",Q="flag-icon flag-icon-"+e[0].code.toLowerCase()+" svelte-1fsck49"),v(J,"class","label svelte-1fsck49"),v(X,"class","svelte-1fsck49"),v(oe,"class","big-mac-image svelte-1fsck49"),a(oe.src,ce="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")||v(oe,"src","https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off"),v(oe,"alt","Big Mac"),v(le,"class",ae="flag-icon flag-icon-"+e[1].code.toLowerCase()+" svelte-1fsck49"),v(re,"class","label svelte-1fsck49"),v(ne,"class","svelte-1fsck49"),v(T,"class","image-container svelte-1fsck49"),v(q,"class",me="big-mac-container "+(e[5]?"show":"")+" svelte-1fsck49")},m(e,a){d(e,t,a),i(t,n),i(n,o),i(n,c),i(n,s),i(n,r),i(n,l),i(n,f),i(n,g),i(g,_),i(n,b),i(n,y),i(n,k),i(n,w),i(n,C),i(n,x),i(x,E),i(n,N),i(n,M),i(n,B),i(n,D),i(n,A),i(n,I),i(I,L),i(n,S),i(n,R),i(n,F),i(n,U),i(U,j),i(n,H),i(n,O),d(e,z,a),d(e,q,a),i(q,T),i(T,X),i(X,Y),i(X,G),i(X,J),i(J,K),i(J,V),i(J,W),i(J,Z),i(J,ee),i(T,te),i(T,ne),i(ne,oe),i(ne,se),i(ne,re),i(re,le),i(re,ie),i(re,de),i(re,ue),i(re,fe)},p(e,t){16&t&&$(o,e[4]),1&t&&pe!==(pe=e[8](1,e[0].code)+"")&&$(l,pe),10&t&&he!==(he=e[8](e[3],e[1].code)+"")&&$(_,he),1&t&&ge!==(ge=e[8](1,e[0].code)+"")&&$(w,ge),3&t&&ve!==(ve=e[8](e[6][e[1].code]/e[6][e[0].code],e[1].code)+"")&&$(E,ve),1&t&&$e!==($e=e[0].name+"")&&$(D,$e),1&t&&_e!==(_e=e[8](e[6][e[0].code],e[0].code)+"")&&$(L,_e),11&t&&be!==(be=e[8](e[6][e[1].code]/e[3],e[0].code)+"")&&$(j,be),2&t&&ye!==(ye=e[1].name+"")&&$(O,ye),5&t&&Q!==(Q="flag-icon flag-icon-"+e[0].code.toLowerCase()+" svelte-1fsck49")&&v(K,"class",Q),1&t&&ke!==(ke=e[8](e[6][e[0].code])+"")&&$(W,ke),1&t&&we!==(we=e[0].code+"")&&$(ee,we),6&t&&ae!==(ae="flag-icon flag-icon-"+e[1].code.toLowerCase()+" svelte-1fsck49")&&v(le,"class",ae),10&t&&Ce!==(Ce=e[8](e[6][e[1].code]/e[3])+"")&&$(de,Ce),1&t&&xe!==(xe=e[0].code+"")&&$(fe,xe),32&t&&me!==(me="big-mac-container "+(e[5]?"show":"")+" svelte-1fsck49")&&v(q,"class",me)},d(e){e&&u(t),e&&u(z),e&&u(q)}}}function J(t){let n,c,s,r,l,a,p,$,b,y,k,w=t[2],C=[];for(let e=0;e<w.length;e+=1)C[e]=X(T(t,w,e));let x=t[2],E=[];for(let e=0;e<x.length;e+=1)E[e]=Y(q(t,x,e));let N=t[4]&&P(t);return{c(){n=m("main"),(c=m("h1")).textContent="Big Mac Index",s=h(),(r=m("h1")).innerHTML='How valuable is <span class="different-color svelte-1fsck49">your</span>  currency?',l=h(),a=m("select");for(let e=0;e<C.length;e+=1)C[e].c();p=h(),$=m("select");for(let e=0;e<E.length;e+=1)E[e].c();b=h(),N&&N.c(),v(c,"class","svelte-1fsck49"),v(r,"class","svelte-1fsck49"),v(a,"id","country1-dropdown"),v(a,"class","svelte-1fsck49"),void 0===t[0]&&B(()=>t[9].call(a)),v($,"id","country2-dropdown"),v($,"class","svelte-1fsck49"),void 0===t[1]&&B(()=>t[10].call($)),v(n,"class","scrollable svelte-1fsck49")},m(e,o){d(e,n,o),i(n,c),i(n,s),i(n,r),i(n,l),i(n,a);for(let e=0;e<C.length;e+=1)C[e]&&C[e].m(a,null);_(a,t[0],!0),i(n,p),i(n,$);for(let e=0;e<E.length;e+=1)E[e]&&E[e].m($,null);_($,t[1],!0),i(n,b),N&&N.m(n,null),y||(k=[g(a,"change",t[9]),g(a,"change",t[7]),g($,"change",t[10]),g($,"change",t[7])],y=!0)},p(e,[t]){if(4&t){let n;for(w=e[2],n=0;n<w.length;n+=1){const o=T(e,w,n);C[n]?C[n].p(o,t):(C[n]=X(o),C[n].c(),C[n].m(a,null))}for(;n<C.length;n+=1)C[n].d(1);C.length=w.length}if(5&t&&_(a,e[0]),4&t){let n;for(x=e[2],n=0;n<x.length;n+=1){const o=q(e,x,n);E[n]?E[n].p(o,t):(E[n]=Y(o),E[n].c(),E[n].m($,null))}for(;n<E.length;n+=1)E[n].d(1);E.length=x.length}6&t&&_($,e[1]),e[4]?N?N.p(e,t):((N=P(e)).c(),N.m(n,null)):N&&(N.d(1),N=null)},i:e,o:e,d(e){e&&u(n),f(C,e),f(E,e),N&&N.d(),y=!1,o(k)}}}function K(e,t,n){let o,c,{countries:s}=t,{selectedCountry1:r}=t,{selectedCountry2:l}=t;const a={CAD:6.77,CNY:24,INR:191,USD:5.15,EUR:4.65,CHF:6.5};let i=!1;function d(){const e=a[r.code],t=a[l.code]/e;return t>o?`${l.code} is overvalued relative to ${r.code}`:t<o?`${l.code} is undervalued relative to ${r.code}`:`${l.code} is fairly valued relative to ${r.code}`}async function u(){n(3,o=await async function(e){const t=await fetch(`https://api.exchangerate-api.com/v4/latest/${r.code}`);return(await t.json()).rates[e]}(l.code)),n(4,c=d()),n(5,i=!0)}return k(async()=>{await u(),n(4,c=d())}),e.$$set=(e=>{"countries"in e&&n(2,s=e.countries),"selectedCountry1"in e&&n(0,r=e.selectedCountry1),"selectedCountry2"in e&&n(1,l=e.selectedCountry2)}),[r,l,s,o,c,i,a,u,function(e,t){return t?new Intl.NumberFormat(r.locale,{style:"currency",currency:t}).format(e):Number(e).toFixed(2)},function(){r=b(this),n(0,r),n(2,s)},function(){l=b(this),n(1,l),n(2,s)}]}class Q extends z{constructor(e){super(),O(this,e,K,J,s,{countries:2,selectedCountry1:0,selectedCountry2:1})}}function V(t){let n,o;return n=new Q({props:{countries:t[0],selectedCountry1:void 0,selectedCountry2:void 0}}),{c(){var e;(e=n.$$.fragment)&&e.c()},m(e,t){U(n,e,t),o=!0},p:e,i(e){o||(F(n.$$.fragment,e),o=!0)},o(e){!function(e,t,n,o){if(e&&e.o){if(S.has(e))return;S.add(e),R.c.push(()=>{S.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}else o&&o()}(n.$$.fragment,e),o=!1},d(e){j(n,e)}}}function W(e){return[[{name:"United States",code:"USD"},{name:"Eurozone",code:"EUR"},{name:"India",code:"INR"},{name:"China",code:"CNY"},{name:"Canada",code:"CAD"},{name:"Switzerland",code:"CHF"}]]}return new class extends z{constructor(e){super(),O(this,e,W,V,s,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
