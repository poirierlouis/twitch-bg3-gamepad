/**
 * Simulate paste event to write a message.
 * @param $element input to fill.
 * @param message to append in input.
 */
export async function simulatePaste($element: HTMLElement, message: string): Promise<void> {
  document.dispatchEvent(buildFocusEvent());
  $element.dispatchEvent(buildFocusEvent());
  $element.click();
  await sleep(50);
  $element.dispatchEvent(buildPasteEvent(message));
}

/**
 * Simulate erase event to delete message.
 * @param $element input to erase content.
 */
export async function simulateErase($element: HTMLElement): Promise<void> {
  document.dispatchEvent(buildFocusEvent());
  $element.dispatchEvent(buildFocusEvent());
  $element.click();
  await sleep(50);
  $element.dispatchEvent(buildEraseEvent());
}

/**
 * Simulate blur event to lose focus from $element.
 * @param $element
 */
export function simulateBlur($element: HTMLElement): void {
  $element.dispatchEvent(buildBlurEvent());
  document.dispatchEvent(buildFocusEvent());
  document.body.click();
}

function buildPasteEvent(message: string): Event {
  const event: Event = new Event('paste', {
    bubbles: true,
    cancelable: true,
    composed: true
  });

  // @ts-ignore
  event.clipboardData = {
    getData: () => message
  };
  return event;
}

function buildEraseEvent(): Event {
  return new InputEvent('beforeinput', {
    view: window,
    bubbles: true,
    cancelable: true,
    composed: true,
    inputType: 'deleteHardLineBackward'
  });
}

function buildFocusEvent(options?: any): Event {
  let eventInit: any = {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: 0,
    which: 0,
  };

  if (options) {
    eventInit = Object.assign({}, eventInit, options);
  }
  return new FocusEvent('focus', eventInit);
}

function buildBlurEvent(options?: any): Event {
  let eventInit: any = {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: 0,
    which: 0,
  };

  if (options) {
    eventInit = Object.assign({}, eventInit, options);
  }
  return new FocusEvent('blur', eventInit);
}

/**
 * Create asynchronous sleep using {@link setTimeout}.
 * @param time in milliseconds to sleep for.
 */
export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
