import {Component} from "./component";
import {
  GamepadTelemetryDto,
  JoystickTelemetryDto,
  KeyboardTelemetryDto,
  TelemetryDto,
  TelemetrySection,
  TelemetryService
} from "./telemetry-service";
import {TELEMETRYStyles, TELEMETRYTemplate} from "./telemetry-template";
import {Joystick} from "./gamepad-event";

interface TelemetryRow {
  readonly $row: HTMLDivElement;
  readonly button: string;
  readonly simple: number;
  readonly long: number;
}

export class TelemetryComponent extends Component {

  private readonly telemetryService: TelemetryService = TelemetryService.instance;

  private readonly gamepad: TelemetryRow[] = [];
  private readonly LJ: TelemetryRow[] = [];
  private readonly RJ: TelemetryRow[] = [];
  private readonly keyboard: TelemetryRow[] = [];

  constructor($parent: HTMLElement) {
    super(TELEMETRYStyles, TELEMETRYTemplate);
    this.build();
    $parent.appendChild(this.$root);
  }

  toggleVisibility(): void {
    let isVisible: boolean = this.$root.style.display !== 'none';

    isVisible = !isVisible;
    this.$root.style.display = (isVisible) ? '' : 'none';
  }

  private get $btnExport(): HTMLSpanElement {
    return this.$root.querySelector('.icon')!;
  }

  private get $gamepad(): HTMLDivElement {
    return this.$root.querySelector('.table[gamepad] .tbody')!;
  }

  private get $LJ(): HTMLDivElement {
    return this.$root.querySelector('.table[joystick="left"] .tbody')!;
  }

  private get $RJ(): HTMLDivElement {
    return this.$root.querySelector('.table[joystick="right"] .tbody')!;
  }

  private get $keyboard(): HTMLDivElement {
    return this.$root.querySelector('.table[keyboard] .tbody')!;
  }

  private onExport(): void {
    const telemetry: TelemetryDto = this.telemetryService.telemetry;
    const file: Blob = new Blob([JSON.stringify(telemetry)]);
    const $link: HTMLAnchorElement = document.createElement('a');
    const url: string = URL.createObjectURL(file);

    $link.href = url;
    $link.download = 'nom-utilisateur-twitch.json';
    $link.click();
    URL.revokeObjectURL(url);
  }

  private onTelemetryChanged(telemetry: GamepadTelemetryDto | JoystickTelemetryDto | KeyboardTelemetryDto,
                             section: TelemetrySection,
                             button: string): void {
    if (section === 'gamepad') {
      this.updateGamepad(telemetry, button);
    } else if (section === 'joystick') {
      this.updateJoystick(telemetry as JoystickTelemetryDto, button);
    } else if (section === 'keyboard') {
      this.updateKeyboard(telemetry, button);
    }
  }

  private updateGamepad(telemetry: GamepadTelemetryDto, button: string): void {
    const isLong: boolean = button[0] === '+';
    const query: string = (isLong) ? button.substring(1) : button;
    const amount: number = telemetry[button] ?? 0;
    const data: TelemetryRow | undefined = this.gamepad.find((item) => item.button === query);

    if (!data) {
      console.warn(`<telemetry (gamepad) button="${button}" ${isLong ? 'long' : 'simple'}="${amount}" />`);
      return;
    }
    console.log(`<telemetry (gamepad) button="${button}" ${isLong ? 'long' : 'simple'}="${amount}" />`);
    const index: number = isLong ? 3 : 2;
    const $amount: HTMLParagraphElement = data.$row.querySelector(`div p:nth-child(${index})`)!;

    $amount.textContent = amount === 0 ? '-' : amount.toString();
  }

  private updateJoystick(telemetry: JoystickTelemetryDto, button: string): void {
    const isLong: boolean = button[0] === '+';
    const query: string = (isLong) ? button.substring(1) : button;
    const amount: number = telemetry[button] ?? 0;
    const data: TelemetryRow | undefined = this[telemetry.side === 'left' ? 'LJ' : 'RJ'].find((item) => item.button === query);

    if (!data) {
      console.warn(`<telemetry (joystick) side="${telemetry.side}" button="${button}" ${isLong ? 'long' : 'simple'}="${amount}" />`);
      return;
    }
    console.log(`<telemetry (joystick) side="${telemetry.side}" button="${button}" ${isLong ? 'long' : 'simple'}="${amount}" />`);
    const index: number = isLong ? 3 : 2;
    const $amount: HTMLParagraphElement = data.$row.querySelector(`div p:nth-child(${index})`)!;

    $amount.textContent = amount === 0 ? '-' : amount.toString();
  }

