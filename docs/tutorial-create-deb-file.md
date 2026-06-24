# 📦 TUTORIAL: CRIAÇÃO DE PACOTE `.DEB`

# 🏗️ 1. ESTRUTURA DO PACOTE

Crie a seguinte árvore de diretórios:

```text
package-name/
├── DEBIAN/
│   ├── control
│   ├── postinst   (opcional)
│   ├── prerm      (opcional)
├── usr/
│   ├── local/
│   │   ├── bin/
│   │   │   └── executable
│   ├── share/
│   │   └── applications/
│   │       └── app.desktop
```

# 📄 2. ARQUIVO `control` (OBRIGATÓRIO)

```text
Package: package-name
Version: 1.0.0
Section: utils
Priority: optional
Architecture: all
Maintainer: Name <email@example.com>
Depends: bash, coreutils
Description: Short description of the package
 Long description of what the software does.
```

# ⚙️ 3. SCRIPT `postinst` (PÓS-INSTALAÇÃO)

Usado para configurar o sistema após instalação.

```bash
#!/bin/bash
set -e

echo "Configuring system..."

# exemplo de configuração:
# registrar serviços, MIME types, permissões etc.

exit 0
```

Permissão:

```bash
chmod +x DEBIAN/postinst
```

# 🧹 4. SCRIPT `prerm` (ANTES DE REMOVER)

Usado para limpar configurações do sistema.

```bash
#!/bin/bash
set -e

echo "Cleaning up system configuration..."

# exemplo:
# remover associações, serviços, configs

exit 0
```

Permissão:

```bash
chmod +x DEBIAN/prerm
```

# 📄 5. ARQUIVO `.desktop` (OPCIONAL)

```ini
[Desktop Entry]
Name=Application Name
Exec=/usr/local/bin/executable %f
Type=Application
Terminal=false
NoDisplay=false
MimeType=application/x-example;
```

# ⚙️ 6. BINÁRIO / SCRIPT PRINCIPAL

Coloque seu executável em:

```text
usr/local/bin/executable
```

E torne executável:

```bash
chmod +x usr/local/bin/executable
```

# 📦 7. GERAR O PACOTE `.DEB`

Execute:

```bash
dpkg-deb --build package-name
```

Isso gera:

```text
package-name.deb
```

# 🚀 8. INSTALAR O PACOTE

```bash
sudo dpkg -i package-name.deb
```

# 🧠 9. DESINSTALAR

```bash
sudo apt remove package-name
```

ou:

```bash
sudo dpkg -r package-name
```

# 📌 RESUMO CONCEITUAL

Um `.deb` é basicamente:

* 📁 arquivos do sistema (usr/, etc)
* ⚙️ scripts de ciclo de vida (DEBIAN/)
* 📄 metadados (control)

# 🧠 OBSERVAÇÃO IMPORTANTE

* `postinst` = instala/configura
* `prerm` = remove/limpa
* `control` = descrição do pacote
* `usr/` = arquivos reais do sistema

---
_That's All Folks_
