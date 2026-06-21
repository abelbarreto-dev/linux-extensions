// No Cinnamon 6.4+, usamos a sintaxe padrão de ESModules (import/export)
import * as Main from "ui/main";
import Gio from "gi://Gio";
import Clutter from "gi://Clutter";

// Em ESModules, variáveis declaradas no escopo do arquivo não poluem o global,
// o que é muito mais limpo e seguro.
let monitorsChangedId = 0;

/**
 * Função principal que calcula a posição e manipula o layout
 */
function alignIconsToRight() {
  try {
    // Acesso ao display e monitor no Cinnamon moderno
    let display = global.display;
    let primaryMonitor = display.get_primary_monitor();
    let geometry = display.get_monitor_geometry(primaryMonitor);
    let screenWidth = geometry.width;

    console.log(
      `[RightAlign] Alinhando ícones à direita. Largura da tela: ${screenWidth}px`,
    );

    // A lógica do Nemo para manipulação do grid entrará aqui
  } catch (error) {
    console.error(`[RightAlign] Erro ao alinhar ícones: ${error.message}`);
  }
}

/**
 * Classe obrigatória que o Cinnamon 6.4+ procura ao carregar a extensão.
 * Ela precisa implementar os métodos enable() e disable().
 */
class RightAlignExtension {
  enable() {
    console.log("[RightAlign] Extensão ativada.");

    // Executa o alinhamento inicial
    alignIconsToRight();

    // Conecta o sinal moderno de mudança de monitores
    monitorsChangedId = global.display.connect("monitors-changed", () => {
      alignIconsToRight();
    });
  }

  disable() {
    console.log("[RightAlign] Extensão desativada.");

    if (monitorsChangedId > 0) {
      global.display.disconnect(monitorsChangedId);
      monitorsChangedId = 0;
    }
  }
}

/**
 * O Cinnamon 6.4 espera que a função init() retorne uma instância
 * da classe que gerencia o ciclo de vida da extensão.
 */
export function init() {
  return new RightAlignExtension();
}
