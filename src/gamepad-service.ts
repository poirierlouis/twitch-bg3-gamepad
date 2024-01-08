import {GamepadInput, getInput} from "./gamepad-input";
import {ButtonReleasedEvent, GamepadEvents, JoystickMovedEvent} from "./gamepad-event";
import {GUI} from "./gui";

type ConnectionEventCallback = (gamepad: Gamepad) => void;
type DisconnectionEventCallback = (gamepad: Gamepad) => void;
type ButtonReleasedEventCallback = (event: ButtonReleasedEvent) => void;
type JoystickMovedEventCallback = (event: JoystickMovedEvent) => void;

/**
 * Service to detect a gamepad, listen for inputs and trigger custom gamepad events.
 */
export class GamepadService {

  // Current connected gamepad, undefined otherwise.
  private gamepad?: Gamepad;

  // Interval handler to poll events, Chrome only.
  private pollID?: number;

  private readonly events: GamepadEvents = new GamepadEvents();
  private readonly listenersConnection: ConnectionEventCallback[] = [];
  private readonly listenersDisconnection: DisconnectionEventCallback[] = [];
  private readonly listenersButton: ButtonReleasedEventCallback[] = [];
  private readonly listenersJoystick: JoystickMovedEventCallback[] = [];

  /**
   * Whether browser support Gamepad API?
   */
  private static isCompatible(): boolean {

    return !!navigator.getGamepads;
  }

  /**
   * Whether browser emit events to detect a gamepad?
   */
  private static canListenGamepadEvents(): boolean {
    return 'ongamepadconnected' in window;
  }

  constructor(private readonly gui: GUI) {
  }

  /**
   * Start service to listen for gamepad events and inputs.
   */
  start(): void {
    if (!GamepadService.isCompatible()) {
      console.error('Your browser doesn\'t support the Gamepad API. Please make sure to update it to the latest ' +
        'version. Chrome / Firefox / Edge are valid candidates.');
      return;
    }
    if (!GamepadService.canListenGamepadEvents()) {
      this.pollID = setInterval(this.poll.bind(this), 500);
      console.log('<gamepad (poll) />');
    } else {
      window.addEventListener('gamepadconnected', this.onConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.onDisconnected.bind(this));
    }
  }

  addConnectionListener(fn: ConnectionEventCallback): void {
    this.listenersConnection.push(fn);
  }

  addDisconnectionListener(fn: DisconnectionEventCallback): void {
    this.listenersDisconnection.push(fn);
  }

  addButtonListener(fn: ButtonReleasedEventCallback): void {
    this.listenersButton.push(fn);
  }

  addJoystickListener(fn: JoystickMovedEventCallback): void {
    this.listenersJoystick.push(fn);
  }

  /**
   * Listen for gamepad inputs.
   */
  private listen(): void {
    const gamepads: Gamepad[] = navigator.getGamepads() as Gamepad[];

    if (gamepads.length === 0) {
      console.log('<gamepad (release) />');
      return;
    }
    const gamepad: Gamepad | null = gamepads[0];

    if (!gamepad) {
      return;
    }
    this.gamepad = gamepad;
    const input: GamepadInput = getInput(gamepad);

    this.pushInput(input);
    requestAnimationFrame(this.listen.bind(this));
  }

  /**
   * Listen for gamepad array to manually trigger a connection/disconnection, Chrome only.
   */
  private poll(): void {
    const gamepads: Gamepad[] = navigator.getGamepads() as Gamepad[];

    if (gamepads.length === 0) {
      return;
    }
    const gamepad: Gamepad | null = gamepads[0];

    if (!gamepad) {
      this.onDisconnected(<any>{gamepad: gamepad});
    } else if (this.gamepad === undefined) {
      this.onConnected(<any>{gamepad: gamepad});
    }
  }

  /**
   * Push current input and consume it to build events.
   * Trigger listeners on released events.
   */
  private pushInput(input: GamepadInput): void {
    this.events.consumeInput(input);
    this.dispatchButtons();
    this.dispatchMoves();
  }

  /**
   * Register gamepad on connection event.
   * Start listening for gamepad inputs.
   */
  private onConnected(event: GamepadEvent): void {
    const gamepad: Gamepad = event.gamepad;

    if (this.gamepad) {
      console.warn('<gamepad (connected) error="Only the first gamepad will be used." />');
      return;
    }
    this.gamepad = gamepad;
    console.log(`<gamepad (connected) index="${gamepad.index}" id="${gamepad.id}" />`);
    console.log(`  <buttons size="${gamepad.buttons.length}" />`);
    console.log(`  <axes size="${gamepad.axes.length}" />`);
    this.listenersConnection.forEach((listener) => listener(gamepad));
    this.listen();
    console.log('<gamepad (listen) />');
  }

  /**
   * Release gamepad on disconnection event.
   * Stop listening for gamepad inputs.
   */
  private onDisconnected(event: GamepadEvent): void {
    const gamepad: Gamepad | null = event.gamepad;

    if (!this.gamepad) {
      return;
    }
    if (gamepad !== null && this.gamepad.index !== gamepad.index) {
      return;
    }
    this.gamepad = undefined;
    this.listenersDisconnection.forEach((listener) => listener(gamepad));
    this.listenersButton.length = 0;
    this.listenersJoystick.length = 0;
    console.log(`<gamepad (disconnected) />`);
  }

  private dispatchButtons(): void {
    let event: ButtonReleasedEvent | undefined;

    while ((event = this.events.nextButton()) !== undefined) {
      const duration: number = event.duration / 1000;

      this.gui.updateLastInput(event.button);
      console.log(`<gamepad (event) button="${event.button}" duration="${duration.toFixed(2)} s" />`);
      this.listenersButton.forEach((listener) => listener(event!));
    }
  }

  private dispatchMoves(): void {
    let event: JoystickMovedEvent | undefined;

    while ((event = this.events.nextJoystick()) !== undefined) {
      const duration: number = event.duration / 1000;
      const side: string = event.side === 'left' ? 'L' : 'R';

      this.gui.updateLastInput(`${side} (${event.button})`);
      console.log(`<gamepad (event) side="${event.side}" button="M${side}${event.button}" duration="${duration.toFixed(2)} s" />`);
      this.listenersJoystick.forEach((listener) => listener(event!));
    }
  }

}
