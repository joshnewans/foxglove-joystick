import { fromDate } from "@foxglove/rostime";
import {
  Immutable,
  MessageEvent,
  PanelExtensionContext,
  Topic,
  SettingsTreeAction,
} from "@foxglove/studio";
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { useGamepads } from "react-gamepads";

import { GamepadDebug } from "./components/GamepadDebug";
import { GamepadView } from "./components/GamepadView";
import { SimpleButtonView } from "./components/SimpleButtonView";
import { Config, buildSettingsTree, settingsActionReducer } from "./panelSettings";
import { Joy } from "./types";

// Should this be exported by react-gamepads?
interface GamepadRef {
  [key: number]: Gamepad;
}

function JoyPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [topics, setTopics] = useState<undefined | Immutable<Topic[]>>();
  const [messages, setMessages] = useState<undefined | Immutable<MessageEvent[]>>();
  const [joy, setJoy] = useState<Joy | undefined>();
  const [gamepads, setGamepads] = useState<GamepadRef | undefined>({}); // TODO make this a GamepadRef
  const [pubTopic, setPubTopic] = useState<string | undefined>();

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as Partial<Config>;
    partialConfig.subJoyTopic ??= "/joy";
    partialConfig.pubJoyTopic ??= "/joy";
    partialConfig.publishMode ??= false;
    partialConfig.publishFrameId ??= "";
    partialConfig.dataSource ??= "sub-joy-topic";
    partialConfig.displayMode ??= "auto";
    partialConfig.debugGamepad ??= false;
    partialConfig.theme ??= "TODO";
    partialConfig.mapping_name ??= "TODO";
    partialConfig.gamepadId ??= 0;
    return partialConfig as Config;
  });

  const settingsActionHandler = useCallback(
    (action: SettingsTreeAction) => {
      setConfig((prevConfig) => settingsActionReducer(prevConfig, action));
    },
    [setConfig],
  );

  // Register the settings tree
  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler: settingsActionHandler,
      nodes: buildSettingsTree(config, topics),
    });
  }, [config, context, settingsActionHandler, topics]);

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // The render handler is run by the broader studio system during playback when your panel
    // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
    // You can only setup one render handler - usually early on in setting up your panel.
    //
    // Without a render handler your panel will never receive updates.
    //
    // The render handler could be invoked as often as 60hz during playback if fields are changing often.
    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, studio shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      // We may have new topics - since we are also watching for messages in the current frame, topics may not have changed
      // It is up to you to determine the correct action when state has not changed.
      setTopics(renderState.topics);

      // currentFrame has messages on subscribed topics since the last render call
      setMessages(renderState.currentFrame);
    };

    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // tell the panel context that we care about any update to the _topic_ field of RenderState
    context.watch("topics");

    // tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");
  }, [context]);

  // Or subscribe to the relevant topic when in a recorded session
  useEffect(() => {
    if (config.dataSource === "sub-joy-topic") {
      console.log("Subscribe to");
      console.log(config.subJoyTopic);
      context.subscribe([config.subJoyTopic]);
    } else {
      context.unsubscribeAll();
    }
  }, [config.subJoyTopic, context, config.dataSource]);

  // If subscribing
  useEffect(() => {
    const latestJoy = messages?.[messages.length - 1]?.message as Joy | undefined;
    // console.log("Here?");
    if (latestJoy) {
      const tmpHeader = {
        stamp: latestJoy.header.stamp,
        frame_id: config.publishFrameId,
      };
      const tmpMsg = {
        header: tmpHeader,
        axes: Array.from(latestJoy.axes),
        buttons: Array.from(latestJoy.buttons),
      };
      setJoy(tmpMsg);
      // console.log("subbbb");
    }
  }, [messages, config.publishFrameId]);

  useGamepads((gamepads) => {
    setGamepads(gamepads);
  });

  useEffect(() => {
    if (config.dataSource !== "gamepad") {
      return;
    }

    // TODO can probably clean up these checks?
    if (!gamepads) {
      return;
    }

    const gp = gamepads[config.gamepadId];

    if (!gp) {
      return;
    }

    const tmpJoy = {
      header: {
        frame_id: config.publishFrameId,
        stamp: fromDate(new Date()), // TODO: /clock
      },
      axes: gp.axes.map((axis) => -axis),
      buttons: gp.buttons.map((button) => (button.pressed ? 1 : 0)),
    } as Joy;

    setJoy(tmpJoy);
  }, [gamepads, config.publishFrameId, config.dataSource, config.gamepadId, context]);

  // Advertise the topic to publish
  useEffect(() => {
    if (config.publishMode) {
      setPubTopic((oldTopic) => {
        if (config.publishMode) {
          if (oldTopic) {
            context.unadvertise?.(oldTopic);
          }
          context.advertise?.(config.pubJoyTopic, "sensor_msgs/Joy");
          return config.pubJoyTopic;
        } else {
          if (oldTopic) {
            context.unadvertise?.(oldTopic);
          }
          return "";
        }
      });
    }
  }, [config.pubJoyTopic, config.publishMode, context]);

  // Publish the joy message
  useEffect(() => {
    if (!config.publishMode) {
      return;
    }

    if (pubTopic && pubTopic === config.pubJoyTopic) {
      context.publish?.(pubTopic, joy);
    }
  }, [context, config.pubJoyTopic, config.publishMode, joy, pubTopic]);

  // Invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div>
      {config.displayMode === "auto" ? <SimpleButtonView joy={joy} /> : null}
      {config.displayMode === "custom" ? <GamepadView joy={joy} /> : null}
      {config.debugGamepad ? <GamepadDebug gamepads={gamepads} /> : null}
    </div>
  );
}

export function initJoyPanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<JoyPanel context={context} />, context.panelElement);

  // Return a function to run when the panel is removed
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}
