#!/bin/bash

set -e

# =========================
# CONFIG BÁSICA
# =========================

APP_NAME="extractor-double-click"
APP_VERSION="1.0.0"
DESKTOP_FILE="$APP_NAME.desktop"

BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"

STATE_DIR="$HOME/.config/extractor-double-click"
BACKUP_FILE="$STATE_DIR/mime-backup.list"
LOG_FILE="$STATE_DIR/install.log"

DRY_RUN=false

# =========================
# ARGS
# =========================

if [[ "$1" == "--simulate" ]]; then
    DRY_RUN=true
    echo "🧪 DRY RUN MODE ENABLED"
fi

# =========================
# PREPARO DE STATE
# =========================

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"

echo "$APP_VERSION" > "$STATE_DIR/version"

# =========================
# LOG SYSTEM
# =========================

log() {
    echo "[$(date '+%F %T')] $*" | tee -a "$LOG_FILE"
}

run() {
    if $DRY_RUN; then
        echo "[DRY-RUN] $*"
    else
        eval "$@"
    fi
}

# =========================
# ROLLBACK
# =========================

rollback() {
  log "🔄 Rolling back changes..."

  if [ -f "$BACKUP_FILE" ]; then
    while IFS="=" read -r mime desktop; do
      if [ -n "$desktop" ]; then
        xdg-mime default "$desktop" "$mime" 2>/dev/null || true
      else
        xdg-mime default "" "$mime" 2>/dev/null || true
      fi
    done < "$BACKUP_FILE"
  fi

    log "✔ Rollback completed"
}

trap 'echo "❌ Install failed"; rollback' ERR

# =========================
# DEPENDÊNCIAS
# =========================

check_dep() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing dependency: $1"
    exit 1
  }
}

check_dep notify-send
check_dep zenity
check_dep unzip
check_dep tar
check_dep bunzip2
check_dep unrar
check_dep 7z

# =========================
# INÍCIO
# =========================

log "📦 Installing $APP_NAME v$APP_VERSION"

mkdir -p "$BIN_DIR"
mkdir -p "$APP_DIR"

# =========================
# BACKUP MIME
# =========================

log "💾 Backing up MIME associations..."

: > "$BACKUP_FILE"

MIME_TYPES=(
  application/zip
  application/x-tar
  application/x-compressed-tar
  application/x-bzip2
  application/x-xz
  application/vnd.rar
  application/x-7z-compressed
  application/x-apple-diskimage
  application/vnd.efi.iso
  application/vnd.efi.img
)

for mime in "${MIME_TYPES[@]}"; do
  current=$(xdg-mime query default "$mime" 2>/dev/null || true)
  echo "$mime=$current" >> "$BACKUP_FILE"
  log "✔ $mime -> ${current:-none}"
done

# =========================
# INSTALL BIN
# =========================

run cp "$APP_NAME" "$BIN_DIR/$APP_NAME"
run chmod +x "$BIN_DIR/$APP_NAME"

# =========================
# DESKTOP FILE
# =========================

log "🧾 Creating desktop entry..."

run bash -c "cat > '$APP_DIR/$DESKTOP_FILE' <<EOF
[Desktop Entry]
Name=Extractor Double Click
Exec=$BIN_DIR/$APP_NAME %f
Type=Application
MimeType=application/zip;application/x-tar;application/x-compressed-tar;application/x-bzip2;application/x-xz;application/vnd.rar;application/x-7z-compressed;application/x-apple-diskimage;application/vnd.efi.iso;application/vnd.efi.img;
NoDisplay=false
Terminal=false
EOF"

run chmod +x "$APP_DIR/$DESKTOP_FILE"

# =========================
# MIME ASSOCIATIONS
# =========================

log "🔗 Applying MIME associations..."

set_mime() {
  local mime=$1
  run xdg-mime default "$DESKTOP_FILE" "$mime"
}

set_mime application/zip
set_mime application/x-tar
set_mime application/x-compressed-tar
set_mime application/x-bzip2
set_mime application/x-xz
set_mime application/vnd.rar
set_mime application/x-7z-compressed
set_mime application/x-apple-diskimage
set_mime application/vnd.efi.iso
set_mime application/vnd.efi.img

# =========================
# FINALIZAÇÃO
# =========================

log "🚀 Installation completed successfully!"
