function t(t,e,i,n){Object.defineProperty(t,e,{get:i,set:n,enumerable:!0,configurable:!0})}var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i={},n={},r=e.parcelRequire9b86;function s(t,e,i){if(!e.has(t))throw new TypeError("attempted to "+i+" private field on non-instance");return e.get(t)}function o(t,e){return e.get?e.get.call(t):e.value}function l(t,e){return o(t,s(t,e,"get"))}function a(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")}function h(t,e,i){a(t,e),e.set(t,i)}function c(t,e,i){if(e.set)e.set.call(t,i);else{if(!e.writable)throw new TypeError("attempted to set read only private field");e.value=i}}function u(t,e,i){return c(t,s(t,e,"set"),i),i}function g(t,e){if(e.set)return"__destrWrapper"in e||(e.__destrWrapper={set value(i){e.set.call(t,i)},get value(){return e.get.call(t)}}),e.__destrWrapper;if(!e.writable)throw new TypeError("attempted to set read only private field");return e}function d(t,e){return g(t,s(t,e,"update"))}function f(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}null==r&&((r=function(t){if(t in i)return i[t].exports;if(t in n){var e=n[t];delete n[t];var r={id:t,exports:{}};return i[t]=r,e.call(r.exports,r,r.exports),r.exports}var s=new Error("Cannot find module '"+t+"'");throw s.code="MODULE_NOT_FOUND",s}).register=function(t,e){n[t]=e},e.parcelRequire9b86=r),r.register("kyEFX",(function(e,i){var n,r;t(e.exports,"register",(function(){return n}),(function(t){return n=t})),t(e.exports,"resolve",(function(){return r}),(function(t){return r=t}));var s={};n=function(t){for(var e=Object.keys(t),i=0;i<e.length;i++)s[e[i]]=t[e[i]]},r=function(t){var e=s[t];if(null==e)throw new Error("Could not resolve bundle with id "+t);return e}})),r("kyEFX").register(JSON.parse('{"ahxzu":"index.1973b67c.js","el5my":"still.5b1c1644.png","cT35h":"walking_1.b14e8473.png","2407k":"walking_2.f3764bc3.png","iY52g":"walking_3.478d9ba0.png","kHvmh":"walking_4.f3764bc3.png","cwiu1":"jumping.05ea4910.png","3aTrs":"ground.ae3be667.png"}'));var w;w=new URL(r("kyEFX").resolve("el5my"),import.meta.url).toString();var p;p=new URL(r("kyEFX").resolve("cT35h"),import.meta.url).toString();var y;y=new URL(r("kyEFX").resolve("2407k"),import.meta.url).toString();var m;m=new URL(r("kyEFX").resolve("iY52g"),import.meta.url).toString();var v;v=new URL(r("kyEFX").resolve("kHvmh"),import.meta.url).toString();var x;x=new URL(r("kyEFX").resolve("cwiu1"),import.meta.url).toString();var R;R=new URL(r("kyEFX").resolve("3aTrs"),import.meta.url).toString();const b={still:new URL(w),walking:[new URL(p),new URL(y),new URL(m),new URL(v)],jumping:new URL(x),ground:new URL(R)};let L,k,_;function E(t){return new Promise(((e,i)=>{const n=new Image;n.onerror=i,n.onload=()=>e(n),n.src=t.toString()}))}let z,S=0;var A;(A=z||(z={})).Left="Left",A.Right="Right";class F{add(t){return new F(this.x+t.x,this.y+t.y)}mul(t){return new F(this.x*t,this.y*t)}abs(){return new F(Math.abs(this.x),Math.abs(this.y))}constructor(t,e){this.x=t,this.y=e}}class H{get topLeft(){return this.r}get bottomRight(){return this.r.add(this.size)}get center(){return this.r.add(this.size.mul(.5))}collidesWith(t){return this.bottomRight.x>=t.topLeft.x&&this.topLeft.x<=t.bottomRight.x&&this.bottomRight.y>=t.topLeft.y&&this.topLeft.y<=t.bottomRight.y}overlapWith(t){const e=new F(1/0,1/0);return this.topLeft.x<t.topLeft.x?e.x=this.bottomRight.x-t.topLeft.x:this.bottomRight.x>t.bottomRight.x&&(e.x=t.bottomRight.x-this.topLeft.x),this.topLeft.y<t.topLeft.y?e.y=this.bottomRight.y-t.topLeft.y:this.bottomRight.y>t.bottomRight.y&&(e.y=t.bottomRight.y-this.topLeft.y),e.x=Math.min(e.x,this.size.x,t.size.x),e.y=Math.min(e.y,this.size.y,t.size.y),e}constructor(t,e,i,n){this.r=new F(t,e),this.size=new F(i,n)}}class M extends H{paint(t){for(let e=0;e<this.size.x/30;e++)for(let i=0;i<this.size.y/30;i++)t.drawImage(L.ground,this.r.x+30*e,this.r.y+30*i,30,30)}constructor(t,e,i,n){super(t,e,i,n)}}var U=new WeakMap,j=new WeakMap;class T extends H{update(t){this.walking===z.Left?this.v.x=-40:this.walking===z.Right&&(this.v.x=40);const e=this.v.x>0?1:-1;0!==this.v.x&&this.collision.ground&&!this.walking&&(this.v.x-=4*e),this.v.x<0||this.walking===z.Left?this.direction=z.Left:(this.v.x>0||this.walking===z.Right)&&(this.direction=z.Right),this.collision.ground||(this.v.y+=-40*t),this.v.y<-120&&(this.v.y=-120),this.r=this.r.add(this.v.mul(t));const i=this.r.y+this.size.y-S-.6*k.height;i>0&&(S+=i,_.translate(0,-i));const n=this.r.y-S-k.height/5;n<0&&(S+=n,_.translate(0,-n))}paint(t){if(t.save(),t.translate(this.center.x,this.center.y),t.scale(this.direction===z.Left?-1:1,-1),t.translate(-this.center.x,-this.center.y),this.collision.ground)if(!this.walking||this.collision.wall_left||this.collision.wall_right){const e=L.still;t.drawImage(e,this.r.x,this.r.y,this.size.x,this.size.y)}else{const e=L.walking[l(this,U)];t.drawImage(e,this.r.x,this.r.y,e.width/L.still.width*this.size.x,this.size.y),d(this,j).value++,u(this,j,l(this,j)%8),0===l(this,j)&&(d(this,U).value++,u(this,U,l(this,U)%L.walking.length))}else{const e=L.jumping,i=e.width/L.still.width*this.size.x,n=e.height/L.still.height*this.size.y,r=i-this.size.x;t.drawImage(e,this.r.x-r/2,this.r.y,i,n)}t.restore()}jump(){this.jumps<3&&(this.jumps++,this.v.y=120)}constructor(t,e,i){super(t,e,L.still.width/L.still.height*i,i),f(this,"v",new F(0,0)),f(this,"collision",{ground:!1,ceiling:!1,wall_left:!1,wall_right:!1}),f(this,"jumps",0),h(this,U,{writable:!0,value:0}),h(this,j,{writable:!0,value:0})}}let I;const W=[new M(0,0,800,30)];let X,O,C=W.slice();function P(t){var e,i,n,r;t=decodeURI(t),X=function(t){let e=1779033703,i=3144134277,n=1013904242,r=2773480762;for(let s,o=0;o<t.length;o++)s=t.charCodeAt(o),e=i^Math.imul(e^s,597399067),i=n^Math.imul(i^s,2869860233),n=r^Math.imul(n^s,951274213),r=e^Math.imul(r^s,2716044179);return e=Math.imul(n^e>>>18,597399067),i=Math.imul(r^i>>>22,2869860233),n=Math.imul(e^n>>>17,951274213),r=Math.imul(i^r>>>19,2716044179),[(e^i^n^r)>>>0,(i^e)>>>0,(n^e)>>>0,(r^e)>>>0]}(t),e=X[0],i=X[1],n=X[2],r=X[3],O=function(){var t=(e>>>=0)+(i>>>=0)|0;return e=i^i>>>9,i=(n>>>=0)+(n<<3)|0,n=(n=n<<21|n>>>11)+(t=t+(r=1+(r>>>=0)|0)|0)|0,(t>>>0)/4294967296},k&&K(!0);const s=document.getElementById("seed");s&&(s.value=t),window.location.hash=`#${t}`,document.title=t}window.addEventListener("load",(async function(){if(L=await async function(t){const e=[];let i={ground:void 0,jumping:void 0,walking:[],still:void 0};for(const n of Object.keys(t))if(Array.isArray(t[n]))for(let r=0;r<t[n].length;r++)e.push(E(t[n][r]).then((t=>i[n][r]=t)));else e.push(E(t[n]).then((t=>i[n]=t)));return await Promise.all(e),i}(b),I=new T(250,200,70),k=document.getElementById("canvas"),!k)return void console.error("failed to get canvas element");if(_=k.getContext("2d"),!_)return void console.error("failed to get canvas context");V();const t=document.getElementById("seed");t?(t.addEventListener("input",(t=>P(t.target.value))),window.addEventListener("hashchange",(()=>P(window.location.hash.substring(1)))),P(window.location.hash.substring(1)||"Jixxklääs"),document.addEventListener("keydown",J),document.addEventListener("keyup",J),window.requestAnimationFrame(B)):console.error("failed to get seed input element")}));let q=-1;function B(t){if(window.requestAnimationFrame(B),!t)return;const e=-1===q?0:(t-q)/100;q=t,k&&_?(_.clearRect(0,S,k.width,k.height),I.update(e),function(){I.collision={ground:!1,ceiling:!1,wall_left:!1,wall_right:!1};for(const t of C)if(I.collidesWith(t)){const e=I.overlapWith(t).abs();e.y<e.x?(I.center.y>t.center.y?(I.r.y=t.r.y+t.size.y,I.collision.ground=!0):(I.r.y=t.r.y-I.size.y,I.collision.ceiling=!0),I.v.y=0):(I.center.x>t.center.x?(I.r.x=t.r.x+t.size.x,I.collision.wall_left=!0):(I.r.x=t.r.x-I.size.x,I.collision.wall_right=!0),I.v.x=0)}I.r.x<=0?(I.r.x=0,I.collision.wall_left=!0):I.r.x+I.size.x>=k.width&&(I.r.x=k.width-I.size.x,I.collision.wall_right=!0)}(),I.paint(_),C.forEach((t=>t.paint(_))),function(){const t=Math.floor(I.r.y/250);I.collision.ground?(I.jumps=0,G=t,G>Q&&(Q=G,localStorage.setItem("highscore",Q.toString()))):t<G&&(G=t);_.textAlign="left",_.fillStyle="white",Y(`Score: ${G}\nHighscore: ${Q}`,20,20)}(),K()):console.error("canvas or context are falsy")}let D=0;function K(t=!1){for(t&&(D=0,C=W.slice());D-I.r.y<2*k.height;){const t=30*Math.round((100+100*O())/30),e=30,i=(k.width-t)*O(),n=D+250;D=n,C.push(new M(i,n,t,e))}}let N=!1,$=!1;function J(t){if("keydown"===t.type)switch(t.code){case"Space":I.jump();break;case"KeyA":case"ArrowLeft":N=!0,I.walking=z.Left;break;case"KeyD":case"ArrowRight":$=!0,I.walking=z.Right}else if("keyup"===t.type)switch(t.code){case"KeyA":case"ArrowLeft":N=!1,I.walking=$?z.Right:null;break;case"KeyD":case"ArrowRight":$=!1,I.walking=N?z.Left:null}}function Y(t,e,i){_.save(),_.translate(0,k.height+S),_.scale(1,-1);const n=t.split("\n");for(let t=0;t<n.length;t++)_.font="20px 'Press Start 2P'",_.fillText(n[t],e,i+20+30*t);_.restore()}let G=0,Q=localStorage.getItem("highscore")||0;function V(){if(!k)return;const{width:t,height:e}=k.parentElement.getBoundingClientRect();k.height=e,k.width=t,_.scale(1,-1),_.translate(0,-k.height-S)}window.addEventListener("resize",V);
//# sourceMappingURL=index.1973b67c.js.map