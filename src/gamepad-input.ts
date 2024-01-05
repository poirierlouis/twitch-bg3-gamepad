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

  readonly L3: boolean;
  readonly R3: boolean;

  readonly timestamp: number;

}

interface GamepadBind {
  readonly index: number;
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

  {index: 10, button: 'L3'},
  {index: 11, button: 'R3'},

  /*
  {index: 0, button: ''},
  {index: 0, button: ''},
  {index: 0, button: ''},
  {index: 0, button: ''},
  */
];

export const GAMEPAD_BUTTONS: string[] = GAMEPAD_BINDING.map((bind) => bind.button);

function isButtonPressed(button: GamepadButton): boolean {
  if (typeof button === "object") {
    return button.pressed;
  }
  return button === 1.0;
}

/**
 * Get current gamepad input states.
 * @param gamepad to bind button states to a {@link GamepadInput}.
 */
export function getInput(gamepad: Gamepad): GamepadInput {
  const input: any = {
    timestamp: performance.now()
  };

  for (const bind of GAMEPAD_BINDING) {
    input[bind.button] = isButtonPressed(gamepad.buttons[bind.index]);
  }
  return input as GamepadInput;
}
