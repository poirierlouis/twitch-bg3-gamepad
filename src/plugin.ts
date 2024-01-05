import {GamepadInput} from "./gamepad-input";
import {ButtonReleasedEvent, GamepadEvents} from "./gamepad-event";
import {GUI} from "./gui";

type ButtonReleasedEventCallback = (event: ButtonReleasedEvent) => void;

export class Plugin {
  public static readonly version: string = '1.0.0';

  // false to disable logging when building in release mode.
  private static readonly logging: boolean = false;

  private static longPressDuration: number = 400;

  gamepad?: Gamepad;
  input?: GamepadInput;
  lastInput?: GamepadInput;

  readonly gui: GUI = new GUI();

  private ws?: WebSocket;
  private readonly events: GamepadEvents = new GamepadEvents();
  private readonly listeners: ButtonReleasedEventCallback[] = [];

  static getLongPressDuration(): number {
    return this.longPressDuration;
  }

  /**
   * Whether web socket is acquired?
   * @private
   */
  private get isConnected(): boolean {
    return !!this.ws;
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
    this.lastInput = this.input;
    this.input = input;
    this.events.consumeInput(input, this.lastInput);
    const event: ButtonReleasedEvent | undefined = this.events.pop();

    if (!event) {
      return;
    }
    const duration: number = event.duration / 1000;

    this.gui.updateLastInput(event.button);
    Plugin.log(`<event (released) button="${event.button}" duration="${duration.toFixed(2)} s" />`);
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /**
   * Add listener on button released events.
   * @param fn to execute on event.
   */
  onReleased(fn: ButtonReleasedEventCallback): void {
    this.listeners.push(fn);
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

}

export const plugin: Plugin = new Plugin();
