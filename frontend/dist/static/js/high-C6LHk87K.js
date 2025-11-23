var Se=Object.defineProperty;var be=Object.getOwnPropertySymbols;var ze=Object.prototype.hasOwnProperty,$e=Object.prototype.propertyIsEnumerable;var ve=(e,n,o)=>n in e?Se(e,n,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[n]=o,Q=(e,n)=>{for(var o in n||(n={}))ze.call(n,o)&&ve(e,o,n[o]);if(be)for(var o of be(n))$e.call(n,o)&&ve(e,o,n[o]);return e};var Z=(e,n,o)=>new Promise((t,a)=>{var u=i=>{try{r(o.next(i))}catch(b){a(b)}},l=i=>{try{r(o.throw(i))}catch(b){a(b)}},r=i=>i.done?t(i.value):Promise.resolve(i.value).then(u,l);r((o=o.apply(e,n)).next())});import{gr as ie,ac as R,a as m,r as U,m as te,gj as ee,d as P,b as V,e as f,h as v,u as s,Q as Le,k as C,f as c,w as _,g as M,fP as J,j as y,x as j,t as I,kj as Me,p as _e,n as me,o as De,i as W,F as K,l as se,a8 as ge,q as he,kk as ye,A as H,a3 as q,v as le,X as re,s as de,T as Te,J as ae,O as Ve,W as Re,z as Pe,gK as Ae,Z as We,gt as we,B as Ee,_ as Oe}from"./index-DUZ9GUvE.js";import{S as Ce}from"./sortable.esm-CqAbI0f6.js";import{u as ce,w as Ne}from"./xlsx-IG8v7nJn.js";import{P as Be}from"./print-B-zH8tbv.js";const B=ie(new Date).format("YYYY-MM-DD"),F=[{date:B,name:"Tom",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Jack",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Dick",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Harry",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Sam",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Lucy",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Mary",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Mike",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Mike1",address:"No. 189, Grove St, Los Angeles"},{date:B,name:"Mike2",address:"No. 189, Grove St, Los Angeles"}];R(F,!0).map(e=>Object.assign(e,{state:"California",city:"Los Angeles","post-code":"CA 90036"}));R(F,!0).map((e,n)=>Object.assign(e,{image:`https://pure-admin.github.io/pure-admin-table/imgs/${n+1}.jpg`}));R(F,!0).map((e,n)=>{delete e.date,Object.assign(e,{date:`${ie(new Date).format("YYYY-MM")}-${n+1}`})});const oe=R(F,!0).map((e,n)=>(delete e.address,delete e.date,Object.assign(e,{id:n+1,date:`${ie(new Date).format("YYYY-MM")}-${n+1}`}))),ne=R(F,!0).map((e,n)=>(delete e.date,Object.assign(e,{id:n+1,date:`${ie(new Date).format("YYYY-MM")}-${n+1}`,address:"China",sex:n%2===0?"男":"女"})));function Ye(){const e=m([]),n=m(!0),o=[{label:"日期",prop:"date"},{label:"姓名",prop:"name"},{label:"地址",prop:"address"}],t=U({pageSize:20,currentPage:1,pageSizes:[20,40,60],total:0,align:"right",background:!0,size:"default"}),a=U({text:"正在加载第一页...",viewBox:"-10, -10, 50, 50",spinner:`
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `}),u={offsetBottom:110};function l(i){}function r(i){a.text=`正在加载第${i}页...`,n.value=!0,ee(600).then(()=>{n.value=!1})}return te(()=>{ee(600).then(()=>{const i=[];Array.from({length:6}).forEach(()=>{i.push(R(F,!0))}),i.flat(1/0).forEach((b,L)=>{e.value.push(Q({id:L},b))}),t.total=e.value.length,n.value=!1})}),{loading:n,columns:o,dataList:e,pagination:t,loadingConfig:a,adaptiveConfig:u,onSizeChange:l,onCurrentChange:r}}const Fe=P({__name:"index",setup(e){const n=m(),{loading:o,columns:t,dataList:a,pagination:u,loadingConfig:l,adaptiveConfig:r,onSizeChange:i,onCurrentChange:b}=Ye();return(L,x)=>{const w=v("pure-table");return f(),V(w,{ref_key:"tableRef",ref:n,border:"",adaptive:"",adaptiveConfig:s(r),"row-key":"id",alignWhole:"center",showOverflowTooltip:"",loading:s(o),"loading-config":s(l),data:s(a).slice((s(u).currentPage-1)*s(u).pageSize,s(u).currentPage*s(u).pageSize),columns:s(t),pagination:s(u),onPageSizeChange:s(i),onPageCurrentChange:s(b)},null,8,["adaptiveConfig","loading","loading-config","data","columns","pagination","onPageSizeChange","onPageCurrentChange"])}}});function He(){const e=m([]),n=m(!0),o=m("no"),t=m("nohide"),a=m("default"),u=m("right"),l=[{type:"selection",align:"left",reserveSelection:!0,hide:()=>o.value==="no"},{label:"日期",prop:"date",hide:()=>t.value==="hideDate"},{label:"姓名",prop:"name",hide:()=>t.value==="hideName"},{label:"地址",prop:"address",hide:()=>t.value==="hideAddress"}],r=U({pageSize:10,currentPage:1,pageSizes:[10,15,20],total:0,align:"right",background:!0,size:"default"}),i=U({text:"正在加载第一页...",viewBox:"-10, -10, 50, 50",spinner:`
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `});function b(w){r.size=w}function L(w){}function x(w){i.text=`正在加载第${w}页...`,n.value=!0,ee(600).then(()=>{n.value=!1})}return Le(()=>{r.align=u.value}),te(()=>{ee(600).then(()=>{const w=[];Array.from({length:6}).forEach(()=>{w.push(R(F,!0))}),w.flat(1/0).forEach((Y,d)=>{e.value.push(Q({id:d},Y))}),r.total=e.value.length,n.value=!1})}),{loading:n,columns:l,dataList:e,select:o,hideVal:t,tableSize:a,pagination:r,loadingConfig:i,paginationAlign:u,onChange:b,onSizeChange:L,onCurrentChange:x}}const Ie=P({__name:"index",setup(e){const{loading:n,columns:o,dataList:t,select:a,hideVal:u,tableSize:l,pagination:r,loadingConfig:i,paginationAlign:b,onChange:L,onSizeChange:x,onCurrentChange:w}=He();return(Y,d)=>{const S=v("el-radio-button"),z=v("el-radio-group"),g=v("el-divider"),A=v("el-space"),E=v("pure-table");return f(),C("div",null,[c(A,{class:"float-right mb-4"},{default:_(()=>[d[20]||(d[20]=M("p",{class:"text-sm"},"多选：",-1)),c(z,{modelValue:s(a),"onUpdate:modelValue":d[0]||(d[0]=T=>J(a)?a.value=T:null),size:"small"},{default:_(()=>[c(S,{value:"yes"},{default:_(()=>[...d[5]||(d[5]=[y("是",-1)])]),_:1}),c(S,{value:"no"},{default:_(()=>[...d[6]||(d[6]=[y("否",-1)])]),_:1})]),_:1},8,["modelValue"]),c(g,{direction:"vertical"}),d[21]||(d[21]=M("p",{class:"text-sm"},"动态列：",-1)),c(z,{modelValue:s(u),"onUpdate:modelValue":d[1]||(d[1]=T=>J(u)?u.value=T:null),size:"small"},{default:_(()=>[c(S,{value:"nohide"},{default:_(()=>[...d[7]||(d[7]=[y("不隐藏",-1)])]),_:1}),c(S,{value:"hideDate"},{default:_(()=>[...d[8]||(d[8]=[y("隐藏日期",-1)])]),_:1}),c(S,{value:"hideName"},{default:_(()=>[...d[9]||(d[9]=[y("隐藏姓名",-1)])]),_:1}),c(S,{value:"hideAddress"},{default:_(()=>[...d[10]||(d[10]=[y("隐藏地址",-1)])]),_:1})]),_:1},8,["modelValue"]),c(g,{direction:"vertical"}),d[22]||(d[22]=M("p",{class:"text-sm"},"表格大小：",-1)),c(z,{modelValue:s(l),"onUpdate:modelValue":d[2]||(d[2]=T=>J(l)?l.value=T:null),size:"small"},{default:_(()=>[c(S,{value:"large"},{default:_(()=>[...d[11]||(d[11]=[y("large",-1)])]),_:1}),c(S,{value:"default"},{default:_(()=>[...d[12]||(d[12]=[y("default",-1)])]),_:1}),c(S,{value:"small"},{default:_(()=>[...d[13]||(d[13]=[y("small",-1)])]),_:1})]),_:1},8,["modelValue"]),c(g,{direction:"vertical"}),d[23]||(d[23]=M("p",{class:"text-sm"},"分页大小：",-1)),c(z,{modelValue:s(r).size,"onUpdate:modelValue":d[3]||(d[3]=T=>s(r).size=T),size:"small",onChange:s(L)},{default:_(()=>[c(S,{value:"large"},{default:_(()=>[...d[14]||(d[14]=[y("large",-1)])]),_:1}),c(S,{value:"default"},{default:_(()=>[...d[15]||(d[15]=[y("default",-1)])]),_:1}),c(S,{value:"small"},{default:_(()=>[...d[16]||(d[16]=[y("small",-1)])]),_:1})]),_:1},8,["modelValue","onChange"]),c(g,{direction:"vertical"}),d[24]||(d[24]=M("p",{class:"text-sm"},"分页的对齐方式：",-1)),c(z,{modelValue:s(b),"onUpdate:modelValue":d[4]||(d[4]=T=>J(b)?b.value=T:null),size:"small"},{default:_(()=>[c(S,{value:"right"},{default:_(()=>[...d[17]||(d[17]=[y("right",-1)])]),_:1}),c(S,{value:"center"},{default:_(()=>[...d[18]||(d[18]=[y("center",-1)])]),_:1}),c(S,{value:"left"},{default:_(()=>[...d[19]||(d[19]=[y("left",-1)])]),_:1})]),_:1},8,["modelValue"])]),_:1}),c(E,{border:"","row-key":"id",alignWhole:"center",showOverflowTooltip:"",size:s(l),loading:s(n),"loading-config":s(i),height:s(l)==="small"?352:440,data:s(t).slice((s(r).currentPage-1)*s(r).pageSize,s(r).currentPage*s(r).pageSize),columns:s(o),pagination:s(r),onPageSizeChange:s(x),onPageCurrentChange:s(w)},null,8,["size","loading","loading-config","height","data","columns","pagination","onPageSizeChange","onPageCurrentChange"])])}}});function je(){const e=m([]),n=m([{label:"日期",prop:"date"},{label:"姓名",prop:"name"},{label:"地址",prop:"address"}]);function o(){n.value=[{label:"日期"+Math.round(Math.random()*99),prop:"date"},{label:Math.round(Math.random()*99)+"姓名",prop:"name"},{label:"地址",prop:"address"}]}return te(()=>{R(F,!0).forEach((t,a)=>{e.value.push(Q({id:a},t))})}),{columns:n,dataList:e,onChange:o}}const Ge=P({__name:"index",setup(e){const n=m(),{columns:o,dataList:t,onChange:a}=je();return(u,l)=>{const r=v("el-button"),i=v("pure-table");return f(),C("div",null,[c(r,{type:"primary",class:"mb-[20px]!",onClick:s(a)},{default:_(()=>[...l[0]||(l[0]=[y(" 切换表头 ",-1)])]),_:1},8,["onClick"]),c(i,{ref_key:"tableRef",ref:n,border:"","row-key":"id",alignWhole:"center",showOverflowTooltip:"",data:s(t),columns:s(o)},null,8,["data","columns"])])}}});function Ue(){const e=m(R(oe,!0)),n=t=>{t.preventDefault(),j(()=>{const a=document.querySelector(".el-table__body-wrapper tbody");Ce.create(a,{animation:300,handle:".drag-btn",onEnd:({newIndex:u,oldIndex:l})=>{const r=e.value.splice(l,1)[0];e.value.splice(u,0,r)}})})};return{columns:[{label:"ID",prop:"id",cellRenderer:({row:t})=>c("div",{class:"flex items-center"},[c(v("iconify-icon-online"),{icon:"icon-park-outline:drag",class:"drag-btn cursor-grab",onMouseenter:a=>n(a)},null),c("p",{class:"ml-[16px]"},[t.id])])},{label:"日期",prop:"date"},{label:"姓名",prop:"name"}],dataList:e}}const qe={class:"flex"},Je={class:"w-[700px]"},Ke=P({__name:"index",setup(e){const{columns:n,dataList:o}=Ue();return(t,a)=>{const u=v("el-scrollbar"),l=v("pure-table");return f(),C("div",qe,[c(u,{height:"700px"},{default:_(()=>[M("code",null,[M("pre",Je," "+I(s(o)),1)])]),_:1}),c(l,{"row-key":"id",data:s(o),columns:s(n)},null,8,["data","columns"])])}}});function Xe(){const e=m(R(oe,!0)),n=m([{label:"ID",prop:"id"},{label:"日期",prop:"date"},{label:"姓名",prop:"name"}]),o=m([{label:"ID",prop:a=>n.value[a].prop},{label:"日期",prop:a=>n.value[a].prop},{label:"姓名",prop:a=>n.value[a].prop}]),t=a=>{a.preventDefault(),j(()=>{const u=document.querySelector(".el-table__header-wrapper tr");Ce.create(u,{animation:300,delay:0,onEnd:({newIndex:l,oldIndex:r})=>{const i=n.value[r];n.value.splice(r,1),n.value.splice(l,0,i)}})})};return te(()=>{j(()=>{t(event)})}),{columns:o,dataList:e,columnsDrag:n}}const Qe={class:"flex"},Ze={class:"w-[700px]"},en=P({__name:"index",setup(e){const{columns:n,dataList:o,columnsDrag:t}=Xe();return(a,u)=>{const l=v("el-scrollbar"),r=v("pure-table");return f(),C("div",Qe,[c(l,{height:"700px"},{default:_(()=>[M("code",null,[M("pre",Ze," "+I(s(t)),1)])]),_:1}),c(r,{"row-key":"id",data:s(o),columns:s(n)},null,8,["data","columns"])])}}}),ke=function(e){let n=Array.isArray(e)?[]:{};if(e&&typeof e=="object")for(let o in e)e.hasOwnProperty(o)&&(e[o]&&typeof e[o]=="object"?n[o]=ke(e[o]):n[o]=e[o]);return n};var G=P({name:"MouseMenu",props:{appendToBody:{type:Boolean,default:!0},menuWidth:{type:Number,default:200},menuList:{type:Array,required:!0},menuHiddenFn:{type:Function},hasIcon:{type:Boolean,default:!1},iconType:{type:String,default:"font-icon"},menuWrapperCss:Object,menuItemCss:Object,el:{type:Object,required:!0},params:{type:[String,Number,Array,Object]},useLongPressInMobile:Boolean,longPressDuration:Number,longPressPreventDefault:[Function,Boolean],injectCloseListener:{type:Boolean,default:!0},customClass:String,disabled:{type:Function}},emits:["open","close"],expose:["show","close","showMenu"],setup(e,{emit:n}){const o=m(0),t=m(0),a=m(!1),u=m(0),l=m(0),r=m(!1),i=m(null),b=m([]),L=_e(()=>e.menuList.some(h=>h.children&&h.children.length>0)),x=m(10),w=m();me(r,h=>Z(null,null,function*(){var k,$;if(h){yield j();let D=w.value;e.menuWrapperCss&&Object.keys(e.menuWrapperCss).map(O=>{D.style.setProperty(`--menu-${O}`,e.menuWrapperCss&&e.menuWrapperCss[O])}),e.menuItemCss&&Object.keys(e.menuItemCss).map(O=>{D.style.setProperty(`--menu-item-${O}`,e.menuItemCss&&e.menuItemCss[O])});let p=($=(k=e.menuItemCss)==null?void 0:k.arrowSize)==null?void 0:$.match(/\d+/);p?x.value=~~p[0]||10:x.value=10,D.style.setProperty("--menu-item-arrowRealSize",x.value/2+"px"),n("open",e.params,i.value,e.el)}else n("close",e.params,i.value,e.el)}));const Y=(h,k)=>{h.disabled||h.fn&&typeof h.fn=="function"&&h.fn(e.params,i.value,e.el,k)===!1||(r.value=!1)},d=(h,k)=>{if(!h.disabled){if(h.fn&&typeof h.fn=="function"&&!h.disabled){if(h.fn(e.params,i.value,e.el,k)===!1)return;a.value=!1}r.value=!1}},S=(h,k)=>Z(null,null,function*(){if(k.children&&!k.disabled){a.value=!0,yield j();const $=h.currentTarget;if(!$)return;const{offsetWidth:D}=$,p=$.querySelector(".__menu__sub__wrapper");if(!p)return;const{offsetWidth:O,offsetHeight:X}=p,{innerWidth:xe,innerHeight:pe}=window,{top:fe,left:ue}=$.getBoundingClientRect();ue+D+O>xe-5?o.value=ue-O+5:o.value=ue+D,fe+X>pe-5?t.value=pe-X:t.value=fe+5}}),z=(h,k,$,D)=>h.map(p=>(p.children&&(p.children=z(p.children,k,$,D)),p.label&&typeof p.label=="function"&&(p.label=p.label(D,k,$)),p.tips&&typeof p.tips=="function"&&(p.tips=p.tips(D,k,$)),p.icon&&typeof p.icon=="function"&&(p.icon=p.icon(D,k,$)),p.hidden&&typeof p.hidden=="function"&&(p.hidden=p.hidden(D,k,$)),p.disabled&&typeof p.disabled=="function"&&(p.disabled=p.disabled(D,k,$)),p)),g=(h=0,k=0)=>Z(null,null,function*(){if(i.value=document.elementFromPoint(h-1,k-1),e.menuHiddenFn?r.value=!e.menuHiddenFn(e.params,i.value,e.el):r.value=!0,!r.value)return;b.value=ke(e.menuList),b.value=z(b.value,i.value,e.el,e.params),yield j();const{innerWidth:$,innerHeight:D}=window,O=w.value.offsetHeight,X=e.menuWidth||200;l.value=h+X+1>$?$-X-5:h+1,u.value=k+O+1>D?D-O-5:k+1}),A=()=>{r.value=!1},E=_e(()=>e.useLongPressInMobile&&"ontouchstart"in window?"touchstart":"mousedown"),T=h=>{w.value&&!w.value.contains(h.currentTarget)&&(r.value=!1,document.oncontextmenu=null)};return me(()=>e.injectCloseListener,h=>{h?document.addEventListener(E.value,T):document.removeEventListener(E.value,T)},{immediate:!0}),De(()=>{document.removeEventListener(E.value,T)}),{subLeft:o,subTop:t,hoverFlag:a,menuTop:u,menuLeft:l,showMenu:r,clickDomEl:i,calcMenuList:b,arrowSize:x,hasSubMenu:L,MenuWrapper:w,handleMenuItemClick:Y,handleSubMenuItemClick:d,handleMenuMouseEnter:S,show:g,close:A,clickEventKey:E}}});const nn=["onMouseenter"],tn={key:0,class:"__menu__item-icon"},an=["innerHTML"],on={class:"__menu__item-label"},ln={class:"__menu__item-tips"},sn={class:"__menu__item-arrow-after"},rn={key:0,class:"__menu__item-icon"},un=["innerHTML"],dn={class:"__menu__sub__item-label"},cn={class:"__menu__sub__item-tips"};function _n(e,n,o,t,a,u){return f(),V(Te,{to:"body",disabled:!e.appendToBody},[e.showMenu?(f(),C("div",{key:0,ref:"MenuWrapper",class:le(["__menu__wrapper",e.customClass]),style:de({width:`${e.menuWidth}px`,top:`${e.menuTop}px`,left:`${e.menuLeft}px`})},[(f(!0),C(K,null,se(e.calcMenuList,(l,r)=>(f(),C(K,null,[!l.hidden&&!l.line?(f(),C("div",ge({key:r,class:["__menu__item",l.disabled&&"disabled",l.customClass]},{[ye(e.clickEventKey)]:he(i=>e.handleMenuItemClick(l,i),["stop"])},{onMouseenter:i=>e.handleMenuMouseEnter(i,l)}),[e.hasIcon?(f(),C("div",tn,[e.iconType==="font-icon"?H((f(),C("i",{key:0,class:le(l.icon)},null,2)),[[q,l.icon]]):e.iconType==="svg-icon"?H((f(),C("div",{key:1,class:"__menu__item-icon-svg",innerHTML:l.icon},null,8,an)),[[q,l.icon]]):e.iconType==="vnode-icon"?(f(),V(re(l.icon),{key:2})):W("v-if",!0)])):W("v-if",!0),M("span",on,I(l.label),1),M("span",ln,I(l.tips||""),1),e.hasSubMenu?(f(),C("span",{key:1,class:le(["__menu__item-arrow",{show:e.hasSubMenu&&l.children}]),style:de({width:e.arrowSize+"px",height:e.arrowSize+"px"})},[H(M("span",sn,null,512),[[q,e.hasSubMenu&&l.children]])],6)):W("v-if",!0),l.children&&l.children.length>0&&!l.disabled?H((f(),C("div",{key:2,class:"__menu__sub__wrapper",style:de({width:`${e.menuWidth}px`,top:`${e.subTop}px`,left:`${e.subLeft}px`})},[(f(!0),C(K,null,se(l.children,(i,b)=>(f(),C(K,null,[!i.hidden&&!i.line?(f(),C("div",ge({key:b,class:["__menu__sub__item",i.disabled&&"disabled",i.customClass]},{[ye(e.clickEventKey)]:he(L=>e.handleSubMenuItemClick(i,L),["stop"])}),[e.hasIcon?(f(),C("div",rn,[e.iconType==="font-icon"?H((f(),C("i",{key:0,class:le(i.icon)},null,2)),[[q,i.icon]]):e.iconType==="svg-icon"?H((f(),C("div",{key:1,class:"__menu__item-icon-svg",innerHTML:i.icon},null,8,un)),[[q,i.icon]]):e.iconType==="vnode-icon"?(f(),V(re(i.icon),{key:2})):W("v-if",!0)])):W("v-if",!0),M("span",dn,I(i.label),1),M("span",cn,I(i.tips||""),1)],16)):W("v-if",!0),i.line?(f(),C("div",{key:b,class:"__menu__line"})):W("v-if",!0)],64))),256))],4)),[[q,e.hoverFlag]]):W("v-if",!0)],16,nn)):W("v-if",!0),!l.hidden&&l.line?(f(),C("div",{key:r,class:"__menu__line"})):W("v-if",!0)],64))),256))],6)):W("v-if",!0)],8,["disabled"])}function mn(e,n){n===void 0&&(n={});var o=n.insertAt;if(typeof document!="undefined"){var t=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css",o==="top"&&t.firstChild?t.insertBefore(a,t.firstChild):t.appendChild(a),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(document.createTextNode(e))}}var pn=`.__menu__mask[data-v-3d21bc0a] {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
}
.__menu__wrapper[data-v-3d21bc0a] {
  --menu-background: #c8f2f0;
  --menu-boxShadow: 0 1px 5px #888;
  --menu-padding: 5px 0;
  --menu-borderRadius: 0;
  --menu-item-height: 30px;
  --menu-item-padding: 0 10px;
  --menu-item-iconSize: 20px;
  --menu-item-iconFontSize: 14px;
  --menu-item-iconColor: #484852;
  --menu-item-labelColor: #484852;
  --menu-item-labelFontSize: 14px;
  --menu-item-tipsColor: #889;
  --menu-item-tipsFontSize: 12px;
  --menu-item-arrowColor: #484852;
  --menu-item-disabledColor: #bcc;
  --menu-item-hoverBackground: rgba(255, 255, 255, 0.8);
  --menu-item-hoverIconColor: inherit;
  --menu-item-hoverLabelColor: inherit;
  --menu-item-hoverTipsColor: inherit;
  --menu-item-hoverArrowColor: inherit;
  --menu-lineColor: #ccc;
  --menu-lineMargin: 5px 0;
}
.__menu__wrapper[data-v-3d21bc0a] {
  position: fixed;
  width: 200px;
  background: var(--menu-background);
  box-shadow: var(--menu-boxShadow);
  padding: var(--menu-padding);
  border-radius: var(--menu-borderRadius);
  z-index: 99999;
}
.__menu__line[data-v-3d21bc0a],
.__menu__sub__line[data-v-3d21bc0a] {
  border-top: 1px solid var(--menu-lineColor);
  margin: var(--menu-lineMargin);
}
.__menu__item[data-v-3d21bc0a],
.__menu__sub__item[data-v-3d21bc0a] {
  display: flex;
  height: var(--menu-item-height);
  align-items: center;
  cursor: pointer;
  padding: var(--menu-item-padding);
}
.__menu__item .__menu__item-icon[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-icon[data-v-3d21bc0a] {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--menu-item-iconColor);
  width: var(--menu-item-iconSize);
  height: var(--menu-item-iconSize);
}
.__menu__item .__menu__item-icon i[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-icon i[data-v-3d21bc0a] {
  font-size: var(--menu-item-iconFontSize);
}
.__menu__item .__menu__item-icon .__menu__item-icon-svg[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-icon .__menu__item-icon-svg[data-v-3d21bc0a] {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.__menu__item .__menu__item-label[data-v-3d21bc0a],
.__menu__item .__menu__sub__item-label[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-label[data-v-3d21bc0a],
.__menu__sub__item .__menu__sub__item-label[data-v-3d21bc0a] {
  width: 100%;
  max-height: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  font-size: var(--menu-item-labelFontSize);
  color: var(--menu-item-labelColor);
  margin-right: 5px;
  overflow: hidden;
}
.__menu__item .__menu__item-tips[data-v-3d21bc0a],
.__menu__item .__menu__sub__item-tips[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-tips[data-v-3d21bc0a],
.__menu__sub__item .__menu__sub__item-tips[data-v-3d21bc0a] {
  font-size: var(--menu-item-tipsFontSize);
  color: var(--menu-item-tipsColor);
}
.__menu__item .__menu__item-arrow[data-v-3d21bc0a],
.__menu__sub__item .__menu__item-arrow[data-v-3d21bc0a] {
  width: 10px;
  height: 10px;
  margin-left: 5px;
  position: relative;
}
.__menu__item.disabled[data-v-3d21bc0a],
.__menu__sub__item.disabled[data-v-3d21bc0a] {
  cursor: not-allowed;
}
.__menu__item.disabled .__menu__item-icon[data-v-3d21bc0a],
.__menu__item.disabled .__menu__item-label[data-v-3d21bc0a],
.__menu__item.disabled .__menu__sub__item-label[data-v-3d21bc0a],
.__menu__item.disabled .__menu__item-tips[data-v-3d21bc0a],
.__menu__item.disabled .__menu__sub__item-tips[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__item-icon[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__item-label[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__sub__item-label[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__item-tips[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__sub__item-tips[data-v-3d21bc0a] {
  color: var(--menu-item-disabledColor);
}
.__menu__item.disabled .__menu__item-arrow .__menu__item-arrow-after[data-v-3d21bc0a],
.__menu__sub__item.disabled .__menu__item-arrow .__menu__item-arrow-after[data-v-3d21bc0a] {
  border-left: var(--menu-item-arrowRealSize) solid var(--menu-item-disabledColor);
}
.__menu__item[data-v-3d21bc0a]:not(.disabled):hover {
  background: var(--menu-item-hoverBackground);
}
.__menu__item:not(.disabled):hover .__menu__item-icon[data-v-3d21bc0a] {
  color: var(--menu-item-hoverIconColor);
}
.__menu__item:not(.disabled):hover .__menu__item-label[data-v-3d21bc0a] {
  color: var(--menu-item-hoverLabelColor);
}
.__menu__item:not(.disabled):hover .__menu__item-tips[data-v-3d21bc0a] {
  color: var(--menu-item-hoverTipsColor);
}
.__menu__item:not(.disabled):hover .__menu__item-arrow[data-v-3d21bc0a] {
  color: var(--menu-item-hoverArrowColor);
}
.__menu__sub__item[data-v-3d21bc0a]:not(.disabled):hover {
  background: var(--menu-item-hoverBackground);
}
.__menu__sub__item:not(.disabled):hover .__menu__sub__item-label[data-v-3d21bc0a] {
  color: var(--menu-item-hoverLabelColor);
}
.__menu__sub__item:not(.disabled):hover .__menu__sub__item-tips[data-v-3d21bc0a] {
  color: var(--menu-item-hoverTipsColor);
}
.__menu__item-icon[data-v-3d21bc0a] {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  margin-right: 4px;
}
.__menu__item-arrow.show .__menu__item-arrow-after[data-v-3d21bc0a] {
  position: absolute;
  width: 0;
  height: 0;
  left: 8px;
  border-left: var(--menu-item-arrowRealSize) solid var(--menu-item-arrowColor);
  border-top: var(--menu-item-arrowRealSize) solid transparent;
  border-bottom: var(--menu-item-arrowRealSize) solid transparent;
}
.__menu__sub__wrapper[data-v-3d21bc0a] {
  position: fixed;
  visibility: hidden;
  width: 200px;
  background: var(--menu-background);
  box-shadow: var(--menu-boxShadow);
  padding: var(--menu-padding);
  border-radius: var(--menu-borderRadius);
}
.__menu__item:hover .__menu__sub__wrapper[data-v-3d21bc0a] {
  visibility: visible;
}`;mn(pn);G.render=_n;G.__scopeId="data-v-3d21bc0a";G.__file="packages/mouse-menu/mouse-menu.vue";function fn(e,n,o){let t=document.createElement(e);return t.setAttribute("class",n),t}G.install=e=>{e.component(G.name,G)};function bn(e){var a;const n="__mouse__menu__container";let o;document.querySelector(`.${n}`)?o=document.querySelector(`.${n}`):o=fn("div",n);const t=c(G,e);return Me(t,o),document.body.appendChild(o),(a=t.component)==null?void 0:a.proxy}function vn(){const e=m(R(oe,!0)),n=[{label:"ID",prop:"id"},{label:"日期",prop:"date"},{label:"姓名",prop:"name"}],o={menuList:[{label:({id:a})=>`ID为：${a}`,disabled:!0},{label:"修改",tips:"Edit",fn:a=>ae(`您修改了第 ${e.value.findIndex(u=>u.id===a.id)+1} 行，数据为：${JSON.stringify(a)}`,{type:"success"})}]};function t(a,u,l){l.preventDefault();const{x:r,y:i}=l;bn(Q({el:l.currentTarget,params:a,menuWrapperCss:{background:"var(--el-bg-color)"},menuItemCss:{labelColor:"var(--el-text-color)",hoverLabelColor:"var(--el-color-primary)",hoverTipsColor:"var(--el-color-primary)"}},o)).show(r,i)}return{columns:n,dataList:e,showMouseMenu:t}}const gn=P({__name:"index",setup(e){const{columns:n,dataList:o,showMouseMenu:t}=vn();return(a,u)=>{const l=v("pure-table");return f(),V(l,{"row-key":"id",border:"",data:s(o),columns:s(n),onRowContextmenu:s(t)},null,8,["data","columns","onRowContextmenu"])}}});function hn(){const e=m(R(oe,!0)),n=[{label:"ID",prop:"id"},{label:"日期",prop:"date"},{label:"姓名",prop:"name"}];return{columns:n,dataList:e,exportExcel:()=>{const t=e.value.map(r=>{const i=[];return n.forEach(b=>{i.push(r[b.prop])}),i}),a=[];n.forEach(r=>{a.push(r.label)}),t.unshift(a);const u=ce.aoa_to_sheet(t),l=ce.book_new();ce.book_append_sheet(l,u,"数据报表"),Ne(l,"pure-admin-table.xlsx"),ae("导出成功",{type:"success"})}}}const yn=P({__name:"index",setup(e){const{columns:n,dataList:o,exportExcel:t}=hn();return(a,u)=>{const l=v("el-button"),r=v("pure-table");return f(),C("div",null,[c(l,{type:"primary",class:"mb-[20px]!",onClick:s(t)},{default:_(()=>[...u[0]||(u[0]=[y(" 导出 ",-1)])]),_:1},8,["onClick"]),c(r,{"row-key":"id",border:"",data:s(o),columns:s(n)},null,8,["data","columns"])])}}});function wn(e){const n=m(R(ne,!0)),o=[{label:"ID",prop:"id"},{label:"日期",prop:"date"},{label:"姓名",prop:"name"},{label:"地址",prop:"address"}];return te(()=>{ee().then(()=>{const{setWatermark:t}=Ve(e.value.getTableDoms().tableWrapper);t("编程即艺术",{font:"16px Microsoft YaHei",globalAlpha:.8,forever:!0,width:240,height:90})})}),{columns:o,dataList:n}}const Cn=P({__name:"index",setup(e){const n=m(),{columns:o,dataList:t}=wn(n);return(a,u)=>{const l=v("pure-table");return f(),V(l,{ref_key:"waterRef",ref:n,"row-key":"id",border:"",data:s(t),columns:s(o)},null,8,["data","columns"])}}});function kn(e){const n=m(R(ne,!0)),o=[{label:"ID",prop:"id"},{label:"日期",prop:"date"},{label:"姓名",prop:"name"},{label:"地址",prop:"address"}],t=()=>{Be(e.value.getTableDoms().tableWrapper).toPrint};function a({column:{property:r},rowIndex:i}){if(r==="id")return i<3?{background:"#87baf9"}:{background:"#87e8de"}}function u({columnIndex:r}){return r===0?{background:"#f3b2d0"}:{background:"#fafafa"}}function l({rowIndex:r}){return r%2===1?{background:"#ffa39e"}:{background:"#91d5ff"}}return{columns:o,dataList:n,print:t,rowStyle:l,cellStyle:a,headerCellStyle:u}}const xn=P({__name:"index",setup(e){const n=m(),{columns:o,dataList:t,print:a,cellStyle:u,rowStyle:l,headerCellStyle:r}=kn(n);return(i,b)=>{const L=v("el-button"),x=v("pure-table");return f(),C("div",null,[c(L,{type:"primary",class:"mb-[20px]!",onClick:s(a)},{default:_(()=>[...b[0]||(b[0]=[y(" 打印 ",-1)])]),_:1},8,["onClick"]),c(x,{ref_key:"printRef",ref:n,rowHoverBgColor:"transparent","row-key":"id",border:"",data:s(t),columns:s(o),"row-style":s(l),"cell-style":s(u),"header-cell-style":s(r)},null,8,["data","columns","row-style","cell-style","header-cell-style"])])}}});function Sn(){const e=m(R(oe,!0).splice(0,4)),n=[{label:"ID",prop:"id"},{label:"姓名",prop:"name"},{label:"日期",prop:"date"},{label:"echarts图表",slot:"echart"}],{isDark:o}=Re(),t=_e(()=>o.value?"dark":"light");return e.value.forEach((a,u)=>{const{setOptions:l}=Pe(Ae(`PieChartRef${u}`),{theme:t});l({tooltip:{trigger:"item",confine:!0},series:[{name:"Github信息",type:"pie",data:[{value:1067,name:"watchers"},{value:4037,name:"star"},{value:859,name:"forks"}],emphasis:{itemStyle:{shadowBlur:10,shadowOffsetX:0,shadowColor:"rgba(0, 0, 0, 0.5)"}}}]},{name:"click",callback:({data:{name:r,value:i}})=>{ae(`您点击了第 ${u+1} 行，图表标题为${r}，图表数据为：${i}`,{type:"success"})}})}),{columns:n,dataList:e}}const zn=P({__name:"index",setup(e){const{columns:n,dataList:o}=Sn();return(t,a)=>{const u=v("pure-table");return f(),V(u,{"row-key":"id",border:"",data:s(o),columns:s(n)},{echart:_(({index:l})=>[M("div",{ref:"PieChartRef"+l,class:"w-full h-[100px]"},null,512)]),_:1},8,["data","columns"])}}});function $n(e){const n=m(""),o=[{label:"ID",prop:"id",width:80},{label:"日期",prop:"date",minWidth:120},{label:"姓名",prop:"name"},{label:"地址",prop:"address"}],t=U({pageSize:5,currentPage:1,layout:"prev, pager, next",total:ne.length,background:!0,size:"small"});function a({row:{name:l}}){return{cursor:"pointer",background:l===n.value?"var(--el-fill-color-light)":""}}function u(l){n.value=l.name,e.value.blur(),ae(`当前选中行的数据为：${JSON.stringify(l)}`,{type:"success"})}return{columns:o,pagination:t,selectValue:n,tableDataEdit:ne,rowStyle:a,onRowClick:u}}const Ln={class:"m-4"},Mn=P({__name:"index",setup(e){const n=m(),{columns:o,pagination:t,selectValue:a,tableDataEdit:u,rowStyle:l,onRowClick:r}=$n(n);return(i,b)=>{const L=v("pure-table"),x=v("el-select");return f(),V(x,{ref_key:"selectRef",ref:n,modelValue:s(a),"onUpdate:modelValue":b[0]||(b[0]=w=>J(a)?a.value=w:null),class:"w-[200px]!",placeholder:"请选择","value-key":"id",clearable:""},{empty:_(()=>[M("div",Ln,[c(L,{"row-key":"id",alignWhole:"center","header-cell-style":{background:"var(--el-fill-color-light)",color:"var(--el-text-color-primary)"},"row-style":s(l),data:s(u).slice((s(t).currentPage-1)*s(t).pageSize,s(t).currentPage*s(t).pageSize),columns:s(o),pagination:s(t),onRowClick:s(r)},null,8,["row-style","data","columns","pagination","onRowClick"])])]),_:1},8,["modelValue"])}}});function Dn(e,n,o){const t=m(ne),a=We(t.value),u=m([1,3,4]),l=U({sexValue:"",searchDate:""}),r=[{value:0,label:"男"},{value:1,label:"女"}],i=[{type:"selection",reserveSelection:!0,align:"left"},{label:"ID",prop:"id",width:50},{label:"姓名",prop:"name"},{label:"性别",prop:"sex"},{label:"地址",prop:"address"},{label:"日期",prop:"date",minWidth:120}],b=U({pageSize:5,currentPage:1,layout:"prev, pager, next",total:t.value.length,background:!0,size:"small"}),L=z=>{const g=[];z.forEach(A=>{g.push({label:A.name,id:A.id})}),u.value=g},x=()=>{if(t.value=a,!we(l.sexValue)){const z=r.map(g=>g.value===Number(l.sexValue)&&g.label).filter(Boolean)[0];t.value=t.value.filter(g=>g.sex===z)}we(l.searchDate)||(t.value=t.value.filter(z=>z.date===l.searchDate)),b.total=t.value.length},w=()=>{n.value.resetFields(),d(),t.value=a,b.total=t.value.length},Y=({id:z})=>{var A;const{toggleRowSelection:g}=o.value.getTableRef();g((A=t.value.filter(E=>E.id==z))==null?void 0:A[0],!1)},d=()=>{const{clearSelection:z}=o.value.getTableRef();z()},S=()=>{e.value.blur(),ae(`当前选中的数据为：${JSON.stringify(u.value)}`,{type:"success"})};return me(u,()=>Z(null,null,function*(){yield j();const{toggleRowSelection:z}=o.value.getTableRef();u.value.forEach(g=>{t.value.forEach(A=>{A.id===g&&z(A)})})}),{immediate:!0}),{searchForm:l,sexOptions:r,columns:i,pagination:b,selectValue:u,tableData:t,onSure:S,onClear:d,onReset:w,onSearch:x,removeTag:Y,handleSelectionChange:L}}const Tn={class:"m-4"},Vn=P({__name:"index",setup(e){const n=m(),o=m(),t=m(),{searchForm:a,sexOptions:u,columns:l,pagination:r,selectValue:i,tableData:b,onSure:L,onClear:x,onReset:w,onSearch:Y,removeTag:d,handleSelectionChange:S}=Dn(t,n,o);return(z,g)=>{const A=v("el-option"),E=v("el-select"),T=v("el-form-item"),h=v("el-date-picker"),k=v("el-button"),$=v("el-form"),D=v("pure-table");return f(),V(E,{ref_key:"selectRef",ref:t,modelValue:s(i),"onUpdate:modelValue":g[2]||(g[2]=p=>J(i)?i.value=p:null),class:"w-[200px]!",placeholder:"请选择",clearable:"",multiple:"","collapse-tags":"","value-key":"id",onRemoveTag:s(d),onClear:s(x)},{empty:_(()=>[M("div",Tn,[c($,{ref_key:"formRef",ref:n,inline:!0,model:s(a)},{default:_(()=>[c(T,{prop:"sexValue"},{default:_(()=>[c(E,{modelValue:s(a).sexValue,"onUpdate:modelValue":g[0]||(g[0]=p=>s(a).sexValue=p),class:"w-[120px]!",placeholder:"请选择性别",teleported:!1,clearable:""},{default:_(()=>[(f(!0),C(K,null,se(s(u),p=>(f(),V(A,{key:p.value,label:p.label,value:p.value},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),c(T,{prop:"searchDate"},{default:_(()=>[c(h,{modelValue:s(a).searchDate,"onUpdate:modelValue":g[1]||(g[1]=p=>s(a).searchDate=p),class:"w-[150px]!",type:"date",placeholder:"请选择日期",format:"YYYY/MM/DD","value-format":"YYYY-MM-D"},null,8,["modelValue"])]),_:1}),c(T,{class:"float-right mr-0!"},{default:_(()=>[c(k,{type:"primary",text:"",bg:"",onClick:s(Y)},{default:_(()=>[...g[3]||(g[3]=[y(" 查询 ",-1)])]),_:1},8,["onClick"]),c(k,{text:"",bg:"",onClick:s(w)},{default:_(()=>[...g[4]||(g[4]=[y(" 重置 ",-1)])]),_:1},8,["onClick"])]),_:1})]),_:1},8,["model"]),c(D,{ref_key:"tableRef",ref:o,"row-key":"id",alignWhole:"center","header-cell-style":{background:"var(--el-fill-color-light)",color:"var(--el-text-color-primary)"},data:s(b).slice((s(r).currentPage-1)*s(r).pageSize,s(r).currentPage*s(r).pageSize),columns:s(l),pagination:s(r),onSelectionChange:s(S)},null,8,["data","columns","pagination","onSelectionChange"]),c(k,{class:"absolute bottom-[25px] left-[20px]",type:"primary",size:"small",text:"",bg:"",onClick:s(L)},{default:_(()=>[...g[5]||(g[5]=[y(" 确定 ",-1)])]),_:1},8,["onClick"])])]),_:1},8,["modelValue","onRemoveTag","onClear"])}}}),Rn=P({__name:"index",setup(e){const n=m("radio");return(o,t)=>{const a=v("el-radio-button"),u=v("el-radio-group"),l=v("el-divider"),r=v("el-space");return f(),V(r,null,{default:_(()=>[c(u,{modelValue:n.value,"onUpdate:modelValue":t[0]||(t[0]=i=>n.value=i)},{default:_(()=>[c(a,{value:"radio"},{default:_(()=>[...t[1]||(t[1]=[y("单选",-1)])]),_:1}),c(a,{value:"multiple"},{default:_(()=>[...t[2]||(t[2]=[y("多选",-1)])]),_:1})]),_:1},8,["modelValue"]),c(l,{direction:"vertical"}),(f(),V(re(n.value==="radio"?Mn:Vn)))]),_:1})}}}),N=e=>`代码位置：src/views/table/high/${e}/index.vue`,Pn=[{key:"adaptive",content:N("adaptive"),title:"自适应内容区高度",component:Fe},{key:"page",content:N("page"),title:"分页、加载动画、动态列",component:Ie},{key:"header",content:N("header"),title:"动态表头",component:Ge},{key:"tableSelect",content:N("table-select"),title:"表格选择器",component:Rn},{key:"rowDrag",content:N("drag/row"),title:"拖拽表格（行拖拽）",component:Ke},{key:"columnDrag",content:N("drag/column"),title:"拖拽表格（列拖拽）",component:en},{key:"contextmenu",content:N("contextmenu"),title:"右键菜单",component:gn},{key:"excel",content:N("excel"),title:"导出excel",component:yn},{key:"print",content:N("print"),title:"打印",component:xn},{key:"watermark",content:N("watermark"),title:"水印",component:Cn},{key:"echarts",content:N("echarts"),title:"内嵌echarts图表",component:zn}],An={class:"card-header"},Wn={class:"font-medium"},En=P({name:"PureTableHigh",__name:"high",setup(e){const n=m(0);function o({index:t}){n.value=t}return(t,a)=>{const u=v("el-link"),l=v("el-alert"),r=v("el-tab-pane"),i=v("el-tabs"),b=v("el-card"),L=Ee("tippy");return f(),V(b,{shadow:"never"},{header:_(()=>[M("div",An,[M("span",Wn,[a[1]||(a[1]=y(" 高级用法全部采用 TSX 语法，充分发挥 ",-1)),c(u,{href:"https://github.com/pure-admin/pure-admin-table",target:"_blank",style:{margin:"0 4px 5px","font-size":"16px"}},{default:_(()=>[...a[0]||(a[0]=[y(" @pureadmin/table ",-1)])]),_:1}),a[2]||(a[2]=y(" 的灵活性，维护整体表格只需操作 columns 配置即可 ",-1))])]),c(u,{class:"mt-2",href:"https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/table/high",target:"_blank"},{default:_(()=>[...a[3]||(a[3]=[y(" 代码位置 src/views/table/high ",-1)])]),_:1})]),default:_(()=>[c(l,{title:`高级用法中所有表格都设置了 row-key ，后端需返回唯一值的字段，比如id。作用：1. 用来优化 Table\r
      的渲染，尤其当字段在深层结构中；2. 防止拖拽后表格组件内部混乱（拖拽必须设置）`,type:"info",closable:!1}),c(i,{onTabClick:o},{default:_(()=>[(f(!0),C(K,null,se(s(Pn),(x,w)=>(f(),V(r,{key:x.key,lazy:!0},{label:_(()=>[H((f(),C("span",null,[y(I(x.title),1)])),[[L,{maxWidth:"none",content:`（第 ${w+1} 个示例）${x.content}`}]])]),default:_(()=>[n.value==w?(f(),V(re(x.component),{key:0})):W("",!0)]),_:2},1024))),128))]),_:1})]),_:1})}}}),Hn=Oe(En,[["__scopeId","data-v-75b786fa"]]);export{Hn as default};
