import { useCallback, useEffect, useState } from "react";

import { GamepadBackground } from "./GamepadBackground";
import cheapo from "./display-mappings/cheapo.json";
import ipega9083s from "./display-mappings/ipega-9083s.json";
import steamdeck from "./display-mappings/steamdeck.json";
import xbox from "./display-mappings/xbox.json";
import { Joy, ButtonConfig, BarConfig, StickConfig, DPadConfig, DisplayMapping } from "../types";

const colStroke = "#ddd";
const colPrim = "blue";
const colSec = "cornflowerblue";
const colAlt = "red";

interface Interaction {
  pointerId: number;
  buttonIdx: number;
  axis1Idx: number;
  axis2Idx: number;
  buttonVal: number;
  axis1Val: number;
  axis2Val: number;
}

enum PointerEventType {
  Down,
  Move,
  Up,
}

function generateButton(
  value: number,
  x: number,
  y: number,
  text: string,
  radius: number,
  downCb: (e: React.PointerEvent) => void,
  upCb: (e: React.PointerEvent) => void,
) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        fill={value > 0 ? colAlt : colPrim}
        r={radius}
        stroke={colStroke}
        strokeWidth={2}
        onPointerDown={downCb}
        onPointerUp={upCb}
      />
      <text
        textAnchor="middle"
        x={x}
        y={y}
        fill="white"
        dominantBaseline="middle"
        pointerEvents="none"
      >
        {text}
      </text>
    </>
  );
}

function generateBar(value: number, x: number, y: number, rot: number) {
  const width = 80;
  const height = 10;
  const fracwidth = ((-value + 1) * width) / 2;

  const transform =
    "translate(" + x.toString() + "," + y.toString() + ") rotate(" + rot.toString() + ")";
  return (
    <>
      <rect
        width={fracwidth}
        height={height}
        x={-width / 2}
        y={-height / 2}
        fill={colPrim}
        transform={transform}
      />

      <rect
        width={width}
        height={height}
        x={-width / 2}
        y={-height / 2}
        fill="transparent"
        stroke={colStroke}
        transform={transform}
      />
    </>
  );
}

function generateStick(
  valueX: number,
  valueY: number,
  valueButton: number,
  x: number,
  y: number,
  radius: number,
  downCb: (e: React.PointerEvent) => void,
  moveCb: (e: React.PointerEvent) => void,
  upCb: (e: React.PointerEvent) => void,
) {
  const offX = -valueX * radius;
  const offY = -valueY * radius;

  return (
    <>
      <circle
        cx={x}
        cy={y}
        fill={colPrim}
        r={radius}
        stroke={colStroke}
        strokeWidth={2}
        onPointerDown={downCb}
        onPointerMove={moveCb}
        onPointerUp={upCb}
      />
      <circle
        cx={x + offX}
        cy={y + offY}
        fill={valueButton > 0 ? colAlt : colSec}
        r={radius * 0.5}
        stroke="none"
        strokeWidth={2}
        pointerEvents="none"
      />
    </>
  );
}

function generateDPad(valueX: number, valueY: number, x: number, y: number, radius: number) {
  const transform = "translate(" + x.toString() + "," + y.toString() + ")";

  return (
    <>
      <circle cx={x} cy={y} fill="none" r={radius} stroke={colStroke} strokeWidth={2} />
      <polygon
        points="10,15 0,25 -10,15"
        fill={valueY < 0 ? colAlt : colPrim}
        stroke={colStroke}
        strokeWidth={2}
        transform={transform}
      />
      <polygon
        points="10,-15 0,-25 -10,-15"
        fill={valueY > 0 ? colAlt : colPrim}
        stroke={colStroke}
        strokeWidth={2}
        transform={transform}
      />
      <polygon
        points="15,10 25,0 15,-10"
        fill={valueX < 0 ? colAlt : colPrim}
        stroke={colStroke}
        strokeWidth={2}
        transform={transform}
      />
      <polygon
        points="-15,10 -25,0 -15,-10"
        fill={valueX > 0 ? colAlt : colPrim}
        stroke={colStroke}
        strokeWidth={2}
        transform={transform}
      />
    </>
  );
}

