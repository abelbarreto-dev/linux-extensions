const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const REGISTRAR_IFACE = `
<node>
  <interface name="com.canonical.AppMenu.Registrar">
    <method name="RegisterWindow">
      <arg type="u" name="windowId" direction="in"/>
      <arg type="o" name="menuObjectPath" direction="in"/>
    </method>
    <method name="UnregisterWindow">
      <arg type="u" name="windowId" direction="in"/>
    </method>
    <method name="GetMenuForWindow">
      <arg type="u" name="windowId" direction="in"/>
      <arg type="s" name="service" direction="out"/>
      <arg type="o" name="menuObjectPath" direction="out"/>
    </method>
    <signal name="WindowRegistered">
      <arg type="u" name="windowId"/>
      <arg type="s" name="service"/>
      <arg type="o" name="menuObjectPath"/>
    </signal>
    <signal name="WindowUnregistered">
      <arg type="u" name="windowId"/>
    </signal>
  </interface>
</node>`;

/**
 * AppMenuRegistrar
 * Sobe o serviço com.canonical.AppMenu.Registrar no session bus.
 * Apps GTK2/GTK3 com appmenu-gtk-module carregado registram seu menu aqui
 * automaticamente quando abrem uma janela.
 *
 * onWindowRegistered(windowId, busName, objectPath)
 * onWindowUnregistered(windowId)
 */
var AppMenuRegistrar = class AppMenuRegistrar {
    constructor(onWindowRegistered, onWindowUnregistered) {
        this._windows = new Map(); // windowId -> {busName, objectPath}
        this._onWindowRegistered = onWindowRegistered;
        this._onWindowUnregistered = onWindowUnregistered;
        this._ownerId = 0;
        this._dbusImpl = null;

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(REGISTRAR_IFACE, this);

        this._ownerId = Gio.bus_own_name(
            Gio.BusType.SESSION,
            'com.canonical.AppMenu.Registrar',
            Gio.BusNameOwnerFlags.NONE,
            (connection) => {
                this._dbusImpl.export(connection, '/com/canonical/AppMenu/Registrar');
            },
            null,
            () => {
                log('[macos-cinnamon-menu] não consegui possuir com.canonical.AppMenu.Registrar (já tem outro registrar rodando?)');
            }
        );
    }

    // Chamado via DBus pelos apps. invocation dá acesso ao sender (busName real do app).
    RegisterWindowAsync(params, invocation) {
        const [windowId, menuObjectPath] = params;
        const busName = invocation.get_sender();
        this._windows.set(windowId, { busName, objectPath: menuObjectPath });
        this._dbusImpl.emit_signal('WindowRegistered',
            new GLib.Variant('(uso)', [windowId, busName, menuObjectPath]));
        invocation.return_value(null);
        if (this._onWindowRegistered) this._onWindowRegistered(windowId, busName, menuObjectPath);
    }

    UnregisterWindowAsync(params, invocation) {
        const [windowId] = params;
        this._windows.delete(windowId);
        this._dbusImpl.emit_signal('WindowUnregistered', new GLib.Variant('(u)', [windowId]));
        invocation.return_value(null);
        if (this._onWindowUnregistered) this._onWindowUnregistered(windowId);
    }

    GetMenuForWindowAsync(params, invocation) {
        const [windowId] = params;
        const entry = this._windows.get(windowId);
        if (entry) {
            invocation.return_value(new GLib.Variant('(so)', [entry.busName, entry.objectPath]));
        } else {
            invocation.return_value(new GLib.Variant('(so)', ['', '/']));
        }
    }

    getMenuForWindowSync(windowId) {
        return this._windows.get(windowId) || null;
    }

    destroy() {
        if (this._dbusImpl) this._dbusImpl.unexport();
        if (this._ownerId) Gio.bus_unown_name(this._ownerId);
        this._windows.clear();
    }
};
