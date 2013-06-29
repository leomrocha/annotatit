////////////////
// ViewModels //
////////////////

/**
 * CommentViewModel: ViewModel for Comment
 * @type {kb.ViewModel}
 * @attribute comment
 * @attribute editing
 * @param  {Comment} model
 * @return {CommentViewModel}   
 */
var CommentViewModel = kb.ViewModel.extend({
  constructor: function(model) {

    kb.ViewModel.prototype.constructor.call(this, model, {internals: ['comment']});   
		var _this = this;	    
    // Data
    this.comment = kb.defaultObservable(this._comment, '');
    this.editing = ko.observable(false);
  	
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