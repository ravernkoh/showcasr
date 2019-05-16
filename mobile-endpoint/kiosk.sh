#!/bin/sh -e

ENV_FILE="./env"
URL="website.url"

main() {
    if [ -e "${ENV_FILE}" ]; then
        . "${ENV_FILE}"
    fi
    ask_for_sudo
    check_internet_connection
    #update_pi
    install_packages
    disable_screen_saver
    disable_chromium_warnings
    launch_chromium
    if [ -n "${USERNAME}" -a -n "${PASSWORD}" -a -n "${URL}" ]; then
        sleep 10
        do_login
    fi

}

ask_for_sudo() {
    sudo -v
    # Keep-alive: update existing `sudo` time stamp until the script has finished.
    while true; do
        sudo -n true
        sleep 60
        kill -0 "$$" || exit
    done 2>/dev/null &
}

check_internet_connection() {
    if  ! ping -c1 google.com > /dev/null 2>&1 ; then
        echo "Internet connection failed"
        exit 1
    else
        echo "Internet connection available"
    fi
}

update_pi() {
    sudo apt-get update || true
    sudo apt-get -y dist-upgrade || true
}

install_packages() {
    command -v xdotool  >/dev/null 2>&1 || sudo apt-get install -y xdotool
    command -v uncluter >/dev/null 2>&1 || sudo apt-get install -y unclutter
}

disable_screen_saver() {
    xset s noblank || true
    xset s off || true
    xset -dpms || true
    if ! pgrep -x "unclutter" > /dev/null; then
        echo "Launching unclutter"
        unclutter -idle 0.5 -root & # Hides mouse
    else
        echo "unclutter already running"
    fi
}

disable_chromium_warnings() {
    sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
    sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences
}

launch_chromium() {
    /usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk "${URL}" >/dev/null 2>&1 &
}

do_login() {
    xdotool click 1
    xdotool key "Tab"
    xdotool type "${USERNAME}"
    xdotool key "Tab"
    xdotool type "${PASSWORD}"
}

main
