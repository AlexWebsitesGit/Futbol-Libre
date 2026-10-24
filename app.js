const VISITOR_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

document.getElementById('zona-horaria').textContent =
  `Horarios en tu zona: ${VISITOR_TZ}`;

function formatearHora(utcISO) {
  return new Intl.DateTimeFormat('es', {
    timeZone: VISITOR_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(utcISO));
}

function esHoy(utcISO) {
  const opciones = { timeZone: VISITOR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' };
  const fechaPartido = new Intl.DateTimeFormat('en-CA', opciones).format(new Date(utcISO));
  const hoy = new Intl.DateTimeFormat('en-CA', opciones).format(new Date());
  return fechaPartido === hoy;
}

function crearElementoPartido(partido) {
  const div = document.createElement('div');
  div.className = 'partido';

  const hora = formatearHora(partido.inicioUTC);
  const competicion = partido.competicion;

  let fuentesHTML = '';
  partido.fuentes.forEach(f => {
    fuentesHTML += `<a href="${f.url}" target="_blank" rel="noopener noreferrer">${f.nombre}</a>`;
  });

  div.innerHTML = `
    <div class="competicion">${competicion}</div>
    <div class="hora">${hora}</div>
    <div class="equipos">${partido.equipoLocal} vs ${partido.equipoVisitante}</div>
    <div class="fuentes">${fuentesHTML}</div>
  `;
  return div;
}

async function iniciar() {
  const contenedor = document.getElementById('agenda');
  try {
    const respuesta = await fetch('./data/partidos.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar la agenda');
    const partidos = await respuesta.json();

    const hoy = partidos
      .filter(p => esHoy(p.inicioUTC))
      .sort((a, b) => new Date(a.inicioUTC) - new Date(b.inicioUTC));

    contenedor.innerHTML = '';

    if (hoy.length === 0) {
      contenedor.innerHTML = '<p class="cargando">No hay partidos programados para hoy.</p>';
      return;
    }

    hoy.forEach(p => contenedor.appendChild(crearElementoPartido(p)));
  } catch (error) {
    contenedor.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

iniciar();
