/* BuildMyFolio V3 — Premium Dark Glassmorphism script.js */
$(function(){

  /* ── NAV STUCK ── */
  $(window).on('scroll',()=>$('#nav').toggleClass('stuck',$(window).scrollTop()>60));

  /* ── FADE-UP REVEAL ── */
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.12});
  document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));

  /* ── PARTICLE CANVAS ── */
  (function(){
    const canvas = document.getElementById('particleCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W,H,particles=[];

    function resize(){
      W=canvas.width=window.innerWidth;
      H=canvas.height=window.innerHeight;
    }
    resize();
    window.addEventListener('resize',resize);

    function Particle(){
      this.x = Math.random()*W;
      this.y = Math.random()*H;
      this.r = Math.random()*1.5+.3;
      this.vx = (Math.random()-.5)*.25;
      this.vy = (Math.random()-.5)*.25;
      this.alpha = Math.random()*.5+.1;
      // color: indigo or purple
      this.color = Math.random()>.5 ? '99,102,241' : '168,85,247';
    }
    Particle.prototype.update = function(){
      this.x+=this.vx; this.y+=this.vy;
      if(this.x<0) this.x=W;
      if(this.x>W) this.x=0;
      if(this.y<0) this.y=H;
      if(this.y>H) this.y=0;
    };
    Particle.prototype.draw = function(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${this.color},${this.alpha})`;
      ctx.fill();
    };

    for(let i=0;i<90;i++) particles.push(new Particle());

    // Draw connecting lines between nearby particles
    function drawLines(){
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x;
          const dy=particles[i].y-particles[j].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=`rgba(99,102,241,${.12*(1-dist/120)})`;
            ctx.lineWidth=.5;
            ctx.stroke();
          }
        }
      }
    }

    function loop(){
      ctx.clearRect(0,0,W,H);
      particles.forEach(p=>{p.update();p.draw();});
      drawLines();
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ── COUNTER ANIMATE ── */
  const cntObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target;
      const target=parseInt(el.dataset.target)||0;
      cntObs.unobserve(el);
      if(target===0){el.textContent='0';return;}
      let f=0,frames=50;
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

  /* ── URL TYPEWRITER ── */
  const names=['yourname','priyanshu','alexjohnson','saradeve','jsmith'];
  let ni=0,ci=0,del=false;
  function typeUrl(){
    const name=names[ni];
    if(del){ ci--; } else { ci++; }
    $('#urlTyped').text(name.substring(0,ci));
    if(!del && ci===name.length){ setTimeout(()=>{del=true;typeUrl();},1800); return; }
    if(del && ci===0){ del=false; ni=(ni+1)%names.length; setTimeout(typeUrl,400); return; }
    setTimeout(typeUrl, del?30:70);
  }
  setTimeout(typeUrl,1500);

  /* ── HIGHLIGHT MANIFESTO ── */
  (function(){
    const $p=$('#manifesto');
    if(!$p.length) return;
    $p.html($p.html().replace(/(<[^>]+>)|([^\s<]+)/g,(m,t,w)=>t?t:`<span class="word">${w}</span>`));
    function update(){
      const top=$p.offset().top,h=$p.outerHeight(),s=$(window).scrollTop(),wh=$(window).height();
      const prog=Math.min(1,Math.max(0,(s-(top-wh*.85))/(h+wh*.6)));
      const words=$p.find('.word'),lit=Math.floor(prog*words.length);
      words.each((i,w)=>i<lit?$(w).addClass('lit'):$(w).removeClass('lit'));
    }
    $(window).on('scroll',update); update();
  })();

  /* ── 3D TILT on bento cards ── */
  document.querySelectorAll('.bento__card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const rect=card.getBoundingClientRect();
      const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
      const dx=(e.clientX-cx)/(rect.width/2);
      const dy=(e.clientY-cy)/(rect.height/2);
      card.style.transform=`perspective(800px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  /* ── FAQ ── */
  $('.faq__q').on('click',function(){
    const open=$(this).attr('aria-expanded')==='true';
    $('.faq__q').attr('aria-expanded','false');
    $('.faq__a').removeClass('open');
    if(!open){$(this).attr('aria-expanded','true');$(this).next('.faq__a').addClass('open');}
  });

  /* ── GLOW PULSE on CTA btn ── */
  setInterval(()=>{
    $('.btn--glow').each(function(){
      $(this).css('box-shadow','0 0 60px rgba(99,102,241,.5),0 8px 30px rgba(99,102,241,.35)');
      setTimeout(()=>$(this).css('box-shadow',''),800);
    });
  },3000);

});
