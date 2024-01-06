/*
import {plugin} from "./plugin";

const nativeWSSend = WebSocket.prototype.send;

/**
 * Override to get a reference to the IRC web socket, and fallthrough with the native behavior.
 * This requires user to manually send a message in chat.
 * @param arg
 */
/*
WebSocket.prototype.send = function (arg): void {
  if (!plugin.hasWebSocket()) {
    plugin.addWebSocket(this);
  }
  return nativeWSSend.call(this, arg);
}
*/
