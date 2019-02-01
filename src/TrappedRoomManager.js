/**
 * Default implementation of a TrappedRoomManager.
 *
 * A TrappedRoomManager manages access to properties of a proxied room.
 * Properties are divided into two categories by the RoomTrapper:
 *
 * - event handlers (all properties starting with "on"), must be functions
 * - all other properties
 *
 * This default implementation keeps a list of event handlers for each trapped
 * room and forwards any access to other properties straight to the proxied
 * room.
 */
module.exports = class TrappedRoomManager {

  constructor() {
    this.handlers = {}
  }

  /**
   * Return the callback function registered for the given handler and
   * identifier, or undefined if none was registered.
   */
  onEventHandlerGet(room, handler, identifier) {
    if (this.handlers.hasOwnProperty(handler)) {
      return this.handlers[handler][identifier];
    }
  }

  /**
   * Return whether the trapped room with the given identifier has the given
   * handler.
   */
  onEventHandlerHas(room, handler, identifier) {
    return (this.handlers.hasOwnProperty(handler)
        && this.handlers[handler].hasOwnProperty(identifier));
  }

  /**
   * Return whether the proxied room has the given property.
   */
  onPropertyHas(room, property, identifier) {
    return room.hasOwnProperty(property);
  }

  /**
   * Return an array of property names of the proxied room.
   */
  onOwnPropertyNamesGet(room, identifier) {
    return Object.getOwnPropertyNames(room);
  }

  /**
   * Return a property descriptor for the given handler of the trapped room
   * with the given identifier.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  onOwnHandlerDescriptorGet(room, handler, identifier) {
    if (this.onEventHandlerHas(room, handler, identifier)) {
      return Object.getOwnPropertyDescriptor(this.handlers[handler], identifier);
    }
  }

  /**
   * Return a proprty descriptor for the given property of the trapped room
   * with the given identifier.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  onOwnPropertyDescriptorGet(room, prop, identifier) {
    return Object.getOwnPropertyDescriptor(room, prop);
  }

  /**
   * Set the given function as the callback for the given handler and
   * identifier.
   */
  onEventHandlerSet(room, handler, callback, identifier) {
    if (!this.handlers[handler]) {
      this.handlers[handler] = {};
    }

    this.handlers[handler][identifier] = callback;
  }

  /**
   * Delete the callback for the given handler and identifier.
   *
   * Does nothing if no callback was registered for the given handler.
   */
  onEventHandlerUnset(room, handler, identifier) {
    delete this.handlers[handler][identifier];
  }

  /**
   * Execute all callbacks registered for the given handler with the given
   * arguments.
   */
  onExecuteEventHandlers(room, handler, ...args) {
    if (!this.handlers[handler]) return;

    let returnValue = true;
    for (let h of this.handlers[handler]) {
      if (h.fn(...args) === false) returnValue = false;
    }
    return returnValue;
  }

  /**
   * Return the value of the given property in the underlying room, or
   * undefined if the property is not set.
   */
  onPropertyGet(room, property, identifier) {
    return room[property];
  }

  /**
   * Assign the given value to the given property in the underlying room.
   */
  onPropertySet(room, property, value, identifier) {
    room[prop] = value;
  }

  /**
   * Delete the given property in the underlying room.
   *
   * Does nothing if the given property is not set in the underlying room.
   */
  onPropertyUnset(room, property, identifier) {
    delete room[property];
  }
};
