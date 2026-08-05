document.addEventListener('DOMContentLoaded', function () {
  // Load header and footer partials into the page if placeholders exist
  function loadPartial(url, selector) {
    return fetch(url)
      .then(resp => {
        if (!resp.ok) throw new Error('Failed to load ' + url);
        return resp.text();
      })
      .then(html => {
        const container = document.querySelector(selector);
        if (container) container.innerHTML = html;
      })
      .catch(err => {
        // silently fail but log to console for debugging
        console.warn(err);
      });
  }

  Promise.all([
    loadPartial('partials/header.html', '#site-header'),
    loadPartial('partials/footer.html', '#site-footer')
  ]).then(() => {
    // set current year in footer
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // initialize nav toggle behavior after header is injected
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-navigation');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open');
      });

      // close mobile menu when a link is clicked
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if (nav.classList.contains('open')) {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  });
});
