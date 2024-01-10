import {Joystick} from "./gamepad-event";

export interface GamepadTelemetryDto {
  [key: string]: number | undefined;

  A?: number;
  B?: number;
  X?: number;
  Y?: number;

  UP?: number;
  DOWN?: number;
  LEFT?: number;
  RIGHT?: number;

  LT?: number;
  RT?: number;

  LB?: number;
  RB?: number;

  L3?: number;
  R3?: number;
}

export interface JoystickTelemetryDto {
  [key: string]: number | undefined | any;

  readonly side: Joystick;

  T?: number;
  B?: number;
  L?: number;
  R?: number;

  TL?: number;
  TR?: number;
  BL?: number;
  BR?: number;
}

export interface KeyboardTelemetryDto {
  [key: string]: number | undefined;

  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
  10?: number;
  11?: number;
  12?: number;
}

export interface TelemetryDto {
  [key: string]: JoystickTelemetryDto | any;

  readonly keyboard: KeyboardTelemetryDto;
  readonly gamepad: GamepadTelemetryDto;
  readonly LJ: JoystickTelemetryDto;
  readonly RJ: JoystickTelemetryDto;

}

export type TelemetrySection = 'gamepad' | 'joystick' | 'keyboard';
export type TelemetryRecordCallback = (telemetry: GamepadTelemetryDto | JoystickTelemetryDto | KeyboardTelemetryDto, section: TelemetrySection, button: string) => void;

/**
 * Service to measure amount of commands sent by user.
 * It records keyboard, gamepad and joysticks inputs.
 * It allows to {@link enable} / {@link disable} recording of commands.
 */
export class TelemetryService {
  private static readonly singleton: TelemetryService = new TelemetryService();

  private readonly _telemetry: TelemetryDto;

  private isRecording: boolean = true;
  private listener?: TelemetryRecordCallback;

  private constructor() {
    const json: string = localStorage.getItem('tbg3gp-telemetry') ?? '{}';
    const data: Partial<TelemetryDto> = JSON.parse(json);

    this._telemetry = {
      keyboard: data.keyboard ?? {},
      gamepad: data.gamepad ?? {},
      LJ: data.LJ ?? {side: 'left'},
      RJ: data.RJ ?? {side: 'right'}
    };
  }

  public static get instance(): TelemetryService {
    return TelemetryService.singleton;
  }

  get telemetry(): TelemetryDto {
    return {
      keyboard: {...this._telemetry.keyboard},
      gamepad: {...this._telemetry.gamepad},
      LJ: {...this._telemetry.LJ},
      RJ: {...this._telemetry.RJ},
    };
  }

  enable(): void {
    this.isRecording = true;
  }

  disable(): void {
    this.isRecording = false;
  }

  addCommand(command: string, section: TelemetrySection): void {
    if (!this.isRecording) {
      return;
    }
    let isLong: boolean = false;

    command = command.toUpperCase();
    if (command[0] === '+') {
      isLong = true;
      command = command.substring(1);
    }
    if (section === 'gamepad') {
      this.addButton(command, isLong);
    } else if (section === 'joystick') {
      const side: Joystick = command[1] === 'L' ? 'left' : 'right';
      const button: string = command.substring(2);

      this.addJoystick(side, button, isLong);
    } else if (section === 'keyboard') {
      this.addKey(command);
    }
  }

  private addKey(key: string): void {
    if (this._telemetry.keyboard[key] === undefined) {
      this._telemetry.keyboard[key] = 1;
    } else {
      this._telemetry.keyboard[key]!++;
    }
    this.update();
    this.listener?.call(this, this.telemetry.keyboard, 'keyboard', key);
  }

  private addButton(button: string, isLong: boolean): void {
    if (isLong) {
      button = `+${button}`;
    }
    if (this._telemetry.gamepad[button] === undefined) {
      this._telemetry.gamepad[button] = 1;
    } else {
      this._telemetry.gamepad[button]!++;
    }
    this.update();
    this.listener?.call(this, this.telemetry.gamepad, 'gamepad', button);
  }

  private addJoystick(side: Joystick, button: string, isLong: boolean): void {
    const joystick: string = side === 'left' ? 'LJ' : 'RJ';

    if (isLong) {
      button = `+${button}`;
    }
    if (this._telemetry[joystick][button] === undefined) {
      this._telemetry[joystick][button] = 1;
    } else {
      this._telemetry[joystick][button]!++;
    }
    this.update();
    this.listener?.call(this, this.telemetry[joystick], 'joystick', button);
  }

  /**
   * Define listener to call when a record is changed.
   * @param fn to callback.
   */
  setRecordListener(fn: TelemetryRecordCallback): void {
    this.listener = fn;
  }

  /**
   * Store changes in local storage.
   */
  private update(): void {
    const json: string = JSON.stringify(this._telemetry);

    localStorage.setItem('tbg3gp-telemetry', json);
  }

}
