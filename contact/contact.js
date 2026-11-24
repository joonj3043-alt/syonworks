'use strict';
(()=>{
 const form=document.getElementById('inquiry');if(!form)return;
 const phone=String(window.SYON_CONFIG?.phone||'').replace(/[^+\d]/g,'');
 const panel=document.getElementById('sms-panel'),canvas=document.getElementById('sms-qr'),open=document.getElementById('sms-open'),instructions=document.getElementById('sms-instructions'),title=document.getElementById('sms-title');
 const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const mobile=apple||/Android|Mobile/i.test(navigator.userAgent);
 const sms=message=>`sms:${phone}${apple?'&':'?'}body=${encodeURIComponent(message)}`;
 const reset=()=>{panel.hidden=true;canvas.hidden=true;open.hidden=true;open.removeAttribute('href');canvas.width=canvas.height=1;};
 const show=(heading,description)=>{title.textContent=heading;instructions.textContent=description;panel.hidden=false;};
 const mobileLink=message=>{show('문자 앱으로 상담 신청하기','문자 앱에서 전송 버튼을 눌러야 상담이 접수됩니다. 앱이 열리지 않으면 아래 버튼을 눌러 주세요.');open.href=sms(message);open.hidden=false;};
 const selected=new URLSearchParams(location.search).get('type');for(const el of form.querySelectorAll('[name="production_type"]'))if(el.value===selected)el.checked=true;
 const pack=message=>{const bytes=new TextEncoder().encode(message);return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
 const unpack=value=>new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
 function drawQR(value){const qr=new window.SyonQR(-1,1);qr.addData(value);qr.make();const n=qr.getModuleCount(),scale=Math.max(3,Math.floor(620/(n+8)));canvas.width=canvas.height=(n+8)*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect((c+4)*scale,(r+4)*scale,scale,scale);canvas.hidden=false;}
 form.addEventListener('submit',e=>{e.preventDefault();reset();const d=new FormData(form),name=String(d.get('company')||'').trim(),tel=String(d.get('phone')||'').trim(),msg=String(d.get('message')||'').trim();for(const [field,valid,error] of [['company',!!name,'이름을 입력해 주세요.'],['phone',tel.replace(/\D/g,'').length>=8&&tel.replace(/\D/g,'').length<=15,'연락 가능한 전화번호를 입력해 주세요.'],['message',!!msg,'문의 내용을 입력해 주세요.']]){if(!valid){form.elements[field].setCustomValidity(error);form.elements[field].reportValidity();return;}}const message=['[시온웍스 홈페이지 제작 상담]','홈페이지 유형: '+d.get('project_kind'),'제작 방식: '+(d.get('production_type')==='partnership'?'제휴형':'일반형'),'이름: '+name,'연락처: '+tel,'업종: '+d.get('industry'),'문의 내용: '+msg].join('\n');if(mobile){mobileLink(message);location.href=sms(message);}else{show('스마트폰으로 상담 신청하기','스마트폰 카메라로 QR코드를 스캔한 뒤 문자 앱을 열어 전송해 주세요.');try{const url=new URL('https://syonworks.com/contact/');url.hash='sms='+pack(message);drawQR(url.href);}catch{show('QR코드를 만들 수 없습니다','문의 내용이 너무 길거나 QR 생성에 실패했습니다. 내용을 줄여 다시 신청하거나 스마트폰에서 직접 신청해 주세요.');}}panel.scrollIntoView({behavior:'smooth',block:'nearest'});});
 form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');reset();});form.addEventListener('change',reset);document.getElementById('sms-close').addEventListener('click',reset);
 if(location.hash.startsWith('#sms=')){try{const message=unpack(location.hash.slice(5));history.replaceState(null,'',location.pathname+location.search);if(message.startsWith('[시온웍스 홈페이지 제작 상담]')){mobileLink(message);panel.scrollIntoView({block:'center'});}}catch{history.replaceState(null,'',location.pathname+location.search);}}
})();
