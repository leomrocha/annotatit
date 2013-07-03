////////////
// Models //
////////////
var Comment, Comments, SyncComment, SyncCommentFlags;

/**
 * Comment : Contains one comment
 * @type {Backbone.Model}
 * @contains Comments
 * @keys [comment, Comment]
 */
Comment = Backbone.Model.extend({
	model: {
		responses: Backbone.Collection.extend({model : Comment}) 
	},
	defaults: {
		comment: "",
		responses: []
	}
});

SyncComment = Backbone.Model.extend({
});

Flag = Backbone.Model.extend({
});

/**
 * Comments: Contains all the comments related inside a CommentsList
 * @type {Backbone.Collection}
 * @contains Comment
 */
Comments = Backbone.Collection.extend({
	model: Comment
});

