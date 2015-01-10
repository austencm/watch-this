var downloadIFrameAPI = _.once(function() {
	Meteor.startup(function() {
		$.getScript('//www.youtube.com/iframe_api');
	});
});

Player = {
	create: function(playerId, videoTemplate, playerVars) {

		window.onYouTubeIframeAPIReady = function() {
			console.log('Creating player...');

			window.player = new YT.Player(playerId, {
				width: '720',
				height: '405',
				events: {
					onReady: function () {
						//ready.set(true);
						Player.onReady();
					},
					onStateChange: function(e) {
						Player.onStateChange(e.data);
					}
				},
				playerVars: playerVars || {}
			});
			videoTemplate.rendered = onYouTubeIframeAPIReady;
		};

		console.log('Loading API...');
		downloadIFrameAPI();
	},

	onReady: function() {
		console.log('Player ready.')

		var videoId = Session.get('videoId');

		if (videoId) {
			Player.loadVideo(videoId);
		}
	},

	onStateChange: function(state) {

		// Started playing from pause
		if (state === YT.PlayerState.PLAYING && lastState === YT.PlayerState.PAUSED) {
			isOwner() ?
				setRoomTime(localTime) :
				Player.setTime( Session.get('time') );

			console.log(Session.get('time'));
		}
		// Video buffering
		else if (state === YT.PlayerState.BUFFERING) {
			if ( isOwner() ) {
				stopTimeTracking();
			}
		}
		// Started playing from buffering
		else if (state === YT.PlayerState.PLAYING && lastState === YT.PlayerState.BUFFERING) {
			localTime = player.getCurrentTime();

			if ( isOwner() ) {
				startTimeTracking();
			}
		}

		lastState = state;
	},

	loadVideo: function(id, length) {
		console.log('Loading video...');

		localVideoId = id;

		player.loadVideoById({
			videoId: id,
			startSeconds: Session.get('time')
		});
		
		var roomId = Session.get('roomId');
		// Update room video id
		Rooms.update({ _id: roomId }, { $set: { videoId: id } });

		$('.player-wrapper').slideDown();
	},

	isPlaying: function() {
		return player.getPlayerState() === YT.PlayerState.PLAYING;
	},

	setTime: function(time) {
		player.seekTo(time, true);
		localTime = time;
	}
}