/* Server configuration - Run when server starts */

Future = Npm.require('fibers/future');

YoutubeApi.authenticate({
  type: 'key',
  key: 'AIzaSyCyxs8djqEP3RlO_4fHZlB8eTJV10jbKUg'
});

Meteor.methods({
  searchVideo: function(search) {
    
    var results = new Future();

    YoutubeApi.search.list(
      {
        part: 'id, snippet',
        type: 'video',
        maxResults: 1,
        q: search,
      },
      function (err, data) {
        err ?
          results.throw(err) :
          results.return(data);
      }
    );

    return results.wait();
  }
});