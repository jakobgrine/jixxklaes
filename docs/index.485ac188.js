!function(){function t(t,e,i,n){Object.defineProperty(t,e,{get:i,set:n,enumerable:!0,configurable:!0})}var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i={},n={},r=e.parcelRequire9b86;null==r&&((r=function(t){if(t in i)return i[t].exports;if(t in n){var e=n[t];delete n[t];var r={id:t,exports:{}};return i[t]=r,e.call(r.exports,r,r.exports),r.exports}var s=new Error("Cannot find module '"+t+"'");throw s.code="MODULE_NOT_FOUND",s}).register=function(t,e){n[t]=e},e.parcelRequire9b86=r),r.register("iE7OH",(function(e,i){var n,r;t(e.exports,"register",(function(){return n}),(function(t){return n=t})),t(e.exports,"resolve",(function(){return r}),(function(t){return r=t}));var s={};n=function(t){for(var e=Object.keys(t),i=0;i<e.length;i++)s[e[i]]=t[e[i]]},r=function(t){var e=s[t];if(null==e)throw new Error("Could not resolve bundle with id "+t);return e}})),r.register("aNJCr",(function(e,i){var n;t(e.exports,"getBundleURL",(function(){return n}),(function(t){return n=t}));var r={};function s(t){return(""+t).replace(/^((?:https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/.+)\/[^/]+$/,"$1")+"/"}n=function(t){var e=r[t];return e||(e=function(){try{throw new Error}catch(e){var t=(""+e.stack).match(/(https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/[^)\n]+/g);if(t)return s(t[2])}return"/"}(),r[t]=e),e}})),r("iE7OH").register(JSON.parse('{"baVEp":"index.485ac188.js","8R9kD":"still.5b1c1644.png","jCEmS":"walking_1.b14e8473.png","ap1kH":"walking_2.f3764bc3.png","czzrC":"walking_3.478d9ba0.png","iGBlG":"walking_4.f3764bc3.png","iVkn8":"jumping.05ea4910.png","9dsWg":"ground.ae3be667.png"}'));class s{add(t){return new s(this.x+t.x,this.y+t.y)}mul(t){return new s(this.x*t,this.y*t)}abs(){return new s(Math.abs(this.x),Math.abs(this.y))}constructor(t,e){this.x=t,this.y=e}}class o{get topLeft(){return this.r}get bottomRight(){return this.r.add(this.size)}get center(){return this.r.add(this.size.mul(.5))}collidesWith(t){return this.bottomRight.x>=t.topLeft.x&&this.topLeft.x<=t.bottomRight.x&&this.bottomRight.y>=t.topLeft.y&&this.topLeft.y<=t.bottomRight.y}overlapWith(t){const e=new s(1/0,1/0);return this.topLeft.x<t.topLeft.x?e.x=this.bottomRight.x-t.topLeft.x:this.bottomRight.x>t.bottomRight.x&&(e.x=t.bottomRight.x-this.topLeft.x),this.topLeft.y<t.topLeft.y?e.y=this.bottomRight.y-t.topLeft.y:this.bottomRight.y>t.bottomRight.y&&(e.y=t.bottomRight.y-this.topLeft.y),e.x=Math.min(e.x,this.size.x,t.size.x),e.y=Math.min(e.y,this.size.y,t.size.y),e}constructor(t,e,i,n){this.r=new s(t,e),this.size=new s(i,n)}}var l;l=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("8R9kD");var a;a=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("jCEmS");var h;h=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("ap1kH");var c;c=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("czzrC");var u;u=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("iGBlG");var d;d=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("iVkn8");var g;g=r("aNJCr").getBundleURL("baVEp")+r("iE7OH").resolve("9dsWg");const f={still:new URL(l),walking:[new URL(a),new URL(h),new URL(c),new URL(u)],jumping:new URL(d),ground:new URL(g)};function w(t){return new Promise(((e,i)=>{const n=new Image;n.onerror=i,n.onload=()=>e(n),n.src=t.toString()}))}let p;async function y(){p=await async function(t){const e=[];let i={ground:void 0,jumping:void 0,walking:[],still:void 0};for(const n of Object.keys(t))if(Array.isArray(t[n]))for(let r=0;r<t[n].length;r++)e.push(w(t[n][r]).then((t=>i[n][r]=t)));else e.push(w(t[n]).then((t=>i[n]=t)));return await Promise.all(e),i}(f)}const x=30;class v extends o{paint(t){for(let e=0;e<this.size.x/x;e++)for(let i=0;i<this.size.y/x;i++)t.drawImage(p.ground,this.r.x+e*x,this.r.y+i*x,x,x);I&&(t.strokeStyle="red",t.strokeRect(this.r.x,this.r.y,this.size.x,this.size.y))}constructor(t,e,i,n){super(t,e,i,n)}}function m(t,e,i){if(!e.has(t))throw new TypeError("attempted to "+i+" private field on non-instance");return e.get(t)}function b(t,e){return e.get?e.get.call(t):e.value}function R(t,e){return b(t,m(t,e,"get"))}function E(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")}function L(t,e,i){E(t,e),e.set(t,i)}function k(t,e,i){if(e.set)e.set.call(t,i);else{if(!e.writable)throw new TypeError("attempted to set read only private field");e.value=i}}function _(t,e,i){return k(t,m(t,e,"set"),i),i}function z(t,e){if(e.set)return"__destrWrapper"in e||(e.__destrWrapper={set value(i){e.set.call(t,i)},get value(){return e.get.call(t)}}),e.__destrWrapper;if(!e.writable)throw new TypeError("attempted to set read only private field");return e}function H(t,e){return z(t,m(t,e,"update"))}function S(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}let A;var j;(j=A||(A={})).Left="Left",j.Right="Right";var C=new WeakMap,U=new WeakMap;class M extends o{update(t){this.walking===A.Left?this.v.x=-40:this.walking===A.Right&&(this.v.x=40);const e=this.v.x>0?1:-1;0!==this.v.x&&this.collision.ground&&!this.walking&&(this.v.x-=4*e),this.v.x<0||this.walking===A.Left?this.direction=A.Left:(this.v.x>0||this.walking===A.Right)&&(this.direction=A.Right),this.collision.ground||(this.v.y+=-40*t),this.v.y<-120&&(this.v.y=-120),this.r=this.r.add(this.v.mul(t))}paint(t){if(I&&(t.strokeStyle="blue",t.strokeRect(this.r.x,this.r.y,this.size.x,this.size.y)),t.save(),t.translate(this.center.x,this.center.y),t.scale(this.direction===A.Left?-1:1,-1),t.translate(-this.center.x,-this.center.y),this.collision.ground)if(!this.walking||this.collision.wall_left||this.collision.wall_right){const e=p.still;t.drawImage(e,this.r.x,this.r.y,this.size.x,this.size.y)}else{const e=p.walking[R(this,C)];t.drawImage(e,this.r.x,this.r.y,e.width/p.still.width*this.size.x,this.size.y),H(this,U).value++,_(this,U,R(this,U)%8),0===R(this,U)&&(H(this,C).value++,_(this,C,R(this,C)%p.walking.length))}else{const e=p.jumping,i=e.width/p.still.width*this.size.x,n=e.height/p.still.height*this.size.y,r=i-this.size.x;t.drawImage(e,this.r.x-r/2,this.r.y,i,n)}t.restore()}jump(){this.jumps<3&&(this.jumps++,this.v.y=120)}constructor(t,e,i){super(t,e,p.still.width/p.still.height*i,i),S(this,"v",new s(0,0)),S(this,"collision",{ground:!1,ceiling:!1,wall_left:!1,wall_right:!1}),S(this,"jumps",0),L(this,C,{writable:!0,value:0}),L(this,U,{writable:!0,value:0})}}let O,B;function F(t){var e,i,n,r;t=decodeURI(t),O=function(t){let e=1779033703,i=3144134277,n=1013904242,r=2773480762;for(let s,o=0;o<t.length;o++)s=t.charCodeAt(o),e=i^Math.imul(e^s,597399067),i=n^Math.imul(i^s,2869860233),n=r^Math.imul(n^s,951274213),r=e^Math.imul(r^s,2716044179);return e=Math.imul(n^e>>>18,597399067),i=Math.imul(r^i>>>22,2869860233),n=Math.imul(e^n>>>17,951274213),r=Math.imul(i^r>>>19,2716044179),[(e^i^n^r)>>>0,(i^e)>>>0,(n^e)>>>0,(r^e)>>>0]}(t),e=O[0],i=O[1],n=O[2],r=O[3],B=function(){var t=(e>>>=0)+(i>>>=0)|0;return e=i^i>>>9,i=(n>>>=0)+(n<<3)|0,n=(n=n<<21|n>>>11)+(t=t+(r=1+(r>>>=0)|0)|0)|0,(t>>>0)/4294967296};const s=document.getElementById("seed");s&&(s.value=t),window.location.hash=`#${t}`,document.title=t}let I=!1;let N,W,J,V=0;const T=[new v(0,0,800,x)];let $=T.slice();window.addEventListener("load",(async function(){if(await y(),J=new M(250,200,70),N=document.getElementById("canvas"),!N)return void console.error("failed to get canvas element");if(W=N.getContext("2d"),!W)return void console.error("failed to get canvas context");nt();const t=document.getElementById("seed");if(!t)return void console.error("failed to get seed input element");const e=t=>{F(t),N&&Q(!0)};t.addEventListener("input",(t=>e(t.target.value))),window.addEventListener("hashchange",(()=>e(window.location.hash.substring(1)))),e(window.location.hash.substring(1)||"Jixxklääs"),document.addEventListener("keydown",Z),document.addEventListener("keyup",Z),window.requestAnimationFrame(G)}));let D,P=0,q=-1;function G(t){if(window.requestAnimationFrame(G),!t)return;const e=-1===q?0:(t-q)/100;if(q=t,!N||!W)return void console.error("canvas or context are falsy");W.clearRect(0,V,N.width,N.height),I&&(0===P&&(D=(10/e).toFixed(1)),P++,P%=10,W.fillStyle="lightgreen",W.textAlign="right",tt(`${D}\n      ${J.jumps}`,N.width-20,20)),J.update(e);const i=J.r.y+J.size.y-V-.6*N.height;i>0&&(V+=i,W.translate(0,-i));const n=J.r.y-V-N.height/5;n<0&&(V+=n,W.translate(0,-n)),function(){J.collision={ground:!1,ceiling:!1,wall_left:!1,wall_right:!1};for(const t of $)if(J.collidesWith(t)){const e=J.overlapWith(t).abs();e.y<e.x?(J.center.y>t.center.y?(J.r.y=t.r.y+t.size.y,J.collision.ground=!0):(J.r.y=t.r.y-J.size.y,J.collision.ceiling=!0),J.v.y=0):(J.center.x>t.center.x?(J.r.x=t.r.x+t.size.x,J.collision.wall_left=!0):(J.r.x=t.r.x-J.size.x,J.collision.wall_right=!0),J.v.x=0)}J.r.x<=0?(J.r.x=0,J.collision.wall_left=!0):J.r.x+J.size.x>=N.width&&(J.r.x=N.width-J.size.x,J.collision.wall_right=!0)}(),J.paint(W),$.forEach((t=>t.paint(W))),function(){const t=Math.floor(J.r.y/250);J.collision.ground?(J.jumps=0,et=t,et>it&&(it=et,localStorage.setItem("highscore",it.toString()))):t<et&&(et=t);W.textAlign="left",W.fillStyle="white",tt(`Score: ${et}\nHighscore: ${it}`,20,20)}(),Q()}let K=0;function Q(t=!1){for(t&&(K=0,$=T.slice());K-J.r.y<2*N.height;){const t=Math.round((100+100*B())/x)*x,e=x,i=(N.width-t)*B(),n=K+250;K=n,$.push(new v(i,n,t,e))}}let X=!1,Y=!1;function Z(t){if("keydown"===t.type)switch(t.code){case"Space":J.jump();break;case"KeyA":case"ArrowLeft":X=!0,J.walking=A.Left;break;case"KeyD":case"ArrowRight":Y=!0,J.walking=A.Right}else if("keyup"===t.type)switch(t.code){case"KeyA":case"ArrowLeft":X=!1,J.walking=Y?A.Right:null;break;case"KeyD":case"ArrowRight":Y=!1,J.walking=X?A.Left:null}}function tt(t,e,i){W.save(),W.translate(0,N.height+V),W.scale(1,-1);const n=t.split("\n");for(let t=0;t<n.length;t++)W.font="20px 'Press Start 2P'",W.fillText(n[t],e,i+20+30*t);W.restore()}let et=0,it=localStorage.getItem("highscore")||0;function nt(){if(!N)return;const{width:t,height:e}=N.parentElement.getBoundingClientRect();N.height=e,N.width=t,W.scale(1,-1),W.translate(0,-N.height-V)}window.addEventListener("resize",nt)}();
//# sourceMappingURL=index.485ac188.js.map
