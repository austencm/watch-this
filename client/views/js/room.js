var searchCountdown;
playerTimeTracker = null;
bufferTimer = null;
localTime = 0;
localVideoId = null;
lastState = -1;

var userColor = randColor();


roomId = function() {
	return Rooms.findOne()._id;
};

var owner = function() {
	return Rooms.findOne().owner;
};

var userId = function() {
	return Session.get('user');
};

isOwner = function() {
	return owner() === userId();
};



function onRoomLoaded() {
	Player.create('player', Template.player, { 
		autoplay: 1,
		controls: 1,
		autohide: 1,
		theme: 'light',
		color: 'white'
	});
};

setRoomTime = function(time) {
	//console.log('Set room time to ' + time);

	Rooms.update({ _id: roomId() }, { $set: { time: time } });
}

function timeOutOfSync(time1, time2, allowedLatency) {
	return Math.abs(time1 - time2) > allowedLatency;
}

function initSearch(search) {
	Meteor.clearTimeout(searchCountdown);

	searchCountdown = Meteor.setTimeout( function() {
		getVideoDataFromSearch(search, function(id, title) {
			Player.loadVideo(id);
			// Set video title for the room
			Rooms.update({ _id: roomId() }, { $set: { videoTitle: title } });

			$('.invite').slideDown();
		});

		// Set time to 0
		Session.set('time', 0);
	}, 400 );
}

function getVideoDataFromSearch(search, callback) {
	console.log('Searching...');

	Meteor.call('searchVideo', search, function(err, data) {
		var video = data.items[0];
		callback(video.id.videoId, video.snippet.title);
	});
}

Tracker.autorun(function() {
	var videoId = Session.get('videoId');
	var roomTime = Session.get('time');

	if (typeof player === 'undefined' || typeof player.getCurrentTime === 'undefined') {
		return;
	}

	//if ( Player.isPlaying() || ) {
		if (videoId !== localVideoId) {
			Player.loadVideo(videoId);
		}
		else if ( timeOutOfSync(roomTime, player.getCurrentTime(), 2) ) {
			Player.setTime(roomTime);
		}
	//}
});

startTimeTracking = function() {
	if (playerTimeTracker) {
		Meteor.clearInterval(playerTimeTracker);
	}
	playerTimeTracker = Meteor.setInterval(trackPlayerTime, 1000);
};

stopTimeTracking = function() {
	if (playerTimeTracker) {
		Meteor.clearInterval(playerTimeTracker);
	}
};

trackPlayerTime = function() {
	if ( !Player.isPlaying() ) {
		return;
	}

	var playerTime = player.getCurrentTime();

	if ( timeOutOfSync(playerTime, localTime, 1) ) {
		// Set room time here to reduce update frequency. Introduces syncing issues when watchers pause.
		// setRoomTime(playerTime);

		localTime = playerTime;
	}

	setRoomTime(localTime);

	localTime++;
};


Template.room.rendered = function() {
	onRoomLoaded();
};

Template.room.helpers({
	isOwner: isOwner,
	inviteURL: function() {
		return window.location.href;
	},

	videoTitle: function() {
		return Rooms.findOne().videoTitle;
	},

	watchers: function() {
	  return Presences.find({ state: { room: roomId() }}).fetch().length;
	},

	messages: function() {
	  return Messages.find({}, {
	  	sort: { timestamp: -1 },
	  	limit: 10
	  }).fetch();
	}
});

Template.room.events({
	'input .search-box': function(e, template) {
		var $this = $(e.target);
		var search = $this.val();
		
		initSearch(search);
	},

	'focus input[type="text"]': function(e, template) {
		var $this = $(e.target);

    Meteor.setTimeout(function() { 
      $this.select(); 
    }, 10);
	},

	'submit .messages form': function(e, template) {
		e.preventDefault();
		var $input = $('.message-input');
		
		Messages.insert({
			room: roomId(),
			timestamp: new Date,
			text: $input.val(),
			color: userColor
		});

		$input.val('');
	},

	'click .invite-dismiss': function(e, template) {
		$('.invite').slideUp(function() {
			$(this).remove();
		});
	},
});