  private updateKeyboard(telemetry: KeyboardTelemetryDto, button: string): void {
    const amount: number = telemetry[button] ?? 0;
    const data: TelemetryRow | undefined = this.keyboard.find((item) => item.button === button);

    if (!data) {
      console.warn(`<telemetry (keyboard) button="${button}" simple="${amount}" />`);
      return;
    }
    console.log(`<telemetry (keyboard) button="${button}" simple="${amount}" />`);
    const $amount: HTMLParagraphElement = data.$row.querySelector(`div p:nth-child(2)`)!;

    $amount.textContent = amount === 0 ? '-' : amount.toString();
  }

  protected build(): void {
    super.build();
    this.buildGamepad();
    this.buildJoystick('left');
    this.buildJoystick('right');
    this.buildKeyboard();

    this.telemetryService.setRecordListener(this.onTelemetryChanged.bind(this));
    this.$btnExport.addEventListener('click', this.onExport.bind(this));
  }

  private buildGamepad(): void {
    [
      'A', 'B', 'X', 'Y', '',
      'UP', 'DOWN', 'LEFT', 'RIGHT', '',
      'LT', 'RT', '',
      'LB', 'RB', '',
      'L3', 'R3'
    ].forEach((button: string) => {
      let $row: HTMLDivElement;

      if (button.length === 0) {
        $row = this.buildTemplate(`<div class="divider"></div>`) as HTMLDivElement;
        this.$gamepad.append($row);
        return;
      }
      const simple: number = this.telemetryService.telemetry.gamepad[button] ?? 0;
      const long: number = this.telemetryService.telemetry.gamepad[`+${button}`] ?? 0;

      $row = this.buildTemplate(`<div class="row">
<p>${button}</p>
<p>${simple === 0 ? '-' : simple.toString()}</p>
<p>${long === 0 ? '-' : long.toString()}</p>
</div>`) as HTMLDivElement;

      const row: TelemetryRow = {
        $row: $row,
        button: button,
        simple: simple,
        long: long
      };

      this.gamepad.push(row);
      this.$gamepad.append($row);
    });
  }

  private buildJoystick(side: Joystick): void {
    const name: 'LJ' | 'RJ' = side === 'left' ? 'LJ' : 'RJ';
    const joystick: TelemetryRow[] = this[name]!;
    const $joystick: HTMLDivElement = this[side === 'left' ? '$LJ' : '$RJ']!;

    [
      'T', 'B', 'L', 'R', '',
      'TL', 'TR', 'BL', 'BR'
    ].forEach((button: string) => {
      let $row: HTMLDivElement;

      if (button.length === 0) {
        $row = this.buildTemplate(`<div class="divider"></div>`) as HTMLDivElement;
        $joystick.append($row);
        return;
      }
      const simple: number = this.telemetryService.telemetry[name][button] ?? 0;
      const long: number = this.telemetryService.telemetry[name][`+${button}`] ?? 0;

      $row = this.buildTemplate(`<div class="row">
<p>M${side === 'left' ? 'L' : 'R'}${button}</p>
<p>${simple === 0 ? '-' : simple.toString()}</p>
<p>${long === 0 ? '-' : long.toString()}</p>
</div>`) as HTMLDivElement;

      const row: TelemetryRow = {
        $row: $row,
        button: button,
        simple: simple,
        long: long
      };

      joystick.push(row);
      $joystick.append($row);
    });
  }

  private buildKeyboard(): void {
    [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
    ].forEach((button: string) => {
      let $row: HTMLDivElement;

      const simple: number = this.telemetryService.telemetry.keyboard[button] ?? 0;

      $row = this.buildTemplate(`<div class="row">
<p>${button}</p>
<p>${simple === 0 ? '-' : simple.toString()}</p>
</div>`) as HTMLDivElement;

      const row: TelemetryRow = {
        $row: $row,
        button: button,
        simple: simple,
        long: 0
      };

      this.keyboard.push(row);
      this.$keyboard.append($row);
    });
  }

  private buildTemplate(html: string): HTMLElement {
    const $template: HTMLTemplateElement = document.createElement('template');

    $template.innerHTML = html;
    return $template.content.children[0] as HTMLElement;
  }

}
