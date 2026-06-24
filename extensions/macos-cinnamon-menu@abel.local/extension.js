const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

let globalMenu = null;
let AppMenuRegistrar = null;
let DBusMenuClient = null;

/**
 * Formata o WM_CLASS cru (ex: "gnome-terminal-server", "Gimp-2.10")
 * pro estilo "Title Case sem hífen" (ex: "Gnome Terminal Server", "Gimp 2.10").
 * 1) tudo pra minúsculo
 * 2) separa por hífen / underscore / espaço
 * 3) capitaliza cada palavra
 * 4) junta com espaço
 */
function formatAppName(rawName) {
  if (!rawName) return "";

  return rawName
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

class GlobalMenuBar {
  constructor() {
    this._registrar = null;
    this._client = null;
    this._focusWindowId = 0;
    this._focusSignalId = 0;
    this._menuManager = null;
    this._rootNode = null;
    this._items = []; // [{ id, button, menu, openStateId }]
    this._openItem = null; // item atualmente com o menu aberto

    // Container que vai no painel, à esquerda (como no macOS)
    this._box = new St.BoxLayout({ style_class: "macos-global-menu-box" });
    this.actor = this._box; // PopupMenuManager espera um "owner" com .actor
    this._appNameLabel = new St.Label({
      style_class: "macos-global-menu-appname",
      text: "",
    });
    this._box.add_child(this._appNameLabel);
  }

  /**
   * Tenta posicionar logo depois do applet de menu (Mint Menu / Whisker, etc.),
   * imitando o lugar do menu Apple no macOS. Se não achar nenhum applet de menu
   * na _leftBox, cai pra posição fixa 1 (logo após o primeiro item existente).
   * Sempre faz clamp pro tamanho real da box, pra nunca estourar índice.
   */
  _getInsertIndex() {
    const leftBox = Main.panel._leftBox;
    const children = leftBox.get_children();
    const FALLBACK_INDEX = 1;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const applet = child._applet || child.applet;
      if (applet && applet._uuid === "menu@cinnamon.org") {
        return Math.min(i + 1, children.length);
      }
    }

    return Math.min(FALLBACK_INDEX, children.length);
  }

  enable() {
    this._menuManager = new PopupMenu.PopupMenuManager(this);

    this._registrar = new AppMenuRegistrar(
      (windowId) => {
        if (windowId === this._focusWindowId) this._reloadForWindow(windowId);
      },
      (windowId) => {
        if (windowId === this._focusWindowId) this._clearMenu();
      },
    );

    Main.panel._leftBox.insert_child_at_index(
      this._box,
      this._getInsertIndex(),
    );

    this._focusSignalId = global.display.connect("notify::focus-window", () => {
      this._onFocusChanged();
    });

    this._onFocusChanged();
  }

  disable() {
    if (this._focusSignalId) {
      global.display.disconnect(this._focusSignalId);
      this._focusSignalId = 0;
    }
    this._clearMenu();
    if (this._client) {
      this._client.destroy();
      this._client = null;
    }
    if (this._registrar) {
      this._registrar.destroy();
      this._registrar = null;
    }
    if (this._box.get_parent()) {
      Main.panel._leftBox.remove_child(this._box);
    }
    this._menuManager = null;
  }

  _onFocusChanged() {
    const win = global.display.focus_window;
    this._clearMenu();

    if (!win) {
      this._appNameLabel.set_text("");
      this._focusWindowId = 0;
      return;
    }

    let xid = 0;
    try {
      xid = win.get_xwindow ? win.get_xwindow() : 0;
    } catch (e) {
      xid = 0;
    }

    const wmClass = formatAppName(
      win.get_wm_class ? win.get_wm_class() || "" : "",
    );
    const appName = ["Nemo", "Nemo Desktop"].includes(wmClass)
      ? "Finder"
      : wmClass;

    this._appNameLabel.set_text(appName);
    this._focusWindowId = xid;

    if (xid) this._reloadForWindow(xid);
  }

  _reloadForWindow(windowId) {
    if (!this._registrar) return;
    const entry = this._registrar.getMenuForWindowSync(windowId);
    if (!entry) return; // app não exporta menu via dbusmenu

    if (this._client) {
      this._client.destroy();
      this._client = null;
    }
    this._rootNode = null;

    this._client = new DBusMenuClient(
      entry.busName,
      entry.objectPath,
      (rootNode) => {
        this._onLayoutChanged(rootNode);
      },
    );
  }

  /**
   * Chamado sempre que o app manda LayoutUpdated — seja na carga inicial,
   * seja por causa do AboutToShow de um submenu que acabamos de abrir.
   * IMPORTANTE: só reconstrói a barra inteira se a lista de itens de TOPO
   * realmente mudou. Caso contrário, só atualiza o conteúdo do submenu que
   * já está aberto (sem fechar/destruir nada) — é isso que elimina o lag
   * e o bug do menu morrer assim que você clica nele.
   */
  _onLayoutChanged(rootNode) {
    const newTop = (rootNode.children || []).filter(
      (c) => c.props.type !== "separator" && c.props.visible !== false,
    );

    const unchanged =
      this._rootNode && this._sameTopLevel(this._rootNode, newTop);
    this._rootNode = rootNode;

    if (!unchanged) {
      this._buildMenuButtons(newTop);
      return;
    }

    if (this._openItem) {
      const updated = newTop.find((c) => c.id === this._openItem.id);
      if (updated) this._populateSubmenu(this._openItem.menu, updated);
    }
  }

  _sameTopLevel(oldRoot, newTop) {
    const oldTop = (oldRoot.children || []).filter(
      (c) => c.props.type !== "separator" && c.props.visible !== false,
    );
    if (oldTop.length !== newTop.length) return false;
    for (let i = 0; i < oldTop.length; i++) {
      if (
        oldTop[i].id !== newTop[i].id ||
        oldTop[i].props.label !== newTop[i].props.label
      ) {
        return false;
      }
    }
    return true;
  }

  _clearMenu() {
    this._closeOpenMenu();
    for (const item of this._items) {
      if (this._menuManager) this._menuManager.removeMenu(item.menu);
      item.menu.destroy();
      item.button.destroy();
    }
    this._items = [];
    this._rootNode = null;
    if (this._client) {
      this._client.destroy();
      this._client = null;
    }
  }

  _closeOpenMenu() {
    if (this._openItem && this._openItem.menu.isOpen) {
      this._openItem.menu.close();
    }
    this._openItem = null;
  }

  _buildMenuButtons(topItems) {
    for (const item of this._items) {
      if (this._menuManager) this._menuManager.removeMenu(item.menu);
      item.menu.destroy();
      item.button.destroy();
    }
    this._items = [];
    this._openItem = null;

    for (const child of topItems) {
      const label = (child.props.label || "").replace(/_/g, "") || "(sem nome)";
      const button = new St.Button({
        style_class: "macos-global-menu-item",
        label,
        reactive: true,
        track_hover: true,
        can_focus: true,
      });

      const menu = new PopupMenu.PopupMenu(button, 0.0, St.Side.TOP);
      Main.uiGroup.add_child(menu.actor);
      menu.actor.hide();
      this._menuManager.addMenu(menu);

      const item = { id: child.id, button, menu };
      this._populateSubmenu(menu, child);

      item.openStateId = menu.connect("open-state-changed", (m, isOpen) => {
        if (!isOpen && this._openItem === item) {
          this._openItem = null;
        }
        button.set_style_pseudo_class(isOpen ? "active" : "");
      });

      button.connect("button-press-event", () => {
        this._onTopButtonClicked(item);
        return Clutter.EVENT_STOP;
      });

      this._box.add_child(button);
      this._items.push(item);
    }
  }

  _onTopButtonClicked(item) {
    // Se outro menu tava aberto, fecha (estilo macOS: só um aberto por vez,
    // e clicar em qualquer outro botão troca direto pro novo).
    if (this._openItem && this._openItem !== item) {
      this._openItem.menu.close();
    }

    // Clicar de novo no mesmo botão fecha (toggle).
    if (item.menu.isOpen) {
      item.menu.close();
      return;
    }

    if (this._client) this._client.aboutToShow(item.id, () => {});
    item.menu.open(true);
    this._openItem = item;
  }

  _populateSubmenu(menu, node) {
    menu.removeAll();
    for (const child of node.children || []) {
      if (child.props.type === "separator") {
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        continue;
      }
      if (child.props.visible === false) continue;

      const label = (child.props.label || "").replace(/_/g, "") || "(sem nome)";
      const enabled = child.props.enabled !== false;
      const popupItem = new PopupMenu.PopupMenuItem(label);
      popupItem.setSensitive(enabled);

      popupItem.connect("activate", () => {
        if (this._client) this._client.activate(child.id);
        menu.close();
      });

      menu.addMenuItem(popupItem);
    }
  }
}

function init(metadata) {
  // metadata.path é o diretório real da extensão, fornecido pelo Cinnamon.
  if (imports.searchPath.indexOf(metadata.path) === -1) {
    imports.searchPath.push(metadata.path);
  }
  AppMenuRegistrar = imports.registrar.AppMenuRegistrar;
  DBusMenuClient = imports.dbusmenu.DBusMenuClient;
}

function enable() {
  if (!globalMenu) {
    globalMenu = new GlobalMenuBar();
    globalMenu.enable();
  }
}

function disable() {
  if (globalMenu) {
    globalMenu.disable();
    globalMenu = null;
  }
}
