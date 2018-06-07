module.exports = class EventTrapper {

  constructor(eventHandlerManager) {
    if (!eventHandlerManager)
      throw new Error('Missing required argument: eventHandlerManager');

    this.eventHandlerManager = eventHandlerManager;
  }

  createTrappedRoom(roomObject, identifier) {
    if (!roomObject) throw new Error('Missing required argument: roomObject');
    if (!identifier) throw new Error('Missing required argument: identifier');

    return new Proxy(roomObject, {

      // intercepts the `=` operator for properties of RoomObject
      set(room, prop, value) {
        // try to guess if user is setting a handler by the property name
        if (!prop.startsWith('on')) {
          room[prop] = value;
          return;
        }
        // if value = falsy => interpretate that user is unsetting the handler
        if (!value) {
          try {
            this.eventHandlerManager.onEventHandlerUnset(prop, identifier);
          } finally {
            return;
          }
        }

        if (typeof value !== 'function') {
          throw new Error(prop + ': value type must be a function.');
        }

        try {
          this.eventHandlerManager.onEventHandlerSet(prop, value, identifier);
        } finally {
          // if the haxball room object does not have handler for this event yet
          if (!room[prop]) {
            room[prop] = (...args) => {
              return this.eventHandlerManager.onExecuteEventHandlers(
                prop, ...args
              );
            }
          }
        }
        
      },

      // intercepts the delete keyword for properties of RoomObject
      deleteProperty(room, prop) {
        // try to guess if user is deleting a handler by the property name
        if (!prop.startsWith('on')) {
          delete room[prop];
          return;
        }
        try {
          this.eventHandlerManager.onEventHandlerUnset(prop, identifier);
        } finally {
        }
      }
    })
  }
}
