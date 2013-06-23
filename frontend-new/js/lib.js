	////////////
	// Models //
	////////////

	/**
	 * CommentsList Model : Contains all the comments related to a list
	 * @type {Backbone.RelatinalModel}
	 * @keys [comments]
	 */
	// var CommentsList = Backbone.RelationalModel.extend({
	//   relations: [{
	//     type: Backbone.HasMany,
	//     key: 'comments',
	//     relatedModel: 'Comment',
	//     reverseRelation: {
	//       key: 'listedIn'
	//     }
	//   }]
	// });

	/**
	 * Comments Model : Contains a comment
	 * @type {Backbone.RelatinalModel}
	 * @keys [comment]
	 */
	// var Comment = Backbone.RelationalModel.extend({});

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


	/**
	 * Comments: Contains all the comments related inside a CommentsList
	 * @type {Backbone.Collection}
	 * @contains Comment
	 */
	var Comments = Backbone.Collection.extend({
		model: Comment
	});

	/**
	 * CommentsList: Contains a Comments model inside comments
	 * @type {Backbone.Model}
	 * @keys [comments]
	 */
	var CommentsList = Backbone.Model.extend({
		defaults: {
			comments: new Comments([
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"})
			])
		}
	}); 

	/** @type {CommentsList} A Lorem list of comments for initial testing */
	var comments_list = new CommentsList({});

	////////////////
	// ViewModels //
	////////////////

	/** @type {viewModel} View for rendering the comments_list data into the view */
	var view_model = kb.viewModel(comments_list);

$( document ).ready(function() {

	/** Binds view_model to the main section in the view */
	ko.applyBindings(view_model, $("#main-section")[0]);
	
});
