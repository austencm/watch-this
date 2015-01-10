/* Run when a new client initializes */

Presence.state = function() {
  return {
    room: Session.get('roomId')
  };
};

randColor = function() {
	return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}
