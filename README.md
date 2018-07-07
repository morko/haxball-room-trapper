# Description

This is a module for intercepting the setting and removing of HaxBall
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
event handlers and properties. It has been made for a plugin system for the HaxBall
headless in mind.

The module allows the plugins to manage room properties and event handlers
exactly like with the vanilla room object, but in the background an
[eventHandlerManager](#eventHandlerManager) and
[propertyManager](#propertyManager) manage access to the proxied room object as
well as storage and execution of event handlers and properties for each plugin.

Instead of allowing a plugin to assign a handler or property to the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject),
a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
is created with the method `EventTrapper.createTrappedRoom` and injected to be
used by the plugin instead. The created Proxy will intercept the setting or
unsetting of handlers and properties and instead will redirect the calls to the
[eventHandlerManager](#eventHandlerManager) and
[propertyManager](#propertyManager), respectively. Other properties and methods
of the [RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
are available to be used through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
normally.

# Installation

`npm install git+https://git@github.com/saviola777/haxroomie-RoomTrapper.git`

For browsers you can use browserify.

e.g. to create a standalone package to be inserted into
`window.roomEventTrapper`
```
git clone https://git@github.com/saviola777/haxroomie-RoomTrapper.git
cd haxroomie-RoomTrapper
browserify --standalone roomTrapper > roomTrapper.js
```

# Usage

```
const RoomTrapper = require('@haxroomie/RoomTrapper');
const PropertyManager = require('@haxroomie/PropertyManager');

let fakeRoomObject = {};

const eventHandlerManager = {
  onEventHandlerGet(room, handler, identifier) {
    console.log(handler, callback, identifier);
  },
  onEventHandlerSet(room, handler, callback, identifier) {
    console.log(handler, callback, identifier);
  },
  onEventHandlerUnset(room, handler, identifier) {
    console.log(handler, identifier);
  },
  onExecuteEventHandlers(room, handler, ...args) {
    console.log(handler, args);
  }
}

const propertyManager = new PropertyManager();

let roomTrapper = new RoomTrapper(eventHandlerManager, propertyManager);

let trappedRoom = roomTrapper.createTrappedRoom(fakeRoomObject, 1);

trappedRoom.onPlayerJoin = function(player) {};
fakeRoomObject.onPlayerJoin({id: 3});
trappedRoom.onPlayerJoin = '';
```

# <a name="eventHandlerManager"></a>eventHandlerManager

The **eventHandlerManager** is an object that must implement the following functions:

- `onEventHandlerGet(room, handler, identifier)`
- `onEventHandlerSet(room, handler, callback, identifier)`
- `onEventHandlerUnset(room, handler, identifier)`
- `onExecuteEventHandlers(room, handler, ...args)`

Where `room` is the proxied room object, `handler` is the name of the handler
(anything starting with "on") including but not limited to the ones listed in the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
(e.g. onPlayerJoin), `callback` is a
[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
that had been set through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
and `identifier` is what was given when a Proxy was created with the
`createTrappedRoom` method. Purpose of the identifier is to be able to identify
which plugin is setting or unsetting the handler so it will be possible for
the `eventHandlerManager` to keep order of handler execution.

### Example eventHandlerManager

See the [EventHandlerManager](./src/EventHandlerManager.js) class for a simple
example of an `eventHandlerManager` that does not care about
order of the event handlers and just stores the handlers in a two dimensional
object structure.

# <a name="propertyManager"></a>propertyManager

**propertyManager** is an object that mus implement the following functions:

- `onPropertyGet(room, property, identifier)`
- `onPropertySet(room, property, value, identifier)`
- `onPropertyUnset(room, property, identifier)`

Where `room`, once again, is the proxied room object, `property` and `value` are
the name of the property and its value, and the identifier is the plugin
identifier passed to `createTrappedRoom`.

The `propertyManager` is optional, if you don't pass it to the `RoomTrapper`
constructor, a default [PropertyManager](./src/PropertyManager.js) will be used.

### Example propertyManager

See the [PropertyManager](./src/PropertyManager.js) class for a simple
example of a `propertyManager` which just redirects all calls to the proxied room
object.
