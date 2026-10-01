import { tareasDesdeLista } from './modelo/Tarea.js';
import { crearAlmacenamiento } from './servicios/almacenamiento.js';
import { obtenerTareasIniciales } from './servicios/api.js';
import { crearStore } from './estado/store.js';
import { montarVista } from './ui/vista.js';

const almacenamiento = crearAlmacenamiento('task-manager-js-intermedio:tareas');

async function iniciar() {
  let tareas = almacenamiento.leer();
  let aviso = null;

  if (tareas === null) {
    // Primer arranque (o datos ilegibles): se cargan las tareas iniciales.
    try {
      const { datos, origen } = await obtenerTareasIniciales();
      tareas = tareasDesdeLista(datos).tareas;
      if (origen === 'respaldo') {
        aviso = 'No se pudo cargar tareas-iniciales.json; se muestran tareas de ejemplo incluidas en la app.';
      }
    } catch {
      tareas = [];
    }
  }

  const store = crearStore({ tareas });
  const vista = montarVista(store);
  if (aviso) vista.mostrarAviso(aviso);

  // Observer: cada cambio se guarda; si no se puede guardar, se avisa una vez.
  let avisoGuardadoMostrado = false;
  const guardarCambios = (estado) => {
    if (!almacenamiento.guardar(estado.tareas) && !avisoGuardadoMostrado) {
      avisoGuardadoMostrado = true;
      vista.mostrarAviso('No se pudo guardar en este navegador; los cambios se perderán al cerrar la página.');
    }
  };
  store.suscribir(guardarCambios);
  guardarCambios(store.obtenerEstado());
}

iniciar();
