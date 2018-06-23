# Description

This is a module for intercepting the setting and removing of HaxBall 
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
event handlers. It has been made for a plugin system for the HaxBall
headless in mind.

The module allows the plugins to set the event handlers 
normally with `=` operator, but instead of overriding the previous handler the
setting of the value will be redirected to be handled by a
[eventHandlerManager](#eventHandlerManager) object.

Instead of allowing a plugin to assign a handler to the 
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject),
a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
is created with the method `EventTrapper.createTrappedRoom` and injected to be used by the
plugin instead. The created Proxy will intercept the 
setting or unsetting the handlers and instead will inform the
[eventHandlerManager](#eventHandlerManager) about the changes. It will also redirect the execution
of handlers in [RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
to [eventHandlerManager](#eventHandlerManager). Other properties and methods of the
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
are available to be used through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
normally.

# Installation

`npm install git+https://git@github.com/morko/haxroomie-EventTrapper.git`

For browsers you can use browserify.

e.g. to create a standalone package to be inserted into
`window.roomEventTrapper`
```
git clone https://git@github.com/morko/haxroomie-EventTrapper.git
cd haxroomie-EventTrapper
browserify --standalone roomEventTrapper > roomEventTrapper.js
```

# Usage

```
const EventTrapper = require('@haxroomie/EventTrapper');

let fakeRoomObject = {};

const eventHandlerManager = {
  onEventHandlerSet(handler, callback, identifier) {
    console.log(handler, callback, identifier);
  },
  onEventHandlerUnset(handler, identifier) {
    console.log(handler, identifier);
  },
  onExecuteEventHandlers(handler, ...args) {
    console.log(handler, args);
  }
}

let eventTrapper = new EventTrapper(eventHandlerManager);

let trappedRoom = eventTrapper.createTrappedRoom(fakeRoomObject, 1);

trappedRoom.onPlayerJoin = function(player) {};
fakeRoomObject.onPlayerJoin({id: 3});
trappedRoom.onPlayerJoin = '';
```

# <a name="eventHandlerManager"></a>eventHandlerManager

**eventHandlerManager** is an Object that should implement following functions:

- onEventHandlerSet(handler, callback, identifier)
- onEventHandlerUnset(handler, identifier)
- onExecuteEventHandlers(handler, ...args)

Where `handler` is the name of the handler in
[RoomObject](https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomobject)
(e.g. onPlayerJoin), `callback` is a
[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
that had been set through the
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
and `identifier` is what was given when a Proxy was created with the
`createTrappedRoom` method. Purpose of the identifier is to be able to identify
which plugin is setting or unsetting the handler so it will be possible for
the **eventHandlerManager** to keep order of handler execution.

### Example eventHandlerManager Object

This is a simple example of the eventHandlerManager that does not care about
order of the event handlers and just pushes new handlers to the end
of an Array.

```
let eventHandlerManager = {
  handlers: {},

  onEventHandlerSet(handler, callback, identifier) {
    if (!this.handlers[handler]) {
      this.handlers[handler] = [{
        id: identifier,
        fn: callback
      }];
      return;
    }

    let alreadySet = false;
    for (let i = 0; i < this.handlers[handler].length; i++) {
      if(this.handlers[handler][i].id === identifier) {
        this.handlers[handler][i].fn = callback;
        alreadySet = true;
        break;
      }
    }
    if (!alreadySet) {
      this.handlers[handler].push({id: identifier, fn: callback});
    }
  },

  onEventHandlerUnset(handler, identifier) {
    if (!this.handlers[handler]) return;
    for (let i = 0; i < this.handlers[handler].length; i++) {
      if(this.handlers[handler][i].id === identifier) {
        this.handlers[handler].splice(i, 1);
      }
    }
  },

  onExecuteEventHandlers(handler, ...args) {
    if (!this.handlers[handler]) return;

    let returnValue = true;
    for (let h of this.handlers[handler]) {
      if (!h.fn(...args)) returnValue = false;
    }
    return returnValue;
  }
}
```


