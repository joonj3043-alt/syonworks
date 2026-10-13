'use strict';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

const nav=$('#navigation'),menu=$('#menu');
function closeMenu(){if(!nav||!menu)return;nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','메뉴 열기');}
if(nav&&menu){
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
 window.addEventListener('resize',()=>{if(innerWidth>1020)closeMenu();});
}

// Current page state — supports Pretty URLs (/services/, /projects/, etc.)
function normalizeNavPath(pathname){
 let p=pathname.replace(/\/index\.html$/i,'/').replace(/\.html$/i,'/');
 if(!p.endsWith('/'))p+='/';
 return p.replace(/\/{2,}/g,'/');
}
const currentPath=normalizeNavPath(location.pathname);
if(nav)nav.querySelectorAll('a').forEach(a=>{
 try{
  const linkPath=normalizeNavPath(new URL(a.getAttribute('href'),location.href).pathname);
  if(linkPath===currentPath)a.setAttribute('aria-current','page');
 }catch{}
});

// Concept project filter / modal only where present
const filters=$$('[data-filter]'),projects=$$('[data-category]');
if(filters.length&&projects.length){filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});let count=0;projects.forEach(p=>{p.hidden=button.dataset.filter!=='all'&&p.dataset.category!==button.dataset.filter;if(!p.hidden)count++;});const status=$('#filter-status');if(status)status.textContent=`${button.textContent}: 디자인 예시 ${count}개 표시`;}));}
const demos={business:{title:'전문성을 이해하기 쉬운 구조로.',description:'기업·브랜드 소개를 위한 Concept Project입니다. 핵심 사업을 빠르게 이해하고 필요한 상담으로 이동하도록 구성합니다.',features:['첫 화면: 사업의 가치와 핵심 서비스','상세 정보: 제공 서비스와 확인된 사업 정보','문의 동선: 소개에서 상담으로 이어지는 버튼']},cafe:{title:'공간의 매력을 방문으로 연결합니다.',description:'음식점·카페의 분위기와 필요한 방문 정보를 함께 보여주는 Concept Project입니다.',features:['첫 화면: 공간의 분위기와 대표 메뉴','방문 정보: 메뉴, 영업 안내와 매장 위치','모바일: 지도와 문의를 쉽게 찾는 구성']},beauty:{title:'서비스를 이해하면, 선택이 쉬워집니다.',description:'뷰티·웰니스의 서비스와 공간을 차분하게 소개하는 Concept Project입니다.',features:['첫 화면: 브랜드의 관점과 서비스 소개','상세 정보: 프로그램과 이용 안내','상담 연결: 궁금증 해소 후 자연스러운 문의']}};
const dialog=$('#demo-dialog');
if(dialog){$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{const d=demos[b.dataset.demo];if(!d)return;$('#demo-title').textContent=d.title;$('#demo-description').textContent=d.description;$('#demo-features').replaceChildren(...d.features.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));dialog.showModal();}));const dc=$('.dialog-close');if(dc)dc.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}

// Confirmed channels only
const cfg=window.SYON_CONFIG||{},phone=String(cfg.phone||'').replace(/[\s()-]/g,''),validPhone=/^\+?\d{8,15}$/.test(phone),email=String(cfg.email||'').trim(),validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
let kakao=null;try{const u=new URL(cfg.kakaoUrl);if(u.protocol==='https:'&&['open.kakao.com','pf.kakao.com'].includes(u.hostname))kakao=u.href;}catch{}
const contactLinks=$('#contact-links');
function contactLink(text,href){if(!contactLinks)return;const a=document.createElement('a');a.textContent=text;a.href=href;contactLinks.append(a);}
if(validPhone)contactLink('전화 상담 ↗','tel:'+phone);if(kakao)contactLink('카카오 상담 ↗',kakao);if(validEmail)contactLink('이메일 상담 ↗','mailto:'+email);

