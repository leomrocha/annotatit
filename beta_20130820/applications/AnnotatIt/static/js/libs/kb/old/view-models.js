(function($) {
    ////////////////
    // ViewModels //
    ////////////////
    //console.log("defining ViewModels");

    //This var defines an scope of all the vars.
    if(! _.has($, "AnnotatIt")){
        $.AnnotatIt = {};
    }
    
    var AnnotatIt = $.AnnotatIt;
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
     * MediaVM: ViewModel for a single media object
     * @type {kb.ViewModel}
     * @attribute comment
     * @param  {Media} model
     * @return {MediaVM}   
     */
    AnnotatIt.MediaVM = kb.ViewModel.extend({
        constructor: function(model) {
            var self = this;
            kb.ViewModel.prototype.constructor.call(this, model);
            
            self.media = model;
            //http://localhost:5000/AnnotatIt/static/images/video_150.png
            //TODO take away this hack and change it for something better!!!
            if (self.media_network().toLowerCase() ==="youtube" && self.media_thumbnail().match("images/video_150.png")){
                //console.log("updating thumbnail");
                //console.log(self.media);
                self.media_thumbnail(getYoutubeThumbnailUrl(self.media_id()));
                self.media.save();
                //console.log(self.media);
            }
            self.isOwner = ko.computed(function(){
                    //warning!! depends on global
                    try{
                        if (self.owner_id == AnnotatIt.me.id){
                            return true;
                            }
                    } catch(err){}
                    return false;
                });
            
            self.saveModel = function() {
                //console.log("Save!!")
                self.media.save();
            };
            self.fetchModel = function() {
                //console.log("Save!!")
                self.media.fetch();
            };
            return self;
        }
    });


    //Knockout Validation things, should only be needed or the add_media ViewModel
    ko.validation.rules.pattern.message = 'Invalid.';

    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true,
        messageTemplate: null
    });

    /**
     * AddMediaVM: ViewModel for MediaCollection( though is not general yet, is only for the add_media view)
     * @type {kb.ViewModel}
     * @attribute comment
     * @param  {MediaCollection} model
     * @return {AddMediaVM}   
     */
    var PrivacyOption = function(name, val) {
        this.optName = name;
        this.optValue = val;
    };
    AnnotatIt.AddMediaVM = kb.ViewModel.extend({
    
        constructor: function(model) {
            
            var self = this;
            kb.ViewModel.prototype.constructor.call(this, model);
            //attributes
            self.medias = model;
            self.m_title = ko.observable("").extend({
                                            required: { 
                                                message: 'Please supply a title.' 
                                                }
                                           });
            self.m_url = ko.observable("").extend({
                                            required: { 
                                                message: 'Must be a YouTube or Vimeo link.' 
                                                }
                                           });
            self.m_thumbnail = ko.computed(function(){
                var thumb = getThumbnail(self.m_url());
                return thumb;
            });
            self.m_description = ko.observable();
            
            self.errors = ko.validation.group(self);
            self.mediaAdded = ko.observable(false);

            
            //privacy
            //TODO put again the multiple choice here. But for the moment will remain optionless
            //self.m_privacy = ko.observableArray([ "private", "unlisted", "public"]);
            self.m_privacy = ko.observableArray(["public"]);
            self.selectedPrivacy = ko.observable("public");
            
            //permissions
            self.m_viewers = ko.observableArray([
                //TODO put again the multiple choice here. But for the moment will remain optionless
                new PrivacyOption("all", "all")//,
                //new PrivacyOption("by invitation", "authorized_groups"),
                //new PrivacyOption("only me", "only_me")
            ]);
            self.selectedViewers = ko.observable();
            self.m_annotators = ko.observableArray([
                //TODO put again the multiple choice here. But for the moment will remain optionless
                //new PrivacyOption("by invitation", "authorized_groups"),
                new PrivacyOption("only me", "only_me"),//,
                new PrivacyOption("all", "all")
            ]);
            self.selectedAnnotators = ko.observable();
            
            //invitations
            self.invitedAnnotators = ko.observableArray();
            self.invitedViewers = ko.observableArray();
            
            // Data
            self.media_annotate_key = ko.observable("");
            
            self.createMedia = function(){
                    var mdl = model.create({
                            title :  self.m_title(), 
                            media_url : self.m_url(),
                            media_thumbnail : self.m_thumbnail(),
                            description : self.m_description(),
                            privacy : self.selectedPrivacy(),
                            annotation_permissions : self.selectedAnnotators().optValue,
                            view_permissions : self.selectedViewers().optValue,
                            //invitees
                            invited_annotators : self.invitedAnnotators(),
                            invited_viewers : self.invitedViewers(),
                            //if success, now get all the invitees
                        }, 
                        {wait: true,
                         success: function(mdl, resp, opt){
                                      self.mediaAdded(true);
                                      //TODO redirect has to be taken out
                                      //show a nice message that tells that everything went well!!
                                      // Give option to start annotating or to keep adding new media files!
                                      //console.log("successfully created new media");
                                      //console.log(mdl);
                                      //console.log("response");
                                      //console.log(resp);
                                      //console.log("options");
                                      //console.log(opt);
                                      //console.log("local model");
                                      //console.log(self.medias);
                                      //mdl.action.fetch();
                                      //self.media_annotate_key(mdl.get('media_annotate_key'));
                                  },
                         error: function(model, xhr, options){
                                     //TODO show errors to client
                                     //for now only client side validation is shown
                                      /*console.log("error creating media");
                                      console.log(model);
                                      console.log("xhr");
                                      console.log(xhr);
                                      console.log("options");
                                      console.log(options);
                                      console.log("End error message");*/
                         }
                        });
                    //console.log(mdl);
                    //mdl.save();
            };

            self.submit = function () {
                console.log("checking for errors");
                if (self.errors().length == 0) {
                    
                    self.createMedia();
                } else {
                    alert('Please check your submission.');
                    self.errors.showAllMessages();
                }
            };
            
            self.Save = function() {
                console.log("Save!!")
                //return model.save();
            };
            return self;
        }
    });


    /**
     * MediaListVM: ViewModel for MediaCollection (for the listing)
     * @type {kb.ViewModel}
     * @attribute comment
     * @param  {MediaCollection} model
     * @return {MediaListVM}   
     */
    AnnotatIt.MediaListVM = kb.ViewModel.extend({
    
        constructor: function(model) {
            
            var self = this;
            kb.ViewModel.prototype.constructor.call(this, model);
            //attributes
            self.medias = model;

            this.mediaFiles = kb.collectionObservable(model, {
                view_model: AnnotatIt.MediaVM
            });
            
            self.loadAllMedia = function(){
                self.medias.fetch();
            };
            self.editMedia = function() {
                //TODO
                //console.log("Save!!")
                //return model.save();
            };
            self.addMedia = function() {
                //TODO
                //console.log("Save!!")
                //return model.save();
            };
            self.annotateMedia = function() {
                //TODO
                //console.log("Save!!")
                //return model.save();
            };
            self.viewMedia = function() {
                //TODO
                //console.log("Save!!")
                //return model.save();
            };
            self.shareMedia = function() {
                //TODO
                //console.log("Save!!")
                //return model.save();
            };
            return self;
        }
    });


    /**
     * FSCommentVM: ViewModel for FlaggedSyncComment
     * @type {kb.ViewModel}
     * @attribute comment
     * @param  {FlaggedSyncComment} model
     * @return {FSCommentVM}   
     */
    AnnotatIt.FSCommentVM = kb.ViewModel.extend({
        constructor: function(model) {
            var self = this;
            kb.ViewModel.prototype.constructor.call(this, model);
            //related user's model. Needs KnockBack observables
            //var usrmdl = new AnnotatIt.User();
            //usrmdl.id = self.owner_id();
            //usrmdl.fetch();
            self.first_name = kb.observable(model.user, { key: 'nickname'} );
            self.thumbnail = kb.observable(model.user, { key: 'image_link'} );
            // extra data needed
            self.editing = ko.observable(false);
            //console.log("media time of this comment");
            //console.log(self.media_time());
            self.timetxt = ko.computed( function() {return number2txttime(self.media_time())});
            //console.log(self.timetxt());
            //self.duration = 
            
            self.can_delete = 
              self.can_edit = ko.computed(function(){ 
                //console.log("setting ownership");
                //console.log(self.owner_id());
                //console.log(AnnotatIt.me.id);
                if (self.owner_id() == AnnotatIt.me.id){
                    return true;
                }
                return false;
            });

            //methods
            
            self.seekTime = function(){
                console.log("seek Time: "+ self.media_time() );
                //emit time signal
                //MUST be a number
                $.event.trigger("Annotatit:Event:time:set", self.media_time());
            };

            self.incrementTime = function(){
                self.media_time(self.media_time() +1);
                //TODO control that is not bigger than duration of the file
            };
            self.decrementTime = function(){
                self.media_time(self.media_time() -1);
                if (self.media_time() < 0){
                    self.media_time(0);
                }
            };
            self.Edit = function() {
                self.editing(true);
            };
            self.Save = function() {
                $.event.trigger("Annotatit:Event:FSCommentsListVM:update", self.model );//TODO change event type
                self.editing(false);
                return self.model.save();
            };
            self.Destroy = function() {
                $.event.trigger("Annotatit:Event:FSCommentsListVM:update", self.model );//TODO change event type
                return self.model.destroy();
            }
            return self;
        }
    });

    /**
     *CommentFlag: Flags (a Model, but not need to synchronize yet) 
     * that are associated with the comments
     * 
     */
    var CommentFlag = function(name, val, shortcut) {
        this.flag_name = name;
        this.flag_color = val;
        this.keyboard_shortcut = shortcut;
    };
    var flagList = [
            //colors from google calendar
            new CommentFlag("Blue", "#5484ed", "B"),
            new CommentFlag("Light Blue", "#a4bdfc", "b"),
            new CommentFlag("Purple", "#dbadff", "p"),
            new CommentFlag("Turquoise", "#46d6db", "t"),
            new CommentFlag("Light green", "#7ae7bf", "L"),
            new CommentFlag("Green", "#7bd148", "g"),
            new CommentFlag("Bold green", "#51b749", "G"),
            new CommentFlag("Yellow", "#fbd75b", "y"),
            new CommentFlag("Orange", "#ffb878", "o"),
            new CommentFlag("Pink", "#ff887c", "r"),
            new CommentFlag("Red", "#dc2127", "R")//,
            //new CommentFlag("Gray", "#e1e1e1", "r")
        ];
    /**
     * FSCommentsListVM: ViewModel for FlaggedSyncronizedComments
     * @attribute comments
     * @param  {FlaggedSyncComments} comments 
     * @return {FSCommentsListVM}
     */
    //AnnotatIt.FSCommentsListVM = function(comments, sections) {
    AnnotatIt.FSCommentsListVM = function(models) {
        var self = this;
        // Data
        self.new_media_time = ko.observable(0);
        self.new_text = ko.observable("");
        //console.log(self.new_media_time())
        self.timetxt = ko.computed( function() {return number2txttime(self.new_media_time())});
        //console.log(self.timetxt());
        //all the flags
        self.allFlags = ko.observableArray(flagList);        
        //knockback comments
        self.comments = kb.collectionObservable(models, {
            view_model: AnnotatIt.FSCommentVM
        });
        //time offset:
        self.timeOffset = ko.observable(-2);
        
        self.incrementOffset = function(){ 
            self.timeOffset(self.timeOffset()+1);
        };
        self.decrementOffset = function(){
            self.timeOffset(self.timeOffset()-1);
        };
        //FILTERS
        //filters selection
        self.allAuthors = ko.computed(function(){
 //console.log("mapping user names");
            //filter all the authors and no repeat
            //console.log(self.sections());
            var tmp = _.map(self.comments(), function(s){
                                                //console.log(s);
                                                //console.log(s.first_name);
                                                var ret2 =  s.first_name();
                                                if(ret2){
                                                    return ret2;
                                                }
                                                return "all";
                                            }); 
            //as they are observables, now apply the functions
            //console.log("passed the mapping");
            //console.log(tmp);
            tmp.unshift("all");
            var ret = _.uniq(tmp);
            //console.log(ret);
            return ret;
        });
        self.allFlagsOptions = ko.computed(function(){
                var ret = _.pluck(self.allFlags(),'flag_name');
                ret.unshift("all");
                return ret;
            });
        self.chosenAuthors = ko.observable("all"); //ko.observableArray(self.allAuthors());
        self.chosenFlags = ko.observable("all"); //ko.observableArray([]);
        self.contentFilter = ko.observable("");
        //filter functionality
        self.filteredComments = ko.computed(function(){
            //console.log("filtered comments ");
            var filtered = self.comments();
            //filter by user
            if (self.chosenAuthors() !="all"){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                   return ( c.first_name().toLowerCase() === self.chosenAuthors().toLowerCase());
                });
            }
            //filter by flag
            if (self.chosenFlags() !="all"){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                   return ( c.flag_name().toLowerCase() === self.chosenFlags().toLowerCase());
                });
            }
            //filter by content
            if ( $.trim(self.contentFilter()) !=""){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                    return ( c.text().match(self.contentFilter()));//TODO this might be too heavy for too many comments
                });
            }
            //console.log(filtered);
            return filtered;
        });
        //Knockback initial sorting
        self.comments.sortAttribute('media_time');
        self.comments.sort();
        
        //Comments creation form selected (focus)
        self.commentsSelected = ko.observable(true);
        self.commentFormSelected = ko.observable(false);

        //Comment creation        

        self.selectedFlag = ko.observable(flagList[7]); //any random flag selected
        
        self.selectFlag = function(flag_name, flag_color, letter){
            //console.log("select new color");
            //console.log(flag_name);
            //console.log(flag_color);
            //console.log(letter);
            //I know it is not efficient. dont worry be huggies.
            self.selectedFlag = ko.observable(new CommentFlag(flag_name, flag_color, letter));
            //now focus the box and stop the time update!! (a new comment should be created)
            self.commentsSelected(true);
            self.commentFormSelected(true);
            //change background color!!
        };
        // Update time (event binding)
        $(document).on("Annotatit:Event:MediaPlayerFacade:time:update", function(event, time) {
            //guarantee that no comment will be bloqued forever in the time I started typing
            //if(Math.abs(self.new_media_time - time ) > 20 || ( $.trim(self.new_text() )=="")){
            if ( $.trim(self.new_text() )==""){
                self.shouldUpdate = true;
            }
            if(self.shouldUpdate){
                self.new_media_time(time);
            }
            //self.new_media_time(MediaPlayerFacade.getCurrentTime());
            //self.commentFormSelected(true);
        });
        // Update time (event binding)
        $(document).on("Annotatit:Event:time:set", function(event, time) {
            console.log("time SET");
            self.shouldUpdate = true;
        });
        //creation functions
        self.createComment = function(view_model, event) {
            //console.log("key up");
            //console.log(event.keyCode);
            //if ($.trim(self.new_text()) && (event.keyCode == ENTER_KEY)) {
            if ( event.keyCode == ENTER_KEY ) {
                //console.log("enter presssed");
                self.addComment();
                self.shouldUpdate = true;
            }else{
                if(self.shouldUpdate){ 
                    self.shouldUpdate = false;
                }
            }
        };
        self.addComment = function() {
            //console.log("Creating a new comment");
            //console.log
            var comment = self.comments.collection().create({
                owner_id: AnnotatIt.me.id,
                media_id: AnnotatIt.media_file.id, //current media id, gets the media id from GLOBAL var
                text: self.new_text(),
                media_time: self.new_media_time() + self.timeOffset(), //take in account the offset
                flag_name: self.selectedFlag().flag_name,
                keyboard_shortcut: self.selectedFlag().keyboard_shortcut,
                flag_color: self.selectedFlag().flag_color
            }//,
             //{success : function() { console.log("comment creation success");  self.comments.push(comment);}  } 
            );
            self.new_text("");
            self.comments.sort();
            //launch event telling about the new comment:
            $.event.trigger("Annotatit:Event:FSCommentsListVM:update", comment );
            return comment;
            };
        
    };
    


