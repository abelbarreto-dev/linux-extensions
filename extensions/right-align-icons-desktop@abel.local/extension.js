const Meta = globalThis.imports.gi.Meta;

let monitorsChangedId = 0;
let monitorManager = null;

function alignIconsToRight() {
  try {
    let display = global.display;
    let primaryMonitor = display.get_primary_monitor();
    let geometry = display.get_monitor_geometry(primaryMonitor);
    let screenWidth = geometry.width;

    console.log(
      `[RightAlign] Alinhando ícones. Largura da tela: ${screenWidth}px`,
    );
  } catch (error) {
    console.error(`[RightAlign] Erro: ${error.message}`);
  }
}

function init() {
  console.log("[RightAlign] Inicializado no modo clássico.");
}

function enable() {
  console.log("[RightAlign] Extensão habilitada no modo clássico.");
  alignIconsToRight();

  monitorManager = Meta.MonitorManager.get();
  monitorsChangedId = monitorManager.connect("monitors-changed", () => {
    alignIconsToRight();
  });
}

function disable() {
  console.log("[RightAlign] Extensão desabilitada no modo clássico.");
  if (monitorsChangedId > 0 && monitorManager) {
    monitorManager.disconnect(monitorsChangedId);
    monitorsChangedId = 0;
    monitorManager = null;
  }
}
