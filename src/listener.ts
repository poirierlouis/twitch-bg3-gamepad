import {Plugin, plugin} from "./plugin";
import {GamepadInput, getInput} from "./gamepad-input";
import {ButtonReleasedEvent, JoystickMovedEvent} from "./gamepad-event";

/**
 * Whether browser support Gamepad API?
 */
function isCompatible(): boolean {
  return !!navigator.getGamepads && 'ongamepadconnected' in window;
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
  window.addEventListener('gamepadconnected', onConnected);
  window.addEventListener('gamepaddisconnected', onDisconnected);
  document.addEventListener('keyup', onKeyUp);
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

function listenGamepad(): void {
  const gamepads: Gamepad[] = navigator.getGamepads() as Gamepad[];

  if (gamepads.length === 0) {
    Plugin.log('<plugin (release) />');
    return;
  }
  const gamepad: Gamepad = gamepads[0];

  plugin.gamepad = gamepad;
  const input: GamepadInput = getInput(gamepad);

  plugin.pushInput(input);
  requestAnimationFrame(listenGamepad);
}

const digits: string = `&é"'(-è_çà)=`;

function onKeyUp(event: KeyboardEvent): void {
  if (!digits.includes(event.key)) {
    return;
  }
  const digit: number = digits.indexOf(event.key) + 1;

  plugin.gui.updateLastInput(digit.toString());
  plugin.send(digit.toString());
  Plugin.log(`<digit command="${digit}" />`);
}

function onButtonReleased(event: ButtonReleasedEvent): void {
  let command: string = event.button;

  if (event.duration >= Plugin.getLongPressDuration()) {
    command = `+${command}`;
  }
  plugin.send(command);
  Plugin.log(`<send command="${command}" />`);
}

function onJoystickMoved(event: JoystickMovedEvent): void {
  let command: string = `M${event.side === 'left' ? 'L' : 'R'}${event.button}`;

  if (event.duration >= Plugin.getLongMovementDuration()) {
    command = `+${command}`;
  }
  plugin.send(command);
  Plugin.log(`<send command="${command}" />`);
}

/**
 * Release gamepad on disconnection event.
 */
function onDisconnected(event: GamepadEvent): void {
  const gamepad: Gamepad = event.gamepad;

  if (!plugin.gamepad) {
    return;
  }
  if (plugin.gamepad.index !== gamepad.index) {
    return;
  }
  plugin.gamepad = undefined;
  plugin.gui.setGamepad(false);
  plugin.offReleased(onButtonReleased);
  plugin.offMoved(onJoystickMoved);
  Plugin.log(`<gamepad (disconnected) index="${gamepad.index}" id="${gamepad.id}" />`);
}
