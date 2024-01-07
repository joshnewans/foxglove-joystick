export function GamepadDebug(props: any) {
  const gamepadDisplay = Object.keys(props.gamepads).map((gamepadId) => {
    return (
      <div>
        <h2>{props.gamepads[gamepadId].id}</h2>
        {props.gamepads[gamepadId].buttons?.map((button: any, index: any) => (
          <div>
            {index}: {button.pressed ? "True" : "False"}
          </div>
        ))}
        {props.gamepads[gamepadId].axes?.map((axis: any, index: any) => (
          <div>
            {index}: {axis}
          </div>
        ))}
      </div>
    );
  });

  return <div>{gamepadDisplay}</div>;
}
