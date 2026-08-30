import{o as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./printer-DhLBmV4X.js";import{F as n,M as r,P as i,Pt as a,n as o,ot as s,t as c}from"./index-B8cU-frw.js";var l=e(a()),u=i(),d=({isOpen:e,onClose:i,gatePass:a})=>{let[d,f]=(0,l.useState)(()=>{let e=localStorage.getItem(`sri_durga_company_details`);if(e)try{return JSON.parse(e)}catch{}return n});if((0,l.useEffect)(()=>{e&&s().then(e=>{e&&f(e)}).catch(e=>console.warn(`Could not load company details for gate pass print`,e))},[e]),(0,l.useEffect)(()=>{let t=e=>{e.key===`Escape`&&i()};return e&&window.addEventListener(`keydown`,t),()=>window.removeEventListener(`keydown`,t)},[e,i]),!e||!a)return null;let p=()=>{let e=document.getElementById(`gatepass-print-area`);if(!e){window.print();return}let t=window.open(``,`_blank`,`width=900,height=1100`);if(t){let n=e.outerHTML;t.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gate Pass - ${a.gatePassNo||`Delivery Challan`}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                background: #ffffff;
                color: #000000;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #gatepass-print-area {
                border: 2px solid #000000 !important;
                width: 100% !important;
                height: 280mm !important;
                min-height: 280mm !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-size: 13px !important;
                line-height: 1.4 !important;
                padding: 16px 20px !important;
                display: flex !important;
                flex-direction: column !important;
                justifyContent: space-between !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                #gatepass-print-area {
                  border: 2px solid #000000 !important;
                  height: 280mm !important;
                  min-height: 280mm !important;
                  box-shadow: none !important;
                }
              }
            </style>
          </head>
          <body>
            ${n}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            <\/script>
          </body>
        </html>
      `),t.document.close()}else window.print()},m=a.gatePassDate?new Date(a.gatePassDate).toLocaleDateString(`en-GB`):new Date().toLocaleDateString(`en-GB`),h=[...a.items||[]];for(;h.length<23;)h.push({serialNumber:h.length+1,description:``,quantity:``,remarks:``});let g=(a.receiverName||a.customerName||``).trim(),_=(a.siteName||``).trim(),v=(a.vehicleNo||``).trim(),y=(a.purposeForTransport||a.reasonForTransfer||``).trim(),b=!!(g||_),x=!!(v||y),S=d.gstin||`34AGKPB3918J1ZV`,C=d.companyName||`SRI DURGA ENTERPRISES`,w=d.address||`# 10, V.G. NAGAR, KOVILPATHU, KARAIKAL - 609 605.`,T=d.phone?`Ph: ${d.phone}`:`Ph: 04368 - 225786 • Cell: 94432 87986, 93454 87986`;return(0,u.jsx)(`div`,{className:`no-print-modal-overlay`,style:{position:`fixed`,inset:0,zIndex:999999,background:`rgba(0,0,0,0.85)`,backdropFilter:`blur(10px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.75rem`,overflow:`hidden`},onClick:e=>{e.target===e.currentTarget&&i()},children:(0,u.jsxs)(`div`,{className:`glass-panel-print-wrap`,style:{width:`100%`,maxWidth:`920px`,height:`96vh`,display:`flex`,flexDirection:`column`,background:`#0f172a`,border:`1.5px solid rgba(99, 102, 241, 0.4)`,borderRadius:`16px`,boxShadow:`0 25px 60px rgba(0, 0, 0, 0.65)`,overflow:`hidden`,position:`relative`},children:[(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.75rem 1.25rem`,background:`rgba(30, 41, 59, 0.98)`,borderBottom:`1px solid rgba(255, 255, 255, 0.1)`,flexShrink:0},children:[(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,u.jsx)(`div`,{style:{width:`32px`,height:`32px`,borderRadius:`8px`,background:`rgba(245, 158, 11, 0.18)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,u.jsx)(r,{size:18,color:`#fbbf24`})}),(0,u.jsxs)(`div`,{children:[(0,u.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`#f8fafc`,margin:0,lineHeight:1.2},children:[a.passType===`IN`?`In`:`Out`,` Gate Pass (A4 Format)`]}),(0,u.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`},children:[`Doc No: `,(0,u.jsx)(`strong`,{style:{color:`#fbbf24`},children:a.gatePassNo}),` • Date: `,(0,u.jsx)(`strong`,{style:{color:`#34d399`},children:m})]})]})]}),(0,u.jsx)(`button`,{onClick:i,className:`btn btn-outline`,style:{width:`36px`,height:`36px`,borderRadius:`50%`,padding:0,display:`flex`,alignItems:`center`,justifyContent:`center`,borderColor:`rgba(255, 255, 255, 0.2)`,background:`rgba(255, 255, 255, 0.06)`,color:`#f8fafc`,cursor:`pointer`,transition:`all 0.2s ease`},title:`Close Preview (Esc)`,"aria-label":`Close Preview`,children:(0,u.jsx)(o,{size:18})})]}),(0,u.jsx)(`div`,{style:{flex:1,padding:`1.5rem`,overflowY:`auto`,background:`#334155`,display:`flex`,justifyContent:`center`,alignItems:`flex-start`},children:(0,u.jsxs)(`div`,{id:`gatepass-print-area`,style:{border:`2px solid #000`,background:`#fff`,fontSize:`13px`,lineHeight:`1.4`,color:`#000`,padding:`18px 22px`,width:`210mm`,maxWidth:`820px`,minHeight:`282mm`,height:`282mm`,boxShadow:`0 8px 30px rgba(0, 0, 0, 0.35)`,borderRadius:`2px`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`,boxSizing:`border-box`},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,marginBottom:`8px`},children:[(0,u.jsxs)(`div`,{style:{fontSize:`11.5px`,fontWeight:`bold`},children:[`GSTIN : `,S]}),(0,u.jsx)(`div`,{style:{textAlign:`center`,border:`1.5px solid #000`,padding:`3px 14px`,fontWeight:`bold`,fontSize:`14px`,letterSpacing:`0.5px`},children:`DELIVERY CHALLAN`}),(0,u.jsxs)(`div`,{style:{textAlign:`right`,fontSize:`13px`,fontWeight:`bold`},children:[(0,u.jsxs)(`div`,{children:[`No. `,(0,u.jsx)(`span`,{style:{textDecoration:`underline`},children:a.gatePassNo})]}),(0,u.jsxs)(`div`,{style:{marginTop:`2px`},children:[`Date: `,(0,u.jsx)(`span`,{style:{textDecoration:`underline`},children:m})]})]})]}),(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,borderBottom:`1.5px solid #000`,paddingBottom:`8px`,marginBottom:`10px`,position:`relative`},children:[(0,u.jsx)(`div`,{style:{width:`70px`,minWidth:`70px`,display:`flex`,alignItems:`center`,justifyContent:`center`,position:`absolute`,left:`0px`,top:`50%`,transform:`translateY(-50%)`},children:(0,u.jsx)(`img`,{src:c,alt:`Sri Durga Logo`,style:{width:`65px`,height:`65px`,objectFit:`contain`}})}),(0,u.jsxs)(`div`,{style:{flex:1,textAlign:`center`,paddingLeft:`75px`,paddingRight:`75px`},children:[(0,u.jsx)(`h1`,{style:{fontSize:`24px`,fontWeight:`900`,color:`#000`,margin:`0 0 2px 0`,letterSpacing:`0.5px`,fontFamily:`Georgia, serif`},children:C}),(0,u.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`600`},children:w}),(0,u.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`500`},children:T})]})]}),(0,u.jsxs)(`div`,{style:{borderBottom:`1.5px solid #000`,padding:`8px 8px 8px 8px`,marginBottom:`12px`,fontSize:`13px`,display:`flex`,alignItems:`baseline`,gap:`8px`,flexWrap:`wrap`},children:[(0,u.jsx)(`div`,{style:{fontWeight:`bold`,fontSize:`13.5px`,whiteSpace:`nowrap`},children:a.passType===`IN`?`From:`:`To:`}),(0,u.jsxs)(`div`,{style:{flex:1,display:`flex`,alignItems:`baseline`,flexWrap:`wrap`,gap:`24px`,paddingLeft:`6px`},children:[g&&(0,u.jsx)(`span`,{style:{fontWeight:`bold`,fontSize:`13.5px`,color:`#000`},children:g}),_&&(0,u.jsx)(`span`,{style:{fontWeight:`bold`,fontSize:`13.5px`,color:`#000`},children:_}),!b&&(0,u.jsx)(`span`,{style:{color:`#666`,fontStyle:`italic`},children:`-`})]})]}),(0,u.jsxs)(`div`,{style:{marginBottom:`10px`,fontSize:`12px`,color:`#000`,letterSpacing:`0.2px`},children:[(0,u.jsx)(`div`,{style:{fontWeight:`bold`},children:`DEAR SIR;`}),(0,u.jsx)(`div`,{style:{paddingLeft:`70px`,marginTop:`2px`,fontWeight:`bold`},children:`KINDLY ARRANGE TO RECEIVER THE FOLLOWING AND ACKNOWELEDGE`})]}),(0,u.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,border:`2px solid #000`,marginBottom:`35px`,fontSize:`12.5px`},children:[(0,u.jsx)(`thead`,{children:(0,u.jsxs)(`tr`,{style:{borderBottom:`2px solid #000`,background:`#f8fafc`},children:[(0,u.jsx)(`th`,{style:{borderRight:`1.5px solid #000`,padding:`5px 4px`,width:`45px`,textAlign:`center`,fontWeight:`bold`},children:`Sl.No`}),(0,u.jsx)(`th`,{style:{borderRight:`1.5px solid #000`,padding:`5px 8px`,textAlign:`center`,fontWeight:`bold`},children:`DESCRIPTION`}),(0,u.jsx)(`th`,{style:{borderRight:`1.5px solid #000`,padding:`5px 8px`,width:`75px`,textAlign:`center`,fontWeight:`bold`},children:`Qty.`}),(0,u.jsx)(`th`,{style:{padding:`5px 8px`,width:`120px`,textAlign:`center`,fontWeight:`bold`},children:`Remarks`})]})}),(0,u.jsx)(`tbody`,{children:h.map((e,t)=>{let n=t===h.length-1;return(0,u.jsxs)(`tr`,{style:{borderBottom:n?`none`:`1px solid #ddd`,height:`22px`},children:[(0,u.jsx)(`td`,{style:{borderRight:`1.5px solid #000`,padding:`2px 4px`,textAlign:`center`,verticalAlign:`top`},children:e.description?e.serialNumber||t+1:``}),(0,u.jsx)(`td`,{style:{borderRight:`1.5px solid #000`,padding:`2px 8px`,verticalAlign:`top`},children:e.description}),(0,u.jsx)(`td`,{style:{borderRight:`1.5px solid #000`,padding:`2px 8px`,textAlign:`center`,verticalAlign:`top`},children:e.quantity}),(0,u.jsx)(`td`,{style:{padding:`2px 8px`,textAlign:`center`,verticalAlign:`top`},children:e.remarks})]},t)})})]})]}),(0,u.jsxs)(`div`,{style:{marginTop:`auto`},children:[x&&(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`3px`,marginBottom:`16px`,fontSize:`12px`,padding:`2px 8px`},children:[v&&(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`Vehicle No:`}),` `,v]}),y&&(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`Purpose for Transport:`}),` `,y]})]}),(0,u.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-end`,paddingTop:x?`10px`:`20px`,fontSize:`12.5px`,fontWeight:`bold`},children:[(0,u.jsx)(`div`,{children:`Receiver's Signature`}),(0,u.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,u.jsxs)(`div`,{style:{marginBottom:`35px`,fontWeight:`normal`,fontSize:`11.5px`},children:[`For `,C]}),(0,u.jsx)(`div`,{children:`Authorized Signatory`})]})]})]})]})}),(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.85rem 1.5rem`,background:`rgba(15, 23, 42, 0.98)`,borderTop:`1px solid rgba(255, 255, 255, 0.12)`,flexShrink:0,zIndex:10},children:[(0,u.jsx)(`div`,{style:{fontSize:`0.8rem`,color:`#94a3b8`},children:`A4 Portrait Layout (210mm × 297mm) • Ready for High-Quality Print`}),(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,u.jsx)(`button`,{onClick:i,className:`btn btn-outline`,style:{padding:`0.55rem 1rem`,fontSize:`0.825rem`,color:`#cbd5e1`,borderColor:`rgba(255, 255, 255, 0.2)`},children:`Close`}),(0,u.jsxs)(`button`,{onClick:p,className:`btn btn-primary`,style:{padding:`0.55rem 1.35rem`,fontSize:`0.85rem`,fontWeight:700,display:`flex`,alignItems:`center`,gap:`0.5rem`,boxShadow:`0 4px 15px rgba(79, 70, 229, 0.4)`},children:[(0,u.jsx)(t,{size:17}),(0,u.jsx)(`span`,{children:`Print Gate Pass / Save PDF`})]})]})]})]})})};export{d as t};