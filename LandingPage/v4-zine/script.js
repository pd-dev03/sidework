/* BuildMyFolio V4 — Neon Zine script.js */
$(function(){

  /* NAV */
  $(window).on('scroll',()=>$('#nav').toggleClass('stuck',$(window).scrollTop()>60));

  /* SCROLL REVEAL */
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.12});
  document.querySelectorAll('.scroll-reveal').forEach(el=>obs.observe(el));

  /* WHY ROWS line sweep */
  const whyObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.15});
  document.querySelectorAll('.why__feat').forEach(el=>whyObs.observe(el));

  /* SCATTER RANT WORDS — appear one by one with delay & wobble */
  const rantObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      e.target.querySelectorAll('.sr-word').forEach((w,i)=>{
        setTimeout(()=>w.classList.add('in'),i*120);
      });
      rantObs.unobserve(e.target);
    });
  },{threshold:0.3});
  const rant=document.querySelector('.story__rant');
  if(rant) rantObs.observe(rant);

  /* HIGHLIGHT PARA */
  (function(){
    const $p=$('#manifesto');
    if(!$p.length) return;
    $p.html($p.html().replace(/(<[^>]+>)|([^\s<]+)/g,(m,t,w)=>t?t:`<span class="word">${w}</span>`));
    function upd(){
      const top=$p.offset().top,h=$p.outerHeight(),s=$(window).scrollTop(),wh=$(window).height();
      const prog=Math.min(1,Math.max(0,(s-(top-wh*.85))/(h+wh*.55)));
      const words=$p.find('.word'),lit=Math.floor(prog*words.length);
      words.each((i,w)=>i<lit?$(w).addClass('lit'):$(w).removeClass('lit'));
    }
    $(window).on('scroll',upd); upd();
  })();

  /* FAST CHARS — increasing speed typing */
  const fastObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target;
      const full=el.dataset.text||el.textContent.trim();
      el.textContent='';
      let i=0;
      function tick(){
        if(i>=full.length) return;
        el.textContent+=full[i]; i++;
        setTimeout(tick,Math.max(14,65-(i/full.length)*52));
      }
      tick();
      fastObs.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('.fast-chars').forEach(el=>fastObs.observe(el));

  /* MAGNETIC BUTTONS */
  document.querySelectorAll('.mag-btn').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const rect=btn.getBoundingClientRect();
      const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
      const dx=(e.clientX-cx)*.2, dy=(e.clientY-cy)*.2;
      btn.style.transform=`translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='translate(0,0)';
    });
  });

  /* FAQ */
  $('.faq__q').on('click',function(){
    const open=$(this).attr('aria-expanded')==='true';
    $('.faq__q').attr('aria-expanded','false');
    $('.faq__a').removeClass('open');
    if(!open){$(this).attr('aria-expanded','true');$(this).next('.faq__a').addClass('open');}
  });

  /* FLOATING BADGE PARALLAX */
  $(window).on('scroll',function(){
    const s=$(this).scrollTop();
    $('.hero__badge-1').css('transform',`translateY(${s*.08}px)`);
    $('.hero__badge-2').css('transform',`translateY(${s*.05}px) rotate(-3deg)`);
  });

});
