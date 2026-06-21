const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

let monitorValueChangeId = 0;

function init() {
  // Inicialização da extensão (executada uma vez ao carregar)
}

function alignIconsToRight() {
  // 1. Pegar a geometria do monitor principal
  let monitor = global.display.get_primary_monitor();
  let geometry = global.display.get_monitor_geometry(monitor);
  let screenWidth = geometry.width;

  // Nota de desenvolvimento: O Cinnamon delega o desktop para o gerenciador 'Nemo'.
  // Para mover os ícones via código puro JS no Cinnamon, nós podemos forçar o Nemo
  // a reordenar ou ler as configurações via GSettings do Nemo Desktop.

  // Uma abordagem comum em scripts/extensões quando o grid nativo resiste:
  // Chamar via subprocesso o ajuste de posição ou alterar a chave de ordenação.
  // Como o Nemo não tem a opção "alinhar à direita" nativa, nós monitoramos a pasta Desktop
  // e calculamos a posição X ideal (ex: screenWidth - largura_do_icone - margem).

  global.log(
    "Alinhando ícones à direita. Largura da tela detectada: " + screenWidth,
  );

  // TODO: Capturar os atores filhos do desktop (Clutter.Actor) correspondentes aos ícones
  // e setar actor.set_position(novo_x, atual_y);
}

function enable() {
  global.log("Extensão de Alinhamento à Direita Ativada");

  // Executa o alinhamento inicial
  alignIconsToRight();

  // Monitora se a resolução da tela mudar para realinhar
  monitorValueChangeId = global.display.connect("screen-size-changed", () => {
    alignIconsToRight();
  });
}

function disable() {
  global.log("Extensão de Alinhamento à Direita Desativada");

  if (monitorValueChangeId > 0) {
    global.display.disconnect(monitorValueChangeId);
    monitorValueChangeId = 0;
  }

  // Aqui você retornaria os ícones para a posição padrão (esquerda), se necessário.
}
