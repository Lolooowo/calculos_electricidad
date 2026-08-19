document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function activateTab(targetId) {
    tabButtons.forEach((btn) => {
      const isTarget = btn.dataset.tab === targetId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    tabPanels.forEach((panel) => {
      const isTarget = panel.id === `panel-${targetId}`;
      panel.classList.toggle('active', isTarget);
      panel.hidden = !isTarget;
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  // Soporte de navegación con teclado (flechas izquierda/derecha)
  const tabList = document.querySelector('.tabs');
  tabList.addEventListener('keydown', (e) => {
    const currentIndex = Array.from(tabButtons).findIndex((b) => b.classList.contains('active'));
    let newIndex = null;

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabButtons.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    if (newIndex !== null) {
      tabButtons[newIndex].focus();
      activateTab(tabButtons[newIndex].dataset.tab);
    }
  });
});