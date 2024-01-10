import {Joystick} from "./gamepad-event";

export interface SettingsDto {
  // How long before a pressed button triggers a long command (in ms)?
  longPressDuration: number;

  // How long before a joystick move triggers a long command (in ms)?
  longMoveDuration: number;

  LJ: JoystickSettingsDto;
  RJ: JoystickSettingsDto;
}

export interface JoystickSettingsDto {
  // Maximum joystick's length to detect joystick in default position (dead zone). Default: 0.2
  deadThreshold: number;

  // Minimum joystick's length to detect joystick in active position. Default: 0.8
  activeThreshold: number;
}

/**
 * Service to get / update / save settings of this plugin, using browser's local storage.
 */
export class SettingsService {
  private static readonly singleton: SettingsService = new SettingsService();

  private readonly _settings: SettingsDto;

  private constructor() {
    const json: string = localStorage.getItem('tbg3gp') ?? '{}';
    const data: Partial<SettingsDto> = JSON.parse(json);

    this._settings = {
      longPressDuration: data.longPressDuration ?? 400,
      longMoveDuration: data.longMoveDuration ?? 400,
      LJ: {
        deadThreshold: data.LJ?.deadThreshold ?? 0.2,
        activeThreshold: data.LJ?.activeThreshold ?? 0.8
      },
      RJ: {
        deadThreshold: data.RJ?.deadThreshold ?? 0.2,
        activeThreshold: data.RJ?.activeThreshold ?? 0.8
      }
    };
  }

  public static get instance(): SettingsService {
    return SettingsService.singleton;
  }

  /**
   * Get current settings and update its content on user's changes.
   * Persist new values using {@link update}.
   */
  get settings(): SettingsDto {
    return this._settings;
  }

  get longPressDuration(): number {
    return this._settings.longPressDuration;
  }

  get longMoveDuration(): number {
    return this._settings.longMoveDuration;
  }

  getJoystick(side: Joystick): JoystickSettingsDto {
    if (side === 'left') {
      return this._settings.LJ;
    }
    return this._settings.RJ;
  }

  /**
   * Store changes in local storage.
   */
  update(): void {
    const json: string = JSON.stringify(this._settings);

    localStorage.setItem('tbg3gp', json);
  }

}
