const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const DBUSMENU_IFACE = `
<node>
  <interface name="com.canonical.dbusmenu">
    <method name="GetLayout">
      <arg type="i" name="parentId" direction="in"/>
      <arg type="i" name="recursionDepth" direction="in"/>
      <arg type="as" name="propertyNames" direction="in"/>
      <arg type="u" name="revision" direction="out"/>
      <arg type="(ia{sv}av)" name="layout" direction="out"/>
    </method>
    <method name="Event">
      <arg type="i" name="id" direction="in"/>
      <arg type="s" name="eventId" direction="in"/>
      <arg type="v" name="data" direction="in"/>
      <arg type="u" name="timestamp" direction="in"/>
    </method>
    <method name="AboutToShow">
      <arg type="i" name="id" direction="in"/>
      <arg type="b" name="needUpdate" direction="out"/>
    </method>
    <signal name="LayoutUpdated">
      <arg type="u" name="revision"/>
      <arg type="i" name="parentId"/>
    </signal>
    <signal name="ItemsPropertiesUpdated">
      <arg type="a(ia{sv})" name="updatedProps"/>
      <arg type="a(ias)" name="removedProps"/>
    </signal>
  </interface>
</node>`;

const DBusMenuProxy = Gio.DBusProxy.makeProxyWrapper(DBUSMENU_IFACE);

/**
 * DBusMenuClient
 * Encapsula a conversa com um app que exporta menu via com.canonical.dbusmenu.
 *
 * onLayoutChanged(rootNode) é chamado toda vez que a árvore do menu muda
 * (no load inicial e em todo LayoutUpdated com parentId == 0).
 */
var DBusMenuClient = class DBusMenuClient {
    constructor(busName, objectPath, onLayoutChanged) {
        this._busName = busName;
        this._objectPath = objectPath;
        this._onLayoutChanged = onLayoutChanged;
        this._proxy = null;
        this._signalId = null;
        this._destroyed = false;

        this._proxy = new DBusMenuProxy(
            Gio.DBus.session,
            busName,
            objectPath,
            (proxy, error) => {
                if (error) {
                    log(`[macos-cinnamon-menu] erro criando proxy dbusmenu: ${error.message}`);
                    return;
                }
                if (this._destroyed) return;

                this._signalId = this._proxy.connectSignal('LayoutUpdated', (proxy, sender, [revision, parentId]) => {
                    if (parentId === 0) this._reloadLayout();
                });

                this._reloadLayout();
            }
        );
    }

    _reloadLayout() {
        if (this._destroyed || !this._proxy) return;
        this._proxy.GetLayoutRemote(0, -1, ['label', 'enabled', 'visible', 'icon-name', 'type', 'children-display', 'toggle-type', 'toggle-state'],
            (result, error) => {
                if (error) {
                    log(`[macos-cinnamon-menu] GetLayout falhou: ${error.message}`);
                    return;
                }
                if (this._destroyed) return;
                const [revision, layout] = result;
                this._onLayoutChanged(this._parseNode(layout));
            });
    }

    _parseNode(node) {
        // node = (id, propsDict, childrenVariants)
        const [id, propsVariant, childrenVariants] = node;
        const props = {};
        for (const key in propsVariant) {
            try {
                props[key] = propsVariant[key].deep_unpack();
            } catch (e) {
                props[key] = null;
            }
        }
        const children = childrenVariants.map(v => this._parseNode(v.deep_unpack()));
        return { id, props, children };
    }

    /** Avisa o app que um submenu vai abrir (necessário pra lazy-load de alguns apps) */
    aboutToShow(itemId, callback) {
        if (!this._proxy) return;
        this._proxy.AboutToShowRemote(itemId, (result, error) => {
            if (error) return;
            const [needUpdate] = result;
            if (needUpdate) this._reloadLayout();
            if (callback) callback();
        });
    }

    /** Dispara clique num item de menu */
    activate(itemId) {
        if (!this._proxy) return;
        const timestamp = GLib.get_monotonic_time() / 1000;
        const emptyVariant = GLib.Variant.new('s', '');
        this._proxy.EventRemote(itemId, 'clicked', emptyVariant, timestamp, (result, error) => {
            if (error) log(`[macos-cinnamon-menu] Event falhou: ${error.message}`);
        });
    }

    destroy() {
        this._destroyed = true;
        if (this._proxy && this._signalId) {
            this._proxy.disconnectSignal(this._signalId);
        }
        this._proxy = null;
    }
};
