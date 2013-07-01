////////////
// Models //
////////////
var Comment, Comments, SyncComment, SyncCommentFlags;

/**
 * Comment : Contains one comment
 * @type {Backbone.Model}
 * @contains Comments
 * @keys [comment, responses]
 */
Comment = Backbone.Model.extend({
	
	defaults: {
		comment: "",
		responses: []
	}
});

SyncCommentFlags = Backbone.Model.extend({
	
});

SyncComment = Backbone.Model.extend({
	defaults: {
	}
});

/**
 * Comments: Contains all the comments related inside a CommentsList
 * @type {Backbone.Collection}
 * @contains Comment
 */
Comments = Backbone.Collection.extend({
	model: Comment
});