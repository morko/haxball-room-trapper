const assert = require('assert');
const sinon = require('sinon');

// TODO add coverage for other methods

const RoomTrapper = require('..');

function createManager() {
  return {
    onEventHandlerGet: sinon.fake(),
    onEventHandlerHas: sinon.fake(),
    onEventHandlerSet: sinon.fake(),
    onEventHandlerUnset: sinon.fake(),
    onOwnHandlerDescriptorGet: sinon.fake(),
    onOwnHandlerNamesGet: sinon.fake(),
    onExecuteEventHandlers: sinon.fake(),
    onPropertyGet: sinon.fake(),
    onPropertyHas: sinon.fake(),
    onPropertySet: sinon.fake(),
    onPropertyUnset: sinon.fake(),
    onOwnPropertyDescriptorGet: sinon.fake(),
    onOwnPropertyNamesGet: sinon.fake(),
  };
}

describe('RoomTrapper', function() {

  describe('#new RoomTrapper', function() {
    it('should be initialized', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      assert(roomTrapper);
    });
  });

  describe('#RoomTrapper.createTrappedRoom', function() {
    it('should be initialized', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      assert(trappedRoom);
    });
  });

  describe('#EventHandlerManager.onEventHandlerSet', function() {

    it('should throw error if not defined', function() {
      let manager = createManager();
      delete manager.onEventHandlerSet;
      assert.throws(() => {new RoomTrapper(manager)});
    });

    it('should be called', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      let eventHandler = sinon.fake();
      trappedRoom[handlerName] = eventHandler;
      assert(manager.onEventHandlerSet.called);
    });

    it('should recieve the room, handler, callback and identifier', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      let eventHandler = sinon.fake();
      trappedRoom[handlerName] = eventHandler;
      assert(manager.onEventHandlerSet.calledWith(
        roomObject, handlerName, eventHandler, identifier
      ));
    });
  });

  describe('#EventHandlerManager.onEventHandlerUnset', function() {

    it('should throw error if not defined', function() {
      let manager = createManager();
      delete manager.onEventHandlerUnset;
      assert.throws(() => {new RoomTrapper(manager)});
    });

    it('should be called with empty string', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      trappedRoom[handlerName] = '';
      assert(manager.onEventHandlerUnset.called);
    });

    it('should be called when deleting', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      delete trappedRoom[handlerName];
      assert(manager.onEventHandlerUnset.called);
    });

    it('should recieve the room, handler and identifier', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      trappedRoom[handlerName] = '';
      assert(manager.onEventHandlerUnset.calledWith(roomObject, handlerName,
          identifier));
    });
  });

  describe('#EventHandlerManager.onExecuteHandlers', function() {

    it('should throw error if not defined', function() {
      let manager = createManager();
      delete manager.onExecuteEventHandlers;
      assert.throws(() => {new RoomTrapper(manager)});
    });

    it('should recieve the room, handler and given arguments', function() {
      let manager = createManager();
      let roomTrapper = new RoomTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = roomTrapper.createTrappedRoom(roomObject, identifier);
      let player = {playerID: 3};
      let handlerName = 'onPlayerJoin';
      trappedRoom[handlerName] = function(player) {};
      roomObject[handlerName](player);
      assert(manager.onExecuteEventHandlers.calledWith(roomObject, handlerName,
          player));
    });
  });
});

