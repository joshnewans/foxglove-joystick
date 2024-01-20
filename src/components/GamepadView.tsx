import { useEffect, useState } from "react";

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
  displayMapping: DisplayMapping;
  cbInteractChange: (joy: Joy) => void;
}): React.ReactElement {
  const { joy, displayMapping, cbInteractChange } = props;
  const dispItems = [];

  const [numButtons, setNumButtons] = useState<number>(0);
  const [numAxes, setNumAxes] = useState<number>(0);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    // const maxButton = displayMapping.reduce((prev,current)=>(prev && prev.button && prev.button ))
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
      <svg viewBox="0 0 512 512">
        <path
          d="m479.773 341.108-7.3-107.083c-.037 0-.037 0-.061-.013-.22-9.51-2.222-18.567-5.75-26.844v-.012c-4.248-13.477-21.18-31.813-25.171-34.755-4.005-2.93-4.627-4.712-6.129-12.976-2.856-17.14-7.385-27.455-13.16-27.552 0-10.462-22.57-11.048-29.407-10.962-6.873-.074-29.432.5-29.432 10.962-5.774.097-10.315 10.413-13.135 27.552-.452 2.43-.818 4.26-1.221 5.762H162.648c-.403-1.502-.769-3.333-1.196-5.762-2.857-17.14-7.373-27.455-13.172-27.552 0-10.462-22.572-11.048-29.408-10.962-6.86-.074-29.42.5-29.42 10.962-5.786.097-10.315 10.413-13.147 27.552-1.514 8.264-2.136 10.047-6.128 12.976-4.004 2.942-20.948 21.278-25.184 34.755v.012c-3.528 8.277-5.542 17.335-5.774 26.844 0 .013-.025.013-.037.013L31.87 341.108c-.037.867-.073 1.77-.073 2.625 0 26.16 21.192 47.365 47.352 47.365 16.871 0 31.69-8.838 40.065-22.12l.012.024 25.88-38.343c8.118 11.707 21.668 19.36 37.013 19.36 21.119 0 38.82-14.502 43.69-34.131h60.024c4.871 19.617 22.596 34.132 43.679 34.132 15.369 0 28.907-7.654 37.013-19.361l25.892 38.343.036-.024c8.387 13.294 23.17 22.12 40.04 22.12 26.161 0 47.366-21.205 47.366-47.365.012-.867-.037-1.758-.086-2.625z"
          style={{
            fill: "none",
            stroke: "#cc6e00",
            strokeWidth: 5,
          }}
        />
        {dispItems}
      </svg>
    </div>
  );
}
