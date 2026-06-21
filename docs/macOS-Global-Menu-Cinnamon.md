# macOS Global Menu para Cinnamon

## Instalação

```bash
cp -r macos-cinnamon-menu@abel.local ~/.local/share/cinnamon/extensions/
```

Depois: Configurações do Sistema → Extensões → ative "macOS Global Menu".
(Se não aparecer, rode `Looking Glass` (Alt+F2 → lg) ou reinicie o Cinnamon com `Ctrl+Alt+Esc`.)

## Como funciona

1. `registrar.js` sobe o serviço DBus `com.canonical.AppMenu.Registrar` no
   session bus. É o mesmo nome de serviço que o Unity/MATE usam.
2. Apps GTK2/GTK3 que tenham o módulo `appmenu-gtk-module` carregado se
   registram automaticamente nesse serviço quando abrem uma janela,
   informando o XID da janela + o caminho DBus do próprio menu (protocolo
   `com.canonical.dbusmenu`).
3. `extension.js` escuta troca de foco de janela (`global.display`,
   `notify::focus-window`), pega o XID via `win.get_xwindow()` e pergunta
   pro registrar se aquele XID tem menu registrado.
4. Se tiver, `dbusmenu.js` consulta `GetLayout` no app via DBus e monta os
   botões no painel. Clique chama `Event` no item; abrir submenu chama
   `AboutToShow` antes (lazy load).

## Testando

A maioria das distros NÃO carrega `appmenu-gtk-module` por padrão. Pra
testar rápido com um app específico, sem mexer no sistema todo:

```bash
GTK_MODULES=appmenu-gtk-module gedit &
# ou
GTK_MODULES=appmenu-gtk-module gimp &
```

Se aparecer o menu na barra ao focar essa janela, o core tá funcionando.

Pra ativar globalmente (todas as apps GTK2/3 compatíveis), no Debian/Ubuntu:

```bash
sudo apt install appmenu-gtk2-module appmenu-gtk3-module
```

E export `GTK_MODULES=appmenu-gtk-module` via `/etc/environment` ou no seu
`~/.profile` (precisa logout/login pra valer pra todo o sistema).

## Limitações conhecidas (não é bug, é o ecossistema)

- **GTK4 / libadwaita** (Nautilus novo, Text Editor, etc.) não tem
  menubar nenhuma exportável — eles usam header bar com hambúrguer.
  Não tem como capturar o que não existe.
- **Electron** (VS Code, Discord, Slack...) não fala esse protocolo.
  Dá pra fazer uma ponte específica pro Electron (ele tem uma flag
  `--enable-features=...` e existe o projeto `electron-appmenu` como
  referência), mas é outro escopo, fora desse MVP.
- **Firefox** precisa de extensão própria (`globalmenu-firefox` no
  GitHub) pra exportar.
- Esse MVP renderiza só os itens de topo + um nível de submenu via
  `PopupMenu` padrão do Cinnamon. Submenus aninhados (submenu dentro de
  submenu) ainda não tão tratados em `_openSubmenu` — é o próximo passo
  se você quiser ir fundo.
- Não tratei o caso de múltiplos monitores/múltiplos painéis Cinnamon
  (assume `Main.panel`, que é o painel principal).

## Próximos ajustes prováveis

- Tratar submenus aninhados recursivamente.
- Esconder o app name / menu quando a janela focada for o próprio
  Desktop/Nautilus.
- Reagir a `ItemsPropertiesUpdated` (estado de checkbox/enabled mudando
  sem reload completo do layout).
