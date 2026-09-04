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
      let fp = parseFloat(inputFactorPotencia.value);
      if (fp < 1){
        fp = fp/100;
      }
      console.log(potencia + " " + fp);
      const corrienteReal= (potencia/fp)/voltaje;
      console.log("Corriente real calculada: " + corrienteReal);

      return corrienteReal;
  }
}
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
0  `;
}

selectMagnitud.addEventListener('change', actualizarOpcionesDatos);
selectDatos.addEventListener('change', actualizarInputs);
btnCalcularVarios.addEventListener('click', calcularVarios);

actualizarOpcionesDatos();

//Tabla pa un solo calibre en Factor de relleno
const TABLA_UN_CALIBRE = {
  "18":   { "1/2": 23, "3/4": 40, "1": 60, "1 1/4": 115, "1 1/2": 157, "2": 257, "3": 550 },
  "16":   { "1/2": 18, "3/4": 31, "1": 50, "1 1/4": 90,  "1 1/2": 122, "2": 200, "3": 480 },
  "14":   { "1/2": 9,  "3/4": 15, "1": 25, "1 1/4": 44,  "1 1/2": 60,  "2": 99,  "3": 250 },
  "12":   { "1/2": 7,  "3/4": 12, "1": 19, "1 1/4": 35,  "1 1/2": 47,  "2": 78,  "3": 171 },
  "10":   { "1/2": 5,  "3/4": 9,  "1": 15, "1 1/4": 26,  "1 1/2": 36,  "2": 60,  "3": 131 },
  "8":    { "1/2": 2,  "3/4": 4,  "1": 7,  "1 1/4": 12,  "1 1/2": 17,  "2": 28,  "3": 62  },
  "6":    { "1/2": 1,  "3/4": 2,  "1": 4,  "1 1/4": 7,   "1 1/2": 10,  "2": 16,  "3": 36  },
  "4":    { "1/2": 1,  "3/4": 1,  "1": 3,  "1 1/4": 5,   "1 1/2": 7,   "2": 12,  "3": 27  },
  "3":    { "1/2": 1,  "3/4": 1,  "1": 2,  "1 1/4": 4,   "1 1/2": 6,   "2": 10,  "3": 23  },
  "2":    { "1/2": 1,  "3/4": 1,  "1": 2,  "1 1/4": 4,   "1 1/2": 5,   "2": 9,   "3": 20  },
  "1":    {            "3/4": 1,  "1": 1,  "1 1/4": 3,   "1 1/2": 4,   "2": 6,   "3": 14  },
  "0":    {            "3/4": 1,  "1": 1,  "1 1/4": 2,   "1 1/2": 3,   "2": 5,   "3": 12  },
  "00":   {            "3/4": 1,  "1": 1,  "1 1/4": 1,   "1 1/2": 3,   "2": 5,   "3": 10  },
  "000":  {            "3/4": 1,  "1": 1,  "1 1/4": 1,   "1 1/2": 2,   "2": 4,   "3": 9   },
  "0000": {            "3/4": 1,  "1": 1,  "1 1/4": 1,   "1 1/2": 1,   "2": 3,   "3": 7   }
};

const ORDEN_TUBOS = ["1/2", "3/4", "1", "1 1/4", "1 1/2", "2", "3"];

//Tabla pa varios calibres de cable en el tubo 
const TABLA_VARIOS_CALIBRES = {
  "14": {"1":9.24 },
  "12": {"1":12.0 },
  "10": {"1": 16.1},
  "8":  {"1":29.2 },
  "6":  {"1": 48.0},
  "4":  {"1": 64.2},
  "2":  {"1": 87.8}
};
//Tabla del diametro del tubo pa los cables pa despues

const TABLA_FINAL ={
  "1/2": 0.40,
  "3/4": 0.67,
  "1": 1.12,
  "1 1/4": 1.80,
  "1 1/2": 2.37,
  "2": 3.71,
  "3": 8.29
}
const ORDEN_TUBOS2 = [
  "1/2",
  "3/4",
  "1",
  "1 1/4",
  "1 1/2",
  "2",
  "3"
];

const mm_a_plg = 645.2

const filasCalibresMixto = document.getElementById('filas-calibres-mixto');
const btnAgregarCalibre = document.getElementById('btnAgregarCalibre');

// esta funcion es pa crear las filas nuevas cuando vamos a meter calibres mixtos
function crearFilaCalibre() {
  const filaExistente = filasCalibresMixto.querySelector('.fila-calibre');
  const nuevaFila = filaExistente.cloneNode(true);


  const select = nuevaFila.querySelector('.calibre-mixto-select');
  select.selectedIndex = 3; 

  const input = nuevaFila.querySelector('.cantidad-mixto-input');
  input.value = '';

  const btnQuitar = nuevaFila.querySelector('.btn-quitar-calibre');
  btnQuitar.disabled = false;
  btnQuitar.addEventListener('click', () => quitarFilaCalibre(nuevaFila));

  filasCalibresMixto.appendChild(nuevaFila);
  actualizarBotonesQuitar();
}


function quitarFilaCalibre(fila) {
  fila.remove();
  actualizarBotonesQuitar();
}

function actualizarBotonesQuitar() {
  const filas = filasCalibresMixto.querySelectorAll('.fila-calibre');
  filas.forEach((fila) => {
    const btnQuitar = fila.querySelector('.btn-quitar-calibre');
    btnQuitar.disabled = filas.length === 1;
  });
}

btnAgregarCalibre.addEventListener('click', crearFilaCalibre);

const radiosTipoCalculoRelleno = document.querySelectorAll('input[name="tipoCalculoRelleno"]');
const camposCalibreUnico = document.getElementById('campos-calibre-unico');
const camposCalibreMixto = document.getElementById('campos-calibre-mixto');

radiosTipoCalculoRelleno.forEach((radio) => {
  radio.addEventListener('change', () => {
    const esVarios = radio.value === 'varios' && radio.checked;
    camposCalibreUnico.hidden = esVarios;
    camposCalibreMixto.hidden = !esVarios;
  });
});


const btnCalcularRelleno = document.getElementById('btnCalcularRelleno');
const resultadoFactorRelleno = document.getElementById('resultadoFactorRelleno');
const selectCalibreUnico = document.getElementById('calibreUnico');
const inputCantidadUnico = document.getElementById('cantidadCablesUnico');

function obtenerModoFactorRelleno() {
  return document.querySelector('input[name="tipoCalculoRelleno"]:checked').value;
}


function obtenerDatosVariosCalibres() {
  const filas = filasCalibresMixto.querySelectorAll('.fila-calibre');
  const datos = [];

  filas.forEach((fila) => {
    const calibre = fila.querySelector('.calibre-mixto-select').value;
    const cantidadTexto = fila.querySelector('.cantidad-mixto-input').value;
    const cantidad = parseInt(cantidadTexto);

    datos.push({ calibre, cantidad, cantidadTexto });
  });

  return datos;
}

// Valida que todas las filas tengan una cantidad válida (mayor a 0)
function validarDatosVariosCalibres(datos) {
  const errores = [];

  datos.forEach((fila, index) => {
    if (!fila.cantidadTexto || isNaN(fila.cantidad) || fila.cantidad <= 0) {
      errores.push(`Fila ${index + 1}: ingresa una cantidad válida para el calibre ${fila.calibre} AWG.`);
    }
  });

  return errores;
}

function calcularFactorRelleno() {
  const modo = obtenerModoFactorRelleno();

  resultadoFactorRelleno.hidden = false;
  resultadoFactorRelleno.classList.remove('ok', 'fail');

  if (modo === 'uno') {
    const calibre = selectCalibreUnico.value;
    const cantidadCables = parseInt(inputCantidadUnico.value);

    if (!inputCantidadUnico.value || isNaN(cantidadCables) || cantidadCables <= 0) {
      resultadoFactorRelleno.classList.add('fail');
      resultadoFactorRelleno.innerHTML = '<strong>Ingresa una cantidad de cables válida (mayor a 0).</strong>';
      return;
    }

    const tuboNecesario = buscarTuboUnico(calibre, cantidadCables);

    if (tuboNecesario === null) {
      resultadoFactorRelleno.classList.add('fail');
      resultadoFactorRelleno.innerHTML = `
        <strong>No hay un tubo en la tabla que soporte ${cantidadCables} cables calibre ${calibre} AWG.</strong>
        <p>Considera dividir los conductores en más de una tubería.</p>
      `;
      return;
    }

    resultadoFactorRelleno.classList.add('ok');
    resultadoFactorRelleno.innerHTML = `
      <strong>Tubo necesario: ${tuboNecesario} pulgada"</strong>
      <p>Para ${cantidadCables} cables calibre ${calibre} AWG.</p>
    `;

  } else {
    const datos = obtenerDatosVariosCalibres();
    const errores = validarDatosVariosCalibres(datos);

    if (errores.length > 0) {
      resultadoFactorRelleno.classList.add('fail');
      resultadoFactorRelleno.innerHTML = `
        <strong>Revisa los siguientes datos:</strong>
        <ul>${errores.map((e) => `<li>${e}</li>`).join('')}</ul>
      `;
      return;
    }

    const totalmm2 = calcularSeccionTotalMixta(datos)/0.40;
    const totalplg = totalmm2/mm_a_plg;
    const diametroTubo = parseFloat(2*Math.sqrt(totalplg/3.1416).toFixed(2));
    const resultado = ORDEN_TUBOS2
          .map((tubo) => [tubo, TABLA_FINAL[tubo]])
          .find(([tubo, valorTabla]) => {
          console.log(
                      `Tubo ${tubo}: ${valorTabla} >= ${diametroTubo} =`,
                        valorTabla >= diametroTubo
                      );

          return valorTabla >= diametroTubo;
      });

    const tubofinal = resultado ? resultado[0] : null;
    if (!tubofinal) {
      resultadoFactorRelleno.classList.add('fail');
      resultadoFactorRelleno.innerHTML = `
        <strong>No hay un tubo en la tabla que soporte la sección total de ${totalmm2.toFixed(2)} mm².</strong>
        <p>Considera dividir los conductores en más de una tubería.</p>
      `;
      return;
    }else{
      resultadoFactorRelleno.classList.add('ok');
      resultadoFactorRelleno.innerHTML = `
      <strong>Tubo recomendado:</strong>
      <ul>El tubo recomendado es ${tubofinal} pulgadas</ul>
    `;
    }
  }
}
function buscarTuboUnico(calibre, cantidadCables) {
  const filaCalibre = TABLA_UN_CALIBRE[calibre];

  for (let i = 0; i < ORDEN_TUBOS.length; i++) {
    const tubo = ORDEN_TUBOS[i];
    const maximoPermitido = filaCalibre[tubo];

    if (maximoPermitido !== undefined && cantidadCables <= maximoPermitido) {
      return tubo;
    }
  }
  return null;
}
function calcularSeccionTotalMixta(datos) {
  let seccionTotalMm2 = 0;

  datos.forEach((fila) => {
    const seccionUnitaria = TABLA_VARIOS_CALIBRES[fila.calibre]["1"];
    seccionTotalMm2 += seccionUnitaria * fila.cantidad;
  });

  return seccionTotalMm2;
}






btnCalcularRelleno.addEventListener('click', calcularFactorRelleno);











//estas llaves que estan abajo son del dom, todo tiene que estar adentro si no, vale madre xdddd
});