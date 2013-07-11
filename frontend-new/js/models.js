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


SyncComment = Comment.extend({
	initialize: function() {
		SyncComment.__super__.initialize.apply(this, arguments);
	},
});

SyncComments = Backbone.Collection.extend({
	model: SyncComment
});

FlaggedSyncComment = SyncComment.extend({
	initialize: function() {
		FlaggedSyncComment.__super__.initialize.apply(this, arguments);
	},
});