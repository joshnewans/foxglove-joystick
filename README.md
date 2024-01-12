# foxglove-joystick

This is an extension for [Foxglove Studio](https://github.com/foxglove/studio) that adds functionality for working with joysticks. It receives joystick data from a variety of inputs, and offers various ways to display it.

## Overview

There are four main operating modes/input sources/use cases:

| Mode | Functionality | Intended use case |
| ----- | ------ | ------ |
| Subscribe Mode | Subscribes to an existing ROS `Joy` topic | Monitoring a robot that is being teleoperated, or replaying a log and reviewing operator actions |
| Gamepad Mode | Receives input from a locally-connected gamepad (and publishes it to a ROS `Joy` topic) | Live control of a robot from any Foxglove-supported device |
| Keyboard Mode *(future)* | Converts local keystrokes into `Joy` messages (for publishing) | Bench-testing a configuration that is primarily designed to use a gamepad but does not currently have one connected |
| Interactive Display Mode *(future)* | Makes the displayed indicators clickable/touchable (for publishing) | Controlling a robot from a touchscreen device |


## Planned functionality/improvements

- **Source modes**
  - [ ] Source Mode 2 (Gamepad)
    - [ ] Option for a custom mapping from gamepad to `Joy` (e.g. GP 6-> Joy 8)
    - [ ] Deadzones, inversion, scaling, etc.
    - [ ] More efficient usage of `react-gamepads` (and/or replace with a custom equivalent)
  - [ ] Source Mode 3 (Keyboard)
  - [ ] Source Mode 4 (Interactive)
- **Display modes**
  - [ ] Simple Auto-Generated Display
    - [ ] Better identification of axes
  - [ ] Gamepad visual mimic
    - [ ] Different options for the image
    - [ ] Different options for mapping joy buttons to image buttons
    - [ ] Options for axes to be sticks, d-pads, triggers, or more
    - [ ] General improved customisability



## Mapping
It is intended that there will be three different kinds of mapping, so it is worth clarifying them here.

| Mapping | Purpose | Current implementation |
| ------- | ------- | ---------------------- |
| Gamepad (numerical) -> Joy (or Keyboard -> Joy) | Defines how key pressed are mapped to `Joy` values (e.g. gamepad button 3 maps to joy button 4). This is useful because sometimes the default mapping for the same gamepad can differ on various platforms and needs to be standardised for the consumer of the `Joy` message. | Direct mapping |
| Joy -> Gamepad (named) | Likewise, two different platforms may have a different mapping for which button is which. For example, this might be to map  Joy button 10 to gamepad "R2". | No concept of a named mapping, it is a direct numerical map.
| Gamepad (named) -> Display | How a given gamepad is rendered. | A structure (saved in JSON) that determines the position and orientation of each button/axis |