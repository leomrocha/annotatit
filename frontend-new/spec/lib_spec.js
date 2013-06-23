describe("Comments", function() {
  var comments_list;
  var new_comment;
  
  beforeEach(function() {
    comments_list = new CommentsList({});
  });

  describe("CommentsList Model: ", function() {

    it("should be able to add comments", function() {
      var new_comment = new Comment({comment: "Lorem ipsum dolor sit amet,"});
      expect(comments_list.get('comments').add(new_comment)
      .contains(new_comment)).toBeTruthy();
    });

    it("should be able to remove comments", function() {
      var new_comment = new Comment({comment: "Lorem ipsum dolor sit amet,"});
      expect(comments_list.get('comments').add(new_comment).remove(new_comment)
      .contains(new_comment)).toBeFalsy();
    });
    
  });

  // describe("when song has been paused", function() {
  //   beforeEach(function() {
  //     player.play(song);
  //     player.pause();
  //   });

  //   it("should indicate that the song is currently paused", function() {
  //     expect(player.isPlaying).toBeFalsy();

  //     // demonstrates use of 'not' with a custom matcher
  //     expect(player).not.toBePlaying(song);
  //   });

  //   it("should be possible to resume", function() {
  //     player.resume();
  //     expect(player.isPlaying).toBeTruthy();
  //     expect(player.currentlyPlayingSong).toEqual(song);
  //   });
  // });

  // // demonstrates use of spies to intercept and test method calls
  // it("tells the current song if the user has made it a favorite", function() {
  //   spyOn(song, 'persistFavoriteStatus');

  //   player.play(song);
  //   player.makeFavorite();

  //   expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  // });

  // //demonstrates use of expected exceptions
  // describe("#resume", function() {
  //   it("should throw an exception if song is already playing", function() {
  //     player.play(song);

  //     expect(function() {
  //       player.resume();
  //     }).toThrow("song is already playing");
  //   });
  // });
});