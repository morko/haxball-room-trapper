const assert = require('assert');
const sinon = require('sinon');

const EventTrapper = require('..');


describe('EventTrapper', function() {

  describe('#new EventTrapper', function() {
    it('should be initialized', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      assert(eventTrapper);
    });
  });

  describe('#EventTrapper.createTrappedRoom', function() {
    it('should be initialized', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      assert(trappedRoom);
    });
  });

  describe('#EventHandlerManager.onEventHandlerSet', function() {

    it('should throw error if not defined', function() {
      let manager = {
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      assert.throws(() => {new EventTrapper(manager)});
    });

    it('should be called', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      let eventHandler = sinon.fake();
      trappedRoom[handlerName] = eventHandler;
      assert(manager.onEventHandlerSet.called);
    });

    it('should recieve the handler, callback and identifier', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      let eventHandler = sinon.fake();
      trappedRoom[handlerName] = eventHandler;
      assert(manager.onEventHandlerSet.calledWith(
        handlerName, eventHandler, identifier
      ));
    });
  });

  describe('#EventHandlerManager.onEventHandlerUnset', function() {

    it('should throw error if not defined', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      assert.throws(() => {new EventTrapper(manager)});
    });

    it('should be called with empty string', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      trappedRoom[handlerName] = '';
      assert(manager.onEventHandlerUnset.called);
    });

    it('should be called when deleting', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin';
      delete trappedRoom[handlerName];
      assert(manager.onEventHandlerUnset.called);
    });

    it('should recieve the handler and identifier', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let handlerName = 'onPlayerJoin'
      trappedRoom[handlerName] = '';
      assert(manager.onEventHandlerUnset.calledWith(handlerName, identifier));
    });
  });

  describe('#EventHandlerManager.onExecuteHandlers', function() {

    it('should throw error if not defined', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
      };
      assert.throws(() => {new EventTrapper(manager)});
    });

    it('should recieve the handler and given arguments', function() {
      let manager = {
        onEventHandlerSet: sinon.fake(),
        onEventHandlerUnset: sinon.fake(),
        onExecuteEventHandlers: sinon.fake()
      };
      let eventTrapper = new EventTrapper(manager);
      let roomObject = {};
      let identifier = 1;
      let trappedRoom = eventTrapper.createTrappedRoom(roomObject, identifier);
      let player = {playerID: 3};
      let handlerName = 'onPlayerJoin'
      trappedRoom[handlerName] = function(player) {};
      roomObject[handlerName](player);
      assert(manager.onExecuteEventHandlers.calledWith(handlerName, player));
    });
  });
});

