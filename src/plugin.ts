import {ButtonReleasedEvent, JoystickMovedEvent} from "./gamepad-event";
import {GUI} from "./gui";
import {GamepadService} from "./gamepad-service";

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

  // Map digit characters using AZERTY keyboard.
  private static readonly digits: string = `&é"'(-è_çà)=`;

  private readonly gui: GUI = new GUI();
  private readonly gamepadService: GamepadService = new GamepadService(this.gui);

  private dropFirstCommand: boolean = true;
  private randomize: RandomizeCase = RandomizeCase.upper;

  static getLongPressDuration(): number {
    return this.longPressDuration;
  }

  static getLongMovementDuration(): number {
    return this.longMovementDuration;
  }

  constructor() {
    if (!Plugin.logging) {
      console.log = () => {};
      console.warn = () => {};
    }
    this.gamepadService.addConnectionListener(this.onConnected.bind(this));
    this.gamepadService.addDisconnectionListener(this.onDisconnected.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  start(): void {
    this.gamepadService.start();
    console.log('<plugin (start) />');
  }

  /**
   * Send message using UI.
   * @param message to send on chat.
   */
  private async send(message: string): Promise<void> {
    if (this.dropFirstCommand) {
      this.dropFirstCommand = false;
      console.log('<plugin (drop-command) />');
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
    console.log(`<send command="${message}" />`);
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

  private onConnected(): void {
    this.gui.setGamepad(true);
    this.gamepadService.addButtonListener(this.onButtonReleased.bind(this));
    this.gamepadService.addJoystickListener(this.onJoystickMoved.bind(this));
  }

  private onDisconnected(): void {
    this.gui.setGamepad(false);
    this.gui.updateLastInput('N/A');
  }

  private onButtonReleased(event: ButtonReleasedEvent): void {
    if (event.button === 'START') {
      this.gui.toggleVisibility();
      return;
    }
    let command: string = event.button;

    if (event.duration >= Plugin.getLongPressDuration()) {
      command = `+${command}`;
    }
    this.send(command);
  }

  private onJoystickMoved(event: JoystickMovedEvent): void {
    let command: string = `M${event.side === 'left' ? 'L' : 'R'}${event.button}`;

    if (event.duration >= Plugin.getLongMovementDuration()) {
      command = `+${command}`;
    }
    this.send(command);
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (!Plugin.digits.includes(event.key)) {
      return;
    }
    const digit: number = Plugin.digits.indexOf(event.key) + 1;

    this.gui.updateLastInput(digit.toString());
    this.send(digit.toString());
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
