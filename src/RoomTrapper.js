const TrappedRoomManager = require('./TrappedRoomManager');

module.exports = class RoomTrapper {

  constructor(trappedRoomManager) {
    if (typeof trappedRoomManager === 'undefined') {
      trappedRoomManager = new TrappedRoomManager();
    }

    RoomTrapper._checkArgumentProperties(trappedRoomManager,
        'trappedRoomManager', [
          'onEventHandlerGet',
          'onEventHandlerHas',
          'onEventHandlerSet',
          'onEventHandlerUnset',
          'onOwnHandlerDescriptorGet',
          'onExecuteEventHandlers',
          'onPropertyGet',
          'onPropertyHas',
          'onPropertySet',
          'onPropertyUnset',
          'onOwnPropertyDescriptorGet',
          'onOwnPropertyNamesGet',
        ]);

    this.trappedRoomManager = trappedRoomManager;
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

    let trappedRoomManager = this.trappedRoomManager;

    return new Proxy(roomObject, {

      // intercepts getting properties
      get(room, prop) {
        prop = String(prop);

        // try to guess if user is getting a handler by the property name
        if (prop.startsWith('on')) {
          try {
            return trappedRoomManager.onEventHandlerGet(room, prop, identifier);
          } finally {
          }

          return false;
        }

        return trappedRoomManager.onPropertyGet(room, prop, identifier);
      },

      has(room, prop) {
        prop = String(prop);

        // try to guess if user is getting a handler by the property name
        if (prop.startsWith('on')) {
          try {
            return trappedRoomManager.onEventHandlerHas(room, prop, identifier);
          } finally {
          }

          return false;
        }

        return trappedRoomManager.onPropertyHas(room, prop, identifier);
      },

      getOwnPropertyDescriptor(room, prop) {
        prop = String(prop);

        // try to guess if user is getting a handler by the property name
        if (prop.startsWith('on')) {
          try {
            return trappedRoomManager.onOwnHandlerDescriptorGet(room, prop,
                identifier);
          } finally {}

          return false;
        }

        return trappedRoomManager.onOwnPropertyDescriptorGet(room, prop,
            identifier);
      },

      ownKeys(room) {
        return [...new Set(
            trappedRoomManager.onOwnPropertyNamesGet(room, identifier)
        )];
      },

      // intercepts the `=` operator for properties of RoomObject
      set(room, prop, value) {
        prop = String(prop);
        let returnValue = false;
        // try to guess if user is setting a handler by the property name
        if (!prop.startsWith('on')) {
          try {
            returnValue = trappedRoomManager.onPropertySet(room, prop, value,
                identifier);
          } finally {}

          return returnValue !== false;
        }
        // if value = falsy => interpret that user is unsetting the handler
        if (!value) {
          try {
            let returnValue = trappedRoomManager.onEventHandlerUnset(room, prop,
                identifier);
          } finally {}

          return returnValue !== false;
        }

        if (typeof value !== 'function') {
          throw new Error(prop + ': value type must be a function.');
        }

        try {
          // if the haxball room object does not have handler for this event yet
          // TODO what if the room already had event handlers before?
          if (!room[prop]) {
            room[prop] = (...args) => {
              return trappedRoomManager.onExecuteEventHandlers(
                  room, prop, ...args
              );
            }
          }

          let returnValue = trappedRoomManager.onEventHandlerSet(room, prop,
              value, identifier);
        } finally {
        }

        return returnValue !== false;
      },

      // intercepts the delete keyword for properties of RoomObject
      deleteProperty(room, prop) {
        prop = String(prop);

        let returnValue = false;
        // try to guess if user is deleting a handler by the property name
        if (!prop.startsWith('on')) {
          try {
            returnValue = trappedRoomManager.onPropertyUnset(room, prop,
                identifier);
          } finally {}

          return returnValue !== false;
        }

        try {
          let returnValue = trappedRoomManager.onEventHandlerUnset(room, prop,
              identifier);
        } finally {}

        return returnValue !== false;
      }
    })
  }
};
