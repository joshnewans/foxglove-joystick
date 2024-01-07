import mapping1 from "./mapping1.json";

export function GamepadView(props: any) {
  interface mappingType {
    [key: number]: number[];
  }

  // console.log(mapping1);

  const buttonDisplayMapping: mappingType = mapping1["buttons"];
  const axisDisplayMapping: mappingType = mapping1["axes"];

  // const buttonDisplayMapping: mappingType = {
  //   0: [397, 276],
  //   1: [430, 242],
  //   3: [363, 242],
  //   4: [397, 210],
  //   6: [121, 131],
  //   7: [393, 131],
  //   8: [121, 97],
  //   9: [393, 97],
  //   10: [211, 242],
  //   11: [302, 242],
  //   13: [184, 377],
  //   14: [329, 377],
  // };
  // const axisDisplayMapping: mappingType = {
  //   0: [184, 308],
  //   1: [184, 308, 90],
  //   2: [329, 308],
  //   3: [329, 308, 90],
  //   4: [395, 60],
  //   5: [119, 60],
  //   6: [117, 243],
  //   7: [117, 243, 90],
  // };

  const buttons = props.joy
    ? props.joy.buttons.map((item: number, index: number) => {
        const size = 36;
        const radius = size / 2;

        const cc = buttonDisplayMapping[index];

        const xi = index % 4;
        const yi = Math.floor(index / 4);
        // const cx = size/2 + xi*(size + 5);
        // const cy = size/2 + yi*(size + 5);

        // const cx = cc ? cc[0] : size/2 + xi*(size + 5);
        // const cy = cc ? cc[1] : size/2 + yi*(size + 5);

        const cx = cc ? cc[0] : -100;
        const cy = cc ? cc[1] : -100;

        return (
          <>
            <circle
              className="svg-pi-track"
              cx={cx}
              cy={cy}
              fill={props.joy && props.joy.buttons[index] > 0 ? "red" : "blue"}
              r={radius}
              stroke="#ddd"
              strokeWidth={2}
            />
            <text textAnchor="middle" x={cx} y={cy} fill="white" dominantBaseline="middle">
              {index}
            </text>
          </>
        );
      })
    : [];

  const axes = props.joy
    ? props.joy.axes.map((item: number, index: number) => {
        const cc = axisDisplayMapping[index];

        // const xi = index % 4;
        // const yi = Math.floor(index / 4);
        // const cx = center + xi*(size + 5);
        // const cy = center + yi*(size + 5);

        // const cx = cc ? cc[0] : center + xi*(size + 5);
        // const cy = cc ? cc[1] : center + yi*(size + 5);

        const width = 80;
        const height = 10;
        const fracwidth = ((item + 1) * width) / 2;
        const cx = cc ? (cc[0] ? cc[0] : -100) : -100;
        const cy = cc ? (cc[1] ? cc[1] : -100) : -100;
        const rot = cc ? (cc[2] ? cc[2] : 0) : 0;

        const transform =
          "translate(" + cx.toString() + "," + cy.toString() + ") rotate(" + rot.toString() + ")";

        return (
          <>
            <rect
              width={fracwidth}
              height={height}
              x={-width / 2}
              y={-height / 2}
              fill="blue"
              transform={transform}
            />

            <rect
              width={width}
              height={height}
              x={-width / 2}
              y={-height / 2}
              fill="transparent"
              stroke="white"
              transform={transform}
            />
          </>
        );
      })
    : [];

  return (
    <div>
      <svg viewBox="0 0 512 512">
        <path
          d="m479.773 341.108-7.3-107.083c-.037 0-.037 0-.061-.013-.22-9.51-2.222-18.567-5.75-26.844v-.012c-4.248-13.477-21.18-31.813-25.171-34.755-4.005-2.93-4.627-4.712-6.129-12.976-2.856-17.14-7.385-27.455-13.16-27.552 0-10.462-22.57-11.048-29.407-10.962-6.873-.074-29.432.5-29.432 10.962-5.774.097-10.315 10.413-13.135 27.552-.452 2.43-.818 4.26-1.221 5.762H162.648c-.403-1.502-.769-3.333-1.196-5.762-2.857-17.14-7.373-27.455-13.172-27.552 0-10.462-22.572-11.048-29.408-10.962-6.86-.074-29.42.5-29.42 10.962-5.786.097-10.315 10.413-13.147 27.552-1.514 8.264-2.136 10.047-6.128 12.976-4.004 2.942-20.948 21.278-25.184 34.755v.012c-3.528 8.277-5.542 17.335-5.774 26.844 0 .013-.025.013-.037.013L31.87 341.108c-.037.867-.073 1.77-.073 2.625 0 26.16 21.192 47.365 47.352 47.365 16.871 0 31.69-8.838 40.065-22.12l.012.024 25.88-38.343c8.118 11.707 21.668 19.36 37.013 19.36 21.119 0 38.82-14.502 43.69-34.131h60.024c4.871 19.617 22.596 34.132 43.679 34.132 15.369 0 28.907-7.654 37.013-19.361l25.892 38.343.036-.024c8.387 13.294 23.17 22.12 40.04 22.12 26.161 0 47.366-21.205 47.366-47.365.012-.867-.037-1.758-.086-2.625z"
          style={{
            fill: "none",
            stroke: "#ff0",
            strokeWidth: 5,
          }}
        />
        {buttons}
        {axes}
      </svg>
    </div>
  );
}