export function GamepadView(props: {
  joy: Joy | undefined;
  cbInteractChange: (joy: Joy) => void;
  layoutName: string;
}): React.ReactElement {
  const { joy, cbInteractChange, layoutName } = props;
  const dispItems = [];

  const [numButtons, setNumButtons] = useState<number>(0);
  const [numAxes, setNumAxes] = useState<number>(0);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [displayMapping, setDisplayMapping] = useState<DisplayMapping>([]);

  useEffect(() => {
    if (layoutName === "steamdeck") {
      setDisplayMapping(steamdeck);
    } else if (layoutName === "ipega-9083s") {
      setDisplayMapping(ipega9083s);
    } else if (layoutName === "xbox") {
      setDisplayMapping(xbox);
    } else if (layoutName === "cheapo") {
      setDisplayMapping(cheapo);
    } else {
      setDisplayMapping([]);
    }
  }, [layoutName]);

  // Prevent accidentally panning/zooming when touching the image
  const preventPan = useCallback((event: Event): void => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const elements = document.getElementsByClassName("preventPan");

    Array.prototype.forEach.call(elements, (el) => {
      el.addEventListener("touchstart", preventPan, { passive: false });
      el.addEventListener("touchend", preventPan, { passive: false });
      el.addEventListener("touchmove", preventPan, { passive: false });
      el.addEventListener("touchcancel", preventPan, { passive: false });
    });

    return () => {
      Array.prototype.forEach.call(elements, (el) => {
        el.removeEventListener("touchstart", preventPan);
        el.removeEventListener("touchend", preventPan);
        el.removeEventListener("touchmove", preventPan);
        el.removeEventListener("touchcancel", preventPan);
      });
    };
  }, [preventPan]);

  useEffect(() => {
    if (displayMapping.length === 0) {
      setNumButtons(0);
      setNumAxes(0);
    } else {
      setNumButtons(
        Math.max(
          ...displayMapping.map((item) =>
            item.type === "button" ? (item as ButtonConfig).button : -1,
          ),
        ) + 1,
      );
      setNumAxes(
        displayMapping.reduce((tempMax, current) => {
          if (current.type === "stick") {
            const mapping = current as StickConfig;
            return Math.max(tempMax, mapping.axisX, mapping.axisY);
          } else {
            return tempMax;
          }
        }, -1) + 1,
      );
    }
  }, [displayMapping]);

  useEffect(() => {
    const tmpJoy = {
      header: {
        frame_id: "",
        stamp: { sec: 0, nsec: 0 },
      },
      buttons: Array<number>(numButtons).fill(0),
      axes: Array<number>(numAxes).fill(0),
    } as Joy;

    interactions.forEach((inter) => {
      if (inter.buttonIdx >= 0 && inter.buttonIdx < numButtons) {
        tmpJoy.buttons[inter.buttonIdx] = inter.buttonVal;
      }

      if (inter.axis1Idx >= 0 && inter.axis1Idx < numAxes) {
        tmpJoy.axes[inter.axis1Idx] = inter.axis1Val;
      }

      if (inter.axis2Idx >= 0 && inter.axis2Idx < numAxes) {
        tmpJoy.axes[inter.axis2Idx] = inter.axis2Val;
      }
    });

    cbInteractChange(tmpJoy);
  }, [numButtons, numAxes, interactions, cbInteractChange]);

  const buttonCb = (idx: number, e: React.PointerEvent, eventType: PointerEventType) => {
    switch (eventType) {
      case PointerEventType.Down: {
        // Add it to the list of tracked interactions
        e.currentTarget.setPointerCapture(e.pointerId);
        setInteractions([
          ...interactions,
          {
            pointerId: e.pointerId,
            buttonIdx: idx,
            buttonVal: 1,
            axis1Idx: -1,
            axis1Val: -1,
            axis2Idx: -1,
            axis2Val: -1,
          },
        ]);
        break;
      }
      case PointerEventType.Move: {
        // Don't really need this for buttons
        break;
      }
      case PointerEventType.Up: {
        // Remove from the list
        setInteractions(interactions.filter((i) => i.pointerId !== e.pointerId));
        break;
      }
    }
  };

  const axisCb = (
    idxX: number,
    idxY: number,
    e: React.PointerEvent,
    eventType: PointerEventType,
  ) => {
    const dim = e.currentTarget.getBoundingClientRect();
    const x = -(e.clientX - (dim.left + dim.right) / 2) / 30;
    const y = -(e.clientY - (dim.top + dim.bottom) / 2) / 30;
    const r = Math.min(Math.sqrt(x * x + y * y), 1);
    const ang = Math.atan2(y, x);
    const xa = r * Math.cos(ang);
    const ya = r * Math.sin(ang);

    switch (eventType) {
      case PointerEventType.Down: {
        // Add it to the list of tracked interactions
        e.currentTarget.setPointerCapture(e.pointerId);
        setInteractions([
          ...interactions,
          {
            pointerId: e.pointerId,
            buttonIdx: -1,
            buttonVal: -1,
            axis1Idx: idxX,
            axis1Val: xa,
            axis2Idx: idxY,
            axis2Val: ya,
          },
        ]);
        break;
      }
      case PointerEventType.Move: {
        const updatedInteractions = interactions.map((v) => {
          if (v.pointerId === e.pointerId) {
            return {
              pointerId: e.pointerId,
              buttonIdx: -1,
              buttonVal: -1,
              axis1Idx: idxX,
              axis1Val: xa,
              axis2Idx: idxY,
              axis2Val: ya,
            };
          } else {
            return v;
          }
        });
        setInteractions(updatedInteractions);
        break;
      }
      case PointerEventType.Up: {
        // Remove from the list
        setInteractions(interactions.filter((i) => i.pointerId !== e.pointerId));
        break;
      }
    }
  };

  for (const mappingA of displayMapping) {
    if (mappingA.type === "button") {
      const mapping = mappingA as ButtonConfig;
      const index = mapping.button;
      const text = mapping.text;
      const x = mapping.x;
      const y = mapping.y;
      const radius = 18;
      const buttonVal = joy?.buttons[index] ?? 0;

      dispItems.push(
        generateButton(
          buttonVal,
          x,
          y,
          text,
          radius,
          (e) => {
            buttonCb(index, e, PointerEventType.Down);
          },
          (e) => {
            buttonCb(index, e, PointerEventType.Up);
          },
        ),
      );
    } else if (mappingA.type === "bar") {
      const mapping = mappingA as BarConfig;
      const axis = mapping.axis;
      const x = mapping.x;
      const y = mapping.y;
      const rot = mapping.rot;
      const axVal = joy?.axes[axis] ?? 0;
      dispItems.push(generateBar(axVal, x, y, rot));
    } else if (mappingA.type === "stick") {
      const mapping = mappingA as StickConfig;
      const axisX = mapping.axisX;
      const axisY = mapping.axisY;
      const button = mapping.button;
      const x = mapping.x;
      const y = mapping.y;
      const axXVal = joy?.axes[axisX] ?? 0;
      const axYVal = joy?.axes[axisY] ?? 0;
      const buttonVal = joy?.buttons[button] ?? 0;
      dispItems.push(
        generateStick(
          axXVal,
          axYVal,
          buttonVal,
          x,
          y,
          30,
          (e) => {
            axisCb(axisX, axisY, e, PointerEventType.Down);
          },
          (e) => {
            axisCb(axisX, axisY, e, PointerEventType.Move);
          },
          (e) => {
            axisCb(axisX, axisY, e, PointerEventType.Up);
          },
        ),
      );
    } else if (mappingA.type === "d-pad") {
      const mapping = mappingA as DPadConfig;
      const axisX = mapping.axisX;
      const axisY = mapping.axisY;
      const x = mapping.x;
      const y = mapping.y;
      const axXVal = joy?.axes[axisX] ?? 0;
      const axYVal = joy?.axes[axisY] ?? 0;
      dispItems.push(generateDPad(axXVal, axYVal, x, y, 30));
    }

    // Auto indexing code to bring back later?
    // const xi = index % 4;
    // const yi = Math.floor(index / 4);
    // const cx = center + xi*(size + 5);
    // const cy = center + yi*(size + 5);

    // const cx = cc ? cc[0] : center + xi*(size + 5);
    // const cy = cc ? cc[1] : center + yi*(size + 5);
  }

  return (
    <div>
      {displayMapping.length === 0 ? <h2>No mapping!</h2> : null}
      <svg viewBox="0 0 512 512" className="preventPan">
        <GamepadBackground layoutName={layoutName} />
        {dispItems}
      </svg>
    </div>
  );
}
