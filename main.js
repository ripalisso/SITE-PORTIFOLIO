// reveal on scroll
document.addEventListener('DOMContentLoaded', () => {
  // thumbnails: usa a imagem própria (data-thumb) se houver, senão busca a capa do YouTube
  document.querySelectorAll('.video-card').forEach(card => {
    const id = card.dataset.video;
    const customThumb = card.dataset.thumb;
    const thumb = card.querySelector('.thumb');
    if (!thumb) return;

    const setBg = (url) => { thumb.style.backgroundImage = `url('${url}')`; };

    if (customThumb) { setBg(customThumb); return; }
    if (!id) return;

    // tenta a versão em alta resolução; se não existir, cai pra hqdefault (essa sempre existe)
    const hq = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const maxres = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const probe = new Image();
    probe.onload = () => {
      // o YouTube devolve uma imagem "placeholder" de 120x90 quando maxresdefault não existe
      setBg(probe.naturalWidth > 120 ? maxres : hq);
    };
    probe.onerror = () => setBg(hq);
    probe.src = maxres;
  });

  // copiar Gmail pra área de transferência (botão .copy-trigger, só existe em contato.html)
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // fallback pra ambientes sem HTTPS/localhost
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }
  document.querySelectorAll('.copy-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      copyText(text).then(() => {
        const plat = btn.querySelector('.plat');
        if (!plat) return;
        const original = plat.textContent;
        const isPt = document.documentElement.lang.startsWith('pt');
        plat.textContent = isPt ? 'Copiado!' : 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          plat.textContent = original;
          btn.classList.remove('copied');
        }, 1800);
      });
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // mobile menu
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.right = '24px';
      navLinks.style.background = 'rgba(12,4,3,0.97)';
      navLinks.style.padding = '20px';
      navLinks.style.border = '1px solid var(--line)';
      navLinks.style.borderRadius = '6px';
      navLinks.style.gap = '18px';
    });
  }

  // portfolio filter (only present on portfolio.html)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.video-card');
  const portfolioGroups = document.querySelectorAll('.grid-shorts, .grid-videos');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        c.style.display = (f === 'all' || c.dataset.category === f) ? '' : 'none';
      });
      // esconde o título da seção (Shorts / Vídeos) quando ela fica sem nenhum card visível
      portfolioGroups.forEach(group => {
        const hasVisible = [...group.querySelectorAll('.video-card')].some(c => c.style.display !== 'none');
        group.style.display = hasVisible ? '' : 'none';
        const title = group.previousElementSibling;
        if (title && title.classList.contains('group-title')) {
          title.style.display = hasVisible ? '' : 'none';
        }
      });
    });
  });

  // video modal (only present on portfolio.html)
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    const modalBox = document.querySelector('.modal-box');
    const frame = document.getElementById('modalFrame');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.video;
        const isVideo = card.dataset.format === 'video';
        modalBox.classList.toggle('is-video', isVideo);
        frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
        overlay.classList.add('open');
      });
    });
    function closeModal() {
      overlay.classList.remove('open');
      frame.src = '';
    }
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }
});
