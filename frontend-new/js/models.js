////////////
// Models //
////////////
var Comment, Comments, SyncComment, FlaggedSyncComment, FlaggedSyncComments;

/**
 * Comment : Contains one comment
 * @type {Backbone.Model}
 * @keys [comment, Comment]
 */
Comment = Backbone.Model.extend({
	defaults: {
		comment: ""
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
	defaults: {
		comment: "",
		media_time: 0
	}
});

SyncComments = Backbone.Collection.extend({
	model: SyncComment
});

FlaggedSyncComment = SyncComment.extend({
	initialize: function() {
		FlaggedSyncComment.__super__.initialize.apply(this, arguments);
	},
});

FlaggedSyncComments = Backbone.Collection.extend({
	model: FlaggedSyncComment
});