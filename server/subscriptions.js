Meteor.publish('room', function(filter) {
	return Rooms.find(filter);
});

Meteor.publish('messages', function(filter) {
	return Messages.find(filter);
});

Meteor.publish('users', function(filter) {
	return Users.find(filter);
});

Meteor.publish('userPresence', function(filter) {
  return Presences.find(filter, { fields: { state: true, userId: true }});
});



Rooms.allow({
	'insert': function() {
		return true;
	},
	'remove': function() {
		return true;
	},
	'update': function() {
		return true;
	}
});

Messages.allow({
  'insert': function() {
    return true;
  }
});

Users.allow({
	'insert': function() {
		return true;
	}
});