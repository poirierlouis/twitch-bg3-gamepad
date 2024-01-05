import {GamepadInput} from "./gamepad-input";
import {ButtonReleasedEvent, GamepadEvents, JoystickMovedEvent} from "./gamepad-event";
import {GUI} from "./gui";

type ButtonReleasedEventCallback = (event: ButtonReleasedEvent) => void;
type JoystickMovedEventCallback = (event: JoystickMovedEvent) => void;

export class Plugin {
  // false to disable logging when building in release mode.
  private static readonly logging: boolean = false;

  private static longPressDuration: number = 400;
  private static longMovementDuration: number = 400;

  gamepad?: Gamepad;
  input?: GamepadInput;

  readonly gui: GUI = new GUI();

  private ws?: WebSocket;
  private readonly events: GamepadEvents = new GamepadEvents();
  private readonly listeners: ButtonReleasedEventCallback[] = [];
  private readonly listenersJoystick: JoystickMovedEventCallback[] = [];

  /**
   * Whether web socket is acquired?
   * @private
   */
  private get isConnected(): boolean {
    return !!this.ws;
  }

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
    this.input = input;
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
   * Whether IRC web socket is already registered internally.
   */
  hasWebSocket(): boolean {
    return !!this.ws;
  }

  /**
   * Register web socket.
   * @param ws
   */
  addWebSocket(ws: WebSocket): void {
    if (ws.url !== 'wss://irc-ws.chat.twitch.tv/') {
      return;
    }
    this.ws = ws;
    this.gui.setWebSocket();
    Plugin.log(`<plugin (websocket) />`);
  }

  /**
   * Send message using UI.
   * @param message to send on chat.
   */
  async send(message: string): Promise<void> {
    /*
    if (!this.isConnected) {
      return;
    }
    */
    await this.gui.send(message);
    this.gui.updateLastCommand(message);
    Plugin.log(`<chat message="${message}" />`);
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

}

export const plugin: Plugin = new Plugin();
