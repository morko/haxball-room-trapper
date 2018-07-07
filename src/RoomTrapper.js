const PropertyManager = require('./PropertyManager');

module.exports = class RoomTrapper {

  constructor(eventHandlerManager, propertyManager) {
    if (typeof eventHandlerManager === 'undefined') {
      throw new Error('Missing required argument: eventHandlerManager');
    }

    if (typeof propertyManager === 'undefined') {
      propertyManager = new PropertyManager();
    }

    RoomTrapper._checkArgumentProperties(eventHandlerManager,
        'eventHandlerManager', ['onEventHandlerGet', 'onEventHandlerSet',
          'onEventHandlerUnset', 'onExecuteEventHandlers']);

    this.eventHandlerManager = eventHandlerManager;

    RoomTrapper._checkArgumentProperties(propertyManager, 'propertyManager',
        ['onPropertyGet', 'onPropertySet', 'onPropertyUnset']);

    this.propertyManager = propertyManager;
  }

  static _checkArgumentProperties(argument, argumentName, requiredProperties) {
    for (let property of requiredProperties) {
      if (typeof argument[property] !== 'function') {
        throw new Error(`Missing ${argumentName} function: ${property}`);
      }
    }
  }

  createTrappedRoom(roomObject, identifier) {
    if (typeof roomObject === 'undefined')
      throw new Error('Missing required argument: roomObject');
    if (typeof identifier === 'undefined')
      throw new Error('Missing required argument: identifier');

    let eventHandlerManager = this.eventHandlerManager;
    let propertyManager = this.propertyManager;

    return new Proxy(roomObject, {

      // intercepts getting properties
      get(room, prop) {
        // try to guess if user is getting a handler by the property name
        if (prop.startsWith('on')) {
          try {
            return eventHandlerManager.onEventHandlerGet(room, prop, identifier);
          } finally {
          }

          return;
        }

        return propertyManager.onPropertyGet(room, prop, identifier);
      },

      // intercepts the `=` operator for properties of RoomObject
      set(room, prop, value) {
        // try to guess if user is setting a handler by the property name
        if (!prop.startsWith('on')) {
          propertyManager.onPropertySet(room, prop, value, identifier);

          return;
        }
        // if value = falsy => interpret that user is unsetting the handler
        if (!value) {
          try {
            eventHandlerManager.onEventHandlerUnset(room, prop, identifier);
          } finally {
          }
        }

        if (typeof value !== 'function') {
          throw new Error(prop + ': value type must be a function.');
        }

        try {
          eventHandlerManager.onEventHandlerSet(room, prop, value, identifier);
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
          propertyManager.onPropertyUnset(room, prop, identifier);
          return;
        }
        try {
          eventHandlerManager.onEventHandlerUnset(room, prop, identifier);
        } finally {
        }
      }
    })
  }
};
