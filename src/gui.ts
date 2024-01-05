import {simulatePaste, sleep} from "./simulate";

/**
 * Plugin's HTML template
 */
export class GUI {

  private readonly $container: HTMLDivElement;
  private readonly $gamepad: HTMLParagraphElement;
  private readonly $ws: HTMLParagraphElement;
  private readonly $lastCommand: HTMLParagraphElement;
  private readonly $lastInput: HTMLParagraphElement;

  private readonly $chatInput: HTMLDivElement = document.querySelector('.chat-wysiwyg-input__editor')!;
  private readonly $chatSend: HTMLButtonElement = document.querySelector('button[data-a-target="chat-send-button"]')!;

  constructor() {
    this.$container = this.buildContainer();
    this.$gamepad = this.buildParagraph('🔴 Manette en attente de connexion');
    this.$ws = this.buildParagraph('🔴 Attente d\'envoi d\'un message au chat');
    this.$lastInput = this.buildParagraph('🎮 Dernière entrée : ', [], this.buildSpan('N/A'));
    this.$lastCommand = this.buildParagraph('💬 Dernière commande : ', [], this.buildSpan('N/A'));
    this.build();
  }

  setGamepad(isConnected: boolean): void {
    this.$gamepad.textContent = isConnected ? '🟢 Manette connectée' : '🔴 Manette en attente de connexion';
  }

  setWebSocket(): void {
    this.$ws.textContent = '🟢 Accès au chat obtenu';
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
    await simulatePaste(this.$chatInput, command);
    await sleep(42);
    this.$chatSend.click();
    await sleep(42);
    this.$chatSend.click();
  }

  private build(): void {
    this.$container.appendChild(this.buildTitle());
    this.$container.appendChild(this.buildAuthor());
    this.$container.appendChild(this.$gamepad);
    this.$container.appendChild(this.$ws);
    this.$container.appendChild(this.$lastInput);
    this.$container.appendChild(this.$lastCommand);
    document.body.appendChild(this.$container);
  }

  private buildContainer(): HTMLDivElement {
    const $container: HTMLDivElement = document.createElement('div');

    $container.style.zIndex = '9999';
    $container.style.position = 'absolute';
    $container.style.display = 'flex';
    $container.style.flexFlow = 'column';
    $container.style.width = '302px';
    $container.style.height = '212px';
    $container.style.margin = '8px';
    $container.style.padding = '8px';
    $container.style.color = 'white';
    $container.style.backgroundColor = '#000610';
    $container.style.border = '2px solid #ffb600';
    $container.style.borderRadius = '8px';
    return $container;
  }

  private buildTitle(): HTMLHeadElement {
    const $title: HTMLHeadElement = document.createElement('h3');

    $title.style.color = '#ffb600';
    $title.style.textAlign = 'center';
    $title.textContent = 'Twitch · BG3 · Gamepad';
    return $title;
  }

  private buildAuthor(): HTMLHeadElement {
    const $author: HTMLHeadElement = document.createElement('h5');

    $author.style.textAlign = 'center';
    $author.textContent = 'by Rayshader';
    return $author;
  }

  private buildSpan(content?: string): HTMLSpanElement {
    const $span: HTMLSpanElement = document.createElement('span');

    if (content) {
      $span.textContent = content;
    }
    return $span;
  }

  private buildParagraph(content: string, styles: any[] = [], child?: HTMLElement): HTMLParagraphElement {
    const $p: HTMLParagraphElement = document.createElement('p');

    $p.style.margin = '8px';
    for (const style of styles) {
      const key: string = Object.keys(style)[0];

      // @ts-ignore
      $p.style[key] = style[key];
    }
    $p.textContent = content;
    if (child) {
      $p.appendChild(child);
    }
    return $p;
  }

}