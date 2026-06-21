const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

function MacOSMenuApplet(orientation, panel_height, instance_id) {
  this._init(orientation, panel_height, instance_id);
}

MacOSMenuApplet.prototype = {
  __proto__: Applet.IconApplet.prototype,

  _init: function (orientation, panel_height, instance_id) {
    Applet.IconApplet.prototype._init.call(
      this,
      orientation,
      panel_height,
      instance_id,
    );

    // --- CARREGA O SEU SVG LOCAL ---
/*    let dir = GLib.get_user_data_dir() + "/cinnamon/applets/macos-menu@abel.local";
    let icon_path = dir + "/apple-logo-svgrepo-com.svg";
    let file = Gio.File.new_for_path(icon_path);

    if (file.query_exists(null)) {
      let icon = new Gio.FileIcon({ file: file });
      this.set_applet_icon_gicon(icon);
      this.set_applet_icon_size(22); // <--- ADICIONE ESTA LINHA (22px é o tamanho ideal de barra)
    } else {
      this.set_applet_icon_name("apple-logo");
    }*/

    let dir =
      GLib.get_user_data_dir() + "/cinnamon/applets/macos-menu@abel.local";
    let icon_path = dir + "/apple-logo-svgrepo-com.svg";
    let file = Gio.File.new_for_path(icon_path);

    if (file.query_exists(null)) {
      // O TextIconApplet aceita caminhos de arquivo diretamente nesta função!
      this.set_applet_icon_path(icon_path);
    } else {
      // Fallback caso o arquivo suma da pasta
      this.set_applet_icon_name("system-log-out");
    }
    // -------------------------------

    this.set_applet_tooltip(_("Menu de Sistema"));

    // Inicializa o menu de contexto (Popup) com o efeito nativo de slide/fade do Cinnamon
    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    this._criarMenu();
  },

  _criarMenu: function () {
    // 1. Sobre Este Computador
    let itemSobre = new PopupMenu.PopupMenuItem(_("Sobre Este Computador"));
    itemSobre.connect("activate", () => {
      Util.spawnCommandLine("cinnamon-settings info");
    });
    this.menu.addMenuItem(itemSobre);

    // Separador
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    // 2. Configurações do Sistema (Preferências)
    let itemConfig = new PopupMenu.PopupMenuItem(
      _("Preferências do Sistema..."),
    );
    itemConfig.connect("activate", () => {
      Util.spawnCommandLine("cinnamon-settings");
    });
    this.menu.addMenuItem(itemConfig);

    // 3. App Store (Gerenciador de Aplicativos)
    let itemApps = new PopupMenu.PopupMenuItem(_("App Store (Mintinstall)"));
    itemApps.connect("activate", () => {
      Util.spawnCommandLine("mintinstall");
    });
    this.menu.addMenuItem(itemApps);

    // Separador
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    // 4. Bloquear Tela
    let itemBloquear = new PopupMenu.PopupMenuItem(_("Bloquear Tela"));
    itemBloquear.connect("activate", () => {
      Util.spawnCommandLine("cinnamon-screensaver-command --lock");
    });
    this.menu.addMenuItem(itemBloquear);

    // 5. Encerrar Sessão
    let itemSair = new PopupMenu.PopupMenuItem(_("Encerrar Sessão..."));
    itemSair.connect("activate", () => {
      // Usando a flag --no-delay para forçar a chamada imediata da janela de logout
      Util.spawnCommandLine("cinnamon-session-quit --logout --no-delay");
    });
    this.menu.addMenuItem(itemSair);

    // Separador
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    // 6. Reiniciar
    let itemReiniciar = new PopupMenu.PopupMenuItem(_("Reiniciar..."));
    itemReiniciar.connect("activate", () => {
      // Chama o diálogo nativo de reinicialização do Cinnamon
      Util.spawnCommandLine("cinnamon-session-quit --reboot");
    });
    this.menu.addMenuItem(itemReiniciar);

    // 7. Desligar
    let itemDesligar = new PopupMenu.PopupMenuItem(_("Desligar..."));
    itemDesligar.connect("activate", () => {
      // Correção aqui: Usamos o console nativo do Cinnamon para invocar o diálogo de desligamento de forma segura
      Util.spawnCommandLine("cinnamon-session-quit --power-off");
    });
    this.menu.addMenuItem(itemDesligar);
  },

  // Comportamento do Clique: Abre/Fecha o menu com o efeito nativo
  on_applet_clicked: function () {
    this.menu.toggle();
  },
};

function main(metadata, orientation, panel_height, instance_id) {
  return new MacOSMenuApplet(orientation, panel_height, instance_id);
}
