(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,74266,e=>{"use strict";e.i(50461);var r=e.i(60997),t=e.i(75907),i=e.i(91788),a=e.i(56206),s=e.i(961),o=e.i(7065),l=e.i(64107),n=e.i(95724),c=e.i(96851),d=e.i(13149),u=e.i(46739);function f(e){return(0,u.default)("MuiCircularProgress",e)}(0,d.default)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);var h=e.i(91398);let m=["className","color","disableShrink","size","style","thickness","value","variant"],p=e=>e,v,k,g,x,y=(0,o.keyframes)(v||(v=p`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),b=(0,o.keyframes)(k||(k=p`
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
`)),P=(0,c.default)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,r[t.variant],r[`color${(0,l.default)(t.color)}`]]}})(({ownerState:e,theme:r})=>(0,t.default)({display:"inline-block"},"determinate"===e.variant&&{transition:r.transitions.create("transform")},"inherit"!==e.color&&{color:(r.vars||r).palette[e.color].main}),({ownerState:e})=>"indeterminate"===e.variant&&(0,o.css)(g||(g=p`
      animation: ${0} 1.4s linear infinite;
    `),y)),w=(0,c.default)("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(e,r)=>r.svg})({display:"block"}),C=(0,c.default)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.circle,r[`circle${(0,l.default)(t.variant)}`],t.disableShrink&&r.circleDisableShrink]}})(({ownerState:e,theme:r})=>(0,t.default)({stroke:"currentColor"},"determinate"===e.variant&&{transition:r.transitions.create("stroke-dashoffset")},"indeterminate"===e.variant&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:e})=>"indeterminate"===e.variant&&!e.disableShrink&&(0,o.css)(x||(x=p`
      animation: ${0} 1.4s ease-in-out infinite;
    `),b)),S=i.forwardRef(function(e,i){let o=(0,n.useDefaultProps)({props:e,name:"MuiCircularProgress"}),{className:c,color:d="primary",disableShrink:u=!1,size:p=40,style:v,thickness:k=3.6,value:g=0,variant:x="indeterminate"}=o,y=(0,r.default)(o,m),b=(0,t.default)({},o,{color:d,disableShrink:u,size:p,thickness:k,value:g,variant:x}),S=(e=>{let{classes:r,variant:t,color:i,disableShrink:a}=e,o={root:["root",t,`color${(0,l.default)(i)}`],svg:["svg"],circle:["circle",`circle${(0,l.default)(t)}`,a&&"circleDisableShrink"]};return(0,s.default)(o,f,r)})(b),D={},j={},R={};if("determinate"===x){let e=2*Math.PI*((44-k)/2);D.strokeDasharray=e.toFixed(3),R["aria-valuenow"]=Math.round(g),D.strokeDashoffset=`${((100-g)/100*e).toFixed(3)}px`,j.transform="rotate(-90deg)"}return(0,h.jsx)(P,(0,t.default)({className:(0,a.default)(S.root,c),style:(0,t.default)({width:p,height:p},j,v),ownerState:b,ref:i,role:"progressbar"},R,y,{children:(0,h.jsx)(w,{className:S.svg,ownerState:b,viewBox:"22 22 44 44",children:(0,h.jsx)(C,{className:S.circle,style:D,ownerState:b,cx:44,cy:44,r:(44-k)/2,fill:"none",strokeWidth:k})})}))});e.s(["CircularProgress",0,S],74266)},28350,e=>{"use strict";var r=e.i(91398),t=e.i(91788),i=e.i(3828),a=e.i(17563),s=e.i(74266),o=e.i(56119);function l(){let e=(0,i.useRouter)();return(0,t.useEffect)(()=>{e.replace("/labs")},[e]),(0,r.jsxs)(a.Box,{sx:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",gap:2},children:[(0,r.jsx)(s.CircularProgress,{}),(0,r.jsx)(o.Typography,{variant:"body2",color:"text.secondary",children:"Redirecting to Co-Work Dashboard..."})]})}e.s(["default",()=>l])},70427,(e,r,t)=>{let i="/cowork";(window.__NEXT_P=window.__NEXT_P||[]).push([i,()=>e.r(28350)]),r.hot&&r.hot.dispose(function(){window.__NEXT_P.push([i])})},48761,e=>{e.v(r=>Promise.all(["static/chunks/fd7c0943d5cd5e09.js"].map(r=>e.l(r))).then(()=>r(93594)))},28805,e=>{e.v(r=>Promise.all(["static/chunks/3dcc93bb4829c1ba.js"].map(r=>e.l(r))).then(()=>r(79466)))}]);