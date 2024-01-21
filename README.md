# foxglove-joystick

This is an extension for [Foxglove Studio](https://github.com/foxglove/studio) that adds functionality for working with joysticks. It receives joystick data from a variety of inputs, and offers various ways to display it.

## Overview

There are four main operating modes/input sources/use cases:

| Mode | Functionality | Intended use case |
| ----- | ------ | ------ |
| Subscribe Mode | Subscribes to an existing ROS `Joy` topic | Monitoring a robot that is being teleoperated, or replaying a log and reviewing operator actions |
| Gamepad Mode | Receives input from a locally-connected gamepad (and publishes it to a ROS `Joy` topic) | Live control of a robot from any Foxglove-supported device |
| Keyboard Mode *(future)* | Converts local keystrokes into `Joy` messages (for publishing) | Bench-testing a configuration that is primarily designed to use a gamepad but does not currently have one connected |
| Interactive Display Mode *(future)* | Makes the displayed indicators clickable/touchable (for publishing) | Controlling a robot from a touchscreen device |``

![Panel Overview Screenshot](/docs/screenshot1.png)

## Installation
With Node and Foxglove installed, `npm install`, `npm run local-install`.
To package up `npm run package`.

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



## Mapping
It is intended that there will be three different kinds of mapping, so it is worth clarifying them here.

| Mapping | Purpose | Current implementation |
| ------- | ------- | ---------------------- |
| Gamepad (numerical) -> Joy (or Keyboard -> Joy) | Defines how key pressed are mapped to `Joy` values (e.g. gamepad button 3 maps to joy button 4). This is useful because sometimes the default mapping for the same gamepad can differ on various platforms and needs to be standardised for the consumer of the `Joy` message. | Direct mapping |
| Joy -> Gamepad (named) | Likewise, two different platforms may have a different mapping for which button is which. For example, this might be to map  Joy button 10 to gamepad "R2". | No concept of a named mapping, it is a direct numerical map.
| Gamepad (named) -> Display | How a given gamepad is rendered. | A structure (saved in JSON) that determines the position and orientation of each button/axis |

Also note that the HTML gamepad API seems to have the axes reversed compared to what typically comes out of the `joy` drivers, so the panel flips those values back automatically.

## Contributions

Thanks to [rgov](https://github.com/rgov) for creating [this repo](https://github.com/ARMADAMarineRobotics/studio-extension-gamepad) which I originally worked on this project from before rewriting it mostly from scratch (but have retained [useGamepads.ts](src/hooks/useGamepad.ts)).