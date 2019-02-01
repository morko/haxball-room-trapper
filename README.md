# Description

This is a module for intercepting the setting and removing of HaxBall
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
event handlers and properties. It has been made for a plugin system for the HaxBall
headless in mind.

The module allows the plugins to manage room properties and event handlers
exactly like with the vanilla room object, but in the background a
[trappedRoomManager](#trappedRoomManager) manages access to the proxied room
object as well as storage and execution of event handlers and properties for
each plugin.

Instead of allowing a plugin to assign a handler or property to the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject),
a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
is created with the method `RoomTrapper.createTrappedRoom` and injected to be
used by the plugin instead. The created Proxy will intercept the setting,
unsetting, as well as accessing and enumeration of handlers and properties and
instead will redirect the calls to the [trappedRoomManager](#trappedRoomManager).
Other properties and methods of the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
are available to be used through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
normally.

# Installation

`npm install git+https://git@github.com/morko/haxroomie-EventTrapper.git`

For browsers you can use browserify.

e.g. to create a standalone package to be inserted into `window.roomTrapper`:

```
git clone https://git@github.com/morko/haxroomie-EventTrapper.git
cd haxroomie-RoomTrapper
browserify --standalone roomTrapper > roomTrapper.js
```

# Usage

```
const RoomTrapper = require('@haxroomie/RoomTrapper');
const TrappedRoomManager = require('@haxroomie/TrappedRoomManager');

let fakeRoomObject = {};

const trappedRoomManager = new TrappedRoomManager();

trappedRoomManager.onEventHandlerGet = function(room, handler, identifier) {
    console.log(handler, callback, identifier);
};

trappedRoomManager.onEventHandlerSet = function(room, handler, callback, identifier) {
    console.log(handler, callback, identifier);
};

trappedRoomManager.onEventHandlerUnset = function(room, handler, identifier) {
    console.log(handler, identifier);
};

trappedRoomManager.onExecuteEventHandlers = function(room, handler, ...args) {
    console.log(handler, args);
};

let roomTrapper = new RoomTrapper(trappedRoomManager);

let trappedRoom = roomTrapper.createTrappedRoom(fakeRoomObject, 1);

trappedRoom.onPlayerJoin = function(player) {};
fakeRoomObject.onPlayerJoin({id: 3});
trappedRoom.onPlayerJoin = '';
```

# <a name="trappedRoomManager"></a>trappedRoomManager

The **trappedRoomManager** is an object that must implement the following functions:

- `onEventHandlerGet(room, handler, identifier)`
- `onEventHandlerHas(room, handler, identifier)`
- `onEventHandlerSet(room, handler, callback, identifier)`
- `onEventHandlerUnset(room, handler, identifier)`
- `onOwnHandlerDescriptorGet(room, handler, identifier)`
- `onExecuteEventHandlers(room, handler, ...args)`
- `onPropertyGet(room, property, identifier)`
- `onPropertyHas(room, property, identifier)`
- `onPropertySet(room, property, value, identifier)`
- `onPropertyUnset(room, property, identifier)`
- `onOwnPropertyDescriptorGet(room, property, identifier)`
- `onOwnPropertyNamesGet(room, identifier)`

Where `room` is the proxied room object, `handler` is the name of the handler
(anything starting with "on") including but not limited to the ones listed in the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
(e.g. onPlayerJoin), `callback` is a
[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
that had been set through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy),
`property` and `value` are the name of the property and its value,
and `identifier` is what was given when a Proxy was created with the
`createTrappedRoom` method. Purpose of the identifier is to be able to identify
which plugin is setting or unsetting the handler so it will be possible for
the `eventHandlerManager` to keep order of handler execution.

### Example trappedRoomManager

See the [TrappedRoomManager](./src/TrappedRoomManager.js) class for a simple
example of an `trappedRoomManager` that does not care about
order of the event handlers and just stores the handlers in a two dimensional
object structure, and allows direct access to room properties. Feel free to
extend this class if you don't want to implement all functions.