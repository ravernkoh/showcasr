#!/bin/sh -e

ENV_FILE="$HOME/dev/bin/env"
URL='showcasr-frontend.ravern.co'

main() {
    if [ -e "${ENV_FILE}" ]; then
	log "Found ENV FILE"
        . "${ENV_FILE}"
    else
	log "DID NOT FIND ENV FILE"
    fi
    #ask_for_sudo
    check_internet_connection
    lxterminal -l -e "journalctl -r -u kiosk --boot" &
    #update_pi
    #install_packages
    disable_screen_saver
    disable_chromium_warnings
    launch_chromium
    if [ -n "${USERNAME}" -a -n "${PASSWORD}" -a -n "${URL}" ]; then
        sleep 30
        do_login
    fi

    while true; do sleep 10;done # Leave the program running

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

check_internet_connection() {
    log "Checking Internet conection"

    if  ! ping -c1 google.com > /dev/null 2>&1 ; then
        log "Internet connection failed"
        exit 1
    else
        log "Internet connection available"
    fi
}

update_pi() {
    log "Updating Pi"
    sudo apt-get update || true
    sudo apt-get -y dist-upgrade || true
}

install_packages() {
    log "Installing packages"
    commad -v chromium-browser >/dev/null 2>&1 || sudo apt-get install -y chromium-browser
    command -v xdotool  >/dev/null 2>&1 || sudo apt-get install -y xdotool
    command -v uncluter >/dev/null 2>&1 || sudo apt-get install -y unclutter
}

disable_screen_saver() {
    log "Disabling screensaver"
    xset s noblank || true
    xset s off || true
    xset -dpms || true
    if ! pgrep -x "unclutter" > /dev/null; then
        log "Launching unclutter"
        unclutter -idle 0.5 -root & # Hides mouse
    else
        log "unclutter already running"
    fi
}

disable_chromium_warnings() {
    log "Disabling chromium warnings"
    sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
    sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences
}

launch_chromium() {
    log "Launching chromium"
    /usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk "${URL}" >/dev/null 2>&1 &
    while ! pgrep chromium; do
	    sleep 5
    done
}

do_login() {
    log "Logging into the website"
    
    xdotool click 1
    sleep 1
    xdotool key "Tab"
    sleep 1
    xdotool type "${USERNAME}"
    sleep 1
    xdotool key "Tab"
    sleep 1
    xdotool type "${PASSWORD}"
    sleep 1
    xdotool key "Return"
}

log() {
    echo "$@"
}

main
