/* Client + server routing */

Router.configure({
	onBeforeAction: 'loading',
	trackPageView: true
});


function newUser(roomId) {
	return Users.insert({
		room: roomId
  });
}

var redirected = false;

Router.route('/', function() {
  var newRoomId =	Rooms.insert({
  	owner: null,
  	videoId: null,
  	videoTitle: null,
  	time: 0
  });

  var newUserId = newUser(newRoomId);

  Rooms.update({ _id: newRoomId }, { $set: { owner: newUserId } });

	redirected = true;
	this.redirect('/' + newRoomId);
});

Router.route('/:_id', {
	waitOn: function() {
		var roomId = this.params._id;

		return [
			Meteor.subscribe('room', { _id: roomId }),
			Meteor.subscribe('messages', { room: roomId }),
			Meteor.subscribe('userPresence', {})
		];
  },
  data: function() {

  },
  action: function() {

  	if ( this.ready() ) {
  		var roomId = this.params._id;
	    var room = Rooms.findOne();

    	var userId = redirected ?
    		room.owner :
    		newUser(roomId);

    	// Set session variables
      Session.set('roomId', roomId);
      Session.set('owner', room.owner);
      Session.set('videoId', room.videoId);
      Session.set('time', room.time);
      Session.set('user', userId);

      // Render the view
      this.render('room');
    }
  }
});