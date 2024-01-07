import {Plugin, plugin} from "./plugin";
import {GamepadInput, getInput} from "./gamepad-input";
import {ButtonReleasedEvent, JoystickMovedEvent} from "./gamepad-event";

/**
 * Whether browser support Gamepad API?
 */
function isCompatible(): boolean {
  return !!navigator.getGamepads;
}

/**
 * Whether browser emit events to detect a gamepad?
 */
function canListenGamepadEvents(): boolean {
  return 'ongamepadconnected' in window;
}

/**
 * Entry-point to start "Twitch BG3 Gamepad" plugin.
 */
export function start(): void {
  if (!isCompatible()) {
    console.error('Your browser doesn\'t support the Gamepad API. Please make sure to update it to the latest ' +
      'version. Chrome / Firefox / Edge are valid candidates.');
    return;
  }
  document.addEventListener('keyup', onKeyUp);
  if (!canListenGamepadEvents()) {
    pollGamepad();
    Plugin.log('<plugin (poll) />');
  } else {
    window.addEventListener('gamepadconnected', onConnected);
    window.addEventListener('gamepaddisconnected', onDisconnected);
  }
  Plugin.log('<plugin (start) />');
}

/**
 * Register gamepad on connection event.
 */
function onConnected(event: GamepadEvent): void {
  const gamepad: Gamepad = event.gamepad;

  if (plugin.gamepad) {
    Plugin.warn('<gamepad (connected) error="Only the first gamepad will be used." />');
    return;
  }
  plugin.gamepad = gamepad;
  Plugin.log(`<gamepad (connected) index="${gamepad.index}" id="${gamepad.id}" />`);
  Plugin.log(`  <buttons size="${gamepad.buttons.length}" />`);
  Plugin.log(`  <axes size="${gamepad.axes.length}" />`);
  plugin.onReleased(onButtonReleased);
  plugin.onMoved(onJoystickMoved);
  plugin.gui.setGamepad(true);
  listenGamepad();
  Plugin.log('<plugin (listen) />');
}

/**
 * Listen for gamepad inputs when connected.
 */
function listenGamepad(): void {
  const gamepads: Gamepad[] = navigator.getGamepads() as Gamepad[];

  if (gamepads.length === 0) {
    Plugin.log('<plugin (release) />');
    return;
  }
  const gamepad: Gamepad | null = gamepads[0];

  if (!gamepad) {
    return;
  }
  plugin.gamepad = gamepad;
  const input: GamepadInput = getInput(gamepad);

  plugin.pushInput(input);
  requestAnimationFrame(listenGamepad);
}

/**
 * Listen for gamepad array to manually trigger a connection/disconnection, Chrome only.
 */
function pollGamepad(): void {
  const gamepads: Gamepad[] = navigator.getGamepads() as Gamepad[];

  if (gamepads.length === 0) {
    requestAnimationFrame(pollGamepad);
    return;
  }
  const gamepad: Gamepad | null = gamepads[0];

  if (!gamepad) {
    onDisconnected(<any>{gamepad: gamepad});
  } else if (plugin.gamepad === undefined) {
    onConnected(<any>{gamepad: gamepad});
  }
  requestAnimationFrame(pollGamepad);
}

// Map digit characters using AZERTY keyboard.
const digits: string = `&é"'(-è_çà)=`;

function onKeyUp(event: KeyboardEvent): void {
  if (!digits.includes(event.key)) {
    return;
  }
  const digit: number = digits.indexOf(event.key) + 1;

  plugin.gui.updateLastInput(digit.toString());
  plugin.send(digit.toString());
}

function onButtonReleased(event: ButtonReleasedEvent): void {
  if (event.button === 'START') {
    return;
  }
  let command: string = event.button;

  if (event.duration >= Plugin.getLongPressDuration()) {
    command = `+${command}`;
  }
  plugin.send(command);
}

function onJoystickMoved(event: JoystickMovedEvent): void {
  let command: string = `M${event.side === 'left' ? 'L' : 'R'}${event.button}`;

  if (event.duration >= Plugin.getLongMovementDuration()) {
    command = `+${command}`;
  }
  plugin.send(command);
}

/**
 * Release gamepad on disconnection event.
 */
function onDisconnected(event: GamepadEvent): void {
  const gamepad: Gamepad | null = event.gamepad;

  if (!plugin.gamepad) {
    return;
  }
  if (gamepad !== null && plugin.gamepad.index !== gamepad.index) {
    return;
  }
  plugin.gamepad = undefined;
  plugin.gui.setGamepad(false);
  plugin.gui.updateLastInput('N/A');
  plugin.offReleased(onButtonReleased);
  plugin.offMoved(onJoystickMoved);
  Plugin.log(`<gamepad (disconnected) />`);
}
