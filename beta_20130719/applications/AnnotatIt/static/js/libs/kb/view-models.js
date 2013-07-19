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
 * @param  {SyncComment} model
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
 * SyncCommentsViewModel: ViewModel for SyncComments
 * @attribute comments
 * @param  {SyncComments} comments 
 * @param {JQueryDOM Element} player_slider DOM Element with JQuery-UI slider attached
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
  $(document).on("Annotatit:Event:MediaPlayerFacade:time:update",this, this.updateMediaTime);

  this.updateMediaTime = function(event, time) {
    //validate that time is a number, or transform it to
    //_this.current_media_time(time); 
    event.data.media_time(time); //event.data is the SyncCommentsViewModel object
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

/**
 * FlaggedSyncCommentViewModel: ViewModel for FlaggedSyncComment
 * @type {kb.ViewModel}
 * @attribute comment
 * @param  {FlaggedSyncComment} model
 * @return {FlaggedSyncCommentViewModel}   
 */
var FlaggedSyncCommentViewModel = kb.ViewModel.extend({
  constructor: function(model) {
    var _this = this;
    kb.ViewModel.prototype.constructor.call(this, model);
    // Data
    this.editing = ko.observable(false);
    this.flags = [
      {flag_name:"What", keyboard_shortcut:"w", flag_color:"#0000FF"},
      {flag_name:"Good", keyboard_shortcut:"g", flag_color:"#00ff00"},
      {flag_name:"Warning", keyboard_shortcut:"!", flag_color:"#ffff00"},
      {flag_name:"Bad", keyboard_shortcut:"b", flag_color:"#ff0000"}
    ];
    // Operations
    ko.computed(function() {
      flag = _.findWhere(_this.flags, {
        keyboard_shortcut: _this.keyboard_shortcut()
      });
      _this.flag_color(flag.flag_color);
      _this.flag_name(flag.flag_name);
    });
    $("#AnnotatItGraphCanvas").on("click", function() {
      if (_this.editing()) {  
        _this.media_time(MediaPlayerFacade.getCurrentTime());
      };
    });
    this.Edit = function() {
      _this.editing(true);
    };
    this.Save = function() {
      _this.editing(false);
    };
    this.Destroy = function() {
      return model.destroy();
    }
    return this;
  }
});

/**
 * FlaggedSyncCommentsViewModel: ViewModel for FlaggedSyncComments
 * @attribute comments
 * @param  {FlaggedSyncComments} comments 
 * @param {JQueryDOM Element} player_slider DOM Element with JQuery-UI slider attached
 * @return {FlaggedSyncCommentsViewModel}
 */
var FlaggedSyncCommentsViewModel = function(comments) {
  var _this = this;
  // Data
  this.new_media_time = ko.observable(0);
  this.new_text = ko.observable("");
  this.new_flag_name = ko.observable("");
  this.new_keyboard_shortcut = ko.observable("");
  this.new_flag_color = ko.observable("");
  this.commentFlags = [
    {flag_name:"What", keyboard_shortcut:"w", flag_color:"#0000FF"},
    {flag_name:"Good", keyboard_shortcut:"g", flag_color:"#00ff00"},
    {flag_name:"Warning", keyboard_shortcut:"!", flag_color:"#ffff00"},
    {flag_name:"Bad", keyboard_shortcut:"b", flag_color:"#ff0000"}
  ];
  this.comments = kb.collectionObservable(comments, {
    view_model: FlaggedSyncCommentViewModel
  });

  // Operations
  $(document).on("Annotatit:Event:MediaPlayerFacade:time:update", function() {
    _this.new_media_time(MediaPlayerFacade.getCurrentTime());
  });
  this.addComment = function() {
    _this.comments.collection().create({
      type: "FlaggedSyncComment", //TODO (data type definition) fix this field in the format, should be selected or created in an automatic way
      owner_id: 1, //should be 
      can_edit: true,
      can_delete: true,
      owner_name: "Leo",//should get from the session of the current user
      owner_thumbnail_url: "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png",
      media_id: "a1", //current media id, has to get the media id in the player ... how to do this?
      parent_id: "",//will not use
      creation_datetime: Date(), //automatic fields in the server
      update_datetime: Date(), //
      text: _this.new_text(),
      media_time: _this.new_media_time(),
      flag_name: this.new_flag_name(),
      keyboard_shortcut: this.new_keyboard_shortcut(),
      flag_color: this.new_flag_color(),
      text: _this.new_text(),
      creation_datetime: "Wed Jul 3 14:17", 
      update_datetime: "Wed Jul 3 14:19" 
    }
    GraphDisplayBox.add(comment);
    _this.comments.collection().create(comment);
    return _this.new_sync_comment('');
  };
};
