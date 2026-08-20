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
});
//Te acordas que la tabla de area_conductor se le tiene que multiplicar 
// el area con el numero de cables ya que es la de varios calibres en un tubo.