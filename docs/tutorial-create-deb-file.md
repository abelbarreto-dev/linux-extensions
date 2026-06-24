# 📦 TUTORIAL: CRIAÇÃO DE PACOTE `.DEB`
Um pequeno tutorial para auxiliar na criação de pacotes debian.

# Sumário

1. [Estrutura do Pacote](#-1-estrutura-do-pacote)
2. [Arquivo Control Obrigatório](#-2-arquivo-control-obrigatório)
3. [Script Postinst pós Instalação](#-3-script-postinst-pós-instalação)
4. [Script Prerm antes de Remover](#-4-script-prerm-antes-de-remover)
5. [Arquivo Desktop Opcional](#-5-arquivo-desktop-opcional)
6. [Binário Script Principal](#-6-binário--script-principal)
7. [Gerar o pacote DEB](#-7-gerar-o-pacote-deb)
8. [Instalar o pacote](#-8-instalar-o-pacote)
9. [Desinstalar](#-9-desinstalar)
10. [Resumo conceitual](#-resumo-conceitual)
11. [Observação importante](#-observação-importante)

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

- 📁 arquivos do sistema (usr/, etc)
- ⚙️ scripts de ciclo de vida (DEBIAN/)
- 📄 metadados (control)

# 🧠 OBSERVAÇÃO IMPORTANTE

- `postinst` = instala/configura
- `prerm` = remove/limpa
- `control` = descrição do pacote
- `usr/` = arquivos reais do sistema

---

_That's All Folks_
