# foxglove-joystick

This is an extension for [Foxglove Studio](https://github.com/foxglove/studio) that adds functionality for working with joysticks. It receives joystick data from a variety of inputs, and offers various ways to display it.

## Overview

There are four main operating modes/input sources/use cases:

| Mode | Functionality | Intended use case |
| ----- | ------ | ------ |
| Subscribe Mode | Subscribes to an existing ROS `Joy` topic | Monitoring a robot that is being teleoperated, or replaying a log and reviewing operator actions |
| Gamepad Mode | Receives input from a locally-connected gamepad (and publishes it to a ROS `Joy` topic.) | Live control of a robot from any Foxglove-supported device |
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
  - [x] Simple auto-generated display of values from a `Joy` message
  - [ ] Controller image
    - [ ] Different options for the image
    - [ ] Different options for mapping joy buttons to image buttons



## Mapping
There are two different kinds of mapping.

Gamepad -> joy (or keyboard -> joy). These are only relevant when using those sources.

Joy -> display. This is independent of how the joy message is getting created and is just about which buttons are displayed as what.

