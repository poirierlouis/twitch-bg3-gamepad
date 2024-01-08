export abstract class Component {

  protected $root!: HTMLElement;
  protected $styles!: HTMLStyleElement;

  protected constructor(private readonly styles: string,
                        private readonly template: string) {
    this.build();
  }

  protected build(): void {
    this.$styles = document.createElement('style');
    this.$styles.innerText = this.styles;
    const $template: HTMLTemplateElement = document.createElement('template');

    $template.innerHTML = this.template;
    this.$root = $template.content.children[0] as unknown as HTMLDivElement;
  }

}
