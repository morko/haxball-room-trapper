module.exports = class EventHandlerManager {

  constructor() {
    this.handlers = {}
  }

  onEventHandlerGet(room, handler, identifier) {
    if (this.handlers.hasOwnProperty(handler)) {
      return this.handlers[handler][identifier];
    }
  }

  onEventHandlerSet(room, handler, callback, identifier) {
    if (!this.handlers[handler]) {
      this.handlers[handler] = {};
    }

    this.handlers[handler][identifier] = callback;
  }

  onEventHandlerUnset(room, handler, identifier) {
    delete this.handlers[handler][identifier];
  }

  onExecuteEventHandlers(room, handler, ...args) {
    if (!this.handlers[handler]) return;

    let returnValue = true;
    for (let h of this.handlers[handler]) {
      if (!h.fn(...args)) returnValue = false;
    }
    return returnValue;
  }
};
