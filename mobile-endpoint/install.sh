#!/bin/sh -e

DEV_DIR="$HOME/dev"
BIN_DIR="$DEV_DIR/bin"
INSTALL_DIR="$DEV_DIR/showcasr"

main() {
    log "Hello!"
    ask_for_sudo
    # update_pi
    install_packages
    make_directories
    clone_repository
    copy_files
    start_systemd
}

ask_for_sudo() {
    log "Asking for sudo"
    sudo -v
    # Keep-alive: update existing `sudo` time stamp until the script has finished.
    while true; do
        sudo -n true
        sleep 60
        kill -0 "$$" || exit
    done 2>/dev/null &
}

update_pi() {
    log "Updating Pi"
    sudo apt-get update || true
    sudo apt-get -y dist-upgrade || true
}

install_packages() {
    log "Installing packages"
    command -v chromium-browser >/dev/null 2>&1 || sudo apt-get install -y chromium-browser
    command -v xdotool >/dev/null 2>&1 || sudo apt-get install -y xdotool
    command -v uncluter >/dev/null 2>&1 || sudo apt-get install -y unclutter
}

make_directories() {
    mkdir -p "$DEV_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$INSTALL_DIR"
}

clone_repository() {
    log "Cloning Repository"
    git clone github.com/ravernkoh/showcasr "$INSTALL_DIR"
}

copy_files() {
    cp "$INSTALL_DIR/mobile-endpoint/kiosk.sh" "$BIN_DIR/kiosk.sh"
    cp "$INSTALL_DIR/mobile-endpoint/env.sample" "$BIN_DIR/env"
    sudo cp "$INSTALL_DIR/mobile-endpoint/kiosk.service" "/lib/systemd/system/kiosk.service"
}

start_systemd() {
    sudo systemctl enable kiosk.sh
    log "update env file located at $HOME/dev/bin/env"
    log "After updating env file, restart system"
}

log() {
    echo "$@"
}

main
