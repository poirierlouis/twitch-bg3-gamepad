import {Plugin, plugin} from "./plugin";
import {GamepadInput, getInput} from "./gamepad-input";
import {ButtonReleasedEvent} from "./gamepad-event";

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

function onButtonReleased(event: ButtonReleasedEvent): void {
  let command: string = event.button;

  if (event.duration >= Plugin.getLongPressDuration()) {
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
  Plugin.log(`<gamepad (disconnected) index="${gamepad.index}" id="${gamepad.id}" />`);
}