//WARNING!!! THe only difference with FSCommentVM is that here call begin_time instead of media_time!!!!
//TODO Check how to do it better without duplicating code
    /**
     * SectionVM: ViewModel for section
     * @type {kb.ViewModel}
     * @attribute comment
     * @param  {Section} model
     * @return {SectionVM}   
     */
    AnnotatIt.SectionVM = kb.ViewModel.extend({
        constructor: function(model) {
            var self = this;
            kb.ViewModel.prototype.constructor.call(this, model);
            //related user's model. Needs KnockBack observables
            var usrmdl = new AnnotatIt.User();
            usrmdl.id = self.owner_id();
            usrmdl.fetch();
            self.first_name = kb.observable(usrmdl, { key: 'nickname'} );
            self.thumbnail = kb.observable(usrmdl, { key: 'image_link'} );
            // extra data needed
            self.editing = ko.observable(false);
            
            self.beginTimetxt = ko.computed( function() { return number2txttime(self.begin_time()) } );
            self.endTimetxt = ko.computed( function() { return number2txttime(self.end_time()) } );
            
            //self.duration = 
            
            self.can_delete = 
              self.can_edit = ko.computed(function(){ 
                //console.log("setting ownership");
                //console.log(self.owner_id());
                //console.log(AnnotatIt.me.id);
                if (self.owner_id() == AnnotatIt.me.id){
                    return true;
                }
                return false;
            });

            //methods
            
            self.seekTime = function(){
                console.log("seek Time: "+ self.begin_time() );
                //emit time signal
                //MUST be a number
                $.event.trigger("Annotatit:Event:time:set", self.begin_time());
            };

            self.incrementBeginTime = function(){
                self.begin_time(self.begin_time() +1);
                if (self.begin_time() > self.end_time()){
                    self.begin_time(self.end_time() -1 );
                }
                //TODO control that is not bigger than duration of the file
            };
            
            self.decrementBeginTime = function(){
                self.begin_time(self.begin_time() -1);
                if (self.begin_time() < 0){
                    self.begin_time(0);
                }
            };
            
            self.incrementEndTime = function(){
                self.end_time(self.end_time() +1);
                //TODO control that is not bigger than duration of the file
            };
            
            self.decrementEndTime = function(){
                self.end_time(self.end_time() -1);
                if (self.begin_time() > self.end_time()){
                    self.end_time(self.begin_time() +1 );
                }
                if (self.end_time() < 0){
                    self.end_time(0);
                }
            };
            self.Edit = function() {
                self.editing(true);
            };
            self.Save = function() {
                self.editing(false);
                var ret = self.model.save();
                $.event.trigger("Annotatit:Event:SectionsListVM:update", self.model );//TODO change event type
                return ret;
            };
            self.Destroy = function() {
                var ret = self.model.destroy();
                $.event.trigger("Annotatit:Event:SectionsListVM:update", self.model );//TODO change event type
                return ret;
            }
            return self;
        }
    });

    /**
     * SectionsListVM: ViewModel for Sections
     * @attribute sections
     * @param  {Sections} Sections 
     * @return {SectionsListVM}
     */
    //AnnotatIt.FSCommentsListVM = function(comments, sections) {
    AnnotatIt.SectionsListVM = function(models) {
        var self = this;
        // Data
        self.new_section_name = ko.observable("");
        self.new_begin_time = ko.observable(0); 
        self.new_end_time = ko.observable(0);

        self.beginTimetxt = ko.computed( function() { return number2txttime(self.new_begin_time()) } );
        self.endTimetxt = ko.computed( function() { return number2txttime(self.new_end_time()) } );
            
        self.sections = kb.collectionObservable(models, {
            view_model: AnnotatIt.SectionVM
        });
        self.sections.sortAttribute('begin_time');
        self.sectionFormSelected = ko.observable(false);
        self.sections.sort();
        
        self.allFlags = ko.observableArray(flagList);
        self.selectedFlag = ko.observable(flagList[8]);
        
        //FILTERS
        //filters selection
        self.allAuthors = ko.computed(function(){
            //console.log("mapping user names");
            //filter all the authors and no repeat
            //console.log(self.sections());
            var tmp = _.map(self.sections(), function(s){
                                                //console.log(s);
                                                //console.log(s.first_name);
                                                var ret2 =  s.first_name();
                                                if(ret2){
                                                    return ret2;
                                                }
                                                return "all";
                                            }); 
            //as they are observables, now apply the functions
            //console.log("passed the mapping");
            //console.log(tmp);
            tmp.unshift("all");
            var ret = _.uniq(tmp);
            //console.log(ret);
            return ret;
        });
        self.allFlagsOptions = ko.computed(function(){
                var ret = _.pluck(self.allFlags(),'flag_name');
                ret.unshift("all");
                return ret;
            });
        self.chosenAuthors = ko.observable("all"); //ko.observableArray(self.allAuthors());
        self.chosenFlags = ko.observable("all"); //ko.observableArray([]);
        self.contentFilter = ko.observable("");
        //filter functionality
        self.filteredSections = ko.computed(function(){
            //console.log("filtered comments ");
            var filtered = self.sections();
            //filter by user
            if (self.chosenAuthors() !="all"){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                   return ( c.first_name().toLowerCase() === self.chosenAuthors().toLowerCase());
                });
            }
            //filter by flag
            if (self.chosenFlags() !="all"){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                   return ( c.flag_name().toLowerCase() === self.chosenFlags().toLowerCase());
                });
            }
            //filter by content
            if ( $.trim(self.contentFilter()) !=""){
                filtered = ko.utils.arrayFilter(filtered, function(c){
                    return ( c.name().match(self.contentFilter()));//TODO this might be too heavy for too many comments
                });
            }
            //console.log(filtered);
            return filtered;
        });
        //Keeping track of the state of section creation
        self.inprogress = ko.observable(false);
        self.notinprogress = ko.computed( function(){ return !self.inprogress() } );
        //self.updateBeginTime = true;
        //self.updateEndTime = true;
        
        self.selectFlag = function(flag_name, flag_color, letter){
            //console.log("select new color");
            //console.log(flag_name);
            //console.log(flag_color);
            //console.log(letter);
            //I know it is not efficient. dont worry be huggies.
            self.selectedFlag = ko.observable(new CommentFlag(flag_name, flag_color, letter));
            //now focus the box and stop the time update!! (a new comment should be created)
            self.sectionFormSelected(true);
            //change background color!!
        };
        
        self.sectionsSelected = ko.observable(false);

        self.selectSections = function(){
            self.sectionsSelected(true);
            self.sectionFormSelected(true);
        };
        // Update time (event binding)
        $(document).on("Annotatit:Event:MediaPlayerFacade:time:update", function(event, time) {         
            if(!self.inprogress()){
                self.new_begin_time(time);
            }
                self.new_end_time(time);
        });
        // Update time (event binding)
        $(document).on("Annotatit:Event:time:set", function(event, time) {
            console.log("time SET");
            self.inprogress(false);
            //self.updateBeginTime = true;
            //self.updateEndTime = true;
        });
        //creation functions
        self.sectionStart = function() {
            console.log("Section Start call");
            //self.updateBeginTime = false;
            self.inprogress(true);
        };
        self.sectionEnd = function() {
            console.log("Section End call");
            self.addSection();
            self.inprogress(false);
            //self.updateBeginTime = true;
            //self.updateEndTime = true;
        };
        self.sectionCancel = function() {
            self.new_section_name("");
            //self.updateBeginTime = true;
            //self.updateEndTime = true;
            self.inprogress(false);
        };
        self.addSection = function() {
            //console.log("Creating a new comment");
            //console.log
            var section = self.sections.collection().create({
                owner_id: AnnotatIt.me.id,
                media_id: AnnotatIt.media_file.id, //current media id, gets the media id from GLOBAL var
                name: self.new_section_name(),
                begin_time: self.new_begin_time(),
                end_time: self.new_end_time(),
                flag_color: self.selectedFlag().flag_color,
                keyboard_shortcut: self.selectedFlag().keyboard_shortcut,
                flag_name: self.selectedFlag().flag_name
            }//,
             //{success : function() { console.log("comment creation success");  self.comments.push(comment);}  } 
            );
            //console.log("section created");
            //console.log(section);
            $.event.trigger("Annotatit:Event:SectionsListVM:update", section );
            return section;
        };
        
    };


/**
     * SectionsListVM: ViewModel for Sections
     * @attribute sections
     * @param  {Sections} Sections 
     * @return {SectionsListVM}
     */
    //AnnotatIt.FSCommentsListVM = function(comments, sections) {
    AnnotatIt.AllListsVM = function(commentsModels,sectionsModels) {
        var self = this;
        console.log("all VM setup");
        // Data
        self.sectionsModels = sectionsModels;
        self.commentsModels = commentsModels;
        
        self.sectionsVM = new AnnotatIt.SectionsListVM(sectionsModels);
        self.commentsVM = new AnnotatIt.FSCommentsListVM(commentsModels);
        
        self.sectionsSelected = ko.observable(false);
        self.commentsSelected = ko.observable(true);//ko.computed( function(){return !self.sectionsSelected} );

        self.selectSections = function(){
            self.sectionsSelected(true);
            self.commentsSelected(false);
        };
        self.selectComments = function(){
            self.sectionsSelected(false);
            self.commentsSelected(true);
        };
        self.selectFlag = function(n,c,s){
            self.sectionsVM.selectFlag(n,c,s);
            self.commentsVM.selectFlag(n,c,s);
        };
        
    };

    
    //console.log("All ViewModels defined");

})(jQuery);



