(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,74266,e=>{"use strict";e.i(50461);var r=e.i(60997),t=e.i(75907),i=e.i(91788),a=e.i(56206),s=e.i(961),o=e.i(7065),l=e.i(64107),n=e.i(95724),c=e.i(96851),d=e.i(13149),u=e.i(46739);function f(e){return(0,u.default)("MuiCircularProgress",e)}(0,d.default)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);var h=e.i(91398);let m=["className","color","disableShrink","size","style","thickness","value","variant"],v=e=>e,p,g,k,x,y=(0,o.keyframes)(p||(p=v`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),b=(0,o.keyframes)(g||(g=v`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),P=(0,c.default)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,r[t.variant],r[`color${(0,l.default)(t.color)}`]]}})(({ownerState:e,theme:r})=>(0,t.default)({display:"inline-block"},"determinate"===e.variant&&{transition:r.transitions.create("transform")},"inherit"!==e.color&&{color:(r.vars||r).palette[e.color].main}),({ownerState:e})=>"indeterminate"===e.variant&&(0,o.css)(k||(k=v`
      animation: ${0} 1.4s linear infinite;
    `),y)),w=(0,c.default)("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(e,r)=>r.svg})({display:"block"}),C=(0,c.default)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.circle,r[`circle${(0,l.default)(t.variant)}`],t.disableShrink&&r.circleDisableShrink]}})(({ownerState:e,theme:r})=>(0,t.default)({stroke:"currentColor"},"determinate"===e.variant&&{transition:r.transitions.create("stroke-dashoffset")},"indeterminate"===e.variant&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:e})=>"indeterminate"===e.variant&&!e.disableShrink&&(0,o.css)(x||(x=v`
      animation: ${0} 1.4s ease-in-out infinite;
    `),b)),S=i.forwardRef(function(e,i){let o=(0,n.useDefaultProps)({props:e,name:"MuiCircularProgress"}),{className:c,color:d="primary",disableShrink:u=!1,size:v=40,style:p,thickness:g=3.6,value:k=0,variant:x="indeterminate"}=o,y=(0,r.default)(o,m),b=(0,t.default)({},o,{color:d,disableShrink:u,size:v,thickness:g,value:k,variant:x}),S=(e=>{let{classes:r,variant:t,color:i,disableShrink:a}=e,o={root:["root",t,`color${(0,l.default)(i)}`],svg:["svg"],circle:["circle",`circle${(0,l.default)(t)}`,a&&"circleDisableShrink"]};return(0,s.default)(o,f,r)})(b),j={},D={},R={};if("determinate"===x){let e=2*Math.PI*((44-g)/2);j.strokeDasharray=e.toFixed(3),R["aria-valuenow"]=Math.round(k),j.strokeDashoffset=`${((100-k)/100*e).toFixed(3)}px`,D.transform="rotate(-90deg)"}return(0,h.jsx)(P,(0,t.default)({className:(0,a.default)(S.root,c),style:(0,t.default)({width:v,height:v},D,p),ownerState:b,ref:i,role:"progressbar"},R,y,{children:(0,h.jsx)(w,{className:S.svg,ownerState:b,viewBox:"22 22 44 44",children:(0,h.jsx)(C,{className:S.circle,style:j,ownerState:b,cx:44,cy:44,r:(44-g)/2,fill:"none",strokeWidth:g})})}))});e.s(["CircularProgress",0,S],74266)},62136,e=>{"use strict";var r=e.i(91398),t=e.i(91788),i=e.i(3828),a=e.i(17563),s=e.i(74266),o=e.i(56119);function l(){let e=(0,i.useRouter)();return(0,t.useEffect)(()=>{e.replace("/labs")},[e]),(0,r.jsxs)(a.Box,{sx:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",gap:2},children:[(0,r.jsx)(s.CircularProgress,{}),(0,r.jsx)(o.Typography,{variant:"body2",color:"text.secondary",children:"Redirecting to Labs..."})]})}e.s(["default",()=>l])},64953,(e,r,t)=>{let i="/live";(window.__NEXT_P=window.__NEXT_P||[]).push([i,()=>e.r(62136)]),r.hot&&r.hot.dispose(function(){window.__NEXT_P.push([i])})},48761,e=>{e.v(r=>Promise.all(["static/chunks/fd7c0943d5cd5e09.js"].map(r=>e.l(r))).then(()=>r(93594)))},28805,e=>{e.v(r=>Promise.all(["static/chunks/3dcc93bb4829c1ba.js"].map(r=>e.l(r))).then(()=>r(79466)))}]);