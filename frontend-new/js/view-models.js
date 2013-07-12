////////////////
// ViewModels //
////////////////

/*

The signals that MUST be emmited 

    //On updating a [Flag|Section|SyncComment|Comment]
    //this is for connecting with GraphicDisplay
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:updated", DATA);
    
    //on mouse clicked over a [Flag|Section|SyncComment]
    $.event.trigger("Annotatit:Event:time:set", MEDIA_TIME);
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:mouse:click", DATA);


That MIGTH be implemented later:
    //on mouse events over a [Flag|Section|SyncComment|Comment]
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:mouse:over", DATA);
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:mouse:out", DATA);
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:mouse:press", DATA);
    $.event.trigger("Annotatit:Event:[Flag|Section|SyncComment|Comment]:mouse:release", DATA);


*/

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
    this.media_time = kb.defaultObservable(this._media_time, 0);
    // Operations
    this.onDestroyComment = function() {
      return model.destroy();
    }
    return this;
  }
});

/**
 * SyncCommentsViewModel: ViewModel for Comments
 * @attribute comments
 * @param  {Comments} comments 
 * @return {SyncCommentsViewModel}
 */
var SyncCommentsViewModel = function(sync_comments) {
  var _this = this;
  this.sync_comments = kb.collectionObservable(sync_comments, {
    view_model: SyncCommentViewModel,
    sort_attribute: 'media_time'
  });
  this.new_sync_comment = ko.observable('');
  //is this the time tracker 
  this.current_media_time = ko.observable(0);
  
  //TODO add event handler
  //the second argument (this) is passed in event.data by jQuery, that way the 
  //reference to the current object is not lost due to event handling
  $(document).on("Annotatit:Event:MediaPlayerFacade:time:update",this, callback);

  this.updateMediaTime = function(event, time) {
    //validate that time is a number, or transform it to
    //_this.current_media_time(time); 
    event.data.current_media_time(time); //event.data is the SyncCommentsViewModel object
  };
  
  this.seekTime = function(time){
    //emit time signal
    //MUST be a number
    $.event.trigger("Annotatit:Event:time:set",media_time);
  };
  
  this.onAddComment = function(view_model, event) {
    if (!$.trim(_this.new_sync_comment()) || (event.keyCode !== ENTER_KEY)) {
      return true;
    }
    _this.sync_comments.collection().create({
      comment: _this.new_sync_comment(),
      media_time: _this.current_media_time()
    });
    return _this.new_sync_comment('');
  };
};

