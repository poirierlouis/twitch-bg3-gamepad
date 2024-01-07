import {GamepadInput} from "./gamepad-input";
import {ButtonReleasedEvent, GamepadEvents, JoystickMovedEvent} from "./gamepad-event";
import {GUI} from "./gui";

type ButtonReleasedEventCallback = (event: ButtonReleasedEvent) => void;
type JoystickMovedEventCallback = (event: JoystickMovedEvent) => void;

enum RandomizeCase {
  upper,
  lower,
  first,
  last,
  size
}

export class Plugin {
  // false to disable logging when building in release mode.
  private static readonly logging: boolean = false;

  private static longPressDuration: number = 400;
  private static longMovementDuration: number = 400;

  gamepad?: Gamepad;

  readonly gui: GUI = new GUI();

  private dropFirstCommand: boolean = true;
  private randomize: RandomizeCase = RandomizeCase.upper;
  private readonly events: GamepadEvents = new GamepadEvents();
  private readonly listeners: ButtonReleasedEventCallback[] = [];
  private readonly listenersJoystick: JoystickMovedEventCallback[] = [];

  static getLongPressDuration(): number {
    return this.longPressDuration;
  }

  static getLongMovementDuration(): number {
    return this.longMovementDuration;
  }

  static warn(message: string): void {
    if (!Plugin.logging) {
      return;
    }
    console.warn(message);
  }

  static log(message: string): void {
    if (!Plugin.logging) {
      return;
    }
    console.log(message);
  }

  /**
   * Push current input and consume it to build events.
   * Trigger listeners on released events.
   */
  pushInput(input: GamepadInput): void {
    this.events.consumeInput(input);
    this.dispatchButtons();
    this.dispatchMoves();
  }

  /**
   * Add listener on button released events.
   * @param fn to execute on event.
   */
  onReleased(fn: ButtonReleasedEventCallback): void {
    this.listeners.push(fn);
  }

  /**
   * Add listener on joystick moved events.
   * @param fn to execute on event.
   */
  onMoved(fn: JoystickMovedEventCallback): void {
    this.listenersJoystick.push(fn);
  }

  /**
   * Remove listener off button released events.
   * @param fn previously registered.
   */
  offReleased(fn: ButtonReleasedEventCallback): void {
    const listener: number = this.listeners.indexOf(fn);

    if (listener === -1) {
      return;
    }
    this.listeners.splice(listener, 1);
  }

  /**
   * Remove listener off joystick moved events.
   * @param fn previously registered.
   */
  offMoved(fn: JoystickMovedEventCallback): void {
    const listener: number = this.listenersJoystick.indexOf(fn);

    if (listener === -1) {
      return;
    }
    this.listeners.splice(listener, 1);
  }

  /**
   * Send message using UI.
   * @param message to send on chat.
   */
  async send(message: string): Promise<void> {
    if (this.dropFirstCommand) {
      this.dropFirstCommand = false;
      Plugin.log('<plugin (drop-command) />');
      return;
    }
    if (!this.gui.isChatAcquired) {
      return;
    }
    message = this.randomizeCommand(message);
    await this.gui.send(message);
    this.gui.updateLastCommand(message);
    setTimeout(this.detectChatError.bind(this), 300);
    this.randomize++;
    if (this.randomize === RandomizeCase.size) {
      this.randomize = 0;
    }
    Plugin.log(`<send command="${message}" />`);
  }

  /**
   * Test if an error occurred due to "spamming" chat. Reset input for next command.
   * @private
   */
  private async detectChatError(): Promise<void> {
    if (!this.gui.hasChatError) {
      return;
    }
    await this.gui.erase();
    const $close: HTMLButtonElement | null = this.gui.$closeChatErrorPopup;

    if (!$close) {
      return;
    }
    $close.click();
  }

  private dispatchButtons(): void {
    let event: ButtonReleasedEvent | undefined;

    while ((event = this.events.nextButton()) !== undefined) {
      const duration: number = event.duration / 1000;

      this.gui.updateLastInput(event.button);
      Plugin.log(`<event (released) button="${event.button}" duration="${duration.toFixed(2)} s" />`);
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }

  private dispatchMoves(): void {
    let event: JoystickMovedEvent | undefined;

    while ((event = this.events.nextJoystick()) !== undefined) {
      const duration: number = event.duration / 1000;
      const side: string = event.side === 'left' ? 'L' : 'R';

      this.gui.updateLastInput(event.button);
      Plugin.log(`<event (moved) side="${event.side}" button="M${side}${event.button}" duration="${duration.toFixed(2)} s" />`);
      for (const listener of this.listenersJoystick) {
        listener(event);
      }
    }
  }

  private randomizeCommand(message: string): string {
    const isNumber: number = parseInt(message);

    if (isNumber >= 1 && isNumber <= 12) {
      return message;
    }
    let offset: number = 0;

    if (message[0] === '+') {
      offset++;
    }
    let randomize: RandomizeCase = this.randomize;

    // Upper / Lower only when command is a single letter.
    if (message.length === 1) {
      randomize %= 2;
    }
    if (randomize === RandomizeCase.upper) {
      return message.toUpperCase();
    } else if (randomize === RandomizeCase.first) {
      return `${message.substring(0, offset + 1).toUpperCase()}${message.substring(offset + 1).toLowerCase()}`;
    } else if (randomize === RandomizeCase.last) {
      return `${message.substring(0, message.length - 1).toLowerCase()}${message.substring(message.length - 1).toUpperCase()}`;
    } else {
      return message.toLowerCase();
    }
  }

}

export const plugin: Plugin = new Plugin();
