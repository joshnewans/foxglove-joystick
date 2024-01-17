import { Joy, ButtonConfig, BarConfig, StickConfig, DPadConfig, DisplayMapping } from "../types";

const colStroke = "#ddd";
const colPrim = "blue";
const colSec = "cornflowerblue";
const colAlt = "red";

function generateButton(value: number, x: number, y: number, text: string, radius: number) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        fill={value > 0 ? colAlt : colPrim}
        r={radius}
        stroke={colStroke}
        strokeWidth={2}
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
) {
  const offX = -valueX * radius;
  const offY = -valueY * radius;

  return (
    <>
      <circle cx={x} cy={y} fill={colPrim} r={radius} stroke={colStroke} strokeWidth={2} />
      <circle
        cx={x + offX}
        cy={y + offY}
        fill={valueButton > 0 ? colAlt : colSec}
        r={radius * 0.5}
        stroke="none"
        strokeWidth={2}
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
}): React.ReactElement {
  const dispItems = [];

  for (const mappingA of props.displayMapping) {
    if (mappingA.type === "button") {
      const mapping = mappingA as ButtonConfig;
      const index = mapping.button;
      const text = mapping.text;
      const x = mapping.x;
      const y = mapping.y;
      const radius = 18;
      const buttonVal = props.joy?.buttons[index] ?? 0;

      dispItems.push(generateButton(buttonVal, x, y, text, radius));
    } else if (mappingA.type === "bar") {
      const mapping = mappingA as BarConfig;
      const axis = mapping.axis;
      const x = mapping.x;
      const y = mapping.y;
      const rot = mapping.rot;
      const axVal = props.joy?.axes[axis] ?? 0;
      dispItems.push(generateBar(axVal, x, y, rot));
    } else if (mappingA.type === "stick") {
      const mapping = mappingA as StickConfig;
      const axisX = mapping.axisX;
      const axisY = mapping.axisY;
      const button = mapping.button;
      const x = mapping.x;
      const y = mapping.y;
      const axXVal = props.joy?.axes[axisX] ?? 0;
      const axYVal = props.joy?.axes[axisY] ?? 0;
      const buttonVal = props.joy?.buttons[button] ?? 0;
      dispItems.push(generateStick(axXVal, axYVal, buttonVal, x, y, 30));
    } else if (mappingA.type === "d-pad") {
      const mapping = mappingA as DPadConfig;
      const axisX = mapping.axisX;
      const axisY = mapping.axisY;
      const x = mapping.x;
      const y = mapping.y;
      const axXVal = props.joy?.axes[axisX] ?? 0;
      const axYVal = props.joy?.axes[axisY] ?? 0;
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
