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
//Te acordás que la tabla de area_conductor se le tiene que multiplicar 
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

  selectVoltaje.addEventListener('change', () => {
    const esOtro = selectVoltaje.value === 'otro';
    inputVoltajeManual.hidden = !esOtro;
    if (esOtro) inputVoltajeManual.focus();
  });

  radiosMetodoCarga.forEach((radio) => {
    radio.addEventListener('change', () => {
      const usaPotencia = radio.value === 'potencia' && radio.checked;
      campoCorriente.hidden = usaPotencia;
      campoPotencia.hidden = !usaPotencia;
    });
  });


const RESISTIVIDAD = {
  cobre: 0.0175,
  aluminio: 0.0282
};

const inputAreaSeccion = document.getElementById('areaSeccion');

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

//Pa calcular la caida de tension y su pocentaje de eso
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
  var limite = 3;
  if(tipoCircuito === 'total') {
      limite = 5   
  }
  const cumple = caidaPorcentaje <= limite;

  resultadoBox.classList.add(cumple ? 'ok' : 'fail');
  resultadoBox.innerHTML = `
    <strong>Caída de tensión: ${caidaVoltios.toFixed(2)} V (${caidaPorcentaje.toFixed(2)}%)</strong>
    <p>Corriente utilizada: ${corriente.toFixed(2)} A</p>
    <p>${cumple ? 'Cumple' : 'No cumple'} el límite de referencia de ${limite}%.</p>
  `;
}

btnCalcular.addEventListener('click', calcularCaidaTension);

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

  //Calcular la corriente dependiendo del fator de potencia 
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
//Seccion pa los calculos varios

const NOMBRES = {
  V: 'Voltaje',
  I: 'Corriente',
  R: 'Resistencia',
  P: 'Potencia'
};

const UNIDADES = {
  V: 'V',
  I: 'A',
  R: 'Ω',
  P: 'W'
};

const FORMULAS = {
  V: [
    { datos: ['I', 'R'], texto: 'Corriente y Resistencia', calcular: (I, R) => I * R },
    { datos: ['P', 'I'], texto: 'Potencia y Corriente', calcular: (P, I) => P / I },
    { datos: ['P', 'R'], texto: 'Potencia y Resistencia', calcular: (P, R) => Math.sqrt(P * R) }
  ],
  I: [
    { datos: ['V', 'R'], texto: 'Voltaje y Resistencia', calcular: (V, R) => V / R },
    { datos: ['P', 'V'], texto: 'Potencia y Voltaje', calcular: (P, V) => P / V },
    { datos: ['P', 'R'], texto: 'Potencia y Resistencia', calcular: (P, R) => Math.sqrt(P / R) }
  ],
  R: [
    { datos: ['V', 'I'], texto: 'Voltaje y Corriente', calcular: (V, I) => V / I },
    { datos: ['V', 'P'], texto: 'Voltaje y Potencia', calcular: (V, P) => (V * V) / P },
    { datos: ['P', 'I'], texto: 'Potencia y Corriente', calcular: (P, I) => P / (I * I) }
  ],
  P: [
    { datos: ['V', 'I'], texto: 'Voltaje y Corriente', calcular: (V, I) => V * I },
    { datos: ['V', 'R'], texto: 'Voltaje y Resistencia', calcular: (V, R) => (V * V) / R },
    { datos: ['I', 'R'], texto: 'Corriente y Resistencia', calcular: (I, R) => (I * I) * R }
  ]
};

const selectMagnitud = document.getElementById('magnitudCalcular');
const selectDatos = document.getElementById('datosConocidos');
const inputsVariables = document.getElementById('inputs-variables');
const btnCalcularVarios = document.getElementById('btnCalcularVarios');
const resultadoVarios = document.getElementById('resultadoCalculosVarios');

function actualizarOpcionesDatos() {
  const magnitud = selectMagnitud.value;
  const opciones = FORMULAS[magnitud];

  selectDatos.innerHTML = '';
  opciones.forEach((opcion, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = opcion.texto;
    selectDatos.appendChild(option);
  });

  actualizarInputs();
}

function actualizarInputs() {
  const magnitud = selectMagnitud.value;
  const indice = parseInt(selectDatos.value);
  const opcion = FORMULAS[magnitud][indice];

  inputsVariables.innerHTML = '';

  opcion.datos.forEach((letra) => {
    const campo = document.createElement('div');
    campo.innerHTML = `
      <label class="field-label small" for="input-${letra}">${NOMBRES[letra]} (${letra}) en ${UNIDADES[letra]}</label>
      <input type="number" id="input-${letra}" placeholder="Ej. 10" step="0.01">
    `;
    inputsVariables.appendChild(campo);
  });

  resultadoVarios.hidden = true;
}

function calcularVarios() {
  const magnitud = selectMagnitud.value;
  const indice = parseInt(selectDatos.value);
  const opcion = FORMULAS[magnitud][indice];

  const valor1 = parseFloat(document.getElementById(`input-${opcion.datos[0]}`).value);
  const valor2 = parseFloat(document.getElementById(`input-${opcion.datos[1]}`).value);

  resultadoVarios.hidden = false;
  resultadoVarios.classList.remove('ok', 'fail');

  if (isNaN(valor1) || isNaN(valor2) || valor1 <= 0 || valor2 <= 0) {
    resultadoVarios.classList.add('fail');
    resultadoVarios.innerHTML = '<strong>Ingresa valores numéricos válidos en ambos campos.</strong>';
    return;
  }

  const resultado = opcion.calcular(valor1, valor2);

  resultadoVarios.classList.add('ok');
  resultadoVarios.innerHTML = `
    <strong>${NOMBRES[magnitud]} (${magnitud}) = ${resultado.toFixed(3)} ${UNIDADES[magnitud]}</strong>
    <p>Calculado con: ${opcion.texto}</p>
  `;
}

selectMagnitud.addEventListener('change', actualizarOpcionesDatos);
selectDatos.addEventListener('change', actualizarInputs);
btnCalcularVarios.addEventListener('click', calcularVarios);

actualizarOpcionesDatos();