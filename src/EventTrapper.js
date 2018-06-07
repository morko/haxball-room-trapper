module.exports = class EventTrapper {

  constructor(eventHandlerManager) {
    if (!eventHandlerManager) {
      throw new Error('Missing required argument: eventHandlerManager');
    }

    if (typeof eventHandlerManager.onEventHandlerSet !== 'function') {
      throw new Error(
        'Missing eventHandlerManager property: onEventHandlerSet'
      );
    }

    if (typeof eventHandlerManager.onEventHandlerUnset !== 'function') {
      throw new Error(
        'Missing eventHandlerManager property: onEventHandlerUnset'
      );
    }

    if (typeof eventHandlerManager.onExecuteEventHandlers !== 'function') {
      throw new Error(
        'Missing eventHandlerManager property: onExecuteEventHandlers'
      );
    }

    this.eventHandlerManager = eventHandlerManager;
  }

  createTrappedRoom(roomObject, identifier) {
    if (!roomObject) throw new Error('Missing required argument: roomObject');
    if (!identifier) throw new Error('Missing required argument: identifier');

    let eventHandlerManager = this.eventHandlerManager;

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
            eventHandlerManager.onEventHandlerUnset(prop, identifier);
          } finally {
            return;
          }
        }

        if (typeof value !== 'function') {
          throw new Error(prop + ': value type must be a function.');
        }

        try {
          eventHandlerManager.onEventHandlerSet(prop, value, identifier);
        } finally {
          // if the haxball room object does not have handler for this event yet
          if (!room[prop]) {
            room[prop] = (...args) => {
              return eventHandlerManager.onExecuteEventHandlers(
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
          eventHandlerManager.onEventHandlerUnset(prop, identifier);
        } finally {
        }
      }
    })
  }
}