// Inquiry form: no server persistence; opens user's own messaging/mail app only when configured
const form=$('#inquiry'),prepared=$('#prepared-message'),canSend=validPhone||validEmail;
if(form&&prepared){
 const params=new URLSearchParams(location.search),freeTrialContext=params.get('type')==='free-trial'||document.body.dataset.page==='free-project';
 const notice=$('#form-notice'),foot=$('#form-foot'),formTitle=$('#form-title'),submitButton=$('#submit-button');
 if(freeTrialContext){if(formTitle)formTitle.textContent='무료체험 신청';if(submitButton)submitButton.innerHTML='무료체험 신청 내용 작성하기 <span>→</span>';}
 if(canSend){if(notice)notice.textContent='작성 후 문자 앱에서 내용을 확인하고 직접 전송해주세요. 이 홈페이지에는 문의 내용을 저장하지 않습니다.';if(foot)foot.textContent='문자 앱으로 이동한 뒤 전송을 완료해주세요.';}
 form.addEventListener('submit',e=>{e.preventDefault();const company=form.elements.company.value.trim();if(!company){form.elements.company.setCustomValidity('이름 또는 업체명을 입력해주세요.');form.elements.company.reportValidity();return;}const digits=form.elements.phone.value.replace(/\D/g,'');if(digits.length<8||digits.length>15){form.elements.phone.setCustomValidity('연락 가능한 전화번호를 확인해주세요.');form.elements.phone.reportValidity();return;}const data=new FormData(form);const title=freeTrialContext?'SYON WORKS 무료체험 신청':'SYON WORKS 프로젝트 문의';const message=`[${title}]\n이름/업체명: ${company}\n연락처: ${String(data.get('phone')).trim()}\n업종: ${data.get('industry')}\n현재 홈페이지: ${data.get('website')}\n원하는 홈페이지: ${String(data.get('message')).trim()||'상담을 통해 정하고 싶습니다.'}`;prepared.value=message;const result=$('#inquiry-result');if(result)result.hidden=false;const status=$('#copy-status');if(status)status.textContent='문의 내용을 준비했습니다. 문자 앱에서 전송을 완료해주세요.';const send=$('#send-inquiry');if(send&&canSend){send.hidden=false;send.textContent=validPhone?'문자 상담 열기 ↗':'이메일 문의 열기 ↗';send.href=validPhone?`sms:${phone}${/iPad|iPhone|iPod/.test(navigator.userAgent)?'&':'?'}body=${encodeURIComponent(message)}`:`mailto:${email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`;}prepared.focus();});
 ['company','phone'].forEach(name=>form.elements[name]?.addEventListener('input',()=>form.elements[name].setCustomValidity('')));
 form.addEventListener('input',()=>{const result=$('#inquiry-result');if(result&&!result.hidden){result.hidden=true;prepared.value='';}});
 const copy=$('#copy');if(copy)copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(prepared.value);$('#copy-status').textContent='내용을 복사했습니다. 원하시는 연락 수단으로 전송해주세요.';}catch{prepared.focus();prepared.select();$('#copy-status').textContent='내용을 선택했습니다. 기기의 복사 기능으로 복사해주세요.';}});
}

// Hide mobile CTA near forms
const mobileCta=$('.mobile-cta'),contactSection=$('.contact-section');
if(mobileCta&&contactSection&&'IntersectionObserver'in window){new IntersectionObserver(entries=>{mobileCta.classList.toggle('hidden-cta',entries[0].isIntersecting);},{threshold:0}).observe(contactSection);}

// HOME only: SYON WORKS brand opening
(()=>{const intro=$('#brand-intro'),skip=$('#intro-skip');if(!intro||!skip)return;let opened=false,prepareTimer,openTimer,doneTimer;document.body.style.overflow='hidden';function finishIntro(){if(opened)return;opened=true;clearTimeout(prepareTimer);clearTimeout(openTimer);clearTimeout(doneTimer);intro.classList.add('intro-prepare');requestAnimationFrame(()=>setTimeout(()=>intro.classList.add('intro-open'),90));doneTimer=setTimeout(()=>{intro.classList.add('intro-done');intro.setAttribute('aria-hidden','true');document.body.style.overflow='';},1450);}skip.addEventListener('click',finishIntro);const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced){prepareTimer=setTimeout(()=>intro.classList.add('intro-prepare'),250);openTimer=setTimeout(finishIntro,650);}else{prepareTimer=setTimeout(()=>intro.classList.add('intro-prepare'),4450);openTimer=setTimeout(finishIntro,4660);}})();
