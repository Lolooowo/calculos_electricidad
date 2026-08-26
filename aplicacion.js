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

  const selectVoltaje = document.getElementById('voltajeNominal');
  const inputVoltajeManual = document.getElementById('voltajeManual');

  const radiosMetodoCarga = document.querySelectorAll('input[name="metodoCarga"]');
  const campoCorriente = document.getElementById('campo-corriente');
  const campoPotencia = document.getElementById('campo-potencia');

  const inputCorriente = document.getElementById('corriente');
  const inputPotencia = document.getElementById('potencia');
  const inputFactorPotencia = document.getElementById('factorPotencia');
  const inputLongitud = document.getElementById('longitud');

  const selectCalibre = document.getElementById('calibreAwg');
  const btnCalcular = document.getElementById('btnCalcularCaidaTension');
  const resultadoBox = document.getElementById('resultadoCaidaTension');

  // Mostrar campo de voltaje manual si se elige "Otro"
  selectVoltaje.addEventListener('change', () => {
    const esOtro = selectVoltaje.value === 'otro';
    inputVoltajeManual.hidden = !esOtro;
    if (esOtro) inputVoltajeManual.focus();
  });

  // Alternar entre Corriente y Potencia+F.P. según el método elegido
  radiosMetodoCarga.forEach((radio) => {
    radio.addEventListener('change', () => {
      const usaPotencia = radio.value === 'potencia' && radio.checked;
      campoCorriente.hidden = usaPotencia;
      campoPotencia.hidden = !usaPotencia;
    });
  });

/* -----------------------------------------------------
   RESISTIVIDAD constante por material (Ω·mm²/m)
----------------------------------------------------- */
const RESISTIVIDAD = {
  cobre: 0.0175,
  aluminio: 0.0282
};

// Referencia al nuevo campo de área de sección
const inputAreaSeccion = document.getElementById('areaSeccion');

/* -----------------------------------------------------
   Validación de datos antes de calcular
----------------------------------------------------- */
function validarFormulario() {
  const errores = [];

  const voltaje = obtenerVoltajeNominal();
  if (!voltaje || voltaje <= 0) {
    errores.push('Ingresa un voltaje nominal válido.');
  }

  const metodo = obtenerMetodoCarga();
  if (metodo === 'corriente') {
    if (!inputCorriente.value || parseFloat(inputCorriente.value) <= 0) {
      errores.push('Ingresa un valor de corriente válido.');
    }
  } else {
    if (!inputPotencia.value || parseFloat(inputPotencia.value) <= 0) {
      errores.push('Ingresa un valor de potencia válido.');
    }
    const fp = parseFloat(inputFactorPotencia.value);
    if (isNaN(fp) || fp <= 0 || fp > 1) {
      errores.push('El factor de potencia debe estar entre 0 y 1.');
    }
  }

  if (!inputLongitud.value || parseFloat(inputLongitud.value) <= 0) {
    errores.push('Ingresa una longitud de circuito válida.');
  }

  if (!inputAreaSeccion.value || parseFloat(inputAreaSeccion.value) <= 0) {
    errores.push('Ingresa el área de la sección transversal del conductor (mm²).');
  }

  return errores;
}

/* -----------------------------------------------------
   CALCULAR_CAIDA_TENSION
   Fórmulas:
     Monofásico: VD = (2 x ρ x I x L) / S
     Trifásico:  VD = (√3 x ρ x I x L) / S
   donde:
     ρ = resistividad del material (Ω·mm²/m)
     I = corriente (A)
     L = longitud en metros (ida)
     S = área de la sección transversal (mm²)
----------------------------------------------------- */
function calcularCaidaTension() {
  const errores = validarFormulario();

  resultadoBox.hidden = false;
  resultadoBox.classList.remove('ok', 'fail');

  if (errores.length > 0) {
    resultadoBox.classList.add('fail');
    resultadoBox.innerHTML = `
      <strong>Revisa los siguientes datos:</strong>
      <ul>${errores.map((e) => `<li>${e}</li>`).join('')}</ul>
    `;
    return;
  }

  const tipoCircuito = obtenerTipoCircuito();
  const voltaje = obtenerVoltajeNominal();
  const material = obtenerMaterialConductor();
  const rho = RESISTIVIDAD[material];
  const longitud = parseFloat(inputLongitud.value);
  const area = parseFloat(inputAreaSeccion.value);
  const corriente = obtenerCorriente(voltaje);


  const caidaVoltios = (rho * corriente * (longitud*2)) / area;
  const caidaPorcentaje = (caidaVoltios / voltaje) * 100;

  const limite = 3; // % límite de referencia (ajustable)
  const cumple = caidaPorcentaje <= limite;

  resultadoBox.classList.add(cumple ? 'ok' : 'fail');
  resultadoBox.innerHTML = `
    <strong>Caída de tensión: ${caidaVoltios.toFixed(2)} V (${caidaPorcentaje.toFixed(2)}%)</strong>
    <p>Corriente utilizada: ${corriente.toFixed(2)} A</p>
    <p>${cumple ? 'Cumple' : 'No cumple'} el límite de referencia de ${limite}%.</p>
  `;
}

btnCalcular.addEventListener('click', calcularCaidaTension);

  /* -----------------------------------------------------
     Helpers de lectura de datos del formulario
  ----------------------------------------------------- */
  function obtenerVoltajeNominal() {
    if (selectVoltaje.value === 'otro') {
      return parseFloat(inputVoltajeManual.value);
    }
    return parseFloat(selectVoltaje.value);
  }

  function obtenerTipoCircuito() {
    return document.querySelector('input[name="tipoCircuito"]:checked').value;
  }

  function obtenerMaterialConductor() {
    return document.querySelector('input[name="materialConductor"]:checked').value;
  }

  function obtenerMetodoCarga() {
    return document.querySelector('input[name="metodoCarga"]:checked').value;
  }

  // Calcula la corriente final, ya sea ingresada directamente
  // o derivada de potencia + factor de potencia
  function obtenerCorriente(voltaje) {
    const metodo = obtenerMetodoCarga();

    if (metodo === 'corriente') {
      return parseFloat(inputCorriente.value);
    }else {
      const potencia = parseFloat(inputPotencia.value);
      const fp = parseFloat(inputFactorPotencia.value);
      if (fp < 1){
        fp = fp/100;
      }
      console.log(potencia + " " + fp);
      const corrienteReal= (potencia/fp)/voltaje;
      console.log("Corriente real calculada: " + corrienteReal);

      return corrienteReal;
  }
}

  /* -----------------------------------------------------
     Validación de datos antes de calcular
  ----------------------------------------------------- */
  function validarFormulario() {
    const errores = [];

    const voltaje = obtenerVoltajeNominal();
    if (!voltaje || voltaje <= 0) {
      errores.push('Ingresa un voltaje nominal válido.');
    }

    const metodo = obtenerMetodoCarga();
    if (metodo === 'corriente') {
      if (!inputCorriente.value || parseFloat(inputCorriente.value) <= 0) {
        errores.push('Ingresa un valor de corriente válido.');
      }
    } else {
      if (!inputPotencia.value || parseFloat(inputPotencia.value) <= 0) {
        errores.push('Ingresa un valor de potencia válido.');
      }
      const fp = parseFloat(inputFactorPotencia.value);
      if (isNaN(fp) || fp <= 0 || fp > 1) {
        errores.push('El factor de potencia debe estar entre 0 y 1.');
      }
    }

    if (!inputLongitud.value || parseFloat(inputLongitud.value) <= 0) {
      errores.push('Ingresa una longitud de circuito válida.');
    }

    return errores;
  }
;