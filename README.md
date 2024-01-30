# foxglove-joystick

This is an extension for [Foxglove Studio](https://github.com/foxglove/studio) that adds functionality for working with joysticks. It receives joystick data from a variety of inputs, and offers various ways to display it.

## Overview

There are four main operating modes/input sources/use cases:

| Mode | Functionality | Intended use case |
| ----- | ------ | ------ |
| Subscribe Mode | Subscribes to an existing ROS `Joy` topic | Monitoring a robot that is being teleoperated, or replaying a log and reviewing operator actions |
| Gamepad Mode | Receives input from a locally-connected gamepad (and publishes it to a ROS `Joy` topic) | Live control of a robot using a gamepad connected to any Foxglove-supported device |
| Keyboard Mode | Converts local keystrokes into `Joy` messages (for publishing) | Bench-testing a configuration that is primarily designed to use a gamepad but does not currently have one connected |
| Interactive Display Mode | Makes the displayed indicators clickable/touchable (for publishing) | Controlling a robot from a touchscreen device |``

![Panel Overview Screenshot](https://github.com/joshnewans/foxglove-joystick/blob/main/docs/screenshot1.png?raw=true)

## Installation

### Foxglove Studio Extension Marketplace

In the Foxglove Studio Desktop app, use the Extension Marketplace (Profile menu in top-right -> Extensions) to find and install the Joystick panel.

### Releases

Download the latest `.foxe` release [here](https://github.com/joshnewans/foxglove-joystick/releases/latest) and drag-and-drop it onto the window of Foxglove Studio (Desktop or Web).

### Compile from source

With Node and Foxglove installed
 - `npm install` to install dependencies
 - `npm run local-install` to build and install for a local copy of the Foxglove Studio Desktop App
 - `npm run package` to package it up into a `.foxe` file

### Snap Users

Right now it seems that this panel will **not** work with the `snap` version of Foxglove Studio. Snaps do not allow joystick input by default and I am looking into what is required to use it (possibly the Foxglove team enabling the `joystick` interface). 

### Steam Deck Users

Please follow [this guide](docs/steamdeck.md).



## Mapping

Right now all "mapping" within the program is direct, but it is intended that there will be flexibility here. This is because different controllers (and in some cases the same controller on different platforms) will have the buttons/axes arranged in a different order. 

Some more complex examples of this are D-Pads (sometimes register as two axes, sometimes four buttons) and triggers (sometimes register as axes + buttons, sometimes buttons with a variable value, unsupported by `Joy`).

Thus it is expected to eventually need the following:

| Mapping | Purpose | Current implementation |
| ------- | ------- | ---------------------- |
| Gamepad (numerical) -> Joy (or Keyboard -> Joy) | Defines how key pressed are mapped to `Joy` values (e.g. gamepad button 3 maps to joy button 4). | Direct mapping |
| Joy -> Gamepad/Layout (named) | Defines how `Joy` values map into the Layout (e.g. joy button 4 maps to layout button "L1"). | Built into layout JSON (separate in future) |

Also note that the HTML gamepad API seems to have the axes reversed compared to what typically comes out of the `joy` drivers, so the panel flips those values back automatically.

## Layouts

Currently consist of a `.json` to determine button locations and an entry in `GamepadBackground.tsx` for the background. Intention is for this to be more configurable in future.

## Planned functionality/improvements

- **Source modes**
  - [x] Source Mode 1 (Subscriber)
  - [x] Source Mode 2 (Gamepad)
    - [ ] Option for a custom mapping from gamepad to `Joy` (e.g. GP 6-> Joy 8)
    - [ ] Deadzones, inversion, scaling, etc.
  - [x] Source Mode 3 (Keyboard)
  - [x] Source Mode 4 (Interactive)
- **Display modes**
  - [x] Simple Auto-Generated Display
    - [ ] Better identification of axes
  - [x] Gamepad visual mimic
    - [ ] Different options for the image
    - [ ] Different options for mapping joy buttons to image buttons
    - [x] Options for axes to be sticks, d-pads, triggers, or more
    - [ ] General improved customisability



## Contributions

Thanks to [rgov](https://github.com/rgov) for creating [this repo](https://github.com/ARMADAMarineRobotics/studio-extension-gamepad) which I originally worked on this project from before rewriting it mostly from scratch (but have retained [useGamepads.ts](src/hooks/useGamepad.ts)).