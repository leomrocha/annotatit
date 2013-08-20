(function($) {
    ////////////
    // Models //
    //
    //Adds to the AnnotatIt space:
    //
    //    FSComment, FSCommentsContainer 
    //    Media, User, UserContainer, Section, SectionContainer;
    ////////////
    //console.log("defining models");
    //This var defines an scope of all the vars.
    if(! _.has($, "AnnotatIt")){
        $.AnnotatIt = {};
    }
    
    var AnnotatIt = $.AnnotatIt;
    /**
     * Me : Information about my user account
     * @type {Backbone.Model}
     * @keys [model, Model]
     */
    AnnotatIt.Me = Backbone.Model.extend({
        urlRoot: '/api/current_user.json', 
        idAttribute: 'id'
    }); 


    /**
     * User : Other User's data, for association with
     * @type {Backbone.Model}
     * @keys [model, Model]
     */
    AnnotatIt.User = Backbone.Model.extend({
        url: function() {return '/api/user/'+this.id+'.json' },
        idAttribute: 'id'
    });
    
    /**
     * SectionsContainer: Contains all the sections related to the current media
     * @type {Backbone.Collection}
     * @contains Comment
     */
    AnnotatIt.MediaUsersContainer = Backbone.Collection.extend({
        self : this,
	    model: AnnotatIt.User,
        url: function() {return '/api/media_users/'+this.media_id+'.json' },
        media_id : -1,
        //idAttribute: 'id',
        getUser : function(uid){
            //TODO get user
            //todo return user if exists in the collection
        }
    });



    /**
     * Media : Contains necessary data to setup the media
     * @type {Backbone.Model}
     * @keys [model, Model]
     */
    AnnotatIt.Media = Backbone.Model.extend({
        urlRoot: function() {
                    if (this.attributes.action && this.attributes.key){
                        return '/api/media/'+this.attributes.action+'/'+this.attributes.key+'.json' 
                    }else{
                        return '/api/media'
                    }
                 },
        //urlRoot: '/api/media/:action', //this is secured in the server
        actions : ['annotate','view', 'embed'],
        idAttribute: 'id'/*,
        user : new AnnotatIt.User(),
        initialize: function(){
            //console.log("this");
            //console.log(this);
            this.user.id = this.get("owner_id");
            this.user.fetch();
        }*/
        //defaults : {
        //    action: "",
        //    key: 0
        //},
    });
    AnnotatIt.MediaContainer = Backbone.Collection.extend({
        self : this,
	    model: AnnotatIt.Media,
        url: function() {return '/api/media_files.json' }
        
    });


    /**
     * FSComment : FlaggedSynchronizedComments
     * @type {Backbone.Model}
     */
    AnnotatIt.FSComment = Backbone.Model.extend({
        //url: function() {return '/api/fscomment/'+this.id+'.json' },
        urlRoot:  '/api/fscomment', /*function() {
                    if (this.id){
                        return '/api/fscomment/'+this.id+'.json' 
                    }else{
                        return '/api/fscomment'
                    }
                 },*/
        idAttribute: 'id',
        user : new AnnotatIt.User(),
        initialize: function(){
            //console.log("this");
            //console.log(this);
            this.user.id = this.get("owner_id");
            this.user.fetch();
        }
    }); 


    /**
     * CommentsContainer: Contains all the comments related inside a CommentsContainer
     * @type {Backbone.Collection}
     * @contains Comment
     */
    AnnotatIt.FSCommentsContainer = Backbone.Collection.extend({
        self : this,
	    model: AnnotatIt.FSComment,
        url: function() {return '/api/fscomments/'+this.media_id+'.json' },
        media_id : -1,
        //idAttribute: 'id',
	    defaults: {
		    text: "Please write your comment here",
		    media_time: 0
	    }
    });

    /**
     * Section : Section of a media
     * @type {Backbone.Model}
     */
    AnnotatIt.Section = Backbone.Model.extend({
        urlRoot: '/api/section', 
        idAttribute: 'id',
        user : new AnnotatIt.User(),
        initialize: function(){
            //console.log("this");
            //console.log(this);
            this.user.id = this.get("owner_id");
            this.user.fetch();
        }
    }); 


    /**
     * SectionsContainer: Contains all the sections related to the current media
     * @type {Backbone.Collection}
     * @contains Comment
     */
    AnnotatIt.SectionsContainer = Backbone.Collection.extend({
        self : this,
	    model: AnnotatIt.Section,
        url: function() {return '/api/sections/'+this.media_id+'.json' },
        media_id : -1,
        //idAttribute: 'id',
	    defaults: {
		    name: "",
		    begin_time: 0,
		    end_time:0
	    }
    });

    //console.log("All models defined");
})(jQuery);
