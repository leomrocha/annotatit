describe("Comments", function() {

  describe("Comment ViewModel: ", function() {
    var comment, new_comment, comment_view_model, new_content;

    beforeEach(function() {
      comment = new Comment();
      new_comment = new Comment({comment: "New Comment" });
    });
    
    it("should be able to generate the ViewModel", function() {
      expect(new CommentViewModel(comment)).toEqual(jasmine.any(CommentViewModel));
    });

    it("should be able to get the model", function() {
      comment_view_model = new CommentViewModel(comment);
      expect(comment_view_model.model()).toEqual(comment);
    });

    it("should be able to set the model", function() {
      comment_view_model = new CommentViewModel(comment);
      expect(function() {comment_view_model.model(new_comment);}).not.toThrow();
      expect(comment_view_model.model()).toEqual(new_comment);
    });

    it("should be able to change the content of the comment", function() {
      comment_view_model = new CommentViewModel(comment);
      new_content = "New Text";
      expect(function() {comment_view_model.model().set('comment', new_content);}).not.toThrow();
      expect(comment_view_model.model().get('comment')).toEqual(new_content);
    });

  });

  describe("Comments ViewModel: ", function() {
    var comments_view_model, comments, new_comments;

    beforeEach(function() {
      comments = new Comments([
        new Comment({comment: "Lorem ipsum dolor sit amet,"}),
        new Comment({comment: "Lorem ipsum dolor sit amet,"}),
        new Comment({comment: "Lorem ipsum dolor sit amet,"}),
        new Comment({comment: "Lorem ipsum dolor sit amet,"})
      ]);
      new_comments = new Comments([
        new Comment({comment: "Zorem ipsum dolor sit amet,"}),
        new Comment({comment: "Zorem ipsum dolor sit amet,"}),
        new Comment({comment: "Zorem ipsum dolor sit amet,"}),
        new Comment({comment: "Zorem ipsum dolor sit amet,"})
      ]);
    });
    
    it("should be able to generate the ViewModel", function() {
      expect(new CommentsViewModel(comments)).toEqual(jasmine.any(CommentsViewModel));
    });

    it("should be able to get the collection", function() {
      comments_view_model = new CommentsViewModel(comments);
      expect(comments_view_model.comments.collection()).toEqual(comments);
    });

    it("should be able to set the collection", function() {
      comments_view_model = new CommentsViewModel(comments);
      expect(function() {
        comments_view_model.comments.collection(new_comments);
      }).not.toThrow();
      expect(comments_view_model.comments.collection()).toEqual(new_comments);
    });

  });

});