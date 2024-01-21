import { useCallback, useEffect, useRef } from "react";


export function useGamepad(
    {didConnect, didDisconnect, didUpdate}: {
        didConnect: (gamepad: Gamepad) => void,
        didDisconnect: (gamepad: Gamepad) => void,
        didUpdate: (gamepad: Gamepad) => void,
    }
): void {
    // MDN says that valid request IDs are non-zero, so we use zero to indicate
    // that there is no pending animation request.
    const animationRequestId = useRef<number>(0);

    const onAnimationFrame = useCallback(() => {
        let gamepadCount = 0;

        for (const gamepad of navigator.getGamepads()) {
            if (gamepad == null) continue;
            didUpdate(gamepad);
            gamepadCount ++;
        }

        // Reschedule for the next animation frame if there are any gamepads
        animationRequestId.current = (gamepadCount === 0) ? 0 :
            window.requestAnimationFrame(onAnimationFrame);
    }, [didUpdate]);

    // onAnimationFrame reschedules itself, and the reference to itself can
    // become stale as dependencies change. When this happens, cancel the old
    // function and schedule the new one. (Thanks Adam!)
    useEffect(() => {
        if (animationRequestId.current !== 0) {
            window.cancelAnimationFrame(animationRequestId.current);
        }

        animationRequestId.current = 
            window.requestAnimationFrame(onAnimationFrame);
    }, [onAnimationFrame]);

    const onConnect = useCallback((event: GamepadEvent) => {
        didConnect(event.gamepad);

        // Schedule an animation frame if there is not already one pending
        if (animationRequestId.current === 0) {
            animationRequestId.current =
                window.requestAnimationFrame(onAnimationFrame);
        }
    }, [didConnect, onAnimationFrame]);

    const onDisconnect = useCallback((event: GamepadEvent) => {
        didDisconnect(event.gamepad);
    }, [didDisconnect]);

    // Register event listeners for gamepad connection and disconnection, and
    // unregister them when the component unmounts.
    useEffect(() => {
        window.addEventListener("gamepadconnected", onConnect);
        window.addEventListener("gamepaddisconnected", onDisconnect);
        return () => {
            window.removeEventListener("gamepadconnected", onConnect);
            window.removeEventListener("gamepaddisconnected", onDisconnect);
        };
    }, [onConnect, onDisconnect]);

    // Cancel any pending animation frames when the component unmounts
    useEffect(() => {
        return () => {
            if (animationRequestId.current !== 0) {
                window.cancelAnimationFrame(animationRequestId.current);
                animationRequestId.current = 0;
            }
        };
    }, []);
}
