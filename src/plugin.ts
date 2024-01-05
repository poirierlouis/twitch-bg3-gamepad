import {GamepadInput} from "./gamepad-input";
import {ButtonReleasedEvent, GamepadEvents} from "./gamepad-event";
import {GUI} from "./gui";

type ButtonReleasedEventCallback = (event: ButtonReleasedEvent) => void;

export class Plugin {
  private static readonly channel: string = 'alphacast';
  private static readonly charsets: string = 'abcdef0123456789';
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
   * Send message through IRC web socket.
   * @param message to send on chat.
   */
  send(message: string): void {
    if (!this.isConnected) {
      return;
    }
    const nonce: string = this.generateNonce();

    this.ws!.send(`@client-nonce=${nonce} PRIVMSG #${Plugin.channel} :${message}`);
    this.gui.updateLastCommand(message);
    Plugin.log(`<websocket nonce="${nonce}" message="${message}" />`);
  }

  /**
   * Example: 440b0ac6878756247927f996f99d7100
   *
   * @param length
   * @private
   */
  private generateNonce(length: number = 32): string {
    let nonce: string = '';

    for (let i: number = 0; i < length; i++) {
      let j: number = Math.floor(Math.random() * Plugin.charsets.length);

      nonce += Plugin.charsets[j];
    }
    return nonce;
  }

}

export const plugin: Plugin = new Plugin();
