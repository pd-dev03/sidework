/* BuildMyFolio V6 — Xtract Dark script.js */
$(function(){

  /* NAV */
  $(window).on('scroll',()=>$('#nav').toggleClass('stuck',$(window).scrollTop()>60));

  /* SCROLL UP */
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});
  },{threshold:.12});
  document.querySelectorAll('.up').forEach(el=>obs.observe(el));

  /* COUNTERS */
  const cObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target,t=parseInt(el.dataset.target)||0;
      cObs.unobserve(el);
      if(!t){el.textContent='0';return;}
      let f=0,fr=50;
      (function tick(){f++;el.textContent=Math.round((1-Math.pow(1-f/fr,3))*t);if(f<fr)requestAnimationFrame(tick);else el.textContent=t;})();
    });
  },{threshold:.5});
  document.querySelectorAll('.stat-n[data-target]').forEach(el=>cObs.observe(el));

  /* HIGHLIGHT MANIFESTO */
  (function(){
    const $p=$('#manifesto');
    if(!$p.length)return;
    $p.html($p.html().replace(/(<[^>]+>)|([^\s<]+)/g,(m,t,w)=>t?t:`<span class="word">${w}</span>`));
    function upd(){
      const top=$p.offset().top,h=$p.outerHeight(),s=$(window).scrollTop(),wh=$(window).height();
      const prog=Math.min(1,Math.max(0,(s-(top-wh*.85))/(h+wh*.55)));
      const words=$p.find('.word'),lit=Math.floor(prog*words.length);
      words.each((i,w)=>i<lit?$(w).addClass('lit'):$(w).removeClass('lit'));
    }
    $(window).on('scroll',upd);upd();
  })();

  /* FEATURE TABS */
  $('.ftab').on('click',function(){
    const tab=$(this).data('tab');
    $('.ftab').removeClass('active');
    $(this).addClass('active');
    $('.ftab-content').removeClass('active');
    $(`.ftab-content[data-content="${tab}"]`).addClass('active');
  });

  /* FAQ */
  $('.faq__q').on('click',function(){
    const open=$(this).attr('aria-expanded')==='true';
    $('.faq__q').attr('aria-expanded','false');
    $('.faq__a').removeClass('open');
    if(!open){$(this).attr('aria-expanded','true');$(this).next('.faq__a').addClass('open');}
  });

  /* WIDGET PUBLISH BUTTON pulse click */
  $('.widget__pub-btn').on('click',function(){
    $(this).text('Published! ✓').css('background','linear-gradient(135deg,#10B981,#059669)');
    setTimeout(()=>$(this).text('Publish Changes →').css('background',''),2000);
  });

  /* COPY BUTTON */
  $('.fui-copy-btn').on('click',function(){
    $(this).text('Copied!');
    setTimeout(()=>$(this).text('Copy'),1500);
  });

});