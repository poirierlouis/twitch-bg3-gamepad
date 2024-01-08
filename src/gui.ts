import {simulateBlur, simulateErase, simulatePaste, sleep} from "./simulate";
import {GUIStyles, GUITemplate} from "./gui-template";
import {Component} from "./component";

/**
 * Plugin's HTML template
 */
export class GUI extends Component {

  private isVisible: boolean = true;

  private get $gamepad(): HTMLParagraphElement {
    return this.$root.querySelector('[feedback] .gamepad')!;
  }

  private get $chat(): HTMLParagraphElement {
    return this.$root.querySelector('[feedback] .chat')!;
  }

  private get $lastCommand(): HTMLParagraphElement {
    return this.$root.querySelector('[feedback] .last-command')!;
  }

  private get $lastInput(): HTMLParagraphElement {
    return this.$root.querySelector('[feedback] .last-input')!;
  }

  private get $settings(): HTMLDivElement {
    return this.$root.querySelector('[settings]')!;
  }

  private get $btnToggleSettings(): HTMLDivElement {
    return this.$root.querySelector('.expand')!;
  }

  get $btnCloseChatPopup(): HTMLButtonElement | null {
    return document.querySelector('.chat-input-tray__open button[title="Close"]');
  }

  private readonly $chatInput: HTMLDivElement | null = document.querySelector('.chat-wysiwyg-input__editor');
  private readonly $chatSend: HTMLButtonElement | null = document.querySelector('button[data-a-target="chat-send-button"]');

  constructor() {
    super(GUIStyles, GUITemplate);
    this.build();
    if (this.isChatAcquired) {
      this.setChatAcquired();
    }
  }

  get isChatAcquired(): boolean {
    return this.$chatInput !== null && this.$chatSend !== null;
  }

  /**
   * Whether an error arisen when using chat?
   */
  get hasChatError(): boolean {
    return document.querySelector('.chat-input-tray__open') !== null;
  }

  setGamepad(isConnected: boolean): void {
    this.$gamepad.textContent = isConnected ? '🟢 Manette connectée' : '🔴 Manette en attente de connexion';
    if (isConnected) {
      this.$lastInput.classList.remove('disabled');
    } else {
      this.$lastInput.classList.add('disabled');
    }
  }

  setChatAcquired(): void {
    this.$chat.textContent = '🟢 Accès au chat obtenu';
    this.$lastCommand.style.color = '';
    this.$lastCommand.classList.remove('disabled');
  }

  updateLastInput(input: string): void {
    const $span: HTMLSpanElement = this.$lastInput.querySelector('span')!;

    $span.textContent = input;
  }

  updateLastCommand(command: string): void {
    const $span: HTMLSpanElement = this.$lastCommand.querySelector('span')!;

    $span.textContent = command;
  }

  async send(command: string): Promise<void> {
    if (!this.$chatInput || !this.$chatSend) {
      return;
    }
    await simulatePaste(this.$chatInput, command);
    await sleep(42);
    this.$chatSend.click();
    await sleep(42);
    this.$chatSend.click();
    await sleep(42);
    simulateBlur(this.$chatInput);
    await sleep(42);
    simulateBlur(this.$chatInput);
  }

  async erase(): Promise<void> {
    if (!this.$chatInput) {
      return;
    }
    await simulateErase(this.$chatInput);
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.$root.style.display = (this.isVisible) ? '' : 'none';
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (event.key !== '²') {
      return;
    }
    this.toggleVisibility();
  }

  private onToggleSettings(): void {
    let isVisible: boolean = this.$settings.style.display !== 'none';

    isVisible = !isVisible;
    this.$settings.style.display = (isVisible) ? '' : 'none';
    if (isVisible) {
      this.$btnToggleSettings.setAttribute('expanded', '');
    } else {
      this.$btnToggleSettings.removeAttribute('expanded');
    }
  }

  protected build(): void {
    super.build();
    document.head.appendChild(this.$styles);
    document.body.appendChild(this.$root);

    this.$settings.style.display = 'none';

    document.addEventListener('keyup', this.onKeyUp.bind(this));
    this.$btnToggleSettings.addEventListener('click', this.onToggleSettings.bind(this));
  }

}
