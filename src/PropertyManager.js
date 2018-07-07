module.exports = class PropertyManager {

  onPropertyGet(room, property, identifier) {
    return room[property];
  }

  onPropertySet(room, property, value, identifier) {
    room[prop] = value;
  }

  onPropertyUnset(room, property, identifier) {
    delete room[property];
  }

};