import {GAMEPAD_BUTTONS, GamepadInput} from "./gamepad-input";

export interface ButtonReleasedEvent {
  readonly button: string;
  readonly duration: number;
}

export class GamepadEvents {

  [key: string]: ButtonReleasedEvent | any;

  private A?: ButtonReleasedEvent;
  private B?: ButtonReleasedEvent;
  private X?: ButtonReleasedEvent;
  private Y?: ButtonReleasedEvent;

  private UP?: ButtonReleasedEvent;
  private DOWN?: ButtonReleasedEvent;
  private LEFT?: ButtonReleasedEvent;
  private RIGHT?: ButtonReleasedEvent;

  private LT?: ButtonReleasedEvent;
  private RT?: ButtonReleasedEvent;

  private LB?: ButtonReleasedEvent;
  private RB?: ButtonReleasedEvent;

  private L3?: ButtonReleasedEvent;
  private R3?: ButtonReleasedEvent;

  readonly queue: ButtonReleasedEvent[] = [];

  consumeInput(input: GamepadInput, previous?: GamepadInput): void {
    const delta: number = (previous) ? input.timestamp - previous.timestamp : 1 / 60;

    for (const button of GAMEPAD_BUTTONS) {
      const isPressed: boolean = input[button];

      if (isPressed) {
        if (this[button] === undefined) {
          this[button] = <ButtonReleasedEvent>{
            button: button,
            duration: delta
          };
        } else {
          this[button].duration += delta;
        }
      } else if (!isPressed && this[button]) {
        this.queue.push(this[button]);
        this[button] = undefined;
      }
    }
  }

  /**
   * Pop first event from queue or return undefined when queue is empty.
   */
  pop(): ButtonReleasedEvent | undefined {
    if (this.queue.length === 0) {
      return undefined;
    }
    const event: ButtonReleasedEvent = this.queue[0];

    this.queue.splice(0, 1);
    return event;
  }

}
