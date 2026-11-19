// Hiệu ứng nhẹ: hiện dần các khối khi cuộn tới (bỏ qua nếu người dùng giảm chuyển động)
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.about-row, .score-rules');
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
})();

// Thanh tìm kiếm ở trang Score: thêm bóng + viền khi đang dính dưới header
(() => {
  const bar = document.querySelector('.search-bar');
  if (!bar) return;
  const stickyTop = () => parseFloat(getComputedStyle(bar).top) || 0;
  let queued = false;
  const update = () => {
    queued = false;
    bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= stickyTop() + 0.5);
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
