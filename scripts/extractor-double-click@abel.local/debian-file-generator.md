# CONSTRUINDO UM ARQUIVO DEBIAN para EXTRACTOR DOUBLE CLICK
Essa documentação é focada nesse pacote de criação de um instalável `.deb` para o utilitário de extração de arquivos compactados.

# Summary

1. [Estrutura do Pacote](#-1-estrtutura-do-pacote)
2. [Control (Essencial)](#-2-control-essencial)
3. [Postinst Instalação Automática](#-3-postinst-instalação-automática)
4. [Prerm Uninstall Limpo](#-4-prerm-uninstall-limpo)
5. [Desktop File](#-5-desktop-file)
6. [Script Principal](#-6-script-principal)
7. [Gerar o DEB](#-7-gerar-o-deb)
8. [Instalar](#-8-instalar)
9. [Considerações](#-considerações)

# 🏗️ 1. Estrtutura do Pacote

Crie isso:

```bash
extractor-double-click-deb/
├── DEBIAN/
│   ├── control
│   ├── postinst
│   ├── prerm
├── usr/
│   ├── local/
│   │   ├── bin/
│   │   │   └── extractor-double-click
│   ├── share/
│   │   └── applications/
│   │       └── extractor-double-click.desktop
```

# 📄 2. CONTROL (ESSENCIAL)

```bash
Package: extractor-double-click
Version: 1.0.0
Section: utils
Priority: optional
Architecture: all
Maintainer: Abel
Depends: bash, coreutils, libnotify-bin, zenity, xdg-utils
Description: Double-click extractor like macOS
 Automatically extracts compressed files on double click
 supporting zip, tar, rar, 7z and more.
```

# ⚙️ 3. POSTINST (INSTALAÇÃO AUTOMÁTICA)

Aqui entra seu comportamento real:

```bash
#!/bin/bash
set -e

echo "🔧 Configuring MIME associations..."

xdg-mime default extractor-double-click.desktop application/zip
xdg-mime default extractor-double-click.desktop application/x-tar
xdg-mime default extractor-double-click.desktop application/x-compressed-tar
xdg-mime default extractor-double-click.desktop application/x-bzip2
xdg-mime default extractor-double-click.desktop application/x-xz
xdg-mime default extractor-double-click.desktop application/vnd.rar
xdg-mime default extractor-double-click.desktop application/x-7z-compressed

echo "✅ Extractor installed successfully"
exit 0
```

```bash
chmod +x DEBIAN/postinst
```

# 🧹 4. PRERM (UNINSTALL LIMPO)

```bash
#!/bin/bash
set -e

echo "🧹 Removing MIME associations..."

xdg-mime default "" application/zip || true
xdg-mime default "" application/x-tar || true
xdg-mime default "" application/x-compressed-tar || true
xdg-mime default "" application/x-bzip2 || true
xdg-mime default "" application/x-xz || true
xdg-mime default "" application/vnd.rar || true
xdg-mime default "" application/x-7z-compressed || true

echo "✔ Cleanup done"
exit 0
```

```bash
chmod +x DEBIAN/prerm
```

# 📄 5. DESKTOP FILE

```ini
[Desktop Entry]
Name=Extractor Double Click
Exec=/usr/local/bin/extractor-double-click %f
Type=Application
Terminal=false
NoDisplay=false
MimeType=application/zip;application/x-tar;application/x-compressed-tar;application/x-bzip2;application/x-xz;application/vnd.rar;application/x-7z-compressed;
```

# ⚙️ 6. SCRIPT PRINCIPAL

Coloque seu extractor aqui:

```bash
/usr/local/bin/extractor-double-click
```

e:

```bash
chmod +x usr/local/bin/extractor-double-click
```

# 📦 7. GERAR O .DEB

Agora o passo mágico:

```bash
dpkg-deb --build extractor-double-click
```

Resultado:

```bash
extractor-double-click.deb
```

# 🚀 8. INSTALAR

```bash
sudo dpkg -i extractor-double-click.deb
```

# 🧠 CONSIDERAÇÕES

Agora seu projeto virou:

**✔ Sistema real Linux package**

- instala em `/usr/local/bin`
- integra com MIME system
- desktop entry oficial

**✔ comportamento profissional**

- install automático (postinst)
- uninstall limpo (prerm)

---
_That's All Folks!_
