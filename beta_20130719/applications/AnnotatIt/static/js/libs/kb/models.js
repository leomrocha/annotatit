////////////
// Models //
////////////

console.log("defining models");

var  FSComment, FSCommentsList;

var Media, User, UserList, Section, SectionList;

/**
 * User : User data
 * @type {Backbone.Model}
 * @keys [model, Model]
 */
User = Backbone.Model.extend({
    urlRoot: '/api/user', 
    idAttribute: 'id'
}); 

/**
 * Media : Contains necessary data to setup the media
 * @type {Backbone.Model}
 * @keys [model, Model]
 */
Media = Backbone.Model.extend({
    urlRoot: '/api/media', //this is secured in the server
    //urlRoot: '/api/media/:action', //this is secured in the server
    //actions = ['annotate','view', 'embed'],
    idAttribute: 'id',
    /* /for later, when everything is working and I can extend it
    relations: [{
            type: Backbone.HasMany,
            key: 'sections',
            relatedModel: 'Section',
            reverseRelation: {
                key: 'media',
                includeInJSON: 'id',
            },
        },{
            type: Backbone.HasMany,
            key: 'comments',
            relatedModel: 'FSComment',
            reverseRelation: {
                key: 'media',
                includeInJSON: 'id',
        },
    }]*/
    getMedia : function(){
    
    },
    getComments : function(){
    
    },
    getSections : function(){
    
    }
});

/**
 * FSComment : FlaggedSynchronizedComments
 * @type {Backbone.Model}
 */
FSComment = Backbone.Model.extend({
    urlRoot: '/api/fscomment', 
    idAttribute: 'id'
}); 


/**
 * CommentsList: Contains all the comments related inside a CommentsList
 * @type {Backbone.Collection}
 * @contains Comment
 */
FSCommentsList = Backbone.Collection.extend({
	model: FSComment,
    url: '/api/fscomments',
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
Section = Backbone.Model.extend({
    urlRoot: '/api/section', 
    idAttribute: 'id'
}); 


/**
 * SectionsList: Contains all the sections related to the current media
 * @type {Backbone.Collection}
 * @contains Comment
 */
SectionsList = Backbone.Collection.extend({
	model: Section,
    url: '/api/sections',
    //idAttribute: 'id',
	defaults: {
		name: "",
		begin_time: 0,
		end_time:0
	}
});
