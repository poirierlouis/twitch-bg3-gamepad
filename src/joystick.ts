import {Component} from "./component";
import {JOYSTICKStyles, JOYSTICKTemplate} from "./joystick-template";
import {Joystick} from "./gamepad-event";
import {JoystickSettingsDto, SettingsService} from "./settings-service";

export class JoystickComponent extends Component {

  private readonly settingsService: SettingsService = SettingsService.instance;

  private get $title(): HTMLDivElement {
    return this.$root.querySelector('.joystick .row:first-child')!;
  }

  private get $activeInput(): HTMLInputElement {
    return this.$root.querySelector(`.joystick input.active`)!;
  }

  private get $deadInput(): HTMLInputElement {
    return this.$root.querySelector(`.joystick input.dead`)!;
  }

  private get $mockup(): SVGElement {
    return this.$root.querySelector(`.joystick svg`)!;
  }

  constructor(private readonly side: Joystick,
              $parent: HTMLElement) {
    super(JOYSTICKStyles, JOYSTICKTemplate);
    this.build();
    $parent.appendChild(this.$root);
  }

  private onActiveChanged(settings: JoystickSettingsDto): void {
    const $input: HTMLInputElement = this.$activeInput;
    let threshold: number = parseFloat($input.value);

    if (threshold < 0.02) {
      threshold = 0.02;
      $input.value = '0.02';
    } else if (threshold > 0.99) {
      threshold = 0.99;
      $input.value = '0.99';
    }
    if (threshold <= settings.deadThreshold) {
      settings.deadThreshold = threshold - 0.01;
      this.$deadInput.value = `${settings.deadThreshold}`;
    }
    settings.activeThreshold = threshold;
    this.settingsService.update();
    this.update(settings);
  }

  private onDeadChanged(settings: JoystickSettingsDto): void {
    const $input: HTMLInputElement = this.$deadInput;
    let threshold: number = parseFloat($input.value);

    if (threshold < 0.01) {
      threshold = 0.01;
      $input.value = '0.01';
    } else if (threshold > 0.98) {
      threshold = 0.98;
      $input.value = '0.98';
    }
    if (threshold >= settings.activeThreshold) {
      settings.activeThreshold = threshold + 0.01;
      this.$activeInput.value = `${settings.activeThreshold}`;
    }
    settings.deadThreshold = threshold;
    this.settingsService.update();
    this.update(settings);
  }

  private update(settings: JoystickSettingsDto): void {
    const $mockup: SVGElement = this.$mockup;
    const $active: SVGCircleElement = $mockup.querySelector('g#area circle')!;
    const $dead: SVGCircleElement = $mockup.querySelector('g#dead circle')!;

    $active.setAttribute('r', `${Math.floor(32 * settings.activeThreshold)}`);
    $dead.setAttribute('r', `${Math.floor(32 * settings.deadThreshold)}`);
  }

  protected build(): void {
    super.build();
    this.$title.textContent = (this.side === 'left') ? 'Gauche' : 'Droit';
    const settings: JoystickSettingsDto = this.settingsService.getJoystick(this.side);

    this.$activeInput.value = `${settings.activeThreshold}`;
    this.$deadInput.value = `${settings.deadThreshold}`;
    this.update(settings);

    this.$activeInput.addEventListener('focusout', this.onActiveChanged.bind(this, settings));
    this.$deadInput.addEventListener('focusout', this.onDeadChanged.bind(this, settings));
  }

}
