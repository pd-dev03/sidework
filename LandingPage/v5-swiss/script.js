/* BuildMyFolio V5 — Swiss Editorial script.js */
$(function(){

  /* NAV */
  $(window).on('scroll',()=>$('#nav').toggleClass('stuck',$(window).scrollTop()>60));

  /* RISE ON SCROLL */
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.12});
  document.querySelectorAll('.rise').forEach(el=>obs.observe(el));

  /* WIPE TEXT — feature titles reveal left to right */
  const wipeObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('wiped');
        wipeObs.unobserve(e.target);
      }
    });
  },{threshold:0.5});
  document.querySelectorAll('.wipe-text').forEach(el=>wipeObs.observe(el));

  /* HIGHLIGHT MANIFESTO — dim → lit word by word */
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

  /* COUNTER */
  const cntObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target,target=parseInt(el.dataset.target)||0;
      cntObs.unobserve(el);
      if(target===0){el.textContent='0';return;}
      let f=0,frames=48;
      function tick(){
        f++;
        el.textContent=Math.round((1-Math.pow(1-f/frames,3))*target);
        if(f<frames) requestAnimationFrame(tick);
        else el.textContent=target;
      }
      tick();
    });
  },{threshold:.5});
  document.querySelectorAll('.cnum').forEach(el=>cntObs.observe(el));

  /* FAQ */
  $('.faq__q').on('click',function(){
    const open=$(this).attr('aria-expanded')==='true';
    $('.faq__q').attr('aria-expanded','false');
    $('.faq__a').removeClass('open');
    if(!open){$(this).attr('aria-expanded','true');$(this).next('.faq__a').addClass('open');}
  });

  /* FEATURE ROW HOVER — subtle red left border */
  $('.feat__row').on('mouseenter',function(){
    $(this).css('border-left','2px solid #B91C1C');
    $(this).css('padding-left','1rem');
  }).on('mouseleave',function(){
    $(this).css('border-left','');
    $(this).css('padding-left','');
  });

  /* SCROLL — hero parallax subtle */
  $(window).on('scroll',function(){
    const s=$(this).scrollTop();
    if(s<window.innerHeight){
      $('.hero__headline').css('transform',`translateY(${s*.03}px)`);
    }
  });

});
