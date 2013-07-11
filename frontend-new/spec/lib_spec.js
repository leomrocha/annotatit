var lorem = "Lorem ipsum dolor sit amet,";
var zorem = "Zorem ipsum dolor sit amet,";
var comments_list1 = [
  {comment: lorem},
  {comment: lorem},
  {comment: lorem},
  {comment: lorem}
];
var comments_list2 = [
  {comment: zorem},
  {comment: zorem},
  {comment: zorem},
  {comment: zorem}
];

describe("ViewModels", function() {

  describe("Comment ViewModel", function() {
    var comment, new_comment, comment_view_model;

    beforeEach(function() {
      comment = new Comment();
      new_comment = new Comment({comment: lorem });
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
      expect(function() {comment_view_model.model().set('comment', zorem);}).not.toThrow();
      expect(comment_view_model.model().get('comment')).toEqual(zorem);
    });
  });

  describe("Comments ViewModel", function() {
    var comments_view_model, comments, new_comments;

    beforeEach(function() {
      comments = new Comments(comments_list1);
      new_comments = new Comments(comments_list2);
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
    it("should be albe to write a comment in new_comment", function() {
      expect(function() {comments_view_model.new_comment(lorem)}).not.toThrow();
      expect(comments_view_model.new_comment()).toEqual(lorem);
    });

    xit("should be able to add a new comment", function() {
      comments_view_model.new_comment(zorem);
      expect(function() {comments_view_model.onAddComment()}).not.toThrow();
      expect(
        comments_view_model.comments.collection()
        .findWhere({comment: zorem}).get("comment")
      ).toEqual(zorem);
    });
  });

  xdescribe("SyncComment ViewModel", function() {
    var sync_comment, sync_new_comment, sync_comment_view_model;

    beforeEach(function() {
      sync_comment = new SyncComment();
      sync_new_comment = new SyncComment({sync_comment: lorem });
    });
    
    xit("should be able to generate the ViewModel", function() {
      expect(new SyncCommentViewModel(sync_comment)).toEqual(jasmine.any(SyncCommentViewModel));
    });

    xit("should be able to get the model", function() {
      sync_comment_view_model = new SyncCommentViewModel(sync_comment);
      expect(sync_comment_view_model.model()).toEqual(sync_comment);
    });

    xit("should be able to set the model", function() {
      sync_comment_view_model = new SyncCommentViewModel(sync_comment);
      expect(function() {sync_comment_view_model.model(sync_new_comment);}).not.toThrow();
      expect(sync_comment_view_model.model()).toEqual(sync_new_comment);
    });

    xit("should be able to change the content of the comment", function() {
      sync_comment_view_model = new SyncCommentViewModel(sync_comment);
      expect(function() {sync_comment_view_model.model().set('comment', zorem);}).not.toThrow();
      expect(sync_comment_view_model.model().get('comment')).toEqual(zorem);
    });
  });

});

describe("Models", function() {
  describe("Comment", function() {
    it("should be able to create a new one", function() {
      expect(new Comment()).toEqual(jasmine.any(Comment));
    });

    it("should be able to create a new one using a JSON object as source", function() {
      new_comment = {comment: lorem};
      expect(new Comment(new_comment)).toEqual(jasmine.any(Comment));
    });
  });

  describe("Comments", function() {
    var comments, new_comment;
    it("should be able to create a new one", function() {
      expect(new Comments([])).toEqual(jasmine.any(Comments));
    });

    it("should be able to create a new one using a JSON object as source", function() {
      expect(new Comments(comments_list1)).toEqual(jasmine.any(Comments));
    });

    it("should be able to get add a comment", function() {
      comments = new Comments([]);
      new_comment = {comment: lorem};
      expect(function(){comments.add(new_comment);}).not.toThrow();
      expect(comments.toJSON()).toContain(new_comment);
    });
  });

  describe("SyncComment", function() {
    var new_sync_comment;
    it("should be able to create a new one", function() {
      expect(new SyncComment()).toEqual(jasmine.any(SyncComment));
    });
    
    it("should be able to create a new one using a JSON object as source", function() {
      new_sync_comment = {comment: lorem};
      expect(new SyncComment(new_comment)).toEqual(jasmine.any(Comment));
    });
  });
});