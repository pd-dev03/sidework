/* BuildMyFolio V2 — Warm Brutalist script.js */
$(function(){

  /* NAV STUCK */
  $(window).on('scroll',function(){
    $('#nav').toggleClass('stuck',$(this).scrollTop()>50);
  });

  /* REVEAL ON SCROLL */
  const revealObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.13});
  document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

  /* WHY ROWS in-view line sweep */
  const whyObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.2});
  document.querySelectorAll('.why__row').forEach(el=>whyObs.observe(el));

  /* COUNTER COUNT-UP with slot-machine feel */
  function slotCount(el){
    const target = parseInt(el.dataset.target);
    if(target===0){el.textContent='0';return;}
    let current=0;
    const frames=40;
    let frame=0;
    function tick(){
      frame++;
      const ease = 1-Math.pow(1-frame/frames,3);
      current = Math.round(ease*target);
      el.textContent=current;
      if(frame<frames) requestAnimationFrame(tick);
      else el.textContent=target;
    }
    tick();
  }
  const cntObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        slotCount(e.target);
        cntObs.unobserve(e.target);
      }
    });
  },{threshold:0.5});
  document.querySelectorAll('.cnum').forEach(el=>cntObs.observe(el));

  /* HIGHLIGHT PARAGRAPH — word by word on scroll */
  (function(){
    const $p = $('#manifesto');
    if(!$p.length) return;
    const html = $p.html();
    const wrapped = html.replace(/(<[^>]+>)|([^\s<]+)/g,(m,tag,word)=>{
      return tag ? tag : `<span class="word">${word}</span>`;
    });
    $p.html(wrapped);

    function update(){
      const top    = $p.offset().top;
      const h      = $p.outerHeight();
      const scroll = $(window).scrollTop();
      const wh     = $(window).height();
      const prog   = Math.min(1,Math.max(0,(scroll-(top-wh*.85))/(h+wh*.6)));
      const words  = $p.find('.word');
      const lit    = Math.floor(prog*words.length);
      words.each((i,w)=> i<lit ? $(w).addClass('lit') : $(w).removeClass('lit'));
    }
    $(window).on('scroll',update);
    update();
  })();

  /* SLOT TITLE — chars drop in with stagger on scroll-in */
  const slotObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el   = e.target;
      const text = el.dataset.text || el.textContent.trim();
      el.textContent='';
      let i=0;
      function drop(){
        if(i>=text.length) return;
        el.textContent+=text[i];
        i++;
        const delay = Math.max(16, 55 - (i/text.length)*40);
        setTimeout(drop,delay);
      }
      drop();
      slotObs.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('.slot-title').forEach(el=>slotObs.observe(el));

  /* FAQ */
  $('.faq__q').on('click',function(){
    const $this=$(this);
    const isOpen=$this.attr('aria-expanded')==='true';
    $('.faq__q').attr('aria-expanded','false');
    $('.faq__a').removeClass('open');
    if(!isOpen){
      $this.attr('aria-expanded','true');
      $this.next('.faq__a').addClass('open');
    }
  });

  /* HOVER — offset shadow on cards */
  $('.how__step, .pricing__card').on('mouseenter mouseleave',function(e){
    /* handled by CSS :hover */
  });

});
