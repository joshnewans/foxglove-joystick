# Steam Deck Guide

## Method 1 - Web Version
First, get into the Desktop mode of your Steam Deck.

1. Install Chrome through the normal "app store".
2. Run `flatpak --user override --filesystem=/run/udev:ro com.google.Chrome`
3. Add Chrome to your Steam Library by finding it in the applications menu, right-click, "Add to Steam"
4. (Optional steps) Right-click the game in your library and select "Properties"
    a. Rename to "Foxglove" or whatever you like (you should be able to add multiple "Chromes" and name them anything)
    b. Set an icon to show in the sidebar game list
    c. At the end of the "Launch Options", add the URL you want to go to between `"@@u"` and `"@@"`, e.g. `... "com.google.Chrome" "@@u" http://localhost:8080 "@@"`. You can play around with this URL to automatically select a particular connection too (try it in a regular browser first).
    d. Also in the launch options, add `--kiosk` between `"com.google.Chrome"` and `"@@u"`
    e. Fix the cover art
        i. Click "Home" near the top-left of the library
        ii. find Foxglove in the cover art list
        iii. Right-click -> Manage -> Set the cover art (*no idea why you can't do this from the other "Manage" menu...*)

5. Fix controller configuration
    a. Get to the controller configuration either from the game page in the Desktop UI, or from within the normal SteamOS UI
    b. Change the configuration to "Gamepad with Mouse Trackpad"
    c. Tweak the settings to suit your usage

*To Add*
- Drag and drop to install extension
- Self-hosted vs studio.foxglove.dev
- Secure websocket settings


## Method 2 - Desktop Add

To do - this
Snap may be the easiest to get installed, but the extension is currently broken under snap.