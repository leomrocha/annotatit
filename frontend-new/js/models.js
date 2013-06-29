////////////
// Models //
////////////

/**
 * Comment : Contains one comment
 * @type {Backbone.Model}
 * @keys [comment]
 */
var Comment = Backbone.Model.extend({
	defaults: {
		comment: ""
	}
});

var SyncCommentFlags = Backbone.Model.extend({
	
});

var SyncComment = Backbone.Model.extend({
	defaults: {
	}
});

/**
 * Comments: Contains all the comments related inside a CommentsList
 * @type {Backbone.Collection}
 * @contains Comment
 */
var Comments = Backbone.Collection.extend({
	model: Comment
});