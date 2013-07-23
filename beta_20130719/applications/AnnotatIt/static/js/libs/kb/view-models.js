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
    kb.ViewModel.prototype.constructor.call(this, model, {internals: ['text']});         
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
  var self = this;
  this.comments = kb.collectionObservable(comments, {
    view_model: CommentViewModel,
    sort_attribute: 'comment'
  });

  this.new_comment = ko.observable('');
  this.onAddComment = function(view_model, event) {
    if (!$.trim(self.new_comment()) || (event.keyCode !== ENTER_KEY)) {
      return true;
    }
    self.comments.collection().create({
      comment: $.trim(self.new_comment())
    });
    return self.new_comment('');
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
  var self = this;
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
  $(document).on("Annotatit:Event:MediaPlayerFacade:time:update",this.updateMediaTime);

  this.updateMediaTime = function(event, time) {
    //validate that time is a number, or transform it to
    //self.current_media_time(time); 
    self.media_time(time); //event.data is the SyncCommentsViewModel object
  };
   
  this.seekTime = function(time){
    //emit time signal
    //MUST be a number
    $.event.trigger("Annotatit:Event:time:set",media_time);
  };
  
  this.onAddComment = function(view_model, event) {
    if (!$.trim(self.new_sync_comment()) || (event.keyCode !== ENTER_KEY)) {
      return true;
    }
    self.sync_comments.collection().create({
      comment: self.new_sync_comment(),
      media_time: self.current_media_time()
    });
    return self.new_sync_comment('');
  };
};

/**
 * FSCommentVM: ViewModel for FlaggedSyncComment
 * @type {kb.ViewModel}
 * @attribute comment
 * @param  {FlaggedSyncComment} model
 * @return {FSCommentVM}   
 */
var FSCommentVM = kb.ViewModel.extend({
  constructor: function(model) {
    var self = this;
    kb.ViewModel.prototype.constructor.call(this, model);
    //TODO understand WHERE is saved the model reference
    //TODO understand if the model is changed automatically, or I have to do it by hand
    // Data
    this.editing = ko.observable(false);
    this.flags = [
      {flag_name:"blue", keyboard_shortcut:"b", flag_color:"#0000FF"},
      {flag_name:"green", keyboard_shortcut:"g", flag_color:"#00ff00"},
      {flag_name:"yellow", keyboard_shortcut:"y", flag_color:"#ffff00"},
      {flag_name:"red", keyboard_shortcut:"r", flag_color:"#ff0000"}
    ];
    // Operations
    ko.computed(function() {
      flag = _.findWhere(self.flags, {
        keyboard_shortcut: self.keyboard_shortcut()
      });
      self.flag_color(flag.flag_color);
      self.flag_name(flag.flag_name);
    });
    
    //nice idea thoung it is not really a good dev practice
    $("#AnnotatItGraphCanvas").on("click", function() {
      if (self.editing()) {  
        self.media_time(MediaPlayerFacade.getCurrentTime());
      };
    });
    
    this.Edit = function() {
      self.editing(true);
    };
    this.Save = function() {
      self.editing(false);
      return model.save();
    };
    this.Destroy = function() {
      return model.destroy();
    }
    return this;
  }
});

/**
 * FSCommentsListVM: ViewModel for FlaggedSyncronizedComments
 * @attribute comments
 * @param  {FlaggedSyncComments} comments 
 * @return {FSCommentsListVM}
 */
var FSCommentsListVM = function(comments) {
  var self = this;
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
    view_model: FSCommentVM
  });

  // Operations
  $(document).on("Annotatit:Event:MediaPlayerFacade:time:update", function() {
    self.new_media_time(MediaPlayerFacade.getCurrentTime());
  });
  this.addComment = function() {
    self.comments.collection().create({
      owner_id: 1, //TODO should be the current user
      can_edit: true,
      can_delete: true,
      owner_name: "Leo",//should get from the session of the current user
      owner_thumbnail_url: "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png",
      media_id: "a1", //current media id, has to get the media id in the player ... how to do this?
      text: self.new_text(),
      media_time: self.new_media_time(),
      flag_name: this.new_flag_name(),
      keyboard_shortcut: this.new_keyboard_shortcut(),
      flag_color: this.new_flag_color(),
      text: self.new_text(),
    }
    GraphDisplayBox.add(comment);
    self.comments.collection().create(comment);
    return self.new_sync_comment('');
  };
};
