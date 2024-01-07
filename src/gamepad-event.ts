import {GAMEPAD_BUTTONS, GamepadInput, getJoystickButton} from "./gamepad-input";
import {Vector2} from "./vector2";

export interface ButtonReleasedEvent {
  readonly button: string;

  duration: number;
}

export interface JoystickMovedEvent {
  readonly side: Joystick;
  readonly button: string;

  duration: number;
}

export type Joystick = 'left' | 'right';

export interface JoystickEvent {
  readonly side: Joystick;
  readonly angle: number;
  readonly length: number;
  readonly timestamp: number;
}

export class JoystickEvents {
  private static readonly buttons: string[] = [
    'T', 'B', 'L', 'R', 'TL', 'TR', 'BL', 'BR'
  ];

  [key: string]: JoystickMovedEvent | any;

  T?: JoystickMovedEvent;
  B?: JoystickMovedEvent;
  L?: JoystickMovedEvent;
  R?: JoystickMovedEvent;

  TL?: JoystickMovedEvent;
  TR?: JoystickMovedEvent;
  BL?: JoystickMovedEvent;
  BR?: JoystickMovedEvent;

  getActiveButton(): string | undefined {
    for (const button of JoystickEvents.buttons) {
      if (this[button] !== undefined) {
        return button;
      }
    }
    return undefined;
  }

  /**
   * Reset all joystick events.
   */
  reset(): void {
    for (const button of JoystickEvents.buttons) {
      this[button] = undefined;
    }
  }
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

  private START?: ButtonReleasedEvent;

  private L3?: ButtonReleasedEvent;
  private R3?: ButtonReleasedEvent;

  private LJ: JoystickEvents = new JoystickEvents();
  private RJ: JoystickEvents = new JoystickEvents();

  private readonly queueButtons: ButtonReleasedEvent[] = [];
  private readonly queueJoysticks: JoystickMovedEvent[] = [];

  private lastInput?: GamepadInput;

  consumeInput(input: GamepadInput): void {
    const delta: number = (this.lastInput) ? input.timestamp - this.lastInput.timestamp : 1 / 60;

    for (const button of GAMEPAD_BUTTONS) {
      this.queueButton(input, button, delta);
    }
    const left: JoystickEvent = this.buildJoystickEvent('left', input.LJ);
    const right: JoystickEvent = this.buildJoystickEvent('right', input.RJ);

    this.queueJoystick('left', left, delta);
    this.queueJoystick('right', right, delta);
    this.lastInput = input;
  }

  /**
   * Pop first button event from queue or return undefined when queue is empty.
   */
  nextButton(): ButtonReleasedEvent | undefined {
    if (this.queueButtons.length === 0) {
      return undefined;
    }
    const event: ButtonReleasedEvent = this.queueButtons[0];

    this.queueButtons.splice(0, 1);
    return event;
  }

  /**
   * Pop first joystick event from queue or return undefined when queue is empty.
   */
  nextJoystick(): JoystickMovedEvent | undefined {
    if (this.queueJoysticks.length === 0) {
      return undefined;
    }
    const event: JoystickMovedEvent = this.queueJoysticks[0];

    this.queueJoysticks.splice(0, 1);
    return event;
  }

  private queueButton(input: GamepadInput, button: string, delta: number): void {
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
    } else if (this[button]) {
      this.queueButtons.push(this[button]);
      this[button] = undefined;
    }
  }

  private queueJoystick(side: Joystick, event: JoystickEvent, delta: number): void {
    const events: JoystickEvents = this[side === 'left' ? 'LJ' : 'RJ']!;
    const button: string = getJoystickButton(event);
    const activeButton: string | undefined = events.getActiveButton();

    if (this.isActive(event)) {
      if (events[button] === undefined) {
        events[button] = <JoystickMovedEvent>{
          side: side,
          button: button,
          duration: delta
        }
      } else {
        events[button]!.duration += delta;
      }
    } else if (this.isInDeadZone(event) && activeButton !== undefined) {
      this.queueJoysticks.push(events[activeButton]!);
      events.reset();
    }
  }

  /**
   * Whether joystick event is in dead zone? Below dead threshold.
   * @private
   */
  private isInDeadZone(event: JoystickEvent): boolean {
    return event.length < 0.2;
  }

  /**
   * Whether joystick event is outside dead zone and is active? Above activation threshold.
   * @private
   */
  private isActive(event: JoystickEvent): boolean {
    return event.length >= 0.8;
  }

  /**
   * Compute angle and vector's length.
   * @param position
   * @param side
   * @private
   */
  private buildJoystickEvent(side: Joystick, position: Vector2): JoystickEvent {
    let length: number = Math.sqrt(position.x * position.x + position.y * position.y);
    let angle: number = 0;

    if (position.x !== 0 && position.y !== 0) {
      angle = Math.atan2(position.y, position.x) * 180.0 / Math.PI;
    }
    return {
      side: side,
      angle: angle,
      length: length,
      timestamp: performance.now()
    };
  }

}
