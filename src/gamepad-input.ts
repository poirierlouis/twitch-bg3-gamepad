import {Vector2} from "./vector2";
import {JoystickEvent} from "./gamepad-event";

export interface GamepadInput {

  [key: string]: boolean | any;

  readonly A: boolean;
  readonly B: boolean;
  readonly X: boolean;
  readonly Y: boolean;

  readonly UP: boolean;
  readonly DOWN: boolean;
  readonly LEFT: boolean;
  readonly RIGHT: boolean;

  readonly LT: boolean;
  readonly RT: boolean;

  readonly LB: boolean;
  readonly RB: boolean;

  readonly START: boolean;

  readonly L3: boolean;
  readonly R3: boolean;

  readonly LJ: Vector2;
  readonly RJ: Vector2;

  readonly timestamp: number;

}

interface GamepadBind {
  readonly index: number;
  readonly button: string;
}

interface JoystickBind {
  readonly min: number;
  readonly max: number;
  readonly button: string;
}

const GAMEPAD_BINDING: GamepadBind[] = [
  {index: 0, button: 'A'},
  {index: 1, button: 'B'},
  {index: 2, button: 'X'},
  {index: 3, button: 'Y'},

  {index: 12, button: 'UP'},
  {index: 13, button: 'DOWN'},
  {index: 14, button: 'LEFT'},
  {index: 15, button: 'RIGHT'},

  {index: 4, button: 'LT'},
  {index: 5, button: 'RT'},

  {index: 6, button: 'LB'},
  {index: 7, button: 'RB'},

  {index: 9, button: 'START'},

  {index: 10, button: 'L3'},
  {index: 11, button: 'R3'}
];

const JOYSTICK_BINDING: JoystickBind[] = [
  {min: -22.5, max: 22.5, button: 'R'},
  {min: -67.5, max: -22.5, button: 'BR'},
  {min: -112.5, max: -67.5, button: 'B'},
  {min: -157.5, max: -112.5, button: 'BL'},
  //{min: 157.5, max: -157.5, button: 'L'},
  {min: 112.5, max: 157.5, button: 'TL'},
  {min: 67.5, max: 112.5, button: 'T'},
  {min: 22.5, max: 67.5, button: 'TR'},
];

export const GAMEPAD_BUTTONS: string[] = GAMEPAD_BINDING.map((bind) => bind.button);

function isButtonPressed(button: GamepadButton): boolean {
  if (typeof button === "object") {
    return button.pressed;
  }
  return button === 1.0;
}

/**
 * Get virtual button's name based on joystick position. Length must be above activation threshold.
 * See https://i.imgur.com/MWPs3ZX.png
 * @param event
 */
export function getJoystickButton(event: JoystickEvent): string {
  for (const bind of JOYSTICK_BINDING) {
    if (event.angle >= bind.min && event.angle <= bind.max) {
      return bind.button;
    }
  }
  return 'L';
}

/**
 * Get current gamepad input states.
 * @param gamepad to bind button states to a {@link GamepadInput}.
 */
export function getInput(gamepad: Gamepad): GamepadInput {
  const input: any = {
    LJ: {x: 0, y: 0},
    RJ: {x: 0, y: 0},
    timestamp: performance.now()
  };

  for (const bind of GAMEPAD_BINDING) {
    input[bind.button] = isButtonPressed(gamepad.buttons[bind.index]);
  }
  input.LJ.x = gamepad.axes[0];
  input.LJ.y = gamepad.axes[1] * -1;
  input.RJ.x = gamepad.axes[2];
  input.RJ.y = gamepad.axes[3] * -1;
  return input as GamepadInput;
}
