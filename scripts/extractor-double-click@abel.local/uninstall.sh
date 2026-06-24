#!/bin/bash

set -e

APP_NAME="extractor-double-click"

BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"

STATE_DIR="$HOME/.config/extractor-double-click"
BACKUP_FILE="$STATE_DIR/mime-backup.list"
LOG_FILE="$STATE_DIR/uninstall.log"

# =========================
# LOG SYSTEM
# =========================

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"

log() {
    echo "[$(date '+%F %T')] $*" | tee -a "$LOG_FILE"
}

# =========================
# ROLLBACK (RESTORE MIME)
# =========================

restore_mime() {
  log "🔄 Restoring MIME associations..."
  if [ -f "$BACKUP_FILE" ]; then
    while IFS="=" read -r mime desktop; do
      if [ -n "$desktop" ]; then
        xdg-mime default "$desktop" "$mime" 2>/dev/null || true
      else
        xdg-mime default "" "$mime" 2>/dev/null || true
      fi
    done < "$BACKUP_FILE"
    log "✔ MIME restored from backup"
  else
    log "⚠️ No backup file found, skipping MIME restore"
  fi
}

# =========================
# REMOVING
# =========================

safe_remove() {
  if [ -e "$1" ]; then
    rm -rf "$1"
    log "🗑️ Removed $1"
  else
    log "ℹ️ Not found: $1"
  fi
}

# =========================
# START
# =========================

log "🧹 Uninstalling $APP_NAME"

# 1. restauring MIME before remove all
restore_mime

# 2. remove bin
safe_remove "$BIN_DIR/$APP_NAME"

# 3. remove desktop file
safe_remove "$APP_DIR/$APP_NAME.desktop"

# 4. remove state dir
safe_remove "$STATE_DIR"

log "🚀 Uninstall completed successfully"
