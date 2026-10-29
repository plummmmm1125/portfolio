(() => {
  const tabs = [...document.querySelectorAll('[data-skill-tab]')];
  if (!tabs.length) return;
  function select(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const label = tab.firstChild.textContent;
    document.querySelector('.skills-current').textContent = `${label} · ${String(panel.querySelectorAll('[data-image]').length).padStart(2, '0')} 件`;
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const destinations = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      select(tabs[destinations[event.key]], true);
    });
  });
})();
