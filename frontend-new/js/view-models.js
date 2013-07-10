////////////////
// ViewModels //
////////////////

/**
 * CommentViewModel: ViewModel for Comment
 * @type {kb.ViewModel}
 * @attribute comment
 * @param  {Comment} model
 * @return {CommentViewModel}   
 */
var CommentViewModel = kb.ViewModel.extend({
  constructor: function(model) {
    kb.ViewModel.prototype.constructor.call(this, model, {internals: ['comment']});         
    // Data
    this.comment = kb.defaultObservable(this._comment, '');
    // Operations
    this.onDestroyComment = function() {
      return model.destroy();
    }
    return this;
  }
});

/**
 * CommentsViewModel: ViewModel for Comments
 * @attribute comments
 * @param  {Comments} comments 
 * @return {CommentsViewModel}
 */
var CommentsViewModel = function(comments) {
  var _this = this;
  this.comments = kb.collectionObservable(comments, {
    view_model: CommentViewModel,
    sort_attribute: 'comment'
  });

  this.new_comment = ko.observable('');
  this.onAddComment = function(view_model, event) {
    if (!$.trim(_this.new_comment()) || (event.keyCode !== ENTER_KEY)) {
      return true;
    }
    _this.comments.collection().create({
      comment: $.trim(_this.new_comment())
    });
    return _this.new_comment('');
  };
};

/**
 * SyncCommentViewModel: ViewModel for SyncComment
 * @type {kb.ViewModel}
 * @attribute comment
 * @param  {Comment} model
 * @return {SyncCommentViewModel}   
 */
var SyncCommentViewModel = kb.ViewModel.extend({
  constructor: function(model) {
    kb.ViewModel.prototype.constructor.call(this, model, {internals: ['comment', 'media_time']});         
    // Data
    this.comment = kb.defaultObservable(this._comment, '');
    this.media_time = kb.observable(this._media_time);
    // Operations
    this.onDestroyComment = function() {
      return model.destroy();
    }
    return this;
  }
});


