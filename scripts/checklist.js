
document.addEventListener('DOMContentLoaded', () => {
  const key = window.location.pathname.split('/').pop().replace('.html','') + '-checks';
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = saved[cb.id] || false;
    cb.addEventListener('change', () => {
      saved[cb.id] = cb.checked;
      localStorage.setItem(key, JSON.stringify(saved));
    });
  });
});
