////////////
// Models //
////////////
var Comment, Comments, SyncComment, FlaggedSyncComment;

/**
 * Comment : Contains one comment
 * @type {Backbone.Model}
 * @contains Comments
 * @keys [comment, Comment]
 */
Comment = Backbone.Model.extend({
	model: {
		responses: Backbone.Collection.extend({
			model: Comment
		})
	},
	defaults: {
		comment: "",
		responses: []
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


SyncComment = Backbone.Model.extend({
	model: {
		responses: Comments
	},
	defaults: {
		comment: "",
		responses: []
	}
});

SyncComments = Backbone.Collection.extend({
	model: SyncComment
});

FlaggedSyncComment = Backbone.Model.extend({});